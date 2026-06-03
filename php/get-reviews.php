<?php
header('Content-Type: application/json');
require_once('../connect.php');

if(!isset($_GET['masp'])) {
    echo json_encode([]);
    exit();
}

$masp = $_GET['masp'];

$stmt = $conn->prepare("
    SELECT r.id, r.masp, r.user_id, r.username, r.so_sao, r.binh_luan, r.ngay_dg,
           r.variant_id, r.mau_sac,
           pv.ma_mau_hex,
           u.ho, u.ten
    FROM rate r
    LEFT JOIN product_variants pv ON r.variant_id = pv.variant_id
    LEFT JOIN users u ON (
        (r.user_id IS NOT NULL AND r.user_id = u.user_id)
        OR (r.user_id IS NULL AND r.username = u.username)
    )
    WHERE r.masp = ?
    ORDER BY r.ngay_dg DESC
");
$stmt->bind_param("s", $masp);
$stmt->execute();
$result = $stmt->get_result();

$reviews = [];
while($row = $result->fetch_assoc()) {
    $displayName = trim(($row['ho'] ?? '') . ' ' . ($row['ten'] ?? ''));
    if ($displayName === '') {
        $displayName = $row['username'] ?? '';
    }

    $reviews[] = [
        'id' => $row['id'],
        'masp' => $row['masp'],
        'user_id' => isset($row['user_id']) ? (int)$row['user_id'] : null,
        'username' => $row['username'],
        'display_name' => $displayName,
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