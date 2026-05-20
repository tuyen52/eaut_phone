<?php
// php/thanhtoan.php
// Luồng mới:
// - COD: tạo orders + order_details và trừ kho ngay.
// - VNPAY: chỉ tạo vnpay_payment_sessions và chuyển sang cổng VNPay.
//          Không tạo orders/order_details cho tới khi VNPay trả kết quả.
//
// Bản sửa bảo mật:
// - Không tin username từ client, lấy username từ session.
// - Không tin giá sản phẩm từ client, backend tự lấy giá từ DB.

header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/auth_session.php');
require_once('../connect.php');
require_once(__DIR__ . '/vnpay_config.php');
require_once(__DIR__ . '/order_helpers.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

function parse_money_value($value)
{
    if (is_int($value) || is_float($value)) {
        return (int)$value;
    }

    $num = preg_replace('/[^\d]/', '', (string)$value);
    return (int)$num;
}

function get_server_product_price(mysqli $conn, string $masp): int
{
    $stmt = $conn->prepare("
        SELECT gia, khuyen_mai_loai, khuyen_mai_gia_tri
        FROM products
        WHERE masp = ?
        LIMIT 1
    ");
    $stmt->bind_param("s", $masp);
    $stmt->execute();

    $rs = $stmt->get_result();

    if ($rs->num_rows === 0) {
        throw new Exception("Không tìm thấy sản phẩm '$masp'.");
    }

    $row = $rs->fetch_assoc();
    $stmt->close();

    $basePrice = parse_money_value($row['gia']);
    $promoType = trim((string)($row['khuyen_mai_loai'] ?? ''));
    $promoValue = parse_money_value($row['khuyen_mai_gia_tri'] ?? 0);

    /*
        Theo frontend hiện tại, chỉ promo "giareonline" được coi là giá bán thay thế.
        Các loại "giamgia", "tragop", "moiramat" giữ nguyên cách xử lý hiện tại.
    */
    if ($promoType === 'giareonline' && $promoValue > 0) {
        return $promoValue;
    }

    return $basePrice;
}

function get_variant_color_name(mysqli $conn, int $variantId, string $masp): ?string
{
    if ($variantId <= 0) return null;

    $stmt = $conn->prepare("
        SELECT ten_mau
        FROM product_variants
        WHERE variant_id = ? AND masp = ?
        LIMIT 1
    ");
    $stmt->bind_param("is", $variantId, $masp);
    $stmt->execute();

    $rs = $stmt->get_result();

    if ($rs->num_rows === 0) {
        $stmt->close();
        throw new Exception("Variant không thuộc sản phẩm '$masp'.");
    }

    $row = $rs->fetch_assoc();
    $stmt->close();

    return $row['ten_mau'] ?? null;
}

function build_server_cart_items(mysqli $conn, array $items): array
{
    if (count($items) === 0) {
        throw new Exception("Giỏ hàng trống hoặc dữ liệu sản phẩm không hợp lệ.");
    }

    $result = [];

    foreach ($items as $sp) {
        if (!is_array($sp)) {
            throw new Exception("Dữ liệu sản phẩm không hợp lệ.");
        }

        $masp = trim((string)($sp['masp'] ?? $sp['ma'] ?? ''));
        $variantId = (int)($sp['variant_id'] ?? 0);
        $soLuong = (int)($sp['so_luong'] ?? $sp['soluong'] ?? 0);

        if ($masp === '') {
            throw new Exception("Thiếu mã sản phẩm trong giỏ hàng.");
        }

        if ($soLuong <= 0) {
            throw new Exception("Số lượng mua không hợp lệ.");
        }

        $serverPrice = get_server_product_price($conn, $masp);
        if ($serverPrice <= 0) {
            throw new Exception("Giá sản phẩm '$masp' không hợp lệ.");
        }

        /*
            Nếu có variant_id thì lấy tên màu thật từ DB.
            Không tin mau_sac do client gửi để tránh giả màu/variant.
        */
        $mauSac = null;
        if ($variantId > 0) {
            $mauSac = get_variant_color_name($conn, $variantId, $masp);
        }

        $result[] = [
            'masp' => $masp,
            'variant_id' => $variantId > 0 ? $variantId : null,
            'mau_sac' => $mauSac,
            'so_luong' => $soLuong,
            'gia' => $serverPrice
        ];
    }

    return $result;
}

try {
    $currentUser = require_login();
    $username = $currentUser['username'];

    $data = read_json_body();

    $hoTen = trim((string)($data['ho_ten'] ?? ''));
    $sdt = trim((string)($data['sdt'] ?? ''));
    $diaChi = trim((string)($data['dia_chi'] ?? ''));
    $paymentMethod = normalize_payment_method_code($data['payment_method_code'] ?? $data['phuong_thuc'] ?? 'COD');

    if ($hoTen === '') {
        throw new Exception("Vui lòng nhập họ tên người nhận.");
    }

    if ($sdt === '' || !preg_match('/^(84|0[35789])[0-9]{8}$/', $sdt)) {
        throw new Exception("Số điện thoại không hợp lệ.");
    }

    if ($diaChi === '' || mb_strlen($diaChi, 'UTF-8') < 10) {
        throw new Exception("Vui lòng nhập địa chỉ nhận hàng chi tiết.");
    }

    /*
        Không dùng giá client gửi.
        Chỉ dùng masp, variant_id, so_luong rồi tự lấy giá từ DB.
    */
    $sanPham = build_server_cart_items($conn, $data['san_pham'] ?? []);
    $tongTienServer = calculate_cart_total_amount($sanPham);
    $tongTienClient = (int)($data['tong_tien'] ?? 0);

    if ($tongTienServer <= 0) {
        throw new Exception("Tổng tiền không hợp lệ.");
    }

    /*
        Nếu client có gửi tổng tiền, dùng để phát hiện sửa request.
        Tổng tiền thật vẫn là tongTienServer.
    */
    if ($tongTienClient > 0 && $tongTienClient !== $tongTienServer) {
        throw new Exception("Tổng tiền gửi lên không khớp với dữ liệu sản phẩm trên server.");
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

            json_response(true, "Đặt hàng COD thành công! Mã đơn: #$maDon", [
                "ma_don" => $maDon,
                "payment_method" => "COD"
            ]);
        } catch (Throwable $e) {
            try { $conn->rollback(); } catch (Throwable $ignore) {}
            throw $e;
        }
    }

    /*
        VNPay: kiểm tra tồn kho tại thời điểm tạo phiên.
        Không tạo orders/order_details và không trừ kho ở bước này.
    */
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

    json_response(true, "Đã tạo phiên thanh toán VNPay tạm. Đơn hàng chỉ được tạo sau khi VNPay trả kết quả.", [
        "payment_method" => "VNPAY",
        "session_id" => $sessionId,
        "txn_ref" => $txnRef,
        "payment_url" => $paymentUrl,
        "expires_at" => $expireAt
    ]);

} catch (Throwable $e) {
    error_log('Checkout error: ' . $e->getMessage());

    json_response(false, $e->getMessage(), [], 400);
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>