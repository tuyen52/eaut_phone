<?php
// php/admin/get-orders.php
header('Content-Type: application/json; charset=utf-8');
require_once(__DIR__ . '/admin_auth.php');
require_once('../../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $col_ngay_mua = 'ngay_mua';
    $checkCol = $conn->query("SHOW COLUMNS FROM orders LIKE 'ngaymua'");
    if ($checkCol && $checkCol->num_rows > 0) {
        $col_ngay_mua = 'ngaymua';
    }

    $sql = "
        SELECT 
            ma_don,
            username,
            so_dien_thoai,
            dia_chi,
            phuong_thuc_tt,
            payment_status,
            tong_tien,
            $col_ngay_mua AS ngay_mua_view,
            tinh_trang,
            vnp_txn_ref,
            vnp_transaction_no,
            vnp_response_code,
            paid_at
        FROM orders
        ORDER BY $col_ngay_mua DESC, ma_don DESC
    ";

    $result = $conn->query($sql);

    $orders = [];

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
        $result_detail = $stmtDetail->get_result();

        $products = [];
        while ($d = $result_detail->fetch_assoc()) {
            $products[] = [
                'ma_sp'      => $d['masp'],
                'variant_id' => $d['variant_id'] !== null ? (int)$d['variant_id'] : null,
                'mau_sac'    => $d['mau_sac'] ?? null,
                'so_luong'   => (int)$d['so_luong'],
                'don_gia'    => (int)$d['don_gia']
            ];
        }

        $orders[] = [
            'maDon'            => $ma_don,
            'khachHang'        => $row['username'],
            'sdt'              => $row['so_dien_thoai'] ?? '',
            'diaChi'           => $row['dia_chi'] ?? '',
            'pttt'             => $row['phuong_thuc_tt'] ?? 'COD',
            'paymentStatus'    => $row['payment_status'] ?? 'Pending',
            'tongTien'         => (int)$row['tong_tien'],
            'ngayMua'          => $row['ngay_mua_view'],
            'tinhTrang'        => $row['tinh_trang'],
            'vnpTxnRef'        => $row['vnp_txn_ref'] ?? null,
            'vnpTransactionNo' => $row['vnp_transaction_no'] ?? null,
            'vnpResponseCode'  => $row['vnp_response_code'] ?? null,
            'paidAt'           => $row['paid_at'] ?? null,
            'sp'               => $products
        ];
    }

    $stmtDetail->close();

    echo json_encode($orders, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>