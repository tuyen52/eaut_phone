<?php
header('Content-Type: application/json');
require_once('../connect.php');

if(!isset($_GET['masp'])) {
    echo json_encode([]);
    exit();
}

$masp = $_GET['masp'];

// Lấy bình luận giảm dần theo ngày (mới nhất lên đầu)
$sql = "SELECT * FROM rate WHERE masp = '$masp' ORDER BY ngay_dg DESC";
$result = $conn->query($sql);

$reviews = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $reviews[] = [
            'id' => $row['id'],
            'masp' => $row['masp'],
            'username' => $row['username'],
            'rating' => (int)$row['so_sao'],    // JS cũ dùng 'rating'
            'comment' => $row['binh_luan'],     // JS cũ dùng 'comment'
            'timestamp' => $row['ngay_dg']      // JS cũ dùng 'timestamp'
        ];
    }
}

echo json_encode($reviews);
$conn->close();
?>