<?php
// php/update-user-info.php
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/auth_session.php');
require_once('../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $currentUser = require_login();
    $userId = (int)($currentUser['user_id'] ?? 0);
    $username = (string)($currentUser['username'] ?? '');

    $data = read_json_body();

    $ho = trim($data['ho'] ?? '');
    $ten = trim($data['ten'] ?? '');

    if ($ho === '' && $ten === '') {
        json_response(false, 'Họ tên không được để trống!', [], 400);
    }

    $hasUserId = false;
    $chkUserId = $conn->query("SHOW COLUMNS FROM users LIKE 'user_id'");
    if ($chkUserId && $chkUserId->num_rows > 0) {
        $hasUserId = true;
    }

    if ($hasUserId && $userId > 0) {
        $stmtCheck = $conn->prepare("SELECT user_id FROM users WHERE user_id = ? LIMIT 1");
        $stmtCheck->bind_param("i", $userId);
        $stmtCheck->execute();
        $resultCheck = $stmtCheck->get_result();

        if ($resultCheck->num_rows === 0) {
            json_response(false, 'Không tìm thấy tài khoản cần cập nhật!', [], 404);
        }

        $stmtCheck->close();

        $stmtUpdate = $conn->prepare("UPDATE users SET ho = ?, ten = ? WHERE user_id = ?");
        $stmtUpdate->bind_param("ssi", $ho, $ten, $userId);
    } else {
        $stmtCheck = $conn->prepare("SELECT username FROM users WHERE username = ? LIMIT 1");
        $stmtCheck->bind_param("s", $username);
        $stmtCheck->execute();
        $resultCheck = $stmtCheck->get_result();

        if ($resultCheck->num_rows === 0) {
            json_response(false, 'Không tìm thấy tài khoản cần cập nhật!', [], 404);
        }

        $stmtCheck->close();

        $stmtUpdate = $conn->prepare("UPDATE users SET ho = ?, ten = ? WHERE username = ?");
        $stmtUpdate->bind_param("sss", $ho, $ten, $username);
    }
    $stmtUpdate->execute();
    $stmtUpdate->close();

    if ($hasUserId && $userId > 0) {
        $stmtUser = $conn->prepare("
            SELECT user_id, username, ho, ten, email, role, trang_thai
            FROM users
            WHERE user_id = ?
            LIMIT 1
        ");
        $stmtUser->bind_param("i", $userId);
    } else {
        $stmtUser = $conn->prepare("
            SELECT user_id, username, ho, ten, email, role, trang_thai
            FROM users
            WHERE username = ?
            LIMIT 1
        ");
        $stmtUser->bind_param("s", $username);
    }
    $stmtUser->execute();

    $resultUser = $stmtUser->get_result();
    $user = $resultUser->fetch_assoc();
    $stmtUser->close();

    $user['off'] = ((int)($user['trang_thai'] ?? 1) === 0);
    $user['user_id'] = isset($user['user_id']) ? (int)$user['user_id'] : $userId;

    $_SESSION['user'] = $user;

    json_response(true, 'Cập nhật họ tên thành công!', [
        'user' => $user
    ]);

} catch (Throwable $e) {
    error_log('Update user info error: ' . $e->getMessage());
    json_response(false, 'Có lỗi xảy ra khi cập nhật thông tin!', [], 400);

} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>