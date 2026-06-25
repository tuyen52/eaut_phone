<?php
// php/price_helpers.php
// giamgia: chi hien thi, khong tru gia web
// giareonline: khuyen_mai_gia_tri = so tien giam online

if (!function_exists('parse_money_value')) {
    function parse_money_value($value): int
    {
        if (is_int($value) || is_float($value)) {
            return (int)$value;
        }

        $num = preg_replace('/[^\d]/', '', (string)$value);
        return (int)$num;
    }
}

if (!function_exists('resolve_online_discount_amount')) {
    function resolve_online_discount_amount(int $listPrice, int $promoValue): int
    {
        if ($promoValue <= 0 || $listPrice <= 0) {
            return 0;
        }
        // Du lieu cu: gia tri KM = gia ban cuoi (lon hon ~50% gia niem yet)
        if ($promoValue > (int)($listPrice * 0.5)) {
            return max(0, $listPrice - $promoValue);
        }
        return $promoValue;
    }
}

if (!function_exists('apply_online_promo_to_list_price')) {
    function apply_online_promo_to_list_price(int $listPrice, string $promoType, int $promoValue): int
    {
        if ($listPrice <= 0) {
            return 0;
        }

        if ($promoType === 'giareonline' && $promoValue > 0) {
            $discount = resolve_online_discount_amount($listPrice, $promoValue);
            return max(0, $listPrice - $discount);
        }

        return $listPrice;
    }
}

if (!function_exists('get_server_item_price')) {
    function get_server_item_price(mysqli $conn, string $masp, int $variantId = 0): int
    {
        $stmt = $conn->prepare("
            SELECT gia, khuyen_mai_loai, khuyen_mai_gia_tri
            FROM products
            WHERE masp = ?
            LIMIT 1
        ");
        $stmt->bind_param("s", $masp);
        $stmt->execute();

        $rs = $stmt->get_result();

        if ($rs->num_rows === 0) {
            throw new Exception("Khong tim thay san pham '$masp'.");
        }

        $row = $rs->fetch_assoc();
        $stmt->close();

        $listPrice = parse_money_value($row['gia']);
        $promoType = trim((string)($row['khuyen_mai_loai'] ?? ''));
        $promoValue = parse_money_value($row['khuyen_mai_gia_tri'] ?? 0);

        if ($variantId > 0) {
            $stmtV = $conn->prepare("
                SELECT gia_ban
                FROM product_variants
                WHERE variant_id = ? AND masp = ?
                LIMIT 1
            ");
            $stmtV->bind_param("is", $variantId, $masp);
            $stmtV->execute();
            $rsV = $stmtV->get_result();

            if ($rsV->num_rows === 0) {
                $stmtV->close();
                throw new Exception("Variant khong thuoc san pham '$masp'.");
            }

            $variantPrice = parse_money_value($rsV->fetch_assoc()['gia_ban'] ?? 0);
            $stmtV->close();

            if ($variantPrice > 0) {
                $listPrice = $variantPrice;
            }
        }

        return apply_online_promo_to_list_price($listPrice, $promoType, $promoValue);
    }
}

if (!function_exists('get_server_product_price')) {
    function get_server_product_price(mysqli $conn, string $masp): int
    {
        return get_server_item_price($conn, $masp, 0);
    }
}
