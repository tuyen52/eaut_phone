<?php
// php/admin/delete-order.php
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/admin_auth.php');
require_once('../../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $data = read_json_body();

    $maDon = (int)($data['maDon'] ?? 0);

    if ($maDon <= 0) {
        json_response(false, 'Mã đơn hàng không hợp lệ!', [], 400);
    }

    $conn->begin_transaction();

    // Kiểm tra đơn có tồn tại không
    $stmtCheck = $conn->prepare("SELECT ma_don FROM orders WHERE ma_don = ? LIMIT 1");
    $stmtCheck->bind_param("i", $maDon);
    $stmtCheck->execute();
    $rs = $stmtCheck->get_result();

    if ($rs->num_rows === 0) {
        throw new Exception('Không tìm thấy đơn hàng cần xóa!');
    }

    $stmtCheck->close();

    // Xóa chi tiết đơn trước
    $stmtDetails = $conn->prepare("DELETE FROM order_details WHERE ma_don = ?");
    $stmtDetails->bind_param("i", $maDon);
    $stmtDetails->execute();
    $stmtDetails->close();

    // Xóa đơn hàng
    $stmtOrder = $conn->prepare("DELETE FROM orders WHERE ma_don = ?");
    $stmtOrder->bind_param("i", $maDon);
    $stmtOrder->execute();

    if ($stmtOrder->affected_rows <= 0) {
        throw new Exception('Không thể xóa đơn hàng!');
    }

    $stmtOrder->close();

    $conn->commit();

    json_response(true, 'Đã xóa đơn hàng vĩnh viễn!');

} catch (Throwable $e) {
    if (isset($conn) && $conn instanceof mysqli) {
        try { $conn->rollback(); } catch (Throwable $ignore) {}
    }

    error_log('Delete order error: ' . $e->getMessage());
    json_response(false, $e->getMessage(), [], 400);

} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>