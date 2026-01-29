<?php
header('Content-Type: application/json');
require_once('../connect.php');

$data = json_decode(file_get_contents("php://input"), true);

if(!$data) { echo json_encode(["status"=>false]); exit(); }

$masp = $conn->real_escape_string($data['masp']);
$user = $conn->real_escape_string($data['username']);
$star = (int)$data['rating'];
$cmt  = $conn->real_escape_string($data['comment']);
// Ngày giờ hiện tại
$date = date("Y-m-d H:i:s");

// 1. Thêm bình luận vào bảng 'rate'
$sqlInsert = "INSERT INTO rate (masp, username, so_sao, binh_luan, ngay_dg) 
              VALUES ('$masp', '$user', $star, '$cmt', '$date')";

if ($conn->query($sqlInsert) === TRUE) {
    
    // 2. TÍNH TOÁN LẠI SAO TRUNG BÌNH CHO SẢN PHẨM
    // Lấy tổng số sao và số lượng đánh giá của sản phẩm này
    $sqlCal = "SELECT AVG(so_sao) as trung_binh, COUNT(*) as so_luong FROM rate WHERE masp='$masp'";
    $result = $conn->query($sqlCal);
    $row = $result->fetch_assoc();
    
    $newStar = round($row['trung_binh']); // Làm tròn số sao (VD: 4.6 -> 5)
    $newCount = $row['so_luong'];

    // Cập nhật lại vào bảng products để hiển thị ngoài trang chủ cho nhanh
    $sqlUpdate = "UPDATE products SET so_sao = $newStar, so_danh_gia = $newCount WHERE masp='$masp'";
    $conn->query($sqlUpdate);

    echo json_encode(["status" => true, "message" => "Đánh giá thành công!"]);
} else {
    echo json_encode(["status" => false, "message" => "Lỗi: " . $conn->error]);
}

$conn->close();
?>