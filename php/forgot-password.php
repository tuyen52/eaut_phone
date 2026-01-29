<?php
// php/forgot-password.php
header('Content-Type: application/json');
require_once('../connect.php');

// 1. KÍCH HOẠT LẠI FILE GỬI MAIL
require_once('send-mail.php'); 

$data = json_decode(file_get_contents("php://input"), true);

// Lấy dữ liệu và xử lý ký tự đặc biệt
$email = $conn->real_escape_string($data['email']);
$username = $conn->real_escape_string($data['username']);

// 2. Kiểm tra tài khoản tồn tại (Email + Username)
// LƯU Ý: Đảm bảo cột tên tài khoản trong DB là 'username'
$sqlCheck = "SELECT * FROM users WHERE email = '$email' AND username = '$username'";
$result = $conn->query($sqlCheck);

if ($result->num_rows > 0) {
    // 3. Tạo mật khẩu mới ngẫu nhiên
    $new_pass = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 8);

    // 4. Cập nhật mật khẩu mới vào DB
    $sqlUpdate = "UPDATE users SET password = '$new_pass' WHERE email = '$email' AND username = '$username'";
    
    if ($conn->query($sqlUpdate) === TRUE) {
        
        // --- GỬI MAIL THẬT ---
        $subject = "Cấp lại mật khẩu mới - EAUT Phone Store";
        $content = "
            <h3>Xin chào $username,</h3>
            <p>Bạn vừa yêu cầu cấp lại mật khẩu.</p>
            <p>Mật khẩu mới của bạn là: <b style='color:red; font-size:18px;'>$new_pass</b></p>
            <p>Vui lòng đăng nhập và đổi lại mật khẩu ngay.</p>
        ";

        // Gọi hàm sendEmail từ file send-mail.php
        $mailSent = sendEmail($email, $subject, $content);

        if ($mailSent) {
            echo json_encode([
                "status" => true, 
                "message" => "Thành công! Mật khẩu mới đã được gửi về email của bạn."
            ]);
        } else {
            // Trường hợp DB đã đổi pass nhưng Mail không gửi được
            // Lúc này user sẽ không biết pass mới -> Có thể coi là lỗi
            echo json_encode([
                "status" => false, 
                "message" => "Lỗi gửi mail! (Dù mật khẩu đã được reset). Vui lòng liên hệ Admin."
            ]);
        }

    } else {
        echo json_encode(["status" => false, "message" => "Lỗi cập nhật Database."]);
    }
} else {
    echo json_encode(["status" => false, "message" => "Tên tài khoản hoặc Email không chính xác!"]);
}

$conn->close();
?>