<?php
header('Content-Type: application/json');
require_once('../connect.php');

$data = json_decode(file_get_contents("php://input"), true);

$username = $conn->real_escape_string($data['username']);
$old_pass = $conn->real_escape_string($data['old_pass']);
$new_pass = $conn->real_escape_string($data['new_pass']);

// 1. Kiểm tra mật khẩu cũ có đúng không
$sqlCheck = "SELECT password FROM users WHERE username = '$username' AND password = '$old_pass'";
$result = $conn->query($sqlCheck);

if ($result->num_rows > 0) {
    // 2. Mật khẩu cũ đúng -> Tiến hành cập nhật mật khẩu mới
    $sqlUpdate = "UPDATE users SET password = '$new_pass' WHERE username = '$username'";
    
    if ($conn->query($sqlUpdate) === TRUE) {
        echo json_encode(["status" => true, "message" => "Đổi mật khẩu thành công!"]);
    } else {
        echo json_encode(["status" => false, "message" => "Lỗi hệ thống: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => false, "message" => "Mật khẩu cũ không chính xác!"]);
}

$conn->close();
?>