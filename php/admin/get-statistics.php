<?php
header('Content-Type: application/json');
require_once('../../connect.php');

// Câu lệnh SQL "thần thánh":
// 1. Lấy tên Hãng sản xuất (hang_sx)
// 2. Tính tổng số lượng bán (SUM so_luong)
// 3. Tính tổng tiền (SUM so_luong * don_gia) - Lấy giá lúc mua trong order_details cho chính xác
// Chỉ tính những đơn hàng có trạng thái là 'Hoàn thành'
$sql = "SELECT 
            p.hang_sx AS tenHang, 
            SUM(od.so_luong) AS soLuongBan, 
            SUM(od.so_luong * od.don_gia) AS doanhThu
        FROM order_details od
        JOIN products p ON od.masp = p.masp
        JOIN orders o ON od.ma_don = o.ma_don
        WHERE o.tinh_trang = 'Hoàn thành' 
        GROUP BY p.hang_sx";

$result = $conn->query($sql);

$data = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $data[] = [
            'hang' => $row['tenHang'],
            'so_luong' => (int)$row['soLuongBan'],
            'doanh_thu' => (float)$row['doanhThu']
        ];
    }
}

echo json_encode($data);
$conn->close();
?>