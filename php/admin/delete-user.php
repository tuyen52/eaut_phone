<?php
header('Content-Type: application/json');
require_once('../../connect.php');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username'])) {
    echo json_encode(["status" => false, "message" => "Thiếu username!"]);
    exit();
}

$username = $data['username'];

// 1. (Tùy chọn) Xóa đơn hàng của user trước để tránh lỗi ràng buộc khóa ngoại (nếu có)
$conn->query("DELETE FROM orders WHERE username = '$username'");

// 2. Xóa user
$sql = "DELETE FROM users WHERE username = '$username'";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => true, "message" => "Đã xóa người dùng thành công!"]);
} else {
    echo json_encode(["status" => false, "message" => "Lỗi xóa user: " . $conn->error]);
}

$conn->close();
?>
