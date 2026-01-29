<?php
// php/thanhtoan.php
header('Content-Type: application/json');
require_once('../connect.php');

$data = json_decode(file_get_contents("php://input"), true);

$username = $data['username'];
$tong_tien = $data['tong_tien'];
$san_pham = $data['san_pham']; 

// Thông tin giao hàng mới
$hoten = $conn->real_escape_string($data['ho_ten']); // (Nếu muốn lưu họ tên người nhận riêng)
$sdt = $conn->real_escape_string($data['sdt']);
$diachi = $conn->real_escape_string($data['dia_chi']);
$pttt = $conn->real_escape_string($data['phuong_thuc']); // 'COD' hoặc 'Banking'

// 1. KIỂM TRA TỒN KHO (Giữ nguyên logic cũ)
foreach ($san_pham as $sp) {
    $masp = $sp['masp'];
    $sl_mua = $sp['so_luong'];
    $check = $conn->query("SELECT ten_sp, so_luong_ton FROM products WHERE masp = '$masp'");
    if ($check->num_rows > 0) {
        $row = $check->fetch_assoc();
        if ($sl_mua > $row['so_luong_ton']) {
            echo json_encode(["status" => false, "message" => "Sản phẩm '{$row['ten_sp']}' chỉ còn {$row['so_luong_ton']} cái!"]);
            exit();
        }
    }
}

// 2. TẠO ĐƠN HÀNG (Thêm các cột mới)
$sql_order = "INSERT INTO orders (username, tong_tien, tinh_trang, phuong_thuc_tt, dia_chi, so_dien_thoai) 
              VALUES ('$username', $tong_tien, 'Chờ xử lý', '$pttt', '$diachi', '$sdt')";

if ($conn->query($sql_order) === TRUE) {
    $ma_don = $conn->insert_id;

    // 3. LƯU CHI TIẾT & TRỪ KHO
    foreach ($san_pham as $sp) {
        $masp = $sp['masp'];
        $sl = $sp['so_luong'];
        $gia = $sp['gia'];

        $conn->query("INSERT INTO order_details (ma_don, masp, so_luong, don_gia) VALUES ($ma_don, '$masp', $sl, $gia)");
        $conn->query("UPDATE products SET so_luong_ton = so_luong_ton - $sl WHERE masp = '$masp'");
    }

    echo json_encode(["status" => true, "message" => "Đặt hàng thành công! Mã đơn: #" . $ma_don]);
} else {
    echo json_encode(["status" => false, "message" => "Lỗi: " . $conn->error]);
}
$conn->close();
?>