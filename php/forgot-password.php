<?php
// php/forgot-password.php
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/auth_session.php');
require_once('../connect.php');
require_once('send-mail.php');

try {
    $data = read_json_body();

    $email = trim($data['email'] ?? '');
    $username = trim($data['username'] ?? '');

    if ($email === '' || $username === '') {
        json_response(false, 'Vui lòng nhập tên tài khoản và email!', [], 400);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_response(false, 'Email không đúng định dạng!', [], 400);
    }

    $stmtCheck = $conn->prepare("
        SELECT username, email
        FROM users
        WHERE username = ? AND email = ?
        LIMIT 1
    ");
    $stmtCheck->bind_param("ss", $username, $email);
    $stmtCheck->execute();

    $rs = $stmtCheck->get_result();

    if ($rs->num_rows === 0) {
        json_response(false, 'Không tìm thấy tài khoản khớp với email đã nhập!', [], 404);
    }

    $stmtCheck->close();

    // Tạo mật khẩu tạm đủ mạnh hơn bản cũ
    $newPass = bin2hex(random_bytes(4)); // 8 ký tự hex
    $newHash = password_hash($newPass, PASSWORD_DEFAULT);

    $stmtUpdate = $conn->prepare("
        UPDATE users
        SET password = ?
        WHERE username = ? AND email = ?
    ");
    $stmtUpdate->bind_param("sss", $newHash, $username, $email);
    $stmtUpdate->execute();
    $stmtUpdate->close();

    $subject = "Cấp lại mật khẩu mới - EAUT Phone Store";
    $safeUsername = htmlspecialchars($username, ENT_QUOTES, 'UTF-8');
    $safePass = htmlspecialchars($newPass, ENT_QUOTES, 'UTF-8');

    $content = "
        <h3>Xin chào {$safeUsername},</h3>
        <p>Bạn vừa yêu cầu cấp lại mật khẩu tại <b>EAUT Phone Store</b>.</p>
        <p>Mật khẩu tạm thời của bạn là: <b style='color:red; font-size:18px;'>{$safePass}</b></p>
        <p>Vui lòng đăng nhập và đổi lại mật khẩu ngay sau khi đăng nhập.</p>
    ";

    $mailSent = sendEmail($email, $subject, $content);

    if (!$mailSent) {
        json_response(false, 'Mật khẩu đã được reset nhưng gửi email thất bại. Vui lòng liên hệ quản trị viên.', [], 500);
    }

    json_response(true, 'Thành công! Mật khẩu mới đã được gửi về email của bạn.');

} catch (Throwable $e) {
    error_log('Forgot password error: ' . $e->getMessage());
    json_response(false, 'Có lỗi xảy ra khi cấp lại mật khẩu!', [], 500);
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>