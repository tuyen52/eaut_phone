<?php
header('Content-Type: application/json');
require_once('../connect.php');

$sql = "SELECT * FROM products";
$result = $conn->query($sql);

$mangSanPham = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $sp = [
            "masp"      => $row['masp'],
            "name"      => $row['ten_sp'],
            "company"   => $row['hang_sx'],
            "img"       => $row['hinh_anh'],
            "price"     => $row['gia'], 
            "star"      => (int)$row['so_sao'],
            "rateCount" => (int)$row['so_danh_gia'],
            "promo"     => [
                "name"  => $row['khuyen_mai_loai'],
                "value" => $row['khuyen_mai_gia_tri']
            ],
            // [QUAN TRỌNG] Đã lấy được chi tiết từ DB
            "detail"    => [
                "screen" => $row['screen'],
                "os" => $row['os'],
                "camara" => $row['camera'], // JS cũ dùng từ 'camara' (lỗi chính tả cũ) nên ta map theo nó
                "camaraFront" => $row['camera_front'],
                "cpu" => $row['cpu'],
                "ram" => $row['ram'],
                "rom" => $row['rom'],
                "microUSB" => $row['micro_usb'],
                "battery" => $row['battery']
            ], 
            "inventory" => (int)$row['so_luong_ton']
        ];
        array_push($mangSanPham, $sp);
    }
}
echo json_encode($mangSanPham);
$conn->close();
?>