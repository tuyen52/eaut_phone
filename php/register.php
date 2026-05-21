<?php
// php/register.php
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/auth_session.php');
require_once('../connect.php');
require_once('send-mail.php');

try {
    $data = read_json_body();

    $ho = trim($data['ho'] ?? '');
    $ten = trim($data['ten'] ?? '');
    $email = trim($data['email'] ?? '');
    $username = trim($data['username'] ?? '');
    $password = trim($data['pass'] ?? '');

    if ($ho === '' || $ten === '' || $email === '' || $username === '' || $password === '') {
        json_response(false, 'Vui lòng nhập đầy đủ thông tin!', [], 400);
    }

    if (mb_strlen($username, 'UTF-8') < 3) {
        json_response(false, 'Tên đăng nhập phải có ít nhất 3 ký tự!', [], 400);
    }

    if (mb_strlen($password, 'UTF-8') < 6) {
        json_response(false, 'Mật khẩu phải có ít nhất 6 ký tự!', [], 400);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_response(false, 'Email không đúng định dạng!', [], 400);
    }

    $domain = substr(strrchr($email, "@"), 1);
    if (!$domain || !checkdnsrr($domain, "MX")) {
        json_response(false, "Tên miền email không tồn tại hoặc không nhận thư!", [], 400);
    }

    // Kiểm tra username đã tồn tại
    $stmtCheckUser = $conn->prepare("SELECT username FROM users WHERE username = ? LIMIT 1");
    $stmtCheckUser->bind_param("s", $username);
    $stmtCheckUser->execute();
    $rsUser = $stmtCheckUser->get_result();

    if ($rsUser->num_rows > 0) {
        json_response(false, 'Tên đăng nhập đã tồn tại!', [], 409);
    }

    $stmtCheckUser->close();

    // Kiểm tra email đã tồn tại
    $stmtCheckEmail = $conn->prepare("SELECT email FROM users WHERE email = ? LIMIT 1");
    $stmtCheckEmail->bind_param("s", $email);
    $stmtCheckEmail->execute();
    $rsEmail = $stmtCheckEmail->get_result();

    if ($rsEmail->num_rows > 0) {
        json_response(false, 'Email này đã được sử dụng cho tài khoản khác!', [], 409);
    }

    $stmtCheckEmail->close();

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $role = 'user';
    $trangThai = 1;

    $stmtInsert = $conn->prepare("
        INSERT INTO users (ho, ten, username, password, email, role, trang_thai)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmtInsert->bind_param(
        "ssssssi",
        $ho,
        $ten,
        $username,
        $passwordHash,
        $email,
        $role,
        $trangThai
    );

    $stmtInsert->execute();
    $stmtInsert->close();

    // Gửi email chào mừng, không gửi mật khẩu
    $subject = "Đăng ký thành công - EAUT Phone Store";
    $content = "
        <h3>Xin chào " . htmlspecialchars($ho . ' ' . $ten, ENT_QUOTES, 'UTF-8') . ",</h3>
        <p>Chúc mừng bạn đã tạo thành công tài khoản tại <b>EAUT Phone Store</b>.</p>
        <p>Tên đăng nhập: <b>" . htmlspecialchars($username, ENT_QUOTES, 'UTF-8') . "</b></p>
        <p>Đây là thư tự động, vui lòng không trả lời email này.</p>
    ";

    // Nếu gửi mail lỗi thì vẫn không rollback đăng ký, vì tài khoản đã tạo thành công
    sendEmail($email, $subject, $content);

    json_response(true, 'Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');

} catch (Throwable $e) {
    error_log('Register error: ' . $e->getMessage());
    json_response(false, 'Có lỗi xảy ra khi đăng ký!', [], 500);
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>