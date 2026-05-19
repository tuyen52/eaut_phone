<?php
header('Content-Type: application/json; charset=utf-8');
require_once('../connect.php');

if (!isset($_GET['username'])) {
    echo json_encode([]);
    exit();
}

$username = trim($_GET['username']);
if ($username === '') {
    echo json_encode([]);
    exit();
}

$stmt = $conn->prepare("
    SELECT 
        ma_don,
        ngay_mua,
        tinh_trang,
        phuong_thuc_tt,
        payment_status,
        tong_tien,
        vnp_txn_ref,
        vnp_transaction_no,
        vnp_response_code,
        paid_at
    FROM orders
    WHERE username = ?
    ORDER BY ngay_mua DESC, ma_don DESC
");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

$dsDonHang = [];

$stmtDetail = $conn->prepare("
    SELECT masp, variant_id, mau_sac, so_luong, don_gia
    FROM order_details
    WHERE ma_don = ?
    ORDER BY detail_id ASC
");

while ($row = $result->fetch_assoc()) {
    $ma_don = (int)$row['ma_don'];

    $stmtDetail->bind_param("i", $ma_don);
    $stmtDetail->execute();
    $res_detail = $stmtDetail->get_result();

    $products = [];
    while ($d = $res_detail->fetch_assoc()) {
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
        'phuongThucTT' => $row['phuong_thuc_tt'],
        'paymentStatus' => $row['payment_status'],
        'tongtien' => (int)$row['tong_tien'],
        'vnpTxnRef' => $row['vnp_txn_ref'],
        'vnpTransactionNo' => $row['vnp_transaction_no'],
        'vnpResponseCode' => $row['vnp_response_code'],
        'paidAt' => $row['paid_at'],
        'sp' => $products
    ];
}

echo json_encode($dsDonHang, JSON_UNESCAPED_UNICODE);

$stmtDetail->close();
$stmt->close();
$conn->close();
?>