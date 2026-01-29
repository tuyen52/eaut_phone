<?php
// php/admin/get-orders.php
header('Content-Type: application/json');

// 1. Kiểm tra đường dẫn kết nối
// Nếu file này nằm ở: php/admin/get-orders.php
// Và connect.php nằm ở thư mục gốc: connect.php
// Thì đường dẫn đúng là ../../connect.php
if (!file_exists('../../connect.php')) {
    echo json_encode(["error" => "Không tìm thấy file connect.php! Kiểm tra lại đường dẫn."]);
    exit();
}
require_once('../../connect.php');

// 2. Thử chạy câu lệnh SQL an toàn
// Lưu ý: Tôi đổi 'ngaymua' thành 'ngay_mua' vì khả năng cao DB của bạn dùng tên này
// Nếu DB bạn là 'ngaymua' thì hãy sửa lại chữ bên dưới nhé
$col_ngay_mua = 'ngay_mua'; // <--- Kiểm tra kỹ tên cột này trong phpMyAdmin

// Kiểm tra xem cột có tồn tại không để tránh lỗi
$checkCol = $conn->query("SHOW COLUMNS FROM orders LIKE 'ngaymua'");
if($checkCol->num_rows > 0) {
    $col_ngay_mua = 'ngaymua';
}

$sql = "SELECT * FROM orders ORDER BY $col_ngay_mua DESC"; 
$result = $conn->query($sql);

if (!$result) {
    // Nếu SQL sai, báo lỗi chi tiết ra JSON để Javascript đọc được
    echo json_encode(["error" => "Lỗi truy vấn SQL: " . $conn->error]);
    exit();
}

$orders = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $ma_don = $row['ma_don'];
        
        // Lấy chi tiết
        $sql_detail = "SELECT * FROM order_details WHERE ma_don = $ma_don";
        $result_detail = $conn->query($sql_detail);
        $products = [];
        
        if($result_detail) {
            while($d = $result_detail->fetch_assoc()) {
                $products[] = [
                    'ma_sp' => $d['masp'],
                    'so_luong' => $d['so_luong'],
                    'don_gia' => $d['don_gia']
                ];
            }
        }

        // Xử lý dữ liệu an toàn (tránh lỗi nếu thiếu cột)
        $orders[] = [
            'maDon' => $row['ma_don'],
            'khachHang' => $row['username'],
            
            // Dùng isset để không bị lỗi nếu bạn chưa chạy lệnh thêm cột mới
            'sdt' => isset($row['so_dien_thoai']) ? $row['so_dien_thoai'] : '',
            'diaChi' => isset($row['dia_chi']) ? $row['dia_chi'] : '',
            'pttt' => isset($row['phuong_thuc_tt']) ? $row['phuong_thuc_tt'] : 'COD',
            
            'tongTien' => $row['tong_tien'],
            'ngayMua' => $row[$col_ngay_mua], // Dùng tên cột động đã check ở trên
            'tinhTrang' => $row['tinh_trang'],
            'sp' => $products
        ];
    }
}

echo json_encode($orders);
$conn->close();
?>