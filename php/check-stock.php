<?php
header('Content-Type: application/json');
require_once('../connect.php');

// Ưu tiên kiểm theo variant_id (tồn kho theo màu)
if (isset($_GET['variant_id'])) {
    $variant_id = (int)$_GET['variant_id'];

    $stmt = $conn->prepare("SELECT so_luong_ton FROM product_variants WHERE variant_id = ?");
    $stmt->bind_param("i", $variant_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode(["status" => true, "stock" => (int)$row['so_luong_ton']]);
    } else {
        echo json_encode(["status" => false, "stock" => 0]);
    }

    $stmt->close();
    $conn->close();
    exit();
}

// Fallback: kiểm theo masp (kho tổng)
if (isset($_GET['masp'])) {
    $masp = $_GET['masp'];

    $stmt = $conn->prepare("SELECT so_luong_ton FROM products WHERE masp = ?");
    $stmt->bind_param("s", $masp);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode(["status" => true, "stock" => (int)$row['so_luong_ton']]);
    } else {
        echo json_encode(["status" => false, "stock" => 0]);
    }

    $stmt->close();
    $conn->close();
    exit();
}

echo json_encode(["status" => false, "stock" => 0]);
$conn->close();
?>