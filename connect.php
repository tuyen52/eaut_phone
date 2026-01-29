<?php
$servername = "localhost";
$username = "root";  // User mặc định của XAMPP
$password = "";      // Pass mặc định của XAMPP là rỗng
$dbname = "eaut_phone_db"; // Tên DB mình vừa tạo

// Tạo kết nối
$conn = new mysqli($servername, $username, $password, $dbname);

// Kiểm tra kết nối
if ($conn->connect_error) {
    die("Kết nối thất bại: " . $conn->connect_error);
}

// Thiết lập bảng mã font chữ tiếng Việt
$conn->set_charset("utf8mb4");
?>