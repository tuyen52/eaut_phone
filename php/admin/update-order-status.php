<?php
header('Content-Type: application/json');
require_once('../../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $data = json_decode(file_get_contents("php://input"), true);
    $maDon = (int)($data['maDon'] ?? 0);
    $trangThaiMoi = $data['trangThai'] ?? '';

    if ($maDon <= 0) throw new Exception("Mã đơn không hợp lệ!");
    if ($trangThaiMoi === '') throw new Exception("Thiếu trạng thái!");

    $conn->begin_transaction();

    // Lấy trạng thái cũ
    $rs = $conn->query("SELECT tinh_trang FROM orders WHERE ma_don = $maDon LIMIT 1");
    if ($rs->num_rows === 0) throw new Exception("Không tìm thấy đơn hàng!");
    $trangThaiCu = $rs->fetch_assoc()['tinh_trang'];

    $cuDaHuy = (stripos($trangThaiCu, 'hủy') !== false);
    $moiLaHuy = ($trangThaiMoi === 'Đã hủy' || $trangThaiMoi === 'Đã hủy bởi Khách');

    // Nếu chuyển sang Hủy lần đầu => hoàn kho theo variant
    if (!$cuDaHuy && $moiLaHuy) {
        $items = $conn->query("SELECT masp, variant_id, so_luong FROM order_details WHERE ma_don = $maDon");

        $maspNeedSync = [];

        while ($item = $items->fetch_assoc()) {
            $masp = $item['masp'];
            $sl = (int)$item['so_luong'];
            $variant_id = isset($item['variant_id']) ? (int)$item['variant_id'] : 0;

            if ($variant_id > 0) {
                $stmt = $conn->prepare("UPDATE product_variants SET so_luong_ton = so_luong_ton + ? WHERE variant_id = ?");
                $stmt->bind_param("ii", $sl, $variant_id);
                $stmt->execute();
                $stmt->close();
            } else {
                // fallback nếu đơn cũ không có variant
                $stmt = $conn->prepare("UPDATE products SET so_luong_ton = so_luong_ton + ? WHERE masp = ?");
                $stmt->bind_param("is", $sl, $masp);
                $stmt->execute();
                $stmt->close();
            }

            $maspNeedSync[$masp] = true;
        }

        // Sync tồn kho tổng products = SUM(variants)
        foreach (array_keys($maspNeedSync) as $m) {
            $stmt2 = $conn->prepare("
                UPDATE products
                SET so_luong_ton = (
                    SELECT IFNULL(SUM(v.so_luong_ton), 0)
                    FROM product_variants v
                    WHERE v.masp = ?
                )
                WHERE masp = ?
            ");
            $stmt2->bind_param("ss", $m, $m);
            $stmt2->execute();
            $stmt2->close();
        }
    }

    // Update trạng thái
    $stmtUp = $conn->prepare("UPDATE orders SET tinh_trang = ? WHERE ma_don = ?");
    $stmtUp->bind_param("si", $trangThaiMoi, $maDon);
    $stmtUp->execute();
    $stmtUp->close();

    $conn->commit();
    echo json_encode(["status" => true, "message" => "Cập nhật trạng thái thành công!"]);
} catch (Exception $e) {
    if (isset($conn)) {
        try { $conn->rollback(); } catch (Exception $ignore) {}
    }
    echo json_encode(["status" => false, "message" => $e->getMessage()]);
} finally {
    if (isset($conn)) $conn->close();
}
?>