<?php
// php/order_helpers.php

if (!function_exists('normalize_payment_method_code')) {
    function normalize_payment_method_code($raw)
    {
        $raw = strtoupper(trim((string)$raw));
        if ($raw === 'VNPAY' || strpos($raw, 'VNPAY') !== false) {
            return 'VNPAY';
        }
        return 'COD';
    }
}

if (!function_exists('generate_vnp_txn_ref')) {
    function generate_vnp_txn_ref($maDon)
    {
        return 'DH' . date('Ymd') . str_pad((string)$maDon, 6, '0', STR_PAD_LEFT);
    }
}

if (!function_exists('get_client_ip')) {
    function get_client_ip()
    {
        $keys = [
            'HTTP_CF_CONNECTING_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'REMOTE_ADDR'
        ];

        foreach ($keys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = trim(explode(',', $_SERVER[$key])[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        return '127.0.0.1';
    }
}

if (!function_exists('clean_vnpay_text')) {
    function clean_vnpay_text($text)
    {
        $text = trim((string)$text);
        if ($text === '') return '';

        $converted = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);
        if ($converted !== false && $converted !== '') {
            $text = $converted;
        }

        $text = preg_replace('/[^A-Za-z0-9\s\-\_\.\:]/', ' ', $text);
        $text = preg_replace('/\s+/', ' ', $text);

        return trim($text);
    }
}

if (!function_exists('vnpay_build_query_string')) {
    function vnpay_build_query_string($data)
    {
        $pieces = [];
        foreach ($data as $key => $value) {
            if ($value === null || $value === '') continue;
            $pieces[] = urlencode($key) . '=' . urlencode($value);
        }
        return implode('&', $pieces);
    }
}

if (!function_exists('vnpay_create_payment_url')) {
    function vnpay_create_payment_url($orderData)
    {
        global $vnp_Url, $vnp_ReturnUrl, $vnp_TmnCode, $vnp_HashSecret;
        global $vnp_ApiVersion, $vnp_OrderType, $vnp_Locale, $vnp_ExpireMinutes;

        $txnRef      = $orderData['txn_ref'];
        $amount      = (int)$orderData['amount'];
        $orderInfo   = clean_vnpay_text($orderData['order_info']);
        $clientIp    = $orderData['ip_addr'];

        $createDate  = date('YmdHis');
        $expireDate  = date('YmdHis', strtotime('+' . (int)$vnp_ExpireMinutes . ' minutes'));

        $inputData = [
            "vnp_Version"    => $vnp_ApiVersion,
            "vnp_TmnCode"    => $vnp_TmnCode,
            "vnp_Amount"     => $amount * 100,
            "vnp_Command"    => "pay",
            "vnp_CreateDate" => $createDate,
            "vnp_CurrCode"   => "VND",
            "vnp_IpAddr"     => $clientIp,
            "vnp_Locale"     => $vnp_Locale,
            "vnp_OrderInfo"  => $orderInfo,
            "vnp_OrderType"  => $vnp_OrderType,
            "vnp_ReturnUrl"  => $vnp_ReturnUrl,
            "vnp_TxnRef"     => $txnRef,
            "vnp_ExpireDate" => $expireDate
        ];

        if (!empty($orderData['bank_code'])) {
            $inputData["vnp_BankCode"] = $orderData['bank_code'];
        }

        ksort($inputData);

        $hashData = vnpay_build_query_string($inputData);
        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        return $vnp_Url . '?' . $hashData . '&vnp_SecureHash=' . $secureHash;
    }
}

if (!function_exists('vnpay_verify_response')) {
    function vnpay_verify_response($sourceData, $hashSecret)
    {
        $inputData = [];
        foreach ($sourceData as $key => $value) {
            if (strpos($key, 'vnp_') === 0) {
                $inputData[$key] = $value;
            }
        }

        $receivedHash = $inputData['vnp_SecureHash'] ?? '';
        unset($inputData['vnp_SecureHash'], $inputData['vnp_SecureHashType']);

        ksort($inputData);
        $hashData = vnpay_build_query_string($inputData);
        $calculatedHash = hash_hmac('sha512', $hashData, $hashSecret);

        return [
            'valid' => hash_equals($calculatedHash, $receivedHash),
            'input' => $inputData,
            'received_hash' => $receivedHash,
            'calculated_hash' => $calculatedHash
        ];
    }
}

if (!function_exists('vnpay_response_message')) {
    function vnpay_response_message($code)
    {
        $map = [
            '00' => 'Giao dịch thành công',
            '07' => 'Giao dịch nghi ngờ gian lận',
            '09' => 'Thẻ/Tài khoản chưa đăng ký Internet Banking',
            '10' => 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
            '11' => 'Đã hết hạn chờ thanh toán',
            '12' => 'Thẻ/Tài khoản bị khóa',
            '13' => 'Sai mật khẩu xác thực giao dịch (OTP)',
            '24' => 'Khách hàng hủy giao dịch',
            '51' => 'Tài khoản không đủ số dư',
            '65' => 'Vượt quá hạn mức giao dịch trong ngày',
            '75' => 'Ngân hàng thanh toán đang bảo trì',
            '79' => 'Nhập sai mật khẩu thanh toán quá số lần quy định',
            '99' => 'Lỗi không xác định'
        ];

        return $map[$code] ?? ('Mã phản hồi: ' . $code);
    }
}

if (!function_exists('parse_vnpay_paydate_to_mysql')) {
    function parse_vnpay_paydate_to_mysql($payDate)
    {
        $payDate = trim((string)$payDate);
        if (!preg_match('/^\d{14}$/', $payDate)) {
            return null;
        }

        return substr($payDate, 0, 4) . '-' .
               substr($payDate, 4, 2) . '-' .
               substr($payDate, 6, 2) . ' ' .
               substr($payDate, 8, 2) . ':' .
               substr($payDate, 10, 2) . ':' .
               substr($payDate, 12, 2);
    }
}

if (!function_exists('sync_total_stock_for_products')) {
    function sync_total_stock_for_products($conn, $maspList)
    {
        if (empty($maspList)) return;

        $stmtSyncProduct = $conn->prepare("
            UPDATE products
            SET so_luong_ton = (
                SELECT IFNULL(SUM(v.so_luong_ton), 0)
                FROM product_variants v
                WHERE v.masp = ?
            )
            WHERE masp = ?
        ");

        foreach ($maspList as $masp) {
            $stmtSyncProduct->bind_param("ss", $masp, $masp);
            $stmtSyncProduct->execute();
        }

        $stmtSyncProduct->close();
    }
}

if (!function_exists('restore_stock_for_order')) {
    function restore_stock_for_order($conn, $maDon)
    {
        $stmt = $conn->prepare("
            SELECT variant_id, so_luong, masp
            FROM order_details
            WHERE ma_don = ?
            ORDER BY detail_id ASC
        ");
        $stmt->bind_param("i", $maDon);
        $stmt->execute();
        $rs = $stmt->get_result();

        if ($rs->num_rows === 0) {
            $stmt->close();
            return;
        }

        $stmtUpdate = $conn->prepare("
            UPDATE product_variants
            SET so_luong_ton = so_luong_ton + ?
            WHERE variant_id = ?
        ");
        $maspNeedSync = [];

        while ($row = $rs->fetch_assoc()) {
            $variantId = (int)$row['variant_id'];
            $soLuong = (int)$row['so_luong'];
            $masp = (string)$row['masp'];
            if ($variantId > 0 && $soLuong > 0) {
                $stmtUpdate->bind_param("ii", $soLuong, $variantId);
                $stmtUpdate->execute();
                $maspNeedSync[$masp] = true;
            }
        }

        $rs->free();
        $stmt->close();
        $stmtUpdate->close();

        if (!empty($maspNeedSync)) {
            sync_total_stock_for_products($conn, array_keys($maspNeedSync));
        }
    }
}

if (!function_exists('checkExpiredPayments')) {
    function checkExpiredPayments($conn)
    {
        $now = date('Y-m-d H:i:s');

        $stmtOrders = $conn->prepare("
            SELECT ma_don
            FROM orders
            WHERE phuong_thuc_tt = 'VNPAY'
              AND payment_status = 'unpaid'
              AND payment_expired_at IS NOT NULL
              AND payment_expired_at <= ?
              AND (tinh_trang IS NULL OR LOWER(tinh_trang) NOT LIKE 'cancelled')
        ");
        $stmtOrders->bind_param("s", $now);
        $stmtOrders->execute();
        $rs = $stmtOrders->get_result();

        $expiredOrders = [];
        while ($row = $rs->fetch_assoc()) {
            $expiredOrders[] = (int)$row['ma_don'];
        }
        $rs->free();
        $stmtOrders->close();

        if (empty($expiredOrders)) {
            return 0;
        }

        $stmtUpdate = $conn->prepare("
            UPDATE orders
            SET payment_status = 'failed',
                tinh_trang = 'cancelled'
            WHERE ma_don = ?
        ");

        foreach ($expiredOrders as $maDon) {
            $conn->begin_transaction();
            try {
                restore_stock_for_order($conn, $maDon);
                $stmtUpdate->bind_param("i", $maDon);
                $stmtUpdate->execute();
                $conn->commit();
            } catch (Throwable $e) {
                try { $conn->rollback(); } catch (Throwable $ignore) {}
                throw $e;
            }
        }

        $stmtUpdate->close();
        return count($expiredOrders);
    }
}

if (!function_exists('save_order_details_from_cart')) {
    function save_order_details_from_cart($conn, $maDon, $sanPham, $deductStockNow = false)
    {
        $stmtPickVariant = $conn->prepare("
            SELECT variant_id, ten_mau
            FROM product_variants
            WHERE masp = ?
            ORDER BY CASE WHEN ten_mau = 'Mặc định' THEN 0 ELSE 1 END, variant_id ASC
            LIMIT 1
        ");

        $stmtGetVariantForUpdate = $conn->prepare("
            SELECT variant_id, masp, ten_mau, so_luong_ton
            FROM product_variants
            WHERE variant_id = ?
            FOR UPDATE
        ");

        $stmtUpdateVariant = $conn->prepare("
            UPDATE product_variants
            SET so_luong_ton = so_luong_ton - ?
            WHERE variant_id = ? AND so_luong_ton >= ?
        ");

        $stmtInsertDetail = $conn->prepare("
            INSERT INTO order_details (
                ma_don, masp, variant_id, mau_sac, so_luong, don_gia,
                product_name_snapshot, product_price_snapshot, product_image_snapshot, variant_name_snapshot
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $maspNeedSync = [];

        foreach ($sanPham as $sp) {
            $masp       = trim($sp['masp'] ?? '');
            $soLuong    = (int)($sp['so_luong'] ?? 0);
            $donGia     = (float)($sp['gia'] ?? 0);
            $variantId  = (int)($sp['variant_id'] ?? 0);
            $mauSacIn   = trim($sp['mau_sac'] ?? '');

            if ($masp === '') {
                throw new Exception("Thiếu mã sản phẩm trong giỏ hàng.");
            }
            if ($soLuong <= 0) {
                throw new Exception("Số lượng mua không hợp lệ.");
            }
            if ($donGia < 0) {
                throw new Exception("Đơn giá không hợp lệ.");
            }

            if ($variantId <= 0) {
                $stmtPickVariant->bind_param("s", $masp);
                $stmtPickVariant->execute();
                $rsPick = $stmtPickVariant->get_result();

                if ($rsPick->num_rows === 0) {
                    throw new Exception("Sản phẩm '$masp' chưa có màu để mua.");
                }

                $pick = $rsPick->fetch_assoc();
                $variantId = (int)$pick['variant_id'];
                if ($mauSacIn === '') {
                    $mauSacIn = $pick['ten_mau'];
                }
                $rsPick->free();
            }

            $stmtGetVariantForUpdate->bind_param("i", $variantId);
            $stmtGetVariantForUpdate->execute();
            $rsV = $stmtGetVariantForUpdate->get_result();

            if ($rsV->num_rows === 0) {
                throw new Exception("Không tìm thấy variant_id = $variantId.");
            }

            $variant = $rsV->fetch_assoc();
            $rsV->free();

            if ($variant['masp'] !== $masp) {
                throw new Exception("variant_id = $variantId không thuộc sản phẩm $masp.");
            }

            $tenMau = $variant['ten_mau'];
            $stock  = (int)$variant['so_luong_ton'];

            if ($deductStockNow) {
                if ($soLuong > $stock) {
                    throw new Exception("Màu '$tenMau' của sản phẩm '$masp' chỉ còn $stock cái.");
                }

                $stmtUpdateVariant->bind_param("iii", $soLuong, $variantId, $soLuong);
                $stmtUpdateVariant->execute();

                if ($stmtUpdateVariant->affected_rows === 0) {
                    throw new Exception("Tồn kho màu '$tenMau' vừa thay đổi, vui lòng thử lại.");
                }

                $maspNeedSync[$masp] = true;
            }

            $mauSacFinal = ($mauSacIn !== '') ? $mauSacIn : $tenMau;
            $productNameSnapshot = '';
            $productPriceSnapshot = $donGia;
            $productImageSnapshot = null;
            $variantNameSnapshot = $tenMau;

            $stmtProductSnapshot = $conn->prepare("SELECT ten_sp, hinh_anh, gia, khuyen_mai_loai, khuyen_mai_gia_tri FROM products WHERE masp = ? LIMIT 1");
            $stmtProductSnapshot->bind_param("s", $masp);
            $stmtProductSnapshot->execute();
            $rsProductSnapshot = $stmtProductSnapshot->get_result();
            if ($rsProductSnapshot->num_rows > 0) {
                $productRow = $rsProductSnapshot->fetch_assoc();
                $productNameSnapshot = (string)($productRow['ten_sp'] ?? '');
                $productImageSnapshot = $productRow['hinh_anh'] ?? null;
                $basePrice = (float)($productRow['gia'] ?? 0);
                $promoType = trim((string)($productRow['khuyen_mai_loai'] ?? ''));
                $promoValue = (float)($productRow['khuyen_mai_gia_tri'] ?? 0);
                $productPriceSnapshot = ($promoType === 'giareonline' && $promoValue > 0) ? $promoValue : $basePrice;
            }
            $rsProductSnapshot->free();
            $stmtProductSnapshot->close();

            $stmtInsertDetail->bind_param("isisidssss", $maDon, $masp, $variantId, $mauSacFinal, $soLuong, $donGia, $productNameSnapshot, $productPriceSnapshot, $productImageSnapshot, $variantNameSnapshot);
            $stmtInsertDetail->execute();
        }

        $stmtPickVariant->close();
        $stmtGetVariantForUpdate->close();
        $stmtUpdateVariant->close();
        $stmtInsertDetail->close();

        if ($deductStockNow && !empty($maspNeedSync)) {
            sync_total_stock_for_products($conn, array_keys($maspNeedSync));
        }
    }
}

if (!function_exists('deduct_stock_for_saved_order')) {
    function deduct_stock_for_saved_order($conn, $maDon)
    {
        $stmtDetails = $conn->prepare("
            SELECT od.detail_id, od.masp, od.variant_id, od.mau_sac, od.so_luong,
                   pv.ten_mau, pv.so_luong_ton
            FROM order_details od
            INNER JOIN product_variants pv ON od.variant_id = pv.variant_id
            WHERE od.ma_don = ?
            ORDER BY od.detail_id ASC
            FOR UPDATE
        ");

        $stmtUpdateVariant = $conn->prepare("
            UPDATE product_variants
            SET so_luong_ton = so_luong_ton - ?
            WHERE variant_id = ? AND so_luong_ton >= ?
        ");

        $stmtDetails->bind_param("i", $maDon);
        $stmtDetails->execute();
        $rs = $stmtDetails->get_result();

        if ($rs->num_rows === 0) {
            throw new Exception("Đơn hàng không có chi tiết để trừ kho.");
        }

        $maspNeedSync = [];

        while ($row = $rs->fetch_assoc()) {
            $variantId = (int)$row['variant_id'];
            $soLuong   = (int)$row['so_luong'];
            $stock     = (int)$row['so_luong_ton'];
            $tenMau    = $row['ten_mau'] ?: ($row['mau_sac'] ?: 'Không rõ');
            $masp      = $row['masp'];

            if ($soLuong > $stock) {
                throw new Exception("Không đủ tồn kho để xác nhận thanh toán cho màu '$tenMau' của sản phẩm '$masp'.");
            }

            $stmtUpdateVariant->bind_param("iii", $soLuong, $variantId, $soLuong);
            $stmtUpdateVariant->execute();

            if ($stmtUpdateVariant->affected_rows === 0) {
                throw new Exception("Tồn kho màu '$tenMau' vừa thay đổi, vui lòng thử lại.");
            }

            $maspNeedSync[$masp] = true;
        }

        $rs->free();
        $stmtDetails->close();
        $stmtUpdateVariant->close();

        if (!empty($maspNeedSync)) {
            sync_total_stock_for_products($conn, array_keys($maspNeedSync));
        }
    }
}
/* =========================================================
   VNPay session flow helpers
   - VNPay bấm thanh toán: chỉ lưu vnpay_payment_sessions
   - Chỉ tạo orders/order_details khi VNPay trả về success/fail
   ========================================================= */

if (!function_exists('generate_vnp_session_ref')) {
    function generate_vnp_session_ref()
    {
        return 'GD' . date('YmdHis') . random_int(1000, 9999);
    }
}

if (!function_exists('normalize_cart_items_for_order')) {
    function normalize_cart_items_for_order($items)
    {
        if (!is_array($items) || count($items) === 0) {
            throw new Exception("Giỏ hàng trống hoặc dữ liệu sản phẩm không hợp lệ.");
        }

        $normalized = [];

        foreach ($items as $sp) {
            if (!is_array($sp)) {
                throw new Exception("Dữ liệu sản phẩm không hợp lệ.");
            }

            $masp = trim((string)($sp['masp'] ?? $sp['ma'] ?? ''));
            $variantId = (int)($sp['variant_id'] ?? 0);
            $mauSac = trim((string)($sp['mau_sac'] ?? ''));
            $soLuong = (int)($sp['so_luong'] ?? $sp['soluong'] ?? 0);
            $gia = (float)($sp['gia'] ?? $sp['don_gia'] ?? 0);

            if ($masp === '') throw new Exception("Thiếu mã sản phẩm trong giỏ hàng.");
            if ($soLuong <= 0) throw new Exception("Số lượng mua không hợp lệ.");
            if ($gia < 0) throw new Exception("Đơn giá không hợp lệ.");

            $normalized[] = [
                'masp' => $masp,
                'variant_id' => $variantId > 0 ? $variantId : null,
                'mau_sac' => $mauSac !== '' ? $mauSac : null,
                'so_luong' => $soLuong,
                'gia' => $gia
            ];
        }

        return $normalized;
    }
}

if (!function_exists('calculate_cart_total_amount')) {
    function calculate_cart_total_amount($sanPham)
    {
        $total = 0;
        foreach ($sanPham as $sp) {
            $total += ((float)$sp['gia']) * ((int)$sp['so_luong']);
        }
        return (int)round($total);
    }
}

if (!function_exists('create_cart_signature')) {
    function create_cart_signature($userKey, $tongTien, $sanPham, $secret = '')
    {
        $payload = json_encode([
            'user_key' => $userKey,
            'tong_tien' => (int)$tongTien,
            'san_pham' => $sanPham
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        return hash('sha256', $payload . '|' . (string)$secret);
    }
}

if (!function_exists('assert_cart_stock_available')) {
    function assert_cart_stock_available($conn, $sanPham)
    {
        $stmtByVariant = $conn->prepare("
            SELECT pv.variant_id, pv.masp, pv.ten_mau, pv.so_luong_ton, p.ten_sp
            FROM product_variants pv
            INNER JOIN products p ON pv.masp = p.masp
            WHERE pv.variant_id = ?
            LIMIT 1
        ");

        $stmtPickVariant = $conn->prepare("
            SELECT pv.variant_id, pv.masp, pv.ten_mau, pv.so_luong_ton, p.ten_sp
            FROM product_variants pv
            INNER JOIN products p ON pv.masp = p.masp
            WHERE pv.masp = ?
            ORDER BY CASE WHEN pv.ten_mau = 'Mặc định' THEN 0 ELSE 1 END, pv.variant_id ASC
            LIMIT 1
        ");

        try {
            foreach ($sanPham as $sp) {
                $masp = trim((string)$sp['masp']);
                $variantId = (int)($sp['variant_id'] ?? 0);
                $soLuong = (int)$sp['so_luong'];

                if ($variantId > 0) {
                    $stmtByVariant->bind_param("i", $variantId);
                    $stmtByVariant->execute();
                    $rs = $stmtByVariant->get_result();
                } else {
                    $stmtPickVariant->bind_param("s", $masp);
                    $stmtPickVariant->execute();
                    $rs = $stmtPickVariant->get_result();
                }

                if ($rs->num_rows === 0) {
                    throw new Exception("Không tìm thấy màu/variant cho sản phẩm $masp.");
                }

                $row = $rs->fetch_assoc();
                $rs->free();

                if ($row['masp'] !== $masp) {
                    throw new Exception("Variant không thuộc sản phẩm $masp.");
                }

                $stock = (int)$row['so_luong_ton'];
                if ($soLuong > $stock) {
                    $tenSp = $row['ten_sp'] ?: $masp;
                    $tenMau = $row['ten_mau'] ?: 'Không rõ';
                    throw new Exception("Sản phẩm '$tenSp' màu '$tenMau' chỉ còn $stock cái.");
                }
            }
        } finally {
            $stmtByVariant->close();
            $stmtPickVariant->close();
        }
    }
}

if (!function_exists('load_order_for_vnpay_result')) {
    function load_order_for_vnpay_result($conn, $maDon)
    {
        $stmt = $conn->prepare("
            SELECT ma_don, user_id, username, ngay_mua, tinh_trang, phuong_thuc_tt, payment_status,
                   tong_tien, dia_chi, so_dien_thoai, vnp_txn_ref, vnp_transaction_no,
                   vnp_response_code, paid_at
            FROM orders
            WHERE ma_don = ?
            LIMIT 1
        ");
        $stmt->bind_param("i", $maDon);
        $stmt->execute();
        $rs = $stmt->get_result();
        $order = $rs->num_rows > 0 ? $rs->fetch_assoc() : null;
        $rs->free();
        $stmt->close();

        return $order;
    }
}

if (!function_exists('create_order_from_vnpay_session')) {
    function create_order_from_vnpay_session($conn, $session, $paymentStatus, $tinhTrang, $vnpTransactionNo, $vnpResponseCode, $paidAt, $deductStockNow)
    {
        $sanPham = json_decode($session['cart_json'], true);
        $sanPham = normalize_cart_items_for_order($sanPham);

        $userId = isset($session['user_id']) ? (int)$session['user_id'] : 0;
        $username = (string)$session['username'];
        $tongTien = (float)$session['tong_tien'];
        $txnRef = (string)$session['txn_ref'];
        $diaChi = (string)$session['dia_chi'];
        $sdt = (string)$session['so_dien_thoai'];

        $hasUserId = false;
        $chkUserId = $conn->query("SHOW COLUMNS FROM orders LIKE 'user_id'");
        if ($chkUserId && $chkUserId->num_rows > 0) {
            $hasUserId = true;
        }

        if ($hasUserId && $userId > 0) {
            $stmt = $conn->prepare("
                INSERT INTO orders (
                    user_id, username, tong_tien, tinh_trang, phuong_thuc_tt, payment_status,
                    vnp_txn_ref, vnp_transaction_no, vnp_response_code, paid_at,
                    dia_chi, so_dien_thoai
                )
                VALUES (?, ?, ?, ?, 'VNPAY', ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->bind_param(
                "isdssssssss",
                $userId,
                $username,
                $tongTien,
                $tinhTrang,
                $paymentStatus,
                $txnRef,
                $vnpTransactionNo,
                $vnpResponseCode,
                $paidAt,
                $diaChi,
                $sdt
            );
        } else {
            $stmt = $conn->prepare("
                INSERT INTO orders (
                    username, tong_tien, tinh_trang, phuong_thuc_tt, payment_status,
                    vnp_txn_ref, vnp_transaction_no, vnp_response_code, paid_at,
                    dia_chi, so_dien_thoai
                )
                VALUES (?, ?, ?, 'VNPAY', ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->bind_param(
                "sdssssssss",
                $username,
                $tongTien,
                $tinhTrang,
                $paymentStatus,
                $txnRef,
                $vnpTransactionNo,
                $vnpResponseCode,
                $paidAt,
                $diaChi,
                $sdt
            );
        }

        $stmt->execute();
        $maDon = (int)$conn->insert_id;
        $stmt->close();

        save_order_details_from_cart($conn, $maDon, $sanPham, $deductStockNow);

        return $maDon;
    }
}

if (!function_exists('normalize_order_payment_status')) {
    function normalize_order_payment_status($status)
    {
        $status = strtolower(trim((string)$status));
        $map = [
            'pending' => 'unpaid',
            'unpaid' => 'unpaid',
            'paid' => 'paid',
            'failed' => 'failed',
            'refunded' => 'refunded'
        ];

        return $map[$status] ?? 'unpaid';
    }
}

if (!function_exists('payment_status_label')) {
    function payment_status_label($status)
    {
        $status = normalize_order_payment_status($status);
        $labels = [
            'unpaid' => 'Chưa thanh toán',
            'paid' => 'Đã thanh toán',
            'failed' => 'Thanh toán thất bại',
            'refunded' => 'Đã hoàn tiền'
        ];

        return $labels[$status] ?? 'Chưa thanh toán';
    }
}

if (!function_exists('normalize_order_status')) {
    function normalize_order_status($status)
    {
        $status = strtolower(trim((string)$status));
        $map = [
            'pending' => 'pending',
            'confirmed' => 'confirmed',
            'processing' => 'processing',
            'shipping' => 'shipping',
            'completed' => 'completed',
            'cancelled' => 'cancelled',
            'delivery_failed' => 'delivery_failed',
            'chờ xử lý' => 'pending',
            'đã xác nhận' => 'confirmed',
            'đang xử lý' => 'processing',
            'đang giao hàng' => 'shipping',
            'hoàn thành' => 'completed',
            'đã hủy' => 'cancelled',
            'đã hủy bởi khách' => 'cancelled',
            'giao thất bại' => 'delivery_failed'
        ];

        return $map[$status] ?? 'pending';
    }
}

if (!function_exists('order_status_label')) {
    function order_status_label($status)
    {
        $status = normalize_order_status($status);
        $labels = [
            'pending' => 'Chờ xử lý',
            'confirmed' => 'Đã xác nhận',
            'processing' => 'Đang chuẩn bị',
            'shipping' => 'Đang giao hàng',
            'completed' => 'Hoàn thành',
            'cancelled' => 'Đã hủy',
            'delivery_failed' => 'Giao thất bại'
        ];

        return $labels[$status] ?? 'Chờ xử lý';
    }
}

if (!function_exists('process_vnpay_session_result')) {
    function process_vnpay_session_result($conn, $txnRef, $vnpAmount, $vnpResponseCode, $vnpTransactionStatus, $vnpTransactionNo, $vnpPayDate)
    {
        $txnRef = trim((string)$txnRef);
        if ($txnRef === '') {
            throw new Exception("MISSING_TXN_REF");
        }

        $conn->begin_transaction();

        try {
            $stmtSession = $conn->prepare("
                SELECT session_id, txn_ref, user_id, username, tong_tien, ho_ten, dia_chi, so_dien_thoai,
                       cart_json, cart_signature, session_status, order_id,
                       vnp_transaction_no, vnp_response_code, paid_at, created_at, expires_at
                FROM vnpay_payment_sessions
                WHERE txn_ref = ?
                LIMIT 1
                FOR UPDATE
            ");
            $stmtSession->bind_param("s", $txnRef);
            $stmtSession->execute();
            $rsSession = $stmtSession->get_result();

            if ($rsSession->num_rows === 0) {
                $rsSession->free();
                $stmtSession->close();
                throw new Exception("SESSION_NOT_FOUND");
            }

            $session = $rsSession->fetch_assoc();
            $rsSession->free();
            $stmtSession->close();

            $tongTienHeThong = (int)$session['tong_tien'];
            $tongTienVnpay = (int)((int)$vnpAmount / 100);

            if ($tongTienVnpay !== $tongTienHeThong) {
                throw new Exception("INVALID_AMOUNT");
            }

            if (!empty($session['order_id'])) {
                $order = load_order_for_vnpay_result($conn, (int)$session['order_id']);
                $conn->commit();

                return [
                    'session' => $session,
                    'order' => $order,
                    'already_processed' => true,
                    'success' => (($session['session_status'] ?? '') === 'Paid')
                ];
            }

            $isSuccess = ($vnpResponseCode === '00' && $vnpTransactionStatus === '00');

            if (!$isSuccess) {
                $stmtUpdateSession = $conn->prepare("
                    UPDATE vnpay_payment_sessions
                    SET session_status = 'Failed',
                        vnp_transaction_no = ?,
                        vnp_response_code = ?,
                        paid_at = ?
                    WHERE session_id = ?
                ");
                $paidAt = null;
                $stmtUpdateSession->bind_param(
                    "sssi",
                    $vnpTransactionNo,
                    $vnpResponseCode,
                    $paidAt,
                    $session['session_id']
                );
                $stmtUpdateSession->execute();
                $stmtUpdateSession->close();

                $conn->commit();

                return [
                    'session' => $session,
                    'order' => null,
                    'already_processed' => false,
                    'success' => false
                ];
            }

            $paymentStatus = 'paid';
            $tinhTrang = 'pending';
            $paidAt = parse_vnpay_paydate_to_mysql($vnpPayDate);
            if ($paidAt === null) $paidAt = date('Y-m-d H:i:s');

            $maDon = create_order_from_vnpay_session(
                $conn,
                $session,
                $paymentStatus,
                $tinhTrang,
                $vnpTransactionNo,
                $vnpResponseCode,
                $paidAt,
                true
            );

            $stmtUpdateSession = $conn->prepare("
                UPDATE vnpay_payment_sessions
                SET session_status = 'Paid',
                    order_id = ?,
                    vnp_transaction_no = ?,
                    vnp_response_code = ?,
                    paid_at = ?
                WHERE session_id = ?
            ");
            $stmtUpdateSession->bind_param(
                "isssi",
                $maDon,
                $vnpTransactionNo,
                $vnpResponseCode,
                $paidAt,
                $session['session_id']
            );
            $stmtUpdateSession->execute();
            $stmtUpdateSession->close();

            $order = load_order_for_vnpay_result($conn, $maDon);

            $conn->commit();

            return [
                'session' => $session,
                'order' => $order,
                'already_processed' => false,
                'success' => true
            ];

        } catch (Throwable $e) {
            try { $conn->rollback(); } catch (Throwable $ignore) {}
            throw $e;
        }
    }
}
?>