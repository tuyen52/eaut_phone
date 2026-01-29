<?php
header('Content-Type: application/json');
require_once('../../connect.php');

$data = json_decode(file_get_contents("php://input"), true);

// Nhận dữ liệu từ JS
$masp = $data['masp'];
$ten = $data['name'];
$hang = $data['company'];
$hinh = $data['img']; // Lưu ý: Ở đây ta đang lưu đường dẫn ảnh (string). Upload ảnh thật cần logic phức tạp hơn.
$gia = str_replace('.', '', $data['price']); // Xóa dấu chấm phân cách: "10.000.000" -> 10000000
$tonkho = $data['inventory'];

$km_loai = $data['promo']['name'];
$km_gt = $data['promo']['value'];

$d = $data['detail'];
$screen = $d['screen']; $os = $d['os']; $cam = $d['camara']; $camFront = $d['camaraFront'];
$cpu = $d['cpu']; $ram = $d['ram']; $rom = $d['rom']; $bat = $d['battery'];

// Kiểm tra trùng mã
$check = $conn->query("SELECT masp FROM products WHERE masp='$masp'");
if($check->num_rows > 0) {
    echo json_encode(["status" => false, "message" => "Mã sản phẩm đã tồn tại!"]);
    exit();
}

$sql = "INSERT INTO products (masp, ten_sp, hang_sx, hinh_anh, gia, khuyen_mai_loai, khuyen_mai_gia_tri, so_luong_ton, screen, os, camera, camera_front, cpu, ram, rom, battery) 
        VALUES ('$masp', '$ten', '$hang', '$hinh', $gia, '$km_loai', '$km_gt', $tonkho, '$screen', '$os', '$cam', '$camFront', '$cpu', '$ram', '$rom', '$bat')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => true, "message" => "Thêm sản phẩm thành công!"]);
} else {
    echo json_encode(["status" => false, "message" => "Lỗi: " . $conn->error]);
}
$conn->close();
?>