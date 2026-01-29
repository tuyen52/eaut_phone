<?php
// File: php/admin/update-product.php
header('Content-Type: application/json');
require_once('../../connect.php');

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => false, "message" => "Không nhận được dữ liệu!"]);
    exit();
}

// 1. Lấy dữ liệu và BẢO VỆ CHUỖI (Escape String)
// Hàm real_escape_string sẽ thêm dấu \ trước ký tự ' để SQL không bị lỗi
$masp = $conn->real_escape_string($data['masp']);
$ten = $conn->real_escape_string($data['name']);
$hang = $conn->real_escape_string($data['company']);
$hinh = $conn->real_escape_string($data['img']);

// Xử lý giá tiền (Xóa dấu chấm)
$gia = str_replace('.', '', $data['price']);
$tonkho = isset($data['inventory']) ? (int)$data['inventory'] : 0;

$km_loai = $conn->real_escape_string($data['promo']['name']);
$km_gt = $conn->real_escape_string($data['promo']['value']);

$d = $data['detail'];
$screen = $conn->real_escape_string($d['screen']);
$os = $conn->real_escape_string($d['os']);
$cam = $conn->real_escape_string($d['camara']);
$camFront = $conn->real_escape_string($d['camaraFront']);
$cpu = $conn->real_escape_string($d['cpu']);
$ram = $conn->real_escape_string($d['ram']);
$rom = $conn->real_escape_string($d['rom']);
$bat = $conn->real_escape_string($d['battery']);

// 2. Câu lệnh SQL (Giờ đã an toàn với ký tự đặc biệt)
$sql = "UPDATE products SET 
        ten_sp='$ten', 
        hang_sx='$hang', 
        hinh_anh='$hinh', 
        gia=$gia, 
        khuyen_mai_loai='$km_loai', 
        khuyen_mai_gia_tri='$km_gt', 
        so_luong_ton=$tonkho,
        screen='$screen', 
        os='$os', 
        camera='$cam', 
        camera_front='$camFront', 
        cpu='$cpu', 
        ram='$ram', 
        rom='$rom', 
        battery='$bat'
        WHERE masp='$masp'";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => true, "message" => "Cập nhật thành công!"]);
} else {
    // Trả về lỗi chi tiết để dễ debug
    echo json_encode(["status" => false, "message" => "Lỗi SQL: " . $conn->error]);
}

$conn->close();
?>