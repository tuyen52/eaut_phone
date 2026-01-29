<?php
header('Content-Type: application/json');
require_once('../../connect.php');

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'];
$masp = $data['masp']; // Cần mã SP để tính lại sao

// 1. Xóa bình luận
$sqlDelete = "DELETE FROM rate WHERE id = $id";
if ($conn->query($sqlDelete) === TRUE) {

    // 2. Tính lại số sao trung bình sau khi xóa
    $sqlCal = "SELECT AVG(so_sao) as trung_binh, COUNT(*) as so_luong FROM rate WHERE masp='$masp'";
    $result = $conn->query($sqlCal);
    $row = $result->fetch_assoc();
    
    // Nếu xóa hết bình luận thì về 0, ngược lại thì làm tròn
    $newStar = $row['so_luong'] > 0 ? round($row['trung_binh']) : 0;
    $newCount = $row['so_luong'];

    // 3. Cập nhật lại bảng products
    $sqlUpdate = "UPDATE products SET so_sao = $newStar, so_danh_gia = $newCount WHERE masp='$masp'";
    $conn->query($sqlUpdate);

    echo json_encode(["status" => true, "message" => "Đã xóa bình luận và cập nhật lại số sao!"]);
} else {
    echo json_encode(["status" => false, "message" => "Lỗi: " . $conn->error]);
}

$conn->close();
?>