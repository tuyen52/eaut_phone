<?php
// php/admin/delete-user.php
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/admin_auth.php');
require_once('../../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $data = read_json_body();

    $userId = (int)($data['user_id'] ?? 0);
    $username = trim($data['username'] ?? '');

    $hasUserId = false;
    $chkUserId = $conn->query("SHOW COLUMNS FROM users LIKE 'user_id'");
    if ($chkUserId && $chkUserId->num_rows > 0) {
        $hasUserId = true;
    }

    if ($hasUserId) {
        if ($userId <= 0) {
            json_response(false, 'Thiếu user_id!', [], 400);
        }
    } else {
        if ($username === '') {
            json_response(false, 'Thiếu username!', [], 400);
        }
    }

    $conn->begin_transaction();

    // Kiểm tra user tồn tại
    if ($hasUserId) {
        $stmtCheck = $conn->prepare("SELECT user_id, username, role FROM users WHERE user_id = ? LIMIT 1");
        $stmtCheck->bind_param("i", $userId);
    } else {
        $stmtCheck = $conn->prepare("SELECT username, role FROM users WHERE username = ? LIMIT 1");
        $stmtCheck->bind_param("s", $username);
    }
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

    $resolvedUserId = (int)($user['user_id'] ?? 0);
    $resolvedUsername = (string)($user['username'] ?? '');

    // Xóa chi tiết đơn hàng của user
    if ($hasUserId && $resolvedUserId > 0) {
        $stmtDetails = $conn->prepare("
            DELETE od
            FROM order_details od
            INNER JOIN orders o ON od.ma_don = o.ma_don
            WHERE o.user_id = ?
        ");
        $stmtDetails->bind_param("i", $resolvedUserId);
    } else {
        $stmtDetails = $conn->prepare("
            DELETE od
            FROM order_details od
            INNER JOIN orders o ON od.ma_don = o.ma_don
            WHERE o.username = ?
        ");
        $stmtDetails->bind_param("s", $resolvedUsername);
    }
    $stmtDetails->execute();
    $stmtDetails->close();

    // Xóa đơn hàng của user
    if ($hasUserId && $resolvedUserId > 0) {
        $stmtOrders = $conn->prepare("DELETE FROM orders WHERE user_id = ?");
        $stmtOrders->bind_param("i", $resolvedUserId);
    } else {
        $stmtOrders = $conn->prepare("DELETE FROM orders WHERE username = ?");
        $stmtOrders->bind_param("s", $resolvedUsername);
    }
    $stmtOrders->execute();
    $stmtOrders->close();

    // Xóa đánh giá của user
    if ($hasUserId && $resolvedUserId > 0) {
        $stmtReviews = $conn->prepare("DELETE FROM rate WHERE user_id = ?");
        $stmtReviews->bind_param("i", $resolvedUserId);
    } else {
        $stmtReviews = $conn->prepare("DELETE FROM rate WHERE username = ?");
        $stmtReviews->bind_param("s", $resolvedUsername);
    }
    $stmtReviews->execute();
    $stmtReviews->close();

    // Xóa phiên VNPay của user nếu có
    if ($hasUserId && $resolvedUserId > 0) {
        $stmtVnp = $conn->prepare("DELETE FROM vnpay_payment_sessions WHERE user_id = ?");
        $stmtVnp->bind_param("i", $resolvedUserId);
    } else {
        $stmtVnp = $conn->prepare("DELETE FROM vnpay_payment_sessions WHERE username = ?");
        $stmtVnp->bind_param("s", $resolvedUsername);
    }
    $stmtVnp->execute();
    $stmtVnp->close();

    // Xóa user
    if ($hasUserId && $resolvedUserId > 0) {
        $stmtUser = $conn->prepare("DELETE FROM users WHERE user_id = ? AND role != 'admin'");
        $stmtUser->bind_param("i", $resolvedUserId);
    } else {
        $stmtUser = $conn->prepare("DELETE FROM users WHERE username = ? AND role != 'admin'");
        $stmtUser->bind_param("s", $resolvedUsername);
    }
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