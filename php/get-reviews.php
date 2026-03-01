<?php
header('Content-Type: application/json');
require_once('../connect.php');

if(!isset($_GET['masp'])) {
    echo json_encode([]);
    exit();
}

$masp = $_GET['masp'];

$stmt = $conn->prepare("
    SELECT r.id, r.masp, r.username, r.so_sao, r.binh_luan, r.ngay_dg,
           r.variant_id, r.mau_sac,
           pv.ma_mau_hex
    FROM rate r
    LEFT JOIN product_variants pv ON r.variant_id = pv.variant_id
    WHERE r.masp = ?
    ORDER BY r.ngay_dg DESC
");
$stmt->bind_param("s", $masp);
$stmt->execute();
$result = $stmt->get_result();

$reviews = [];
while($row = $result->fetch_assoc()) {
    $reviews[] = [
        'id' => $row['id'],
        'masp' => $row['masp'],
        'username' => $row['username'],
        'rating' => (int)$row['so_sao'],
        'comment' => $row['binh_luan'],
        'timestamp' => $row['ngay_dg'],
        'variant_id' => $row['variant_id'] !== null ? (int)$row['variant_id'] : null,
        'mau_sac' => $row['mau_sac'],
        'ma_mau_hex' => $row['ma_mau_hex']
    ];
}

echo json_encode($reviews);

$stmt->close();
$conn->close();
?>