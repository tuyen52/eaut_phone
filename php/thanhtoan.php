<?php
// php/thanhtoan.php
header('Content-Type: application/json; charset=utf-8');

require_once('../connect.php');
require_once(__DIR__ . '/vnpay_config.php');
require_once(__DIR__ . '/order_helpers.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

function normalize_cart_items_for_signature(array $items): array
{
    $normalized = [];

    foreach ($items as $sp) {
        $normalized[] = [
            'masp'       => trim((string)($sp['masp'] ?? '')),
            'variant_id' => (int)($sp['variant_id'] ?? 0),
            'mau_sac'    => trim((string)($sp['mau_sac'] ?? '')),
            'so_luong'   => (int)($sp['so_luong'] ?? 0),
            'gia'        => (int)round((float)($sp['gia'] ?? 0))
        ];
    }

    usort($normalized, function ($a, $b) {
        $ka = $a['masp'] . '|' . $a['variant_id'] . '|' . $a['mau_sac'] . '|' . $a['gia'] . '|' . $a['so_luong'];
        $kb = $b['masp'] . '|' . $b['variant_id'] . '|' . $b['mau_sac'] . '|' . $b['gia'] . '|' . $b['so_luong'];
        return strcmp($ka, $kb);
    });

    return $normalized;
}

function build_cart_signature(array $items): string
{
    return hash('sha256', json_encode(
        normalize_cart_items_for_signature($items),
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    ));
}

function get_order_details_signature(mysqli $conn, int $maDon): string
{
    $stmt = $conn->prepare("
        SELECT masp, variant_id, mau_sac, so_luong, don_gia
        FROM order_details
        WHERE ma_don = ?
        ORDER BY detail_id ASC
    ");
    $stmt->bind_param("i", $maDon);
    $stmt->execute();
    $rs = $stmt->get_result();

    $items = [];
    while ($row = $rs->fetch_assoc()) {
        $items[] = [
            'masp'       => $row['masp'],
            'variant_id' => $row['variant_id'] !== null ? (int)$row['variant_id'] : 0,
            'mau_sac'    => $row['mau_sac'] ?? '',
            'so_luong'   => (int)$row['so_luong'],
            'gia'        => (int)$row['don_gia']
        ];
    }

    $rs->free();
    $stmt->close();

    return build_cart_signature($items);
}

function find_reusable_pending_vnpay_order(
    mysqli $conn,
    string $username,
    int $tongTien,
    string $diaChi,
    string $sdt,
    array $sanPham
): ?array {
    $cartSignature = build_cart_signature($sanPham);

    $stmt = $conn->prepare("
        SELECT ma_don, vnp_txn_ref, tong_tien, dia_chi, so_dien_thoai, ngay_mua
        FROM orders
        WHERE username = ?
          AND phuong_thuc_tt = 'VNPAY'
          AND payment_status = 'Pending'
          AND tinh_trang = 'Chờ thanh toán'
          AND tong_tien = ?
          AND ngay_mua >= DATE_SUB(NOW(), INTERVAL 6 HOUR)
        ORDER BY ma_don DESC
        LIMIT 10
    ");
    $stmt->bind_param("si", $username, $tongTien);
    $stmt->execute();
    $rs = $stmt->get_result();

    while ($row = $rs->fetch_assoc()) {
        $sameAddress = trim((string)$row['dia_chi']) === trim($diaChi);
        $samePhone   = trim((string)$row['so_dien_thoai']) === trim($sdt);

        if (!$sameAddress || !$samePhone) {
            continue;
        }

        $oldSignature = get_order_details_signature($conn, (int)$row['ma_don']);
        if ($oldSignature === $cartSignature) {
            $rs->free();
            $stmt->close();
            return $row;
        }
    }

    $rs->free();
    $stmt->close();
    return null;
}

try {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);

    if (!is_array($data)) {
        throw new Exception("Dữ liệu gửi lên không hợp lệ (JSON).");
    }

    $username = trim($data['username'] ?? '');
    $sanPham  = $data['san_pham'] ?? [];
    $tongTienGuiLen = (float)($data['tong_tien'] ?? 0);

    $hoTen   = trim($data['ho_ten'] ?? '');
    $sdt     = trim($data['sdt'] ?? '');
    $diaChi  = trim($data['dia_chi'] ?? '');
    $ptttRaw = $data['payment_method_code'] ?? ($data['phuong_thuc'] ?? 'COD');
    $paymentMethod = normalize_payment_method_code($ptttRaw);

    if ($username === '') {
        throw new Exception("Thiếu username.");
    }

    if (!is_array($sanPham) || count($sanPham) === 0) {
        throw new Exception("Giỏ hàng trống.");
    }

    if ($sdt === '') {
        throw new Exception("Thiếu số điện thoại.");
    }

    if ($diaChi === '') {
        throw new Exception("Thiếu địa chỉ nhận hàng.");
    }

    $tongTien = 0;
    foreach ($sanPham as $sp) {
        $soLuong = (int)($sp['so_luong'] ?? 0);
        $gia     = (float)($sp['gia'] ?? 0);

        if ($soLuong <= 0) {
            throw new Exception("Số lượng mua không hợp lệ.");
        }
        if ($gia < 0) {
            throw new Exception("Đơn giá không hợp lệ.");
        }

        $tongTien += ($soLuong * $gia);
    }

    if ($tongTien <= 0) {
        throw new Exception("Tổng tiền không hợp lệ.");
    }

    if ((int)$tongTienGuiLen !== (int)$tongTien) {
        $tongTienGuiLen = $tongTien;
    }

    // =========================================================
    // REUSE ĐƠN PENDING CŨ NẾU USER BẤM LẠI VNPAY CÙNG 1 GIỎ
    // =========================================================
    if ($paymentMethod === 'VNPAY') {
        $existingPending = find_reusable_pending_vnpay_order(
            $conn,
            $username,
            (int)$tongTien,
            $diaChi,
            $sdt,
            $sanPham
        );

        if ($existingPending) {
            $maDon = (int)$existingPending['ma_don'];
            $vnpTxnRef = trim((string)$existingPending['vnp_txn_ref']);

            if ($vnpTxnRef === '') {
                $vnpTxnRef = generate_vnp_txn_ref($maDon);

                $stmtFixTxnRef = $conn->prepare("
                    UPDATE orders
                    SET vnp_txn_ref = ?
                    WHERE ma_don = ?
                ");
                $stmtFixTxnRef->bind_param("si", $vnpTxnRef, $maDon);
                $stmtFixTxnRef->execute();
                $stmtFixTxnRef->close();
            }

            $paymentUrl = vnpay_create_payment_url([
                'txn_ref'    => $vnpTxnRef,
                'amount'     => (int)$tongTien,
                'order_info' => 'Thanh toan don hang ' . $vnpTxnRef,
                'ip_addr'    => get_client_ip()
            ]);

            echo json_encode([
                "status" => true,
                "message" => "Đã tìm thấy đơn VNPay đang chờ thanh toán. Hệ thống sẽ dùng lại đơn cũ.",
                "ma_don" => $maDon,
                "payment_method" => "VNPAY",
                "payment_status" => "Pending",
                "vnp_TxnRef" => $vnpTxnRef,
                "payment_url" => $paymentUrl,
                "reused_pending_order" => true
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // =========================================================
    // TẠO ĐƠN MỚI
    // =========================================================
    $conn->begin_transaction();

    $tinhTrangDon = ($paymentMethod === 'VNPAY') ? 'Chờ thanh toán' : 'Chờ xử lý';
    $paymentStatus = 'Pending';

    $stmtOrder = $conn->prepare("
        INSERT INTO orders (
            username,
            tong_tien,
            tinh_trang,
            phuong_thuc_tt,
            payment_status,
            dia_chi,
            so_dien_thoai
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    $stmtOrder->bind_param(
        "sdsssss",
        $username,
        $tongTien,
        $tinhTrangDon,
        $paymentMethod,
        $paymentStatus,
        $diaChi,
        $sdt
    );
    $stmtOrder->execute();

    $maDon = $conn->insert_id;
    $stmtOrder->close();

    $vnpTxnRef = null;

    if ($paymentMethod === 'VNPAY') {
        $vnpTxnRef = generate_vnp_txn_ref($maDon);

        $stmtUpdateTxnRef = $conn->prepare("
            UPDATE orders
            SET vnp_txn_ref = ?
            WHERE ma_don = ?
        ");
        $stmtUpdateTxnRef->bind_param("si", $vnpTxnRef, $maDon);
        $stmtUpdateTxnRef->execute();
        $stmtUpdateTxnRef->close();
    }

    // COD: trừ kho ngay
    // VNPAY: chỉ lưu order_details, chưa trừ kho
    save_order_details_from_cart($conn, $maDon, $sanPham, $paymentMethod === 'COD');

    $paymentUrl = null;

    if ($paymentMethod === 'VNPAY') {
        if (
            trim($vnp_TmnCode) === '' ||
            trim($vnp_HashSecret) === '' ||
            trim($vnp_ReturnUrl) === ''
        ) {
            throw new Exception("VNPay Sandbox chưa được cấu hình trong php/vnpay_config.php.");
        }

        $paymentUrl = vnpay_create_payment_url([
            'txn_ref'    => $vnpTxnRef,
            'amount'     => (int)$tongTien,
            'order_info' => 'Thanh toan don hang ' . $vnpTxnRef,
            'ip_addr'    => get_client_ip()
        ]);
    }

    $conn->commit();

    if ($paymentMethod === 'VNPAY') {
        echo json_encode([
            "status" => true,
            "message" => "Đơn hàng đã được tạo. Đang chuyển sang VNPay Sandbox.",
            "ma_don" => $maDon,
            "payment_method" => "VNPAY",
            "payment_status" => "Pending",
            "vnp_TxnRef" => $vnpTxnRef,
            "payment_url" => $paymentUrl,
            "reused_pending_order" => false
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode([
        "status" => true,
        "message" => "Đặt hàng thành công! Mã đơn: #" . $maDon,
        "ma_don" => $maDon,
        "payment_method" => "COD",
        "payment_status" => "Pending"
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if (isset($conn)) {
        try {
            $conn->rollback();
        } catch (Exception $ignore) {}
    }

    echo json_encode([
        "status" => false,
        "message" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);

} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>