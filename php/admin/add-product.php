<?php
// php/admin/add-product.php
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/admin_auth.php');
require_once('../../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

function parse_admin_price($value) {
    $raw = (string)$value;
    $num = preg_replace('/[^\d]/', '', $raw);
    return (int)$num;
}

function normalize_hex_color($hex) {
    $hex = trim((string)$hex);
    if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $hex)) {
        return '#000000';
    }
    return $hex;
}

function normalize_variants_for_add($variants, $defaultImg, $fallbackStock, $fallbackPrice) {
    if (!is_array($variants)) {
        $variants = [];
    }

    if (count($variants) === 0) {
        $variants = [[
            'ten_mau' => 'Mặc định',
            'ma_mau_hex' => '#000000',
            'hinh_anh' => $defaultImg,
            'so_luong_ton' => $fallbackStock,
            'gia_ban' => max(0, (int)$fallbackPrice)
        ]];
    }

    $result = [];
    $totalStock = 0;
    $minPrice = null;

    foreach ($variants as $v) {
        if (!is_array($v)) continue;

        $tenMau = trim((string)($v['ten_mau'] ?? ''));
        if ($tenMau === '') continue;

        $hex = normalize_hex_color($v['ma_mau_hex'] ?? '#000000');

        $img = trim((string)($v['hinh_anh'] ?? ''));
        if ($img === '') {
            $img = $defaultImg;
        }

        $stock = (int)($v['so_luong_ton'] ?? 0);
        if ($stock < 0) {
            $stock = 0;
        }

        $ram = trim((string)($v['ram'] ?? ''));
        $rom = trim((string)($v['rom'] ?? ''));

        $giaBan = parse_admin_price($v['gia_ban'] ?? 0);
        if ($giaBan <= 0) {
            $giaBan = max(0, (int)$fallbackPrice);
        }

        $result[] = [
            'ten_mau'      => $tenMau,
            'ma_mau_hex'   => $hex,
            'hinh_anh'     => $img,
            'so_luong_ton' => $stock,
            'gia_ban'      => $giaBan,
            'ram'          => $ram,
            'rom'          => $rom
        ];

        $totalStock += $stock;
        if ($giaBan > 0 && ($minPrice === null || $giaBan < $minPrice)) {
            $minPrice = $giaBan;
        }
    }

    if (count($result) === 0) {
        $stock = max(0, (int)$fallbackStock);

        $result[] = [
            'ten_mau' => 'Mặc định',
            'ma_mau_hex' => '#000000',
            'hinh_anh' => $defaultImg,
            'so_luong_ton' => $stock,
            'gia_ban' => max(0, (int)$fallbackPrice)
        ];

        $totalStock = $stock;
        if ($fallbackPrice > 0) {
            $minPrice = max(0, (int)$fallbackPrice);
        }
    }

    return [$result, $totalStock, $minPrice ?? 0];
}

try {
    $data = read_json_body();

    $masp = trim((string)($data['masp'] ?? ''));
    $ten = trim((string)($data['name'] ?? ''));
    $hang = trim((string)($data['company'] ?? ''));
    $hinh = trim((string)($data['img'] ?? ''));

    $gia = parse_admin_price($data['price'] ?? 0);

    $promo = is_array($data['promo'] ?? null) ? $data['promo'] : [];
    $kmLoai = trim((string)($promo['name'] ?? ''));
    $kmGt = trim((string)($promo['value'] ?? ''));

    $detail = is_array($data['detail'] ?? null) ? $data['detail'] : [];

    $screen = trim((string)($detail['screen'] ?? ''));
    $os = trim((string)($detail['os'] ?? ''));
    $camera = trim((string)($detail['camara'] ?? ''));
    $cameraFront = trim((string)($detail['camaraFront'] ?? ''));
    $cpu = trim((string)($detail['cpu'] ?? ''));
    $ram = trim((string)($detail['ram'] ?? ''));
    $rom = trim((string)($detail['rom'] ?? ''));
    $battery = trim((string)($detail['battery'] ?? ''));
    $gioiThieu = trim((string)($data['gioi_thieu_san_pham'] ?? ''));

    $tonKhoCu = isset($data['inventory']) ? (int)$data['inventory'] : 0;
    if ($tonKhoCu < 0) $tonKhoCu = 0;

    if ($masp === '' || $ten === '' || $hang === '' || $hinh === '') {
        json_response(false, 'Thiếu thông tin sản phẩm bắt buộc!', [], 400);
    }

    if ($gia <= 0) {
        json_response(false, 'Vui lòng nhập giá bán cho ít nhất một biến thể!', [], 400);
    }

    [$variants, $totalStock, $minPrice] = normalize_variants_for_add(
        $data['variants'] ?? [],
        $hinh,
        $tonKhoCu,
        $gia
    );

    if ($minPrice > 0) {
        $gia = $minPrice;
    }

    // Kiểm tra trùng mã sản phẩm
    $stmtCheck = $conn->prepare("SELECT masp FROM products WHERE masp = ? LIMIT 1");
    $stmtCheck->bind_param("s", $masp);
    $stmtCheck->execute();
    $rsCheck = $stmtCheck->get_result();

    if ($rsCheck->num_rows > 0) {
        json_response(false, 'Mã sản phẩm đã tồn tại!', [], 409);
    }

    $stmtCheck->close();

    $conn->begin_transaction();

    $stmtProduct = $conn->prepare("
        INSERT INTO products (
            masp, ten_sp, hang_sx, hinh_anh, gia,
            khuyen_mai_loai, khuyen_mai_gia_tri, so_luong_ton,
            screen, os, camera, camera_front, cpu, ram, rom, battery, gioi_thieu_san_pham
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmtProduct->bind_param(
        "ssssississsssssss",
        $masp,
        $ten,
        $hang,
        $hinh,
        $gia,
        $kmLoai,
        $kmGt,
        $totalStock,
        $screen,
        $os,
        $camera,
        $cameraFront,
        $cpu,
        $ram,
        $rom,
        $battery,
        $gioiThieu
    );

    $stmtProduct->execute();
    $stmtProduct->close();

    $stmtVariant = $conn->prepare("
        INSERT INTO product_variants (
            masp, ten_mau, ma_mau_hex, hinh_anh, so_luong_ton, gia_ban, ram, rom
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");

    foreach ($variants as $v) {
        $tenMau     = $v['ten_mau'];
        $hex        = $v['ma_mau_hex'];
        $imgVariant = $v['hinh_anh'];
        $stock      = (int)$v['so_luong_ton'];
        $giaBan     = (int)$v['gia_ban'];
        $vRam       = $v['ram'] ?? '';
        $vRom       = $v['rom'] ?? '';

        $stmtVariant->bind_param(
            "ssssiiss",
            $masp,
            $tenMau,
            $hex,
            $imgVariant,
            $stock,
            $giaBan,
            $vRam,
            $vRom
        );

        $stmtVariant->execute();
    }

    $stmtVariant->close();

    // Đồng bộ tồn kho + giá min (trigger cũng cập nhật khi insert variant)
    $stmtSync = $conn->prepare("
        UPDATE products
        SET so_luong_ton = (
            SELECT IFNULL(SUM(v.so_luong_ton), 0)
            FROM product_variants v
            WHERE v.masp = ?
        ),
        gia = COALESCE(
            (
                SELECT MIN(v.gia_ban)
                FROM product_variants v
                WHERE v.masp = ? AND v.gia_ban > 0
            ),
            gia
        )
        WHERE masp = ?
    ");
    $stmtSync->bind_param("sss", $masp, $masp, $masp);
    $stmtSync->execute();
    $stmtSync->close();

    $conn->commit();

    json_response(true, 'Thêm sản phẩm + màu + ảnh theo màu thành công!');

} catch (Throwable $e) {
    if (isset($conn) && $conn instanceof mysqli) {
        try { $conn->rollback(); } catch (Throwable $ignore) {}
    }

    error_log('Add product error: ' . $e->getMessage());
    json_response(false, $e->getMessage(), [], 400);

} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>