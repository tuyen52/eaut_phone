<?php
header('Content-Type: application/json');
require_once('../connect.php');

if (!isset($_GET['masp'])) {
    echo json_encode(["status" => false, "stock" => 0]);
    exit();
}

$masp = $_GET['masp'];
$sql = "SELECT so_luong_ton FROM products WHERE masp = '$masp'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode(["status" => true, "stock" => (int)$row['so_luong_ton']]);
} else {
    echo json_encode(["status" => false, "stock" => 0]);
}

$conn->close();
?>