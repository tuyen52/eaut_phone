<?php
require_once('../connect.php');
require_once(__DIR__ . '/vnpay_config.php');
require_once(__DIR__ . '/order_helpers.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

function e($value)
{
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

$statusTitle = 'Kết quả thanh toán VNPay';
$statusClass = 'pending';
$statusMessage = 'Hệ thống đang xử lý kết quả thanh toán.';
$order = null;
$shouldClearCart = false;

try {
    if (trim($vnp_HashSecret) === '') {
        throw new Exception('Thiếu cấu hình Hash Secret VNPay.');
    }

    $verify = vnpay_verify_response($_GET, $vnp_HashSecret);
    if (!$verify['valid']) {
        throw new Exception('Chữ ký không hợp lệ. Dữ liệu trả về có thể đã bị thay đổi.');
    }

    $input = $verify['input'];

    $vnpTxnRef            = trim($input['vnp_TxnRef'] ?? '');
    $vnpAmount            = (int)($input['vnp_Amount'] ?? 0);
    $vnpResponseCode      = trim($input['vnp_ResponseCode'] ?? '');
    $vnpTransactionStatus = trim($input['vnp_TransactionStatus'] ?? '');
    $vnpTransactionNo     = trim($input['vnp_TransactionNo'] ?? '');
    $vnpPayDate           = trim($input['vnp_PayDate'] ?? '');

    if ($vnpTxnRef === '') {
        throw new Exception('Không tìm thấy mã giao dịch VNPay.');
    }

    $stmt = $conn->prepare("
        SELECT ma_don, username, ngay_mua, tinh_trang, phuong_thuc_tt, payment_status,
               tong_tien, dia_chi, so_dien_thoai, vnp_txn_ref, vnp_transaction_no,
               vnp_response_code, paid_at
        FROM orders
        WHERE vnp_txn_ref = ?
        LIMIT 1
    ");
    $stmt->bind_param("s", $vnpTxnRef);
    $stmt->execute();
    $rs = $stmt->get_result();

    if ($rs->num_rows === 0) {
        throw new Exception('Không tìm thấy đơn hàng tương ứng với giao dịch VNPay.');
    }

    $order = $rs->fetch_assoc();
    $rs->free();
    $stmt->close();

    $maDon = (int)$order['ma_don'];
    $heThongTongTien = (int)$order['tong_tien'];
    $vnpTongTien = (int)($vnpAmount / 100);

    if ($vnpTongTien !== $heThongTongTien) {
        throw new Exception('Số tiền VNPay trả về không khớp với đơn hàng.');
    }

    // =========================================================
    // FALLBACK XỬ LÝ THÀNH CÔNG NGAY TẠI RETURN NẾU IPN CHƯA UPDATE
    // =========================================================
    if (
        $vnpResponseCode === '00' &&
        $vnpTransactionStatus === '00' &&
        ($order['payment_status'] ?? '') === 'Pending'
    ) {
        $conn->begin_transaction();

        $stmtLock = $conn->prepare("
            SELECT ma_don, payment_status
            FROM orders
            WHERE ma_don = ?
            FOR UPDATE
        ");
        $stmtLock->bind_param("i", $maDon);
        $stmtLock->execute();
        $rsLock = $stmtLock->get_result();
        $locked = $rsLock->fetch_assoc();
        $rsLock->free();
        $stmtLock->close();

        if ($locked && $locked['payment_status'] === 'Pending') {
            deduct_stock_for_saved_order($conn, $maDon);

            $paidAt = parse_vnpay_paydate_to_mysql($vnpPayDate);
            if ($paidAt === null) {
                $paidAt = date('Y-m-d H:i:s');
            }

            $stmtUpdate = $conn->prepare("
                UPDATE orders
                SET tinh_trang = 'Chờ xử lý',
                    payment_status = 'Paid',
                    vnp_transaction_no = ?,
                    vnp_response_code = ?,
                    paid_at = ?
                WHERE ma_don = ?
            ");
            $stmtUpdate->bind_param("sssi", $vnpTransactionNo, $vnpResponseCode, $paidAt, $maDon);
            $stmtUpdate->execute();
            $stmtUpdate->close();
        }

        $conn->commit();

        // đọc lại đơn sau update
        $stmtReload = $conn->prepare("
            SELECT ma_don, username, ngay_mua, tinh_trang, phuong_thuc_tt, payment_status,
                   tong_tien, dia_chi, so_dien_thoai, vnp_txn_ref, vnp_transaction_no,
                   vnp_response_code, paid_at
            FROM orders
            WHERE ma_don = ?
            LIMIT 1
        ");
        $stmtReload->bind_param("i", $maDon);
        $stmtReload->execute();
        $rsReload = $stmtReload->get_result();
        $order = $rsReload->fetch_assoc();
        $rsReload->free();
        $stmtReload->close();
    }

    // =========================================================
    // FALLBACK FAIL / HỦY
    // =========================================================
    if (
        !($vnpResponseCode === '00' && $vnpTransactionStatus === '00') &&
        ($order['payment_status'] ?? '') === 'Pending'
    ) {
        $conn->begin_transaction();

        $stmtFail = $conn->prepare("
            UPDATE orders
            SET tinh_trang = 'Đã hủy thanh toán',
                payment_status = 'Failed',
                vnp_transaction_no = ?,
                vnp_response_code = ?
            WHERE ma_don = ?
              AND payment_status = 'Pending'
        ");
        $stmtFail->bind_param("ssi", $vnpTransactionNo, $vnpResponseCode, $maDon);
        $stmtFail->execute();
        $stmtFail->close();

        $conn->commit();

        $stmtReload = $conn->prepare("
            SELECT ma_don, username, ngay_mua, tinh_trang, phuong_thuc_tt, payment_status,
                   tong_tien, dia_chi, so_dien_thoai, vnp_txn_ref, vnp_transaction_no,
                   vnp_response_code, paid_at
            FROM orders
            WHERE ma_don = ?
            LIMIT 1
        ");
        $stmtReload->bind_param("i", $maDon);
        $stmtReload->execute();
        $rsReload = $stmtReload->get_result();
        $order = $rsReload->fetch_assoc();
        $rsReload->free();
        $stmtReload->close();
    }

    if (($order['payment_status'] ?? '') === 'Paid') {
        $statusTitle = 'Thanh toán thành công';
        $statusClass = 'success';
        $statusMessage = 'Đơn hàng của bạn đã được thanh toán thành công qua VNPay.';
        $shouldClearCart = true;
    } elseif (($order['payment_status'] ?? '') === 'Failed') {
        $statusTitle = 'Thanh toán thất bại / đã hủy';
        $statusClass = 'failed';
        $statusMessage = vnpay_response_message($order['vnp_response_code'] ?? $vnpResponseCode);
    } else {
        $statusTitle = 'Đang chờ xác nhận thanh toán';
        $statusClass = 'pending';
        $statusMessage = 'Hệ thống đã nhận kết quả từ VNPay nhưng đơn hàng vẫn đang chờ xác nhận.';
    }

} catch (Exception $e) {
    $statusTitle = 'Có lỗi xảy ra';
    $statusClass = 'failed';
    $statusMessage = $e->getMessage();
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Kết quả thanh toán VNPay</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <script src="../js/core/utils.js"></script>
    <script src="../js/core/classes.js"></script>
    <script src="../js/core/database.js"></script>
    <script src="../js/core/auth.js"></script>

    <style>
        body{
            font-family: Arial, sans-serif;
            background:#f5f7fb;
            margin:0;
            padding:30px 15px;
            color:#222;
        }
        .wrap{
            max-width:760px;
            margin:0 auto;
            background:#fff;
            border-radius:14px;
            box-shadow:0 8px 30px rgba(0,0,0,.08);
            overflow:hidden;
        }
        .head{
            padding:24px;
            color:#fff;
        }
        .success{ background:linear-gradient(135deg,#28a745,#1f8b38); }
        .failed{ background:linear-gradient(135deg,#dc3545,#b02a37); }
        .pending{ background:linear-gradient(135deg,#f39c12,#e67e22); }
        .body{
            padding:24px;
        }
        .message{
            font-size:16px;
            line-height:1.6;
            margin:0 0 18px;
        }
        .box{
            border:1px solid #e9ecef;
            border-radius:10px;
            padding:16px;
            margin-bottom:18px;
            background:#fafbfc;
        }
        .row{
            display:flex;
            justify-content:space-between;
            gap:16px;
            padding:10px 0;
            border-bottom:1px dashed #ddd;
        }
        .row:last-child{ border-bottom:none; }
        .label{ color:#666; }
        .value{ font-weight:bold; text-align:right; }
        .actions{
            display:flex;
            gap:12px;
            flex-wrap:wrap;
        }
        .btn{
            display:inline-block;
            text-decoration:none;
            padding:12px 18px;
            border-radius:8px;
            color:#fff;
            font-weight:bold;
        }
        .btn-home{ background:#007bff; }
        .btn-user{ background:#28a745; }
        .btn-cart{ background:#6c757d; }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="head <?php echo e($statusClass); ?>">
            <h1 style="margin:0 0 8px;"><?php echo e($statusTitle); ?></h1>
            <div><?php echo e($statusMessage); ?></div>
        </div>

        <div class="body">
            <?php if ($order): ?>
                <div class="box">
                    <div class="row">
                        <div class="label">Mã đơn</div>
                        <div class="value">#<?php echo e($order['ma_don']); ?></div>
                    </div>
                    <div class="row">
                        <div class="label">Phương thức</div>
                        <div class="value"><?php echo e($order['phuong_thuc_tt']); ?></div>
                    </div>
                    <div class="row">
                        <div class="label">Trạng thái đơn</div>
                        <div class="value"><?php echo e($order['tinh_trang']); ?></div>
                    </div>
                    <div class="row">
                        <div class="label">Trạng thái thanh toán</div>
                        <div class="value"><?php echo e($order['payment_status']); ?></div>
                    </div>
                    <div class="row">
                        <div class="label">Tổng tiền</div>
                        <div class="value"><?php echo number_format((float)$order['tong_tien'], 0, ',', '.'); ?>đ</div>
                    </div>
                    <div class="row">
                        <div class="label">VNPay TxnRef</div>
                        <div class="value"><?php echo e($order['vnp_txn_ref']); ?></div>
                    </div>
                    <div class="row">
                        <div class="label">VNPay Transaction No</div>
                        <div class="value"><?php echo e($order['vnp_transaction_no']); ?></div>
                    </div>
                    <div class="row">
                        <div class="label">Mã phản hồi</div>
                        <div class="value"><?php echo e($order['vnp_response_code']); ?></div>
                    </div>
                    <div class="row">
                        <div class="label">Thanh toán lúc</div>
                        <div class="value"><?php echo e($order['paid_at'] ?: 'Chưa ghi nhận'); ?></div>
                    </div>
                </div>
            <?php endif; ?>

            <div class="actions">
                <a class="btn btn-home" href="../index.html">Về trang chủ</a>
                <a class="btn btn-user" href="../nguoidung.html">Xem lịch sử đơn hàng</a>
                <a class="btn btn-cart" href="../giohang.html">Quay lại giỏ hàng</a>
            </div>
        </div>
    </div>

    <script>
        function clearPaidVnpayCart() {
            try {
                if (typeof getCurrentUser !== 'function') return;
                var user = getCurrentUser();
                if (!user) return;

                user.products = [];
                if (typeof setCurrentUser === 'function') {
                    setCurrentUser(user);
                }
                if (typeof updateSingleUserInList === 'function') {
                    updateSingleUserInList(user);
                }
                if (typeof capNhat_ThongTin_CurrentUser === 'function') {
                    capNhat_ThongTin_CurrentUser();
                }
            } catch (e) {
                console.error('Không thể xóa giỏ local sau khi thanh toán thành công:', e);
            }
        }

        <?php if ($shouldClearCart): ?>
        clearPaidVnpayCart();
        <?php endif; ?>
    </script>
</body>
</html>