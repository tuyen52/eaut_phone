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
        if ($userId <= 0 && $username === '') {
            json_response(false, 'Thiếu dữ liệu đầu vào!', [], 400);
        }
    } else {
        if ($username === '') {
            json_response(false, 'Thiếu username!', [], 400);
        }
    }

    $conn->begin_transaction();

    // Kiểm tra user tồn tại và chỉ cho phép xóa tài khoản user thường.
    if ($hasUserId && $userId > 0) {
        $stmtCheck = $conn->prepare("SELECT user_id, username, role FROM users WHERE user_id = ? LIMIT 1");
        $stmtCheck->bind_param("i", $userId);
    } else {
        $stmtCheck = $conn->prepare("SELECT user_id, username, role FROM users WHERE username = ? LIMIT 1");
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

    // Chỉ xóa bản ghi user.
    // Các dữ liệu liên quan sẽ được MySQL xử lý bằng ràng buộc FK hiện có:
    // - orders.user_id -> SET NULL
    // - orders.username -> CASCADE
    // - order_details / rate / vnpay_payment_sessions -> CASCADE hoặc SET NULL theo schema hiện tại
    if ($resolvedUserId > 0) {
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