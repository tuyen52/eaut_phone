<?php
header('Content-Type: application/json');
require_once('../connect.php');

// check-stock
if (isset($_GET['variant_id'])) {
    $variant_id = intval($_GET['variant_id']);
    if ($variant_id <= 0) {
        echo json_encode(["status" => false, "stock" => 0]);
        exit();
    }

    $stmt = $conn->prepare("SELECT so_luong_ton, ten_mau FROM product_variants WHERE variant_id = ? LIMIT 1");
    $stmt->bind_param("i", $variant_id);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows > 0) {
        $row = $res->fetch_assoc();
        echo json_encode([
            "status" => true,
            "stock" => (int)$row['so_luong_ton'],
            "ten_mau" => $row['ten_mau']
        ]);
    } else {
        echo json_encode(["status" => false, "stock" => 0]);
    }

    $stmt->close();
    $conn->close();
    exit();
}

// Fallback cũ: check theo masp
if (!isset($_GET['masp'])) {
    echo json_encode(["status" => false, "stock" => 0]);
    exit();
}

$masp = $_GET['masp'];
$stmt = $conn->prepare("SELECT so_luong_ton FROM products WHERE masp = ? LIMIT 1");
$stmt->bind_param("s", $masp);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows > 0) {
    $row = $res->fetch_assoc();
    echo json_encode(["status" => true, "stock" => (int)$row['so_luong_ton']]);
} else {
    echo json_encode(["status" => false, "stock" => 0]);
}

$stmt->close();
$conn->close();
?>