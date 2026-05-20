<?php
// php/admin/delete-user.php
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/admin_auth.php');
require_once('../../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $data = read_json_body();

    $username = trim($data['username'] ?? '');

    if ($username === '') {
        json_response(false, 'Thiếu username!', [], 400);
    }

    $conn->begin_transaction();

    // Kiểm tra user tồn tại
    $stmtCheck = $conn->prepare("SELECT username, role FROM users WHERE username = ? LIMIT 1");
    $stmtCheck->bind_param("s", $username);
    $stmtCheck->execute();
    $rsCheck = $stmtCheck->get_result();

    if ($rsCheck->num_rows === 0) {
        throw new Exception('Không tìm thấy người dùng cần xóa!');
    }

    $user = $rsCheck->fetch_assoc();
    $stmtCheck->close();

    if (($user['role'] ?? '') === 'admin') {
        throw new Exception('Không được xóa tài khoản quản trị viên!');
    }

    // Xóa chi tiết đơn hàng của user
    $stmtDetails = $conn->prepare("
        DELETE od
        FROM order_details od
        INNER JOIN orders o ON od.ma_don = o.ma_don
        WHERE o.username = ?
    ");
    $stmtDetails->bind_param("s", $username);
    $stmtDetails->execute();
    $stmtDetails->close();

    // Xóa đơn hàng của user
    $stmtOrders = $conn->prepare("DELETE FROM orders WHERE username = ?");
    $stmtOrders->bind_param("s", $username);
    $stmtOrders->execute();
    $stmtOrders->close();

    // Xóa đánh giá của user
    $stmtReviews = $conn->prepare("DELETE FROM rate WHERE username = ?");
    $stmtReviews->bind_param("s", $username);
    $stmtReviews->execute();
    $stmtReviews->close();

    // Xóa user
    $stmtUser = $conn->prepare("DELETE FROM users WHERE username = ? AND role != 'admin'");
    $stmtUser->bind_param("s", $username);
    $stmtUser->execute();

    if ($stmtUser->affected_rows <= 0) {
        throw new Exception('Không thể xóa người dùng!');
    }

    $stmtUser->close();

    $conn->commit();

    json_response(true, 'Đã xóa người dùng thành công!');

} catch (Throwable $e) {
    if (isset($conn) && $conn instanceof mysqli) {
        try { $conn->rollback(); } catch (Throwable $ignore) {}
    }

    error_log('Delete user error: ' . $e->getMessage());
    json_response(false, $e->getMessage(), [], 400);

} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>