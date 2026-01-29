<?php
header('Content-Type: application/json');
require_once('../../connect.php');

$data = json_decode(file_get_contents("php://input"), true);
$maDon = $data['maDon'];
$trangThaiMoi = $data['trangThai'];

// 1. Kiểm tra trạng thái hiện tại của đơn hàng trước khi cập nhật
// (Để tránh việc đơn đã hủy rồi lại bấm hủy lần nữa gây cộng dồn kho sai lệch)
$checkSql = "SELECT tinh_trang FROM orders WHERE ma_don = $maDon";
$resultCheck = $conn->query($checkSql);
$rowCheck = $resultCheck->fetch_assoc();
$trangThaiCu = $rowCheck['tinh_trang'];

// Nếu đơn hàng đã bị hủy trước đó rồi thì không làm gì thêm về kho nữa
if (strpos($trangThaiCu, 'Hủy') !== false || strpos($trangThaiCu, 'hủy') !== false) {
    // Chỉ update trạng thái text nếu cần, hoặc chặn luôn cũng được
    // Ở đây ta cứ cho update text nhưng KHÔNG cộng kho
} 
else {
    // [LOGIC MỚI] Nếu trạng thái MỚI là Hủy -> Cộng lại kho
    if ($trangThaiMoi == 'Đã hủy' || $trangThaiMoi == 'Đã hủy bởi Khách') {
        
        // Lấy danh sách sản phẩm trong đơn hàng này
        $sqlGetItems = "SELECT masp, so_luong FROM order_details WHERE ma_don = $maDon";
        $resultItems = $conn->query($sqlGetItems);

        if ($resultItems->num_rows > 0) {
            while ($item = $resultItems->fetch_assoc()) {
                $masp = $item['masp'];
                $sl = $item['so_luong'];

                // Cộng lại vào kho
                $sqlRestore = "UPDATE products SET so_luong_ton = so_luong_ton + $sl WHERE masp = '$masp'";
                $conn->query($sqlRestore);
            }
        }
    }
}

// 2. Cập nhật trạng thái đơn hàng
$sql = "UPDATE orders SET tinh_trang = '$trangThaiMoi' WHERE ma_don = $maDon";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => true, "message" => "Cập nhật trạng thái thành công!"]);
} else {
    echo json_encode(["status" => false, "message" => "Lỗi: " . $conn->error]);
}

$conn->close();
?>