<?php
header('Content-Type: application/json');
require_once('../../connect.php');

$sql = "
    SELECT r.*, p.ten_sp, pv.ma_mau_hex
    FROM rate r
    JOIN products p ON r.masp = p.masp
    LEFT JOIN product_variants pv ON r.variant_id = pv.variant_id
    ORDER BY r.ngay_dg DESC
";

$result = $conn->query($sql);

$reviews = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) $reviews[] = $row;
}

echo json_encode($reviews);
$conn->close();
?>