<?php
// php/admin/add-product.php
header('Content-Type: application/json');
require_once('../../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) throw new Exception("Không nhận được dữ liệu JSON!");

    $masp = $conn->real_escape_string(trim($data['masp'] ?? ''));
    $ten  = $conn->real_escape_string(trim($data['name'] ?? ''));
    $hang = $conn->real_escape_string(trim($data['company'] ?? ''));
    $hinh = $conn->real_escape_string(trim($data['img'] ?? ''));

    $gia_raw = (string)($data['price'] ?? '0');
    $gia = (int)str_replace('.', '', $gia_raw);

    $km_loai = $conn->real_escape_string(trim($data['promo']['name'] ?? ''));
    $km_gt   = $conn->real_escape_string(trim($data['promo']['value'] ?? ''));

    $d = $data['detail'] ?? [];
    $screen   = $conn->real_escape_string(trim($d['screen'] ?? ''));
    $os       = $conn->real_escape_string(trim($d['os'] ?? ''));
    $cam      = $conn->real_escape_string(trim($d['camara'] ?? ''));
    $camFront = $conn->real_escape_string(trim($d['camaraFront'] ?? ''));
    $cpu      = $conn->real_escape_string(trim($d['cpu'] ?? ''));
    $ram      = $conn->real_escape_string(trim($d['ram'] ?? ''));
    $rom      = $conn->real_escape_string(trim($d['rom'] ?? ''));
    $bat      = $conn->real_escape_string(trim($d['battery'] ?? ''));

    $tonkho_old = isset($data['inventory']) ? (int)$data['inventory'] : 0;

    if ($masp === '' || $ten === '' || $hang === '' || $hinh === '') {
        throw new Exception("Thiếu thông tin sản phẩm (masp/name/company/img).");
    }

    // ===== Variants =====
    $variants = $data['variants'] ?? [];
    if (!is_array($variants)) $variants = [];

    if (count($variants) === 0) {
        $variants = [[
            'ten_mau' => 'Mặc định',
            'ma_mau_hex' => '#000000',
            'hinh_anh' => $hinh,
            'so_luong_ton' => $tonkho_old
        ]];
    }

    $totalStock = 0;
    $norm = [];
    foreach ($variants as $v) {
        $ten_mau = trim($v['ten_mau'] ?? '');
        if ($ten_mau === '') continue;

        $hex = trim($v['ma_mau_hex'] ?? '#000000');
        if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $hex)) $hex = '#000000';

        $imgV = trim($v['hinh_anh'] ?? '');
        if ($imgV === '') $imgV = $hinh;

        $stock = (int)($v['so_luong_ton'] ?? 0);
        if ($stock < 0) $stock = 0;

        $totalStock += $stock;

        $norm[] = [
            'ten_mau' => $conn->real_escape_string($ten_mau),
            'hex' => $conn->real_escape_string($hex),
            'img' => $conn->real_escape_string($imgV),
            'stock' => $stock
        ];
    }

    if (count($norm) === 0) {
        $norm[] = [
            'ten_mau' => $conn->real_escape_string('Mặc định'),
            'hex' => $conn->real_escape_string('#000000'),
            'img' => $conn->real_escape_string($hinh),
            'stock' => max(0, $tonkho_old)
        ];
        $totalStock = max(0, $tonkho_old);
    }

    // Check trùng masp
    $check = $conn->query("SELECT masp FROM products WHERE masp='$masp' LIMIT 1");
    if ($check && $check->num_rows > 0) {
        throw new Exception("Mã sản phẩm đã tồn tại!");
    }

    $conn->begin_transaction();

    $sql = "INSERT INTO products
            (masp, ten_sp, hang_sx, hinh_anh, gia, khuyen_mai_loai, khuyen_mai_gia_tri, so_luong_ton,
             screen, os, camera, camera_front, cpu, ram, rom, battery)
            VALUES
            ('$masp', '$ten', '$hang', '$hinh', $gia, '$km_loai', '$km_gt', $totalStock,
             '$screen', '$os', '$cam', '$camFront', '$cpu', '$ram', '$rom', '$bat')";
    $conn->query($sql);

    foreach ($norm as $v) {
        $sqlV = "INSERT INTO product_variants (masp, ten_mau, ma_mau_hex, hinh_anh, so_luong_ton)
                 VALUES ('$masp', '{$v['ten_mau']}', '{$v['hex']}', '{$v['img']}', {$v['stock']})";
        $conn->query($sqlV);
    }

    // Sync kho tổng
    $conn->query("UPDATE products SET so_luong_ton = (
                    SELECT IFNULL(SUM(v.so_luong_ton),0) FROM product_variants v WHERE v.masp='$masp'
                  ) WHERE masp='$masp'");

    $conn->commit();

    echo json_encode(["status" => true, "message" => "Thêm sản phẩm + màu + ảnh theo màu thành công!"]);
} catch (Exception $e) {
    try { $conn->rollback(); } catch (Exception $ignore) {}
    echo json_encode(["status" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>