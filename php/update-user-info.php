<?php
header('Content-Type: application/json');
require_once('../connect.php');

$data = json_decode(file_get_contents("php://input"), true);

// Nhận dữ liệu
$username = $conn->real_escape_string($data['username']);
$ho = $conn->real_escape_string($data['ho']);
$ten = $conn->real_escape_string($data['ten']);

// Cập nhật vào DB
$sql = "UPDATE users SET ho = '$ho', ten = '$ten' WHERE username = '$username'";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => true, "message" => "Cập nhật thông tin thành công!"]);
} else {
    echo json_encode(["status" => false, "message" => "Lỗi: " . $conn->error]);
}

$conn->close();
?>