<?php
header('Content-Type: application/json; charset=utf-8');
require_once('../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

if (!isset($_GET['masp'])) {
    echo json_encode([]);
    exit();
}

$masp = trim((string)$_GET['masp']);
if ($masp === '') {
    echo json_encode([]);
    exit();
}

$hasRateUserId = false;
$chkRateUserId = $conn->query("SHOW COLUMNS FROM rate LIKE 'user_id'");
if ($chkRateUserId && $chkRateUserId->num_rows > 0) {
    $hasRateUserId = true;
}

$hasUsersUserId = false;
$chkUsersUserId = $conn->query("SHOW COLUMNS FROM users LIKE 'user_id'");
if ($chkUsersUserId && $chkUsersUserId->num_rows > 0) {
    $hasUsersUserId = true;
}

if ($hasRateUserId && $hasUsersUserId) {
    $sql = "
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
    ";
} else {
    $sql = "
        SELECT r.id, r.masp, r.username, r.so_sao, r.binh_luan, r.ngay_dg,
               r.variant_id, r.mau_sac,
               pv.ma_mau_hex
        FROM rate r
        LEFT JOIN product_variants pv ON r.variant_id = pv.variant_id
        WHERE r.masp = ?
        ORDER BY r.ngay_dg DESC
    ";
}

$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $masp);
$stmt->execute();
$result = $stmt->get_result();

$reviews = [];
while ($row = $result->fetch_assoc()) {
    $displayName = trim((string)($row['ho'] ?? '') . ' ' . (string)($row['ten'] ?? ''));
    if ($displayName === '') {
        $displayName = (string)($row['username'] ?? '');
    }

    $reviews[] = [
        'id' => $row['id'],
        'masp' => $row['masp'],
        'user_id' => isset($row['user_id']) ? (int)$row['user_id'] : null,
        'username' => $row['username'] ?? '',
        'display_name' => $displayName,
        'rating' => (int)$row['so_sao'],
        'comment' => $row['binh_luan'],
        'timestamp' => $row['ngay_dg'],
        'variant_id' => $row['variant_id'] !== null ? (int)$row['variant_id'] : null,
        'mau_sac' => $row['mau_sac'],
        'ma_mau_hex' => $row['ma_mau_hex'] ?? null
    ];
}

echo json_encode($reviews, JSON_UNESCAPED_UNICODE);

$stmt->close();
$conn->close();
?>