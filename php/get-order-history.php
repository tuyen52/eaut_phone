<?php
header('Content-Type: application/json');
require_once('../connect.php');

if(!isset($_GET['username'])) {
    echo json_encode([]);
    exit();
}

$username = $_GET['username'];

$stmt = $conn->prepare("SELECT * FROM orders WHERE username = ? ORDER BY ngay_mua DESC");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

$dsDonHang = [];

$stmtDetail = $conn->prepare("
    SELECT masp, variant_id, mau_sac, so_luong, don_gia
    FROM order_details
    WHERE ma_don = ?
");

while($row = $result->fetch_assoc()) {
    $ma_don = (int)$row['ma_don'];

    $stmtDetail->bind_param("i", $ma_don);
    $stmtDetail->execute();
    $res_detail = $stmtDetail->get_result();

    $products = [];
    while($d = $res_detail->fetch_assoc()) {
        $products[] = [
            'ma' => $d['masp'],
            'variant_id' => $d['variant_id'] !== null ? (int)$d['variant_id'] : null,
            'mau_sac' => $d['mau_sac'] ?? null,
            'soluong' => (int)$d['so_luong'],
            'gia' => (int)$d['don_gia']
        ];
    }

    $dsDonHang[] = [
        'maDon' => $ma_don,
        'ngaymua' => $row['ngay_mua'],
        'tinhTrang' => $row['tinh_trang'],
        'tongtien' => (int)$row['tong_tien'],
        'sp' => $products
    ];
}

echo json_encode($dsDonHang);

$stmtDetail->close();
$stmt->close();
$conn->close();
?>