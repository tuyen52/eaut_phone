<?php
header('Content-Type: application/json; charset=utf-8');

$uploadDir = __DIR__ . '/../img/products/uploads/';
$publicDir = 'img/products/uploads/';

if (!isset($_FILES['image'])) {
    echo json_encode(['status' => false, 'message' => 'Không tìm thấy file ảnh.']);
    exit;
}

$file = $_FILES['image'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['status' => false, 'message' => 'Upload thất bại. Mã lỗi: ' . $file['error']]);
    exit;
}

$allowedExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
$originalName = $file['name'];
$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

if (!in_array($ext, $allowedExt, true)) {
    echo json_encode(['status' => false, 'message' => 'Chỉ hỗ trợ ảnh JPG, JPEG, PNG, GIF, WEBP, BMP.']);
    exit;
}

$maxSize = 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    echo json_encode(['status' => false, 'message' => 'Kích thước ảnh không được vượt quá 5MB.']);
    exit;
}

if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0777, true) && !is_dir($uploadDir)) {
        echo json_encode(['status' => false, 'message' => 'Không thể tạo thư mục upload.']);
        exit;
    }
}

$baseName = preg_replace('/[^a-zA-Z0-9-_]/', '-', pathinfo($originalName, PATHINFO_FILENAME));
$baseName = trim($baseName, '-');
if ($baseName === '') {
    $baseName = 'image';
}

$uniqueName = $baseName . '-' . time() . '.' . $ext;
$targetPath = $uploadDir . $uniqueName;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    echo json_encode(['status' => false, 'message' => 'Không thể lưu file ảnh.']);
    exit;
}

echo json_encode([
    'status' => true,
    'message' => 'Upload ảnh thành công.',
    'path' => $publicDir . $uniqueName,
    'filename' => $uniqueName
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
