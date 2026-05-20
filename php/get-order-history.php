<?php
// php/get-order-history.php
header('Content-Type: application/json; charset=utf-8');

require_once('../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $username = trim((string)($_GET['username'] ?? ''));

    if ($username === '') {
        echo json_encode([], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $dateCol = 'ngay_mua';
    $chk = $conn->query("SHOW COLUMNS FROM orders LIKE 'ngaymua'");
    if ($chk && $chk->num_rows > 0) {
        $dateCol = 'ngaymua';
    }

    $stmtOrders = $conn->prepare("
        SELECT ma_don, $dateCol AS ngay_mua_view, tinh_trang, tong_tien,
               phuong_thuc_tt, payment_status, vnp_txn_ref,
               vnp_transaction_no, vnp_response_code, paid_at,
               dia_chi, so_dien_thoai
        FROM orders
        WHERE username = ?
        ORDER BY $dateCol DESC, ma_don DESC
    ");
    $stmtOrders->bind_param("s", $username);
    $stmtOrders->execute();
    $rsOrders = $stmtOrders->get_result();

    $stmtDetails = $conn->prepare("
        SELECT masp, variant_id, mau_sac, so_luong, don_gia
        FROM order_details
        WHERE ma_don = ?
        ORDER BY detail_id ASC
    ");

    $orders = [];

    while ($row = $rsOrders->fetch_assoc()) {
        $maDon = (int)$row['ma_don'];

        $stmtDetails->bind_param("i", $maDon);
        $stmtDetails->execute();
        $rsDetails = $stmtDetails->get_result();

        $products = [];

        while ($d = $rsDetails->fetch_assoc()) {
            $products[] = [
                'ma' => $d['masp'],
                'masp' => $d['masp'],
                'variant_id' => $d['variant_id'] !== null ? (int)$d['variant_id'] : null,
                'mau_sac' => $d['mau_sac'] ?? null,
                'soluong' => (int)$d['so_luong'],
                'so_luong' => (int)$d['so_luong'],
                'gia' => (int)$d['don_gia']
            ];
        }

        $orders[] = [
            'maDon' => $maDon,
            'ngaymua' => $row['ngay_mua_view'],
            'ngayMua' => $row['ngay_mua_view'],
            'tinhTrang' => $row['tinh_trang'],
            'tongtien' => (int)$row['tong_tien'],
            'tongTien' => (int)$row['tong_tien'],
            'phuongThucTT' => $row['phuong_thuc_tt'] ?? 'COD',
            'pttt' => $row['phuong_thuc_tt'] ?? 'COD',
            'paymentStatus' => $row['payment_status'] ?? 'Pending',
            'vnpTxnRef' => $row['vnp_txn_ref'] ?? null,
            'vnpTransactionNo' => $row['vnp_transaction_no'] ?? null,
            'vnpResponseCode' => $row['vnp_response_code'] ?? null,
            'paidAt' => $row['paid_at'] ?? null,
            'diaChi' => $row['dia_chi'] ?? '',
            'sdt' => $row['so_dien_thoai'] ?? '',
            'sp' => $products
        ];
    }

    $stmtDetails->close();
    $stmtOrders->close();

    echo json_encode($orders, JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(400);

    echo json_encode([
        "status" => false,
        "message" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>