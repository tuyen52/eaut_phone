<?php
// php/admin/delete-product.php
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/admin_auth.php');
require_once('../../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $data = read_json_body();

    $masp = trim($data['masp'] ?? '');

    if ($masp === '') {
        json_response(false, 'Thiếu mã sản phẩm!', [], 400);
    }

    $conn->begin_transaction();

    // Kiểm tra sản phẩm tồn tại
    $stmtCheck = $conn->prepare("SELECT masp FROM products WHERE masp = ? LIMIT 1");
    $stmtCheck->bind_param("s", $masp);
    $stmtCheck->execute();
    $rsCheck = $stmtCheck->get_result();

    if ($rsCheck->num_rows === 0) {
        throw new Exception('Không tìm thấy sản phẩm cần xóa!');
    }

    $stmtCheck->close();

    // Không xóa cứng sản phẩm đã có trong đơn hàng để tránh hỏng lịch sử mua hàng
    $stmtUsed = $conn->prepare("SELECT COUNT(*) AS total FROM order_details WHERE masp = ?");
    $stmtUsed->bind_param("s", $masp);
    $stmtUsed->execute();
    $usedRow = $stmtUsed->get_result()->fetch_assoc();
    $stmtUsed->close();

    if ((int)$usedRow['total'] > 0) {
        throw new Exception('Sản phẩm đã phát sinh đơn hàng, không nên xóa cứng. Có thể để tồn kho = 0 hoặc thêm trạng thái ẩn sản phẩm.');
    }

    // Xóa đánh giá của sản phẩm
    $stmtRate = $conn->prepare("DELETE FROM rate WHERE masp = ?");
    $stmtRate->bind_param("s", $masp);
    $stmtRate->execute();
    $stmtRate->close();

    // Xóa variant màu
    $stmtVariants = $conn->prepare("DELETE FROM product_variants WHERE masp = ?");
    $stmtVariants->bind_param("s", $masp);
    $stmtVariants->execute();
    $stmtVariants->close();

    // Xóa sản phẩm
    $stmtProduct = $conn->prepare("DELETE FROM products WHERE masp = ?");
    $stmtProduct->bind_param("s", $masp);
    $stmtProduct->execute();

    if ($stmtProduct->affected_rows <= 0) {
        throw new Exception('Không thể xóa sản phẩm!');
    }

    $stmtProduct->close();

    $conn->commit();

    json_response(true, 'Đã xóa sản phẩm!');

} catch (Throwable $e) {
    if (isset($conn) && $conn instanceof mysqli) {
        try { $conn->rollback(); } catch (Throwable $ignore) {}
    }

    error_log('Delete product error: ' . $e->getMessage());
    json_response(false, $e->getMessage(), [], 400);

} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>