<?php
header('Content-Type: application/json');
require_once('../../connect.php');

// Nhận dữ liệu JSON gửi từ Javascript
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username']) || !isset($data['lock'])) {
    echo json_encode(["status" => false, "message" => "Thiếu dữ liệu đầu vào!"]);
    exit();
}

$username = $data['username'];
// Nếu lock = true (Muốn khóa) -> trang_thai = 0
// Nếu lock = false (Muốn mở) -> trang_thai = 1
$trang_thai_moi = $data['lock'] ? 0 : 1; 

$sql = "UPDATE users SET trang_thai = $trang_thai_moi WHERE username = '$username'";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => true, "message" => "Cập nhật trạng thái thành công!"]);
} else {
    echo json_encode(["status" => false, "message" => "Lỗi Database: " . $conn->error]);
}

$conn->close();
?>
