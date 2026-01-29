<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); // Cho phép gọi API từ mọi nguồn (nếu cần)
require_once('../../connect.php'); // Gọi file kết nối ở thư mục gốc

// Lấy tất cả user ngoại trừ admin để hiển thị
$sql = "SELECT * FROM users WHERE role != 'admin'"; 
$result = $conn->query($sql);

$users = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Bảo mật: Xóa mật khẩu trước khi gửi về client
        unset($row['password']); 
        
        // Logic chuyển đổi: Database lưu 1 (Mở) / 0 (Khóa)
        // Javascript cần biến 'off': true (Bị khóa) / false (Hoạt động)
        $row['off'] = ($row['trang_thai'] == 0); 
        
        $users[] = $row;
    }
}

echo json_encode($users);
$conn->close();
?>