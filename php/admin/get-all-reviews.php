<?php
header('Content-Type: application/json');
require_once('../../connect.php');

// Lấy danh sách bình luận kèm tên sản phẩm
// Dùng JOIN để lấy tên sản phẩm từ bảng products
$sql = "SELECT rate.*, products.ten_sp 
        FROM rate 
        JOIN products ON rate.masp = products.masp 
        ORDER BY rate.ngay_dg DESC";

$result = $conn->query($sql);

$reviews = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $reviews[] = $row;
    }
}

echo json_encode($reviews);
$conn->close();
?>