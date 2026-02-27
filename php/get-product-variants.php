<?php
header('Content-Type: application/json');
require_once('../connect.php');

if (!isset($_GET['masp'])) {
    echo json_encode([]);
    exit();
}

$masp = $_GET['masp'];

$stmt = $conn->prepare("SELECT variant_id, masp, mau_sac, so_luong_ton, hex, hinh_anh, gia
                        FROM product_variants
                        WHERE masp = ?
                        ORDER BY mau_sac ASC");
$stmt->bind_param("s", $masp);
$stmt->execute();

$result = $stmt->get_result();
$variants = [];

while ($row = $result->fetch_assoc()) {
    $variants[] = [
        "variant_id"   => (int)$row["variant_id"],
        "masp"         => $row["masp"],
        "mau_sac"      => $row["mau_sac"],
        "so_luong_ton" => (int)$row["so_luong_ton"],
        "hex"          => $row["hex"],
        "hinh_anh"     => $row["hinh_anh"],
        "gia"          => $row["gia"] !== null ? (int)$row["gia"] : null
    ];
}

echo json_encode($variants);

$stmt->close();
$conn->close();
?>