<?php
// php/admin/update-product.php
header('Content-Type: application/json');
require_once('../../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) throw new Exception("Không nhận được dữ liệu!");

    $masp = $conn->real_escape_string(trim($data['masp'] ?? ''));
    if ($masp === '') throw new Exception("Thiếu mã sản phẩm!");

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

    $hasVariantsKey = array_key_exists('variants', $data);
    $variantsReplace = ((int)($data['variants_replace'] ?? 0) === 1);
    $variants = $data['variants'] ?? [];
    if (!is_array($variants)) $variants = [];

    $conn->begin_transaction();

    // Update base product
    $sql = "UPDATE products SET
            ten_sp='$ten',
            hang_sx='$hang',
            hinh_anh='$hinh',
            gia=$gia,
            khuyen_mai_loai='$km_loai',
            khuyen_mai_gia_tri='$km_gt',
            screen='$screen',
            os='$os',
            camera='$cam',
            camera_front='$camFront',
            cpu='$cpu',
            ram='$ram',
            rom='$rom',
            battery='$bat'
            WHERE masp='$masp'";
    $conn->query($sql);

    // Replace variants nếu client gửi
    if ($hasVariantsKey && $variantsReplace) {
        $keepIds = [];

        foreach ($variants as $v) {
            $variant_id = (int)($v['variant_id'] ?? 0);
            $ten_mau = trim($v['ten_mau'] ?? '');
            if ($ten_mau === '') continue;

            $hex = trim($v['ma_mau_hex'] ?? '#000000');
            if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $hex)) $hex = '#000000';

            $imgV = trim($v['hinh_anh'] ?? '');
            if ($imgV === '') $imgV = $hinh;

            $stock = (int)($v['so_luong_ton'] ?? 0);
            if ($stock < 0) $stock = 0;

            $ten_mau_sql = $conn->real_escape_string($ten_mau);
            $hex_sql = $conn->real_escape_string($hex);
            $img_sql = $conn->real_escape_string($imgV);

            if ($variant_id > 0) {
                $conn->query("UPDATE product_variants
                              SET ten_mau='$ten_mau_sql', ma_mau_hex='$hex_sql', hinh_anh='$img_sql', so_luong_ton=$stock
                              WHERE variant_id=$variant_id AND masp='$masp'");
                $keepIds[] = $variant_id;
            } else {
                $conn->query("INSERT INTO product_variants (masp, ten_mau, ma_mau_hex, hinh_anh, so_luong_ton)
                              VALUES ('$masp', '$ten_mau_sql', '$hex_sql', '$img_sql', $stock)");
                $keepIds[] = (int)$conn->insert_id;
            }
        }

        if (count($keepIds) === 0) {
            // đảm bảo có 1 variant
            $ten_mau_sql = $conn->real_escape_string('Mặc định');
            $hex_sql = $conn->real_escape_string('#000000');
            $img_sql = $conn->real_escape_string($hinh);

            $conn->query("INSERT INTO product_variants (masp, ten_mau, ma_mau_hex, hinh_anh, so_luong_ton)
                          VALUES ('$masp', '$ten_mau_sql', '$hex_sql', '$img_sql', 0)");
            $keepIds[] = (int)$conn->insert_id;
        }

        $idsStr = implode(',', array_map('intval', $keepIds));
        $conn->query("DELETE FROM product_variants WHERE masp='$masp' AND variant_id NOT IN ($idsStr)");
    }

    // Sync tồn kho tổng theo SUM variants
    $conn->query("UPDATE products SET so_luong_ton = (
                    SELECT IFNULL(SUM(v.so_luong_ton),0) FROM product_variants v WHERE v.masp='$masp'
                  ) WHERE masp='$masp'");

    $conn->commit();
    echo json_encode(["status" => true, "message" => "Cập nhật sản phẩm + màu + ảnh theo màu thành công!"]);
} catch (Exception $e) {
    try { $conn->rollback(); } catch (Exception $ignore) {}
    echo json_encode(["status" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>