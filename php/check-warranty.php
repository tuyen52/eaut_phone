<?php
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/order_helpers.php');
require_once('../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

function warranty_status_label($orderStatus, $paymentStatus)
{
    $orderStatus = normalize_order_status($orderStatus);
    $paymentStatus = normalize_order_payment_status($paymentStatus);

    if ($orderStatus === 'cancelled') return 'Đơn hàng đã hủy';
    if ($paymentStatus === 'failed') return 'Thanh toán thất bại';
    if ($orderStatus === 'completed' && $paymentStatus === 'paid') return 'Đủ điều kiện hỗ trợ/bảo hành';
    if ($orderStatus === 'shipping') return 'Đơn hàng đang giao';
    if ($orderStatus === 'processing' || $orderStatus === 'confirmed' || $orderStatus === 'pending') return 'Đơn hàng đang xử lý';
    return 'Cần kiểm tra thêm';
}

try {
    $data = read_json_body();
    $maDon = (int)($data['ma_don'] ?? 0);
    $soDienThoai = trim((string)($data['so_dien_thoai'] ?? ''));
    $masp = trim((string)($data['masp'] ?? ''));

    if ($maDon <= 0 || $soDienThoai === '') {
        json_response(false, 'Vui lòng nhập mã đơn hàng và số điện thoại.', [], 400);
    }

    $stmt = $conn->prepare("\n        SELECT ma_don, username, ngay_mua, tinh_trang, phuong_thuc_tt, payment_status, tong_tien, dia_chi, so_dien_thoai, paid_at\n        FROM orders\n        WHERE ma_don = ? AND so_dien_thoai = ?\n        LIMIT 1\n    ");
    $stmt->bind_param('is', $maDon, $soDienThoai);
    $stmt->execute();
    $rs = $stmt->get_result();
    $order = $rs->fetch_assoc();
    $rs->free();
    $stmt->close();

    if (!$order) {
        json_response(false, 'Không tìm thấy đơn hàng khớp với số điện thoại đã nhập.', ['found' => false], 404);
    }

    $stmtDetails = $conn->prepare("\n        SELECT masp, variant_id, mau_sac, so_luong, don_gia,\n               product_name_snapshot, product_price_snapshot,\n               product_image_snapshot, variant_name_snapshot\n        FROM order_details\n        WHERE ma_don = ?\n        ORDER BY detail_id ASC\n    ");
    $stmtDetails->bind_param('i', $maDon);
    $stmtDetails->execute();
    $rsDetails = $stmtDetails->get_result();

    $products = [];
    $matchedProduct = null;
    while ($d = $rsDetails->fetch_assoc()) {
        $item = [
            'masp' => $d['masp'],
            'variant_id' => $d['variant_id'] !== null ? (int)$d['variant_id'] : null,
            'mau_sac' => $d['mau_sac'] ?? null,
            'so_luong' => (int)$d['so_luong'],
            'don_gia' => (float)$d['don_gia'],
            'product_name_snapshot' => $d['product_name_snapshot'] ?? '',
            'product_price_snapshot' => (float)($d['product_price_snapshot'] ?? $d['don_gia']),
            'product_image_snapshot' => $d['product_image_snapshot'] ?? null,
            'variant_name_snapshot' => $d['variant_name_snapshot'] ?? null
        ];

        if ($masp !== '' && strcasecmp($item['masp'], $masp) === 0) {
            $matchedProduct = $item;
        }

        $products[] = $item;
    }
    $rsDetails->free();
    $stmtDetails->close();

    if ($masp !== '' && !$matchedProduct) {
        json_response(false, 'Sản phẩm nhập vào không nằm trong đơn hàng này.', [
            'found' => true,
            'order' => [
                'ma_don' => (int)$order['ma_don'],
                'username' => $order['username'],
                'ngay_mua' => $order['ngay_mua'],
                'tinh_trang' => normalize_order_status($order['tinh_trang']),
                'tinh_trang_label' => order_status_label($order['tinh_trang']),
                'payment_status' => normalize_order_payment_status($order['payment_status']),
                'payment_status_label' => payment_status_label($order['payment_status'])
            ]
        ], 200);
    }

    $stmtLogs = $conn->prepare("\n        SELECT status, note, created_at\n        FROM order_status_logs\n        WHERE ma_don = ?\n        ORDER BY created_at ASC, log_id ASC\n    ");
    $stmtLogs->bind_param('i', $maDon);
    $stmtLogs->execute();
    $rsLogs = $stmtLogs->get_result();

    $timeline = [];
    while ($row = $rsLogs->fetch_assoc()) {
        $timeline[] = [
            'status' => normalize_order_status($row['status'] ?? ''),
            'label' => order_status_label($row['status'] ?? ''),
            'note' => $row['note'] ?? null,
            'created_at' => $row['created_at'] ?? null
        ];
    }
    $rsLogs->free();
    $stmtLogs->close();

    $orderStatus = normalize_order_status($order['tinh_trang']);
    $paymentStatus = normalize_order_payment_status($order['payment_status']);
    $warrantyState = warranty_status_label($orderStatus, $paymentStatus);

    $daysSincePurchase = null;
    if (!empty($order['ngay_mua'])) {
        try {
            $purchaseDate = new DateTime($order['ngay_mua']);
            $now = new DateTime();
            $daysSincePurchase = (int)$purchaseDate->diff($now)->format('%a');
        } catch (Throwable $ignore) {}
    }

    $warrantyMonths = 12;
    $remainingDays = null;
    $warrantyEnd = null;
    if (!empty($order['ngay_mua'])) {
        try {
            $purchaseDate = new DateTime($order['ngay_mua']);
            $end = (clone $purchaseDate)->modify('+' . $warrantyMonths . ' months');
            $warrantyEnd = $end->format('Y-m-d H:i:s');
            $remainingDays = (int)$purchaseDate->diff($end)->days;
            $today = new DateTime();
            if ($today > $end) {
                $remainingDays = 0;
            } else {
                $remainingDays = (int)$today->diff($end)->format('%a');
            }
        } catch (Throwable $ignore) {}
    }

    json_response(true, 'Tra cứu bảo hành thành công.', [
        'found' => true,
        'warranty' => [
            'status' => $warrantyState,
            'can_support' => ($orderStatus === 'completed' && $paymentStatus === 'paid'),
            'warranty_months' => $warrantyMonths,
            'warranty_end' => $warrantyEnd,
            'remaining_days' => $remainingDays,
            'days_since_purchase' => $daysSincePurchase
        ],
        'order' => [
            'ma_don' => (int)$order['ma_don'],
            'username' => $order['username'],
            'ngay_mua' => $order['ngay_mua'],
            'tinh_trang' => $orderStatus,
            'tinh_trang_label' => order_status_label($order['tinh_trang']),
            'payment_status' => $paymentStatus,
            'payment_status_label' => payment_status_label($order['payment_status']),
            'phuong_thuc_tt' => $order['phuong_thuc_tt'] ?? 'COD',
            'tong_tien' => (int)$order['tong_tien'],
            'dia_chi' => $order['dia_chi'] ?? '',
            'so_dien_thoai' => $order['so_dien_thoai'] ?? '',
            'paid_at' => $order['paid_at'] ?? null
        ],
        'product' => $matchedProduct,
        'products' => $products,
        'timeline' => $timeline
    ]);
} catch (Throwable $e) {
    error_log('check-warranty error: ' . $e->getMessage());
    json_response(false, 'Có lỗi xảy ra khi tra cứu bảo hành.', [], 500);
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>