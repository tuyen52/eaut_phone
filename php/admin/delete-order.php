<?php
header('Content-Type: application/json');
require_once(__DIR__ . '/admin_auth.php');
require_once('../../connect.php');

$data = json_decode(file_get_contents("php://input"), true);
$maDon = $data['maDon'];

// Xóa trong bảng orders (bảng order_details sẽ tự xóa theo nếu đã cài foreign key cascade, 
// nhưng để chắc chắn ta xóa cả 2)
$conn->query("DELETE FROM order_details WHERE ma_don = $maDon");
$sql = "DELETE FROM orders WHERE ma_don = $maDon";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => true, "message" => "Đã xóa đơn hàng vĩnh viễn!"]);
} else {
    echo json_encode(["status" => false, "message" => "Lỗi: " . $conn->error]);
}

$conn->close();
?>
