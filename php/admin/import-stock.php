<?php
header('Content-Type: application/json');
require_once('../../connect.php');

$data = json_decode(file_get_contents("php://input"), true);
$masp = $data['masp'];
$sl = (int)$data['so_luong'];

if($sl <= 0) {
    echo json_encode(["status" => false, "message" => "Số lượng nhập phải lớn hơn 0!"]);
    exit();
}

// 1. Lưu lịch sử nhập kho
$sqlLog = "INSERT INTO nhap_kho (masp, so_luong_nhap) VALUES ('$masp', $sl)";
$conn->query($sqlLog);

// 2. Cộng thêm số lượng vào kho chính (bảng products)
$sqlUpdate = "UPDATE products SET so_luong_ton = so_luong_ton + $sl WHERE masp = '$masp'";

if ($conn->query($sqlUpdate) === TRUE) {
    echo json_encode(["status" => true, "message" => "Đã nhập thêm $sl sản phẩm vào kho!"]);
} else {
    echo json_encode(["status" => false, "message" => "Lỗi: " . $conn->error]);
}

$conn->close();
?>