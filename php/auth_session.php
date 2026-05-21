<?php
// php/auth_session.php
// Xác thực session dùng chung cho user/admin.

if (session_status() === PHP_SESSION_NONE) {
    $isHttps = (
        (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443)
    );

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    session_start();
}

function json_response($status, $message, $extra = [], $httpCode = 200) {
    http_response_code($httpCode);
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode(array_merge([
        'status' => $status,
        'message' => $message
    ], $extra), JSON_UNESCAPED_UNICODE);

    exit;
}

function get_current_user_session() {
    return $_SESSION['user'] ?? null;
}

function require_login() {
    $user = get_current_user_session();

    if (!$user || empty($user['username'])) {
        json_response(false, 'Bạn cần đăng nhập để thực hiện chức năng này!', [], 401);
    }

    return $user;
}

function require_admin() {
    $user = require_login();

    if (($user['role'] ?? '') !== 'admin') {
        json_response(false, 'Bạn không có quyền truy cập chức năng quản trị!', [], 403);
    }

    return $user;
}

function read_json_body() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!is_array($data)) {
        json_response(false, 'Dữ liệu JSON không hợp lệ!', [], 400);
    }

    return $data;
}
?>