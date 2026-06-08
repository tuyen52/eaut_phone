<?php
// php/login.php
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/auth_session.php');
require_once('../connect.php');

try {
    $data = read_json_body();

    $username = trim($data['username'] ?? '');
    $password = trim($data['pass'] ?? '');

    if ($username === '' || $password === '') {
        json_response(false, 'Vui lòng nhập tên đăng nhập và mật khẩu!', [], 400);
    }

    $stmt = $conn->prepare("
        SELECT user_id, username, password, ho, ten, email, role, trang_thai
        FROM users
        WHERE username = ?
        LIMIT 1
    ");
    $stmt->bind_param("s", $username);
    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        json_response(false, 'Sai tên đăng nhập hoặc mật khẩu!', [], 401);
    }

    $row = $result->fetch_assoc();
    $stmt->close();

    if ((int)$row['trang_thai'] === 0) {
        json_response(false, 'Tài khoản đang bị khóa!', [], 403);
    }

    $storedPassword = (string)$row['password'];
    $isHashed = password_get_info($storedPassword)['algo'] !== 0;

    if ($isHashed) {
        $passwordOk = password_verify($password, $storedPassword);
    } else {
        // Hỗ trợ tài khoản cũ đang lưu plain text
        $passwordOk = hash_equals($storedPassword, $password);
    }

    if (!$passwordOk) {
        json_response(false, 'Sai tên đăng nhập hoặc mật khẩu!', [], 401);
    }

    /*
        Nếu mật khẩu cũ đang là plain text, tự nâng cấp sang password_hash()
        sau khi người dùng đăng nhập thành công.
    */
    if (!$isHashed) {
        $newHash = password_hash($password, PASSWORD_DEFAULT);

        $stmtHash = $conn->prepare("UPDATE users SET password = ? WHERE username = ?");
        $stmtHash->bind_param("ss", $newHash, $username);
        $stmtHash->execute();
        $stmtHash->close();
    }

    $user = [
        'user_id' => (int)($row['user_id'] ?? 0),
        'username' => $row['username'],
        'ho' => $row['ho'] ?? '',
        'ten' => $row['ten'] ?? '',
        'email' => $row['email'] ?? '',
        'role' => $row['role'] ?? 'user',
        'trang_thai' => (int)$row['trang_thai'],
        'off' => ((int)$row['trang_thai'] === 0)
    ];

    session_regenerate_id(true);
    $_SESSION['user'] = $user;

    json_response(true, 'Đăng nhập thành công!', [
        'user' => $user
    ]);

} catch (Throwable $e) {
    error_log('Login error: ' . $e->getMessage());
    json_response(false, 'Có lỗi xảy ra khi đăng nhập!', [], 500);
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>