<?php
header('Content-Type: application/json');
require_once(__DIR__ . '/admin_auth.php');
require_once('../../connect.php');

$data = json_decode(file_get_contents("php://input"), true);
$masp = $data['masp'];

// Xóa
$sql = "DELETE FROM products WHERE masp = '$masp'";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => true, "message" => "Đã xóa sản phẩm!"]);
} else {
    echo json_encode(["status" => false, "message" => "Lỗi: " . $conn->error]);
}
$conn->close();
?>