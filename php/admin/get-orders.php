<?php
// php/admin/get-orders.php
header('Content-Type: application/json');

if (!file_exists('../../connect.php')) {
    echo json_encode(["error" => "Không tìm thấy file connect.php! Kiểm tra lại đường dẫn."]);
    exit();
}
require_once('../../connect.php');

$col_ngay_mua = 'ngay_mua';
$checkCol = $conn->query("SHOW COLUMNS FROM orders LIKE 'ngaymua'");
if ($checkCol && $checkCol->num_rows > 0) {
    $col_ngay_mua = 'ngaymua';
}

$sql = "SELECT * FROM orders ORDER BY $col_ngay_mua DESC";
$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["error" => "Lỗi truy vấn SQL: " . $conn->error]);
    exit();
}

$orders = [];

while ($row = $result->fetch_assoc()) {
    $ma_don = (int)$row['ma_don'];

    // Lấy chi tiết: có variant_id + mau_sac
    $sql_detail = "SELECT masp, variant_id, mau_sac, so_luong, don_gia
                   FROM order_details
                   WHERE ma_don = $ma_don";
    $result_detail = $conn->query($sql_detail);

    $products = [];
    if ($result_detail) {
        while ($d = $result_detail->fetch_assoc()) {
            $products[] = [
                'ma_sp'      => $d['masp'],
                'variant_id' => isset($d['variant_id']) ? (int)$d['variant_id'] : null,
                'mau_sac'    => $d['mau_sac'] ?? null,
                'so_luong'   => (int)$d['so_luong'],
                'don_gia'    => (int)$d['don_gia']
            ];
        }
    }

    $orders[] = [
        'maDon'     => (int)$row['ma_don'],
        'khachHang' => $row['username'],
        'sdt'       => isset($row['so_dien_thoai']) ? $row['so_dien_thoai'] : '',
        'diaChi'    => isset($row['dia_chi']) ? $row['dia_chi'] : '',
        'pttt'      => isset($row['phuong_thuc_tt']) ? $row['phuong_thuc_tt'] : 'COD',
        'tongTien'  => (int)$row['tong_tien'],
        'ngayMua'   => $row[$col_ngay_mua],
        'tinhTrang' => $row['tinh_trang'],
        'sp'        => $products
    ];
}

echo json_encode($orders);
$conn->close();
?>