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
            INSERT INTO order_details (ma_don, masp, variant_id, mau_sac, so_luong, don_gia)
            VALUES (?, ?, ?, ?, ?, ?)
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

            $stmtInsertDetail->bind_param("isisid", $maDon, $masp, $variantId, $mauSacFinal, $soLuong, $donGia);
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
?>