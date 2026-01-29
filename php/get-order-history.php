<?php
header('Content-Type: application/json');
require_once('../connect.php'); // Kết nối CSDL

// Lấy username từ đường dẫn (URL) do user.js gửi lên
if(isset($_GET['username'])) {
    $username = $_GET['username'];
} else {
    echo json_encode([]); // Trả về rỗng nếu không có user
    exit();
}

// 1. Lấy danh sách đơn hàng của user đó từ bảng 'orders'
$sql = "SELECT * FROM orders WHERE username = '$username' ORDER BY ngay_mua DESC";
$result = $conn->query($sql);

$dsDonHang = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $ma_don = $row['ma_don'];
        
        // 2. Với mỗi đơn hàng, lấy chi tiết sản phẩm từ bảng 'order_details'
        $sql_detail = "SELECT * FROM order_details WHERE ma_don = $ma_don";
        $res_detail = $conn->query($sql_detail);
        $products = [];
        
        while($d = $res_detail->fetch_assoc()) {
            $products[] = [
                'ma' => $d['masp'],          // Mã sản phẩm
                'soluong' => $d['so_luong'], // Số lượng
                'gia' => $d['don_gia']       // Giá lúc mua
            ];
        }

        // 3. Gom dữ liệu trả về cho js/pages/user.js hiển thị
        $dsDonHang[] = [
            'maDon' => $row['ma_don'],
            'ngaymua' => $row['ngay_mua'],
            'tinhTrang' => $row['tinh_trang'], 
            'tongtien' => $row['tong_tien'],
            'sp' => $products
        ];
    }
}

// Trả kết quả về cho user.js
echo json_encode($dsDonHang);
$conn->close();
?>