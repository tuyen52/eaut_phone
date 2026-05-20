<?php
// php/thanhtoan.php
// Luồng mới:
// - COD: tạo orders + order_details và trừ kho ngay.
// - VNPAY: chỉ tạo vnpay_payment_sessions và chuyển sang cổng VNPay.
//          Không tạo orders/order_details cho tới khi VNPay trả kết quả.

header('Content-Type: application/json; charset=utf-8');

require_once('../connect.php');
require_once(__DIR__ . '/vnpay_config.php');
require_once(__DIR__ . '/order_helpers.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

function json_response($ok, $payload = [], $httpCode = 200)
{
    http_response_code($httpCode);
    echo json_encode(array_merge(["status" => $ok], $payload), JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!is_array($data)) {
        throw new Exception("Không nhận được dữ liệu JSON hợp lệ.");
    }

    $username = trim((string)($data['username'] ?? ''));
    $hoTen = trim((string)($data['ho_ten'] ?? ''));
    $sdt = trim((string)($data['sdt'] ?? ''));
    $diaChi = trim((string)($data['dia_chi'] ?? ''));
    $paymentMethod = normalize_payment_method_code($data['payment_method_code'] ?? $data['phuong_thuc'] ?? 'COD');

    if ($username === '') throw new Exception("Thiếu tài khoản đặt hàng.");
    if ($hoTen === '') throw new Exception("Vui lòng nhập họ tên người nhận.");
    if ($sdt === '' || !preg_match('/^(84|0[35789])[0-9]{8}$/', $sdt)) {
        throw new Exception("Số điện thoại không hợp lệ.");
    }
    if ($diaChi === '' || mb_strlen($diaChi, 'UTF-8') < 10) {
        throw new Exception("Vui lòng nhập địa chỉ nhận hàng chi tiết.");
    }

    $sanPham = normalize_cart_items_for_order($data['san_pham'] ?? []);
    $tongTienServer = calculate_cart_total_amount($sanPham);
    $tongTienClient = (int)($data['tong_tien'] ?? 0);

    if ($tongTienServer <= 0) {
        throw new Exception("Tổng tiền không hợp lệ.");
    }

    if ($tongTienClient > 0 && $tongTienClient !== $tongTienServer) {
        throw new Exception("Tổng tiền gửi lên không khớp với giỏ hàng.");
    }

    $stmtUser = $conn->prepare("SELECT username, trang_thai FROM users WHERE username = ? LIMIT 1");
    $stmtUser->bind_param("s", $username);
    $stmtUser->execute();
    $rsUser = $stmtUser->get_result();

    if ($rsUser->num_rows === 0) {
        throw new Exception("Tài khoản không tồn tại.");
    }

    $userRow = $rsUser->fetch_assoc();
    $stmtUser->close();

    if (isset($userRow['trang_thai']) && (int)$userRow['trang_thai'] === 0) {
        throw new Exception("Tài khoản của bạn đang bị khóa.");
    }

    if ($paymentMethod === 'COD') {
        $conn->begin_transaction();

        try {
            $tinhTrang = 'Chờ xử lý';
            $paymentStatus = 'Pending';
            $pttt = 'COD';

            $stmtOrder = $conn->prepare("
                INSERT INTO orders (
                    username, tong_tien, tinh_trang, phuong_thuc_tt,
                    payment_status, dia_chi, so_dien_thoai
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmtOrder->bind_param(
                "sdsssss",
                $username,
                $tongTienServer,
                $tinhTrang,
                $pttt,
                $paymentStatus,
                $diaChi,
                $sdt
            );
            $stmtOrder->execute();
            $maDon = (int)$conn->insert_id;
            $stmtOrder->close();

            save_order_details_from_cart($conn, $maDon, $sanPham, true);

            $conn->commit();

            json_response(true, [
                "message" => "Đặt hàng COD thành công! Mã đơn: #$maDon",
                "ma_don" => $maDon,
                "payment_method" => "COD"
            ]);
        } catch (Throwable $e) {
            try { $conn->rollback(); } catch (Throwable $ignore) {}
            throw $e;
        }
    }

    // VNPay: chỉ kiểm tra tồn kho tại thời điểm tạo phiên, không tạo đơn và không trừ kho.
    assert_cart_stock_available($conn, $sanPham);

    if (trim((string)$vnp_HashSecret) === '') {
        throw new Exception("Thiếu cấu hình VNPay HashSecret.");
    }

    $txnRef = generate_vnp_session_ref();
    $cartJson = json_encode($sanPham, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $cartSignature = create_cart_signature($username, $tongTienServer, $sanPham, $vnp_HashSecret);
    $expireAt = date('Y-m-d H:i:s', strtotime('+' . (int)$vnp_ExpireMinutes . ' minutes'));

    $stmtSession = $conn->prepare("
        INSERT INTO vnpay_payment_sessions (
            txn_ref, username, tong_tien, ho_ten, dia_chi, so_dien_thoai,
            cart_json, cart_signature, session_status, expires_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
    ");
    $stmtSession->bind_param(
        "ssdssssss",
        $txnRef,
        $username,
        $tongTienServer,
        $hoTen,
        $diaChi,
        $sdt,
        $cartJson,
        $cartSignature,
        $expireAt
    );
    $stmtSession->execute();
    $sessionId = (int)$conn->insert_id;
    $stmtSession->close();

    $paymentUrl = vnpay_create_payment_url([
        'txn_ref' => $txnRef,
        'amount' => $tongTienServer,
        'order_info' => 'Thanh toan EAUT PHONE ' . $txnRef,
        'ip_addr' => get_client_ip(),
        'bank_code' => trim((string)($data['bank_code'] ?? ''))
    ]);

    json_response(true, [
        "message" => "Đã tạo phiên thanh toán VNPay tạm. Đơn hàng chỉ được tạo sau khi VNPay trả kết quả.",
        "payment_method" => "VNPAY",
        "session_id" => $sessionId,
        "txn_ref" => $txnRef,
        "payment_url" => $paymentUrl,
        "expires_at" => $expireAt
    ]);

} catch (Throwable $e) {
    json_response(false, [
        "message" => $e->getMessage()
    ], 400);
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>