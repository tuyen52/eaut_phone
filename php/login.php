<?php
header('Content-Type: application/json');
require_once('../connect.php'); // Kết nối DB

// Nhận dữ liệu JSON từ phía JS gửi lên
$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'];
$password = $data['pass'];

// Kiểm tra trong database
$sql = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    
    // Nếu tài khoản bị khóa (trang_thai = 0)
    if($row['trang_thai'] == 0) {
        echo json_encode(["status" => false, "message" => "Tài khoản đang bị khóa!"]);
    } else {
        // Đăng nhập thành công -> Trả về thông tin user (trừ mật khẩu)
        unset($row['password']); 
        echo json_encode([
            "status" => true, 
            "message" => "Đăng nhập thành công!",
            "user" => $row
        ]);
    }
} else {
    echo json_encode(["status" => false, "message" => "Sai tên đăng nhập hoặc mật khẩu!"]);
}

$conn->close();
?>
