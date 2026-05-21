<?php
// php/change-password.php
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/auth_session.php');
require_once('../connect.php');

try {
    $currentUser = require_login();
    $username = $currentUser['username'];

    $data = read_json_body();

    $oldPass = trim($data['old_pass'] ?? '');
    $newPass = trim($data['new_pass'] ?? '');

    if ($oldPass === '' || $newPass === '') {
        json_response(false, 'Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới!', [], 400);
    }

    if (mb_strlen($newPass, 'UTF-8') < 6) {
        json_response(false, 'Mật khẩu mới phải có ít nhất 6 ký tự!', [], 400);
    }

    $stmt = $conn->prepare("SELECT password FROM users WHERE username = ? LIMIT 1");
    $stmt->bind_param("s", $username);
    $stmt->execute();

    $rs = $stmt->get_result();

    if ($rs->num_rows === 0) {
        json_response(false, 'Không tìm thấy tài khoản!', [], 404);
    }

    $row = $rs->fetch_assoc();
    $stmt->close();

    $storedPassword = (string)$row['password'];
    $isHashed = password_get_info($storedPassword)['algo'] !== 0;

    if ($isHashed) {
        $oldPassOk = password_verify($oldPass, $storedPassword);
    } else {
        // Hỗ trợ dữ liệu cũ plain text
        $oldPassOk = hash_equals($storedPassword, $oldPass);
    }

    if (!$oldPassOk) {
        json_response(false, 'Mật khẩu cũ không chính xác!', [], 400);
    }

    if (hash_equals($oldPass, $newPass)) {
        json_response(false, 'Mật khẩu mới không được trùng mật khẩu cũ!', [], 400);
    }

    $newHash = password_hash($newPass, PASSWORD_DEFAULT);

    $stmtUpdate = $conn->prepare("UPDATE users SET password = ? WHERE username = ?");
    $stmtUpdate->bind_param("ss", $newHash, $username);
    $stmtUpdate->execute();
    $stmtUpdate->close();

    json_response(true, 'Đổi mật khẩu thành công!');

} catch (Throwable $e) {
    error_log('Change password error: ' . $e->getMessage());
    json_response(false, 'Có lỗi xảy ra khi đổi mật khẩu!', [], 500);
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>