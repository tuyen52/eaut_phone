<?php
// php/vnpay_ipn.php
header('Content-Type: application/json; charset=utf-8');

require_once('../connect.php');
require_once(__DIR__ . '/vnpay_config.php');
require_once(__DIR__ . '/order_helpers.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

function ipn_response($code, $message)
{
    echo json_encode([
        'RspCode' => $code,
        'Message' => $message
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    if (trim($vnp_HashSecret) === '') {
        ipn_response('99', 'Config Error');
    }

    $verify = vnpay_verify_response($_GET, $vnp_HashSecret);
    if (!$verify['valid']) {
        ipn_response('97', 'Invalid Signature');
    }

    $input = $verify['input'];

    $vnpTxnRef          = trim($input['vnp_TxnRef'] ?? '');
    $vnpAmount          = (int)($input['vnp_Amount'] ?? 0);
    $vnpResponseCode    = trim($input['vnp_ResponseCode'] ?? '');
    $vnpTransactionNo   = trim($input['vnp_TransactionNo'] ?? '');
    $vnpTransactionStatus = trim($input['vnp_TransactionStatus'] ?? '');
    $vnpPayDate         = trim($input['vnp_PayDate'] ?? '');

    if ($vnpTxnRef === '') {
        ipn_response('01', 'Order Not Found');
    }

    $conn->begin_transaction();

    $stmtOrder = $conn->prepare("
        SELECT ma_don, tong_tien, tinh_trang, phuong_thuc_tt, payment_status, vnp_txn_ref
        FROM orders
        WHERE vnp_txn_ref = ?
        FOR UPDATE
    ");
    $stmtOrder->bind_param("s", $vnpTxnRef);
    $stmtOrder->execute();
    $rsOrder = $stmtOrder->get_result();

    if ($rsOrder->num_rows === 0) {
        $rsOrder->free();
        $stmtOrder->close();
        $conn->rollback();
        ipn_response('01', 'Order Not Found');
    }

    $order = $rsOrder->fetch_assoc();
    $rsOrder->free();
    $stmtOrder->close();

    $maDon = (int)$order['ma_don'];
    $tongTienHeThong = (int)$order['tong_tien'];
    $paymentStatusHienTai = trim($order['payment_status'] ?? '');
    $phuongThuc = strtoupper(trim($order['phuong_thuc_tt'] ?? ''));

    if ($phuongThuc !== 'VNPAY') {
        $conn->rollback();
        ipn_response('01', 'Order Not Found');
    }

    $soTienVnpay = (int)($vnpAmount / 100);
    if ($soTienVnpay !== $tongTienHeThong) {
        $conn->rollback();
        ipn_response('04', 'Invalid Amount');
    }

    if ($paymentStatusHienTai === 'Paid' || $paymentStatusHienTai === 'Failed') {
        $conn->rollback();
        ipn_response('02', 'Order Already Confirmed');
    }

    if ($vnpResponseCode === '00' && $vnpTransactionStatus === '00') {
        // Thanh toán thành công -> trừ kho theo order_details
        deduct_stock_for_saved_order($conn, $maDon);

        $tinhTrangMoi = 'Chờ xử lý';
        $paymentStatusMoi = 'Paid';
        $paidAt = parse_vnpay_paydate_to_mysql($vnpPayDate);
        if ($paidAt === null) {
            $paidAt = date('Y-m-d H:i:s');
        }

        $stmtUpdate = $conn->prepare("
            UPDATE orders
            SET tinh_trang = ?,
                payment_status = ?,
                vnp_transaction_no = ?,
                vnp_response_code = ?,
                paid_at = ?
            WHERE ma_don = ?
        ");
        $stmtUpdate->bind_param(
            "sssssi",
            $tinhTrangMoi,
            $paymentStatusMoi,
            $vnpTransactionNo,
            $vnpResponseCode,
            $paidAt,
            $maDon
        );
        $stmtUpdate->execute();
        $stmtUpdate->close();

        $conn->commit();
        ipn_response('00', 'Confirm Success');
    }

    // Thanh toán thất bại / user hủy
    $tinhTrangMoi = 'Đã hủy thanh toán';
    $paymentStatusMoi = 'Failed';
    $paidAt = null;

    $stmtUpdate = $conn->prepare("
        UPDATE orders
        SET tinh_trang = ?,
            payment_status = ?,
            vnp_transaction_no = ?,
            vnp_response_code = ?,
            paid_at = ?
        WHERE ma_don = ?
    ");
    $stmtUpdate->bind_param(
        "sssssi",
        $tinhTrangMoi,
        $paymentStatusMoi,
        $vnpTransactionNo,
        $vnpResponseCode,
        $paidAt,
        $maDon
    );
    $stmtUpdate->execute();
    $stmtUpdate->close();

    $conn->commit();
    ipn_response('00', 'Confirm Success');

} catch (Exception $e) {
    if (isset($conn)) {
        try {
            $conn->rollback();
        } catch (Exception $ignore) {}
    }
    ipn_response('99', 'Unknown Error');
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>