<?php
// php/admin/update-product.php
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/admin_auth.php');
require_once('../../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

function parse_admin_price_update($value) {
    $raw = (string)$value;
    $num = preg_replace('/[^\d]/', '', $raw);
    return (int)$num;
}

function normalize_hex_color_update($hex) {
    $hex = trim((string)$hex);
    if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $hex)) {
        return '#000000';
    }
    return $hex;
}

function normalize_variant_row_update($v, $defaultImg) {
    if (!is_array($v)) return null;

    $tenMau = trim((string)($v['ten_mau'] ?? ''));
    if ($tenMau === '') return null;

    $variantId = (int)($v['variant_id'] ?? 0);
    $hex = normalize_hex_color_update($v['ma_mau_hex'] ?? '#000000');

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

    $giaBan = parse_admin_price_update($v['gia_ban'] ?? 0);
    if ($giaBan < 0) {
        $giaBan = 0;
    }

    return [
        'variant_id'   => $variantId,
        'ten_mau'      => $tenMau,
        'ma_mau_hex'   => $hex,
        'hinh_anh'     => $img,
        'so_luong_ton' => $stock,
        'gia_ban'      => $giaBan,
        'ram'          => $ram,
        'rom'          => $rom
    ];
}

function sync_product_stock_update(mysqli $conn, $masp) {
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
}

try {
    $data = read_json_body();

    $masp = trim((string)($data['masp'] ?? ''));

    if ($masp === '') {
        json_response(false, 'Thiếu mã sản phẩm!', [], 400);
    }

    $ten = trim((string)($data['name'] ?? ''));
    $hang = trim((string)($data['company'] ?? ''));
    $hinh = trim((string)($data['img'] ?? ''));

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

    if ($ten === '' || $hang === '' || $hinh === '') {
        json_response(false, 'Thiếu thông tin sản phẩm bắt buộc!', [], 400);
    }

    $hasVariantsKey = array_key_exists('variants', $data);
    $variantsReplace = ((int)($data['variants_replace'] ?? 0) === 1);
    $variants = is_array($data['variants'] ?? null) ? $data['variants'] : [];

    $conn->begin_transaction();

    // Kiểm tra sản phẩm tồn tại
    $stmtCheckProduct = $conn->prepare("SELECT masp FROM products WHERE masp = ? LIMIT 1");
    $stmtCheckProduct->bind_param("s", $masp);
    $stmtCheckProduct->execute();
    $rsProduct = $stmtCheckProduct->get_result();

    if ($rsProduct->num_rows === 0) {
        throw new Exception('Không tìm thấy sản phẩm cần cập nhật!');
    }

    $stmtCheckProduct->close();

    // Cập nhật thông tin cơ bản sản phẩm
    $stmtProduct = $conn->prepare("
        UPDATE products
        SET ten_sp = ?,
            hang_sx = ?,
            hinh_anh = ?,
            khuyen_mai_loai = ?,
            khuyen_mai_gia_tri = ?,
            screen = ?,
            os = ?,
            camera = ?,
            camera_front = ?,
            cpu = ?,
            ram = ?,
            rom = ?,
            battery = ?,
            gioi_thieu_san_pham = ?
        WHERE masp = ?
    ");

    $stmtProduct->bind_param(
        "sssssssssssssss",
        $ten,
        $hang,
        $hinh,
        $kmLoai,
        $kmGt,
        $screen,
        $os,
        $camera,
        $cameraFront,
        $cpu,
        $ram,
        $rom,
        $battery,
        $gioiThieu,
        $masp
    );

    $stmtProduct->execute();
    $stmtProduct->close();

    /*
        Nếu frontend gửi variants_replace = 1 thì thay thế danh sách màu.
        Giữ nguyên chức năng cũ:
        - variant_id > 0: sửa variant cũ nếu thuộc sản phẩm
        - variant_id <= 0: thêm variant mới
        - variant không còn trong danh sách gửi lên sẽ bị xóa
        - luôn đảm bảo còn ít nhất 1 variant
    */
    if ($hasVariantsKey && $variantsReplace) {
        $normalizedVariants = [];

        foreach ($variants as $v) {
            $row = normalize_variant_row_update($v, $hinh);
            if ($row !== null) {
                $normalizedVariants[] = $row;
            }
        }

        if (count($normalizedVariants) === 0) {
            $normalizedVariants[] = [
                'variant_id' => 0,
                'ten_mau' => 'Mặc định',
                'ma_mau_hex' => '#000000',
                'hinh_anh' => $hinh,
                'so_luong_ton' => 0,
                'gia_ban' => 0
            ];
        }

        $hasValidPrice = false;
        foreach ($normalizedVariants as $nv) {
            if ((int)($nv['gia_ban'] ?? 0) > 0) {
                $hasValidPrice = true;
                break;
            }
        }
        if (!$hasValidPrice) {
            throw new Exception('Vui lòng nhập giá bán cho ít nhất một biến thể!');
        }

        $keepIds = [];

        $stmtCheckVariant = $conn->prepare("
            SELECT variant_id
            FROM product_variants
            WHERE variant_id = ? AND masp = ?
            LIMIT 1
        ");

        $stmtUpdateVariant = $conn->prepare("
            UPDATE product_variants
            SET ten_mau = ?,
                ma_mau_hex = ?,
                hinh_anh = ?,
                so_luong_ton = ?,
                gia_ban = ?,
                ram = ?,
                rom = ?
            WHERE variant_id = ? AND masp = ?
        ");

        $stmtInsertVariant = $conn->prepare("
            INSERT INTO product_variants (
                masp, ten_mau, ma_mau_hex, hinh_anh, so_luong_ton, gia_ban, ram, rom
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        foreach ($normalizedVariants as $v) {
            $variantId  = (int)$v['variant_id'];
            $tenMau     = $v['ten_mau'];
            $hex        = $v['ma_mau_hex'];
            $imgVariant = $v['hinh_anh'];
            $stock      = (int)$v['so_luong_ton'];
            $giaBan     = (int)$v['gia_ban'];
            $vRam       = $v['ram'] ?? '';
            $vRom       = $v['rom'] ?? '';

            $updatedExisting = false;

            if ($variantId > 0) {
                $stmtCheckVariant->bind_param("is", $variantId, $masp);
                $stmtCheckVariant->execute();
                $rsVariant = $stmtCheckVariant->get_result();

                if ($rsVariant->num_rows > 0) {
                    $stmtUpdateVariant->bind_param(
                        "sssiissis",
                        $tenMau,
                        $hex,
                        $imgVariant,
                        $stock,
                        $giaBan,
                        $vRam,
                        $vRom,
                        $variantId,
                        $masp
                    );

                    $stmtUpdateVariant->execute();
                    $keepIds[] = $variantId;
                    $updatedExisting = true;
                }
            }

            if (!$updatedExisting) {
                $stmtInsertVariant->bind_param(
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

                $stmtInsertVariant->execute();
                $keepIds[] = (int)$conn->insert_id;
            }
        }

        $stmtCheckVariant->close();
        $stmtUpdateVariant->close();
        $stmtInsertVariant->close();

        /*
            Xóa các variant cũ không còn trong danh sách giữ lại.
            Không dùng chuỗi user input, keepIds toàn số nguyên do server tạo/kiểm tra.
        */
        $stmtListOld = $conn->prepare("
            SELECT variant_id
            FROM product_variants
            WHERE masp = ?
        ");
        $stmtListOld->bind_param("s", $masp);
        $stmtListOld->execute();
        $rsOld = $stmtListOld->get_result();

        $stmtDeleteOld = $conn->prepare("
            DELETE FROM product_variants
            WHERE variant_id = ? AND masp = ?
        ");

        while ($old = $rsOld->fetch_assoc()) {
            $oldId = (int)$old['variant_id'];

            if (!in_array($oldId, $keepIds, true)) {
                $stmtDeleteOld->bind_param("is", $oldId, $masp);
                $stmtDeleteOld->execute();
            }
        }

        $stmtListOld->close();
        $stmtDeleteOld->close();
    }

    // Đồng bộ tồn kho tổng
    sync_product_stock_update($conn, $masp);

    $conn->commit();

    json_response(true, 'Cập nhật sản phẩm + màu + ảnh theo màu thành công!');

} catch (Throwable $e) {
    if (isset($conn) && $conn instanceof mysqli) {
        try { $conn->rollback(); } catch (Throwable $ignore) {}
    }

    error_log('Update product error: ' . $e->getMessage());
    json_response(false, $e->getMessage(), [], 400);

} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>