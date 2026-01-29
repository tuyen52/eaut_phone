<?php
header('Content-Type: application/json');
require_once('../connect.php');
require_once('send-mail.php'); 

$data = json_decode(file_get_contents("php://input"), true);
$ho = $data['ho'];
$ten = $data['ten'];
$email = $data['email'];
$username = $data['username'];
$password = $data['pass'];

// --- BƯỚC 1: KIỂM TRA EMAIL HỢP LỆ (MỚI THÊM) ---

// 1.1 Kiểm tra định dạng (có @, có dấu chấm...)
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => false, "message" => "Email không đúng định dạng! (Ví dụ đúng: ten@gmail.com)"]);
    exit();
}

// 1.2 Kiểm tra tên miền (Domain) có thực hay không
// Ví dụ: nhập @gmaill.com (thừa chữ l) hoặc @yahooo.com sẽ bị chặn
$domain = substr(strrchr($email, "@"), 1);
if (!checkdnsrr($domain, "MX")) {
    echo json_encode(["status" => false, "message" => "Tên miền email ($domain) không tồn tại hoặc không nhận thư!"]);
    exit();
}

// ------------------------------------------------

// 2. Kiểm tra username đã tồn tại chưa
$check = "SELECT * FROM users WHERE username = '$username'";
if ($conn->query($check)->num_rows > 0) {
    echo json_encode(["status" => false, "message" => "Tên đăng nhập đã tồn tại!"]);
    exit();
}

// 3. Kiểm tra email đã tồn tại chưa (Nên thêm cái này để tránh 1 email reg nhiều nick)
$checkEmail = "SELECT * FROM users WHERE email = '$email'";
if ($conn->query($checkEmail)->num_rows > 0) {
    echo json_encode(["status" => false, "message" => "Email này đã được sử dụng cho tài khoản khác!"]);
    exit();
}

// 4. Thêm người dùng vào Database
$sql = "INSERT INTO users (ho, ten, username, password, email, role, trang_thai) 
        VALUES ('$ho', '$ten', '$username', '$password', '$email', 'user', 1)";

if ($conn->query($sql) === TRUE) {
    
    // 5. Gửi email chào mừng
    $tieude = "Đăng ký thành công - EAUT Phone Store";
    $noidung = "
        <h3>Xin chào $ho $ten,</h3>
        <p>Chúc mừng bạn đã tạo thành công tài khoản tại <b>EAUT Phone Store</b>.</p>
        <p>Tên đăng nhập: <b>$username</b></p>
        <p>Đây là thư tự động, vui lòng không trả lời email này.</p>
    ";

    sendEmail($email, $tieude, $noidung);

    echo json_encode([
        "status" => true, 
        "message" => "Đăng ký thành công! Vui lòng kiểm tra email."
    ]);

} else {
    echo json_encode(["status" => false, "message" => "Lỗi hệ thống: " . $conn->error]);
}

$conn->close();
?>