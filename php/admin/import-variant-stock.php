<?php
// php/admin/import-variant-stock.php
header('Content-Type: application/json');
require_once(__DIR__ . '/admin_auth.php');
require_once('../../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) throw new Exception("Không nhận được dữ liệu JSON!");

    $variant_id = (int)($data['variant_id'] ?? 0);
    $so_luong   = (int)($data['so_luong'] ?? 0);

    if ($variant_id <= 0) throw new Exception("variant_id không hợp lệ!");
    if ($so_luong <= 0) throw new Exception("Số lượng nhập phải > 0!");

    $conn->begin_transaction();

    // Lấy masp của variant
    $stmtGet = $conn->prepare("SELECT masp FROM product_variants WHERE variant_id = ? LIMIT 1");
    $stmtGet->bind_param("i", $variant_id);
    $stmtGet->execute();
    $rs = $stmtGet->get_result();
    if ($rs->num_rows === 0) throw new Exception("Không tìm thấy variant!");
    $masp = $rs->fetch_assoc()['masp'];
    $stmtGet->close();

    // Cộng kho cho variant
    $stmtUp = $conn->prepare("UPDATE product_variants SET so_luong_ton = so_luong_ton + ? WHERE variant_id = ?");
    $stmtUp->bind_param("ii", $so_luong, $variant_id);
    $stmtUp->execute();
    $stmtUp->close();

    // Sync kho tổng products = SUM(variants)
    $stmtSync = $conn->prepare("
        UPDATE products
        SET so_luong_ton = (
            SELECT IFNULL(SUM(v.so_luong_ton), 0)
            FROM product_variants v
            WHERE v.masp = ?
        )
        WHERE masp = ?
    ");
    $stmtSync->bind_param("ss", $masp, $masp);
    $stmtSync->execute();
    $stmtSync->close();

    $conn->commit();

    echo json_encode([
        "status" => true,
        "message" => "Nhập kho theo màu thành công! (+$so_luong)"
    ]);
} catch (Exception $e) {
    if (isset($conn)) {
        try { $conn->rollback(); } catch (Exception $ignore) {}
    }
    echo json_encode(["status" => false, "message" => $e->getMessage()]);
} finally {
    if (isset($conn)) $conn->close();
}
?>