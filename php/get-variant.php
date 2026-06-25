<?php
header('Content-Type: application/json');
require_once('../connect.php');

$variant_id = isset($_GET['variant_id']) ? intval($_GET['variant_id']) : 0;

if ($variant_id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "MISSING_VARIANT_ID", "message" => "Thiếu hoặc sai variant_id"]);
    $conn->close();
    exit;
}

$stmt = $conn->prepare("SELECT variant_id, masp, ten_mau, ma_mau_hex, ram, rom, hinh_anh, so_luong_ton, gia_ban
                        FROM product_variants
                        WHERE variant_id = ?
                        LIMIT 1");
$stmt->bind_param("i", $variant_id);
$stmt->execute();
$res = $stmt->get_result();

if ($res && $res->num_rows > 0) {
    $v = $res->fetch_assoc();
    echo json_encode([
        "variant_id" => (int)$v["variant_id"],
        "masp" => $v["masp"],
        "ten_mau" => $v["ten_mau"],
        "ma_mau_hex" => $v["ma_mau_hex"],
        "ram" => $v["ram"],
        "rom" => $v["rom"],
        "hinh_anh" => $v["hinh_anh"],
        "so_luong_ton" => (int)$v["so_luong_ton"],
        "gia_ban" => (int)($v["gia_ban"] ?? 0)
    ]);
} else {
    http_response_code(404);
    echo json_encode(["error" => "NOT_FOUND", "message" => "Không tìm thấy variant"]);
}

$stmt->close();
$conn->close();
?>