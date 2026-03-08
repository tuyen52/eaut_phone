<?php
// php/admin/update-order-status.php
header('Content-Type: application/json; charset=utf-8');
require_once('../../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

function sync_product_stock(mysqli $conn, array $maspList)
{
    if (empty($maspList)) return;

    $stmt = $conn->prepare("
        UPDATE products
        SET so_luong_ton = (
            SELECT IFNULL(SUM(v.so_luong_ton), 0)
            FROM product_variants v
            WHERE v.masp = ?
        )
        WHERE masp = ?
    ");

    foreach ($maspList as $masp) {
        $stmt->bind_param("ss", $masp, $masp);
        $stmt->execute();
    }

    $stmt->close();
}

try {
    $data = json_decode(file_get_contents("php://input"), true);

    $maDon = (int)($data['maDon'] ?? 0);
    $trangThaiMoi = trim((string)($data['trangThai'] ?? ''));

    if ($maDon <= 0) {
        throw new Exception("Mã đơn không hợp lệ!");
    }
    if ($trangThaiMoi === '') {
        throw new Exception("Thiếu trạng thái!");
    }

    $allowedStatuses = [
        'Chờ thanh toán',
        'Chờ xử lý',
        'Đang giao hàng',
        'Đã nhận hàng',
        'Hoàn thành',
        'Đã hủy',
        'Đã hủy bởi Khách',
        'Đã hủy thanh toán'
    ];

    if (!in_array($trangThaiMoi, $allowedStatuses, true)) {
        throw new Exception("Trạng thái không hợp lệ!");
    }

    $conn->begin_transaction();

    $stmtOrder = $conn->prepare("
        SELECT ma_don, tinh_trang, phuong_thuc_tt, payment_status
        FROM orders
        WHERE ma_don = ?
        LIMIT 1
        FOR UPDATE
    ");
    $stmtOrder->bind_param("i", $maDon);
    $stmtOrder->execute();
    $rs = $stmtOrder->get_result();

    if ($rs->num_rows === 0) {
        throw new Exception("Không tìm thấy đơn hàng!");
    }

    $order = $rs->fetch_assoc();
    $stmtOrder->close();

    $trangThaiCu = trim((string)$order['tinh_trang']);
    $phuongThuc  = strtoupper(trim((string)($order['phuong_thuc_tt'] ?? 'COD')));
    $paymentStatus = trim((string)($order['payment_status'] ?? 'Pending'));

    $cuDaHuy  = (stripos($trangThaiCu, 'hủy') !== false);
    $moiLaHuy = (stripos($trangThaiMoi, 'hủy') !== false);

    // Không cho đơn VNPay chưa thanh toán đi tiếp sang giao hàng / hoàn tất
    if (
        $phuongThuc === 'VNPAY' &&
        $paymentStatus !== 'Paid' &&
        in_array($trangThaiMoi, ['Chờ xử lý', 'Đang giao hàng', 'Đã nhận hàng', 'Hoàn thành'], true)
    ) {
        throw new Exception("Đơn VNPay này chưa thanh toán thành công, không thể chuyển sang trạng thái xử lý/giao hàng.");
    }

    // Xác định đơn này đã từng bị trừ kho hay chưa
    $daTruKho = false;
    if ($phuongThuc === 'COD') {
        $daTruKho = true;
    } elseif ($phuongThuc === 'VNPAY' && $paymentStatus === 'Paid') {
        $daTruKho = true;
    }

    // Nếu hủy lần đầu và đơn đã từng trừ kho thì mới hoàn kho
    if (!$cuDaHuy && $moiLaHuy && $daTruKho) {
        $stmtItems = $conn->prepare("
            SELECT masp, variant_id, so_luong
            FROM order_details
            WHERE ma_don = ?
            ORDER BY detail_id ASC
        ");
        $stmtItems->bind_param("i", $maDon);
        $stmtItems->execute();
        $items = $stmtItems->get_result();

        $maspNeedSync = [];

        while ($item = $items->fetch_assoc()) {
            $masp = $item['masp'];
            $sl = (int)$item['so_luong'];
            $variant_id = $item['variant_id'] !== null ? (int)$item['variant_id'] : 0;

            if ($variant_id > 0) {
                $stmtUpVariant = $conn->prepare("
                    UPDATE product_variants
                    SET so_luong_ton = so_luong_ton + ?
                    WHERE variant_id = ?
                ");
                $stmtUpVariant->bind_param("ii", $sl, $variant_id);
                $stmtUpVariant->execute();
                $stmtUpVariant->close();
            } else {
                $stmtUpProduct = $conn->prepare("
                    UPDATE products
                    SET so_luong_ton = so_luong_ton + ?
                    WHERE masp = ?
                ");
                $stmtUpProduct->bind_param("is", $sl, $masp);
                $stmtUpProduct->execute();
                $stmtUpProduct->close();
            }

            $maspNeedSync[$masp] = true;
        }

        $stmtItems->close();
        sync_product_stock($conn, array_keys($maspNeedSync));
    }

    // Nếu admin hủy đơn VNPay còn Pending thì chuyển payment_status sang Failed
    $paymentStatusMoi = $paymentStatus;
    if ($phuongThuc === 'VNPAY' && $moiLaHuy && $paymentStatus === 'Pending') {
        $paymentStatusMoi = 'Failed';
    }

    $stmtUp = $conn->prepare("
        UPDATE orders
        SET tinh_trang = ?, payment_status = ?
        WHERE ma_don = ?
    ");
    $stmtUp->bind_param("ssi", $trangThaiMoi, $paymentStatusMoi, $maDon);
    $stmtUp->execute();
    $stmtUp->close();

    $conn->commit();

    echo json_encode([
        "status" => true,
        "message" => "Cập nhật trạng thái thành công!"
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if (isset($conn)) {
        try { $conn->rollback(); } catch (Exception $ignore) {}
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