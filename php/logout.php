<?php
// php/logout.php
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/auth_session.php');

$_SESSION = [];

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();

    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"] ?? '',
        $params["secure"],
        $params["httponly"]
    );
}

session_destroy();

echo json_encode([
    'status' => true,
    'message' => 'Đã đăng xuất!'
], JSON_UNESCAPED_UNICODE);
?>