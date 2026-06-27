<?php
header('Content-Type: application/json');
require_once('../connect.php');

$masp = isset($_GET['masp']) ? trim($_GET['masp']) : '';

if ($masp === '') {
    http_response_code(400);
    echo json_encode([
        "error" => "MISSING_MASP",
        "message" => "Thiếu tham số masp"
    ]);
    $conn->close();
    exit;
}

$stmt = $conn->prepare("SELECT variant_id, masp, ten_mau, ma_mau_hex, ram, rom, hinh_anh, so_luong_ton, gia_ban
                        FROM product_variants
                        WHERE masp = ?
                        ORDER BY variant_id ASC");
$stmt->bind_param("s", $masp);
$stmt->execute();
$res = $stmt->get_result();

$variants = [];
while ($v = $res->fetch_assoc()) {
    $variants[] = [
        "variant_id" => (int)$v['variant_id'],
        "masp" => $v['masp'],
        "ten_mau" => $v['ten_mau'],
        "ma_mau_hex" => $v['ma_mau_hex'],
        "ram" => $v['ram'],
        "rom" => $v['rom'],
        "hinh_anh" => $v['hinh_anh'],
        "so_luong_ton" => (int)$v['so_luong_ton'],
        "gia_ban" => (int)$v['gia_ban']
    ];
}

echo json_encode($variants);

$stmt->close();
$conn->close();
?>