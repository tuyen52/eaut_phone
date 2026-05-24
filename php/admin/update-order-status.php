<?php
// php/admin/update-order-status.php
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/../auth_session.php');
require_once(__DIR__ . '/../order_helpers.php');
require_once('../../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

function sync_product_stock(mysqli $conn, array $maspList)
{
    if (empty($maspList)) return;

    $stmt = $conn->prepare("
        UPDATE products
        SET so_luong_ton = (
            SELECT IFNULL(SUM(v.so_luong_ton), 0)
            FROM product_variants v
            WHERE v.masp = ?
        )
        WHERE masp = ?
    ");

    foreach ($maspList as $masp) {
        $stmt->bind_param("ss", $masp, $masp);
        $stmt->execute();
    }

    $stmt->close();
}

try {
    $currentUser = require_login();
    $isAdmin = (($currentUser['role'] ?? '') === 'admin');
    $currentUsername = $currentUser['username'] ?? '';

    $data = read_json_body();

    $maDon = (int)($data['maDon'] ?? 0);
    $trangThaiMoi = normalize_order_status($data['trangThai'] ?? '');

    if ($maDon <= 0) {
        throw new Exception("Mã đơn không hợp lệ!");
    }

    if ($trangThaiMoi === '') {
        throw new Exception("Thiếu trạng thái!");
    }

    $allowedStatusesAdmin = [
        'pending',
        'confirmed',
        'processing',
        'shipping',
        'completed',
        'cancelled',
        'delivery_failed'
    ];

    $statusFlow = [
        'pending' => ['confirmed', 'cancelled'],
        'confirmed' => ['processing', 'cancelled'],
        'processing' => ['shipping', 'cancelled'],
        'shipping' => ['completed', 'delivery_failed', 'cancelled'],
        'completed' => [],
        'cancelled' => [],
        'delivery_failed' => []
    ];

    $allowedStatusesUser = [
        'completed',
        'cancelled'
    ];

    if ($isAdmin) {
        if (!in_array($trangThaiMoi, $allowedStatusesAdmin, true)) {
            throw new Exception("Trạng thái không hợp lệ!");
        }
    } else {
        if (!in_array($trangThaiMoi, $allowedStatusesUser, true)) {
            throw new Exception("Bạn không có quyền chuyển đơn sang trạng thái này!");
        }
    }

    $conn->begin_transaction();

    $stmtOrder = $conn->prepare("
        SELECT ma_don, username, tinh_trang, phuong_thuc_tt, payment_status
        FROM orders
        WHERE ma_don = ?
        LIMIT 1
        FOR UPDATE
    ");
    $stmtOrder->bind_param("i", $maDon);
    $stmtOrder->execute();
    $rs = $stmtOrder->get_result();

    if ($rs->num_rows === 0) {
        throw new Exception("Không tìm thấy đơn hàng!");
    }

    $order = $rs->fetch_assoc();
    $stmtOrder->close();

    $orderUsername = (string)($order['username'] ?? '');

    if (!$isAdmin && $orderUsername !== $currentUsername) {
        throw new Exception("Bạn không có quyền cập nhật đơn hàng này!");
    }

    $trangThaiCu = normalize_order_status($order['tinh_trang']);
    $phuongThuc  = strtoupper(trim((string)($order['phuong_thuc_tt'] ?? 'COD')));
    $paymentStatus = normalize_order_payment_status($order['payment_status'] ?? 'unpaid');

    $cuDaHuy  = in_array($trangThaiCu, ['cancelled', 'delivery_failed'], true);
    $moiLaHuy = in_array($trangThaiMoi, ['cancelled', 'delivery_failed'], true);

    if ($cuDaHuy) {
        throw new Exception("Đơn hàng đã hủy, không thể cập nhật tiếp!");
    }

    /*
        User chỉ được hủy đơn khi đơn còn pending (đang chờ admin xác nhận).
        User không được can thiệp các trạng thái giao hàng khác.
    */
    if (!$isAdmin) {
        if ($trangThaiMoi !== 'cancelled') {
            throw new Exception("Chỉ được hủy đơn khi đang chờ admin xác nhận!");
        }
        if ($trangThaiCu !== 'pending') {
            throw new Exception("Đơn đã được admin xác nhận nên không thể hủy nữa!");
        }
    }

    if ($trangThaiMoi === $trangThaiCu) {
        throw new Exception("Trạng thái mới phải khác trạng thái hiện tại!");
    }

    if (!isset($statusFlow[$trangThaiCu]) || !in_array($trangThaiMoi, $statusFlow[$trangThaiCu], true)) {
        throw new Exception("Không thể chuyển trạng thái từ {$trangThaiCu} sang {$trangThaiMoi}!");
    }

    if ($phuongThuc === 'VNPAY' && $paymentStatus !== 'paid' && in_array($trangThaiMoi, ['confirmed', 'processing', 'shipping', 'completed'], true)) {
        throw new Exception("Đơn VNPay này chưa thanh toán thành công, không thể chuyển sang xử lý/giao hàng.");
    }

    if ($isAdmin && $trangThaiMoi === 'confirmed' && $trangThaiCu !== 'pending') {
        throw new Exception("Chỉ đơn ở trạng thái pending mới được xác nhận.");
    }

    /*
        Xác định đơn đã từng trừ kho chưa.
        COD trừ kho ngay.
        VNPay chỉ trừ kho khi Paid.
    */
    $daTruKho = false;

    if ($phuongThuc === 'COD') {
        $daTruKho = true;
    } elseif ($phuongThuc === 'VNPAY' && $paymentStatus === 'paid') {
        $daTruKho = true;
    }

    /*
        Nếu hủy lần đầu và đơn đã từng trừ kho thì hoàn kho.
        Nếu đơn đã thanh toán trước đó, đánh dấu payment_status = refunded.
    */
    $shouldRefundPayment = ($moiLaHuy && $paymentStatus === 'paid');

    if (!$cuDaHuy && $moiLaHuy && $daTruKho) {
        $stmtItems = $conn->prepare("
            SELECT masp, variant_id, so_luong
            FROM order_details
            WHERE ma_don = ?
            ORDER BY detail_id ASC
        ");
        $stmtItems->bind_param("i", $maDon);
        $stmtItems->execute();
        $items = $stmtItems->get_result();

        $maspNeedSync = [];

        while ($item = $items->fetch_assoc()) {
            $masp = $item['masp'];
            $sl = (int)$item['so_luong'];
            $variant_id = $item['variant_id'] !== null ? (int)$item['variant_id'] : 0;

            if ($variant_id > 0) {
                $stmtUpVariant = $conn->prepare("
                    UPDATE product_variants
                    SET so_luong_ton = so_luong_ton + ?
                    WHERE variant_id = ?
                ");
                $stmtUpVariant->bind_param("ii", $sl, $variant_id);
                $stmtUpVariant->execute();
                $stmtUpVariant->close();
            } else {
                $stmtUpProduct = $conn->prepare("
                    UPDATE products
                    SET so_luong_ton = so_luong_ton + ?
                    WHERE masp = ?
                ");
                $stmtUpProduct->bind_param("is", $sl, $masp);
                $stmtUpProduct->execute();
                $stmtUpProduct->close();
            }

            $maspNeedSync[$masp] = true;
        }

        $stmtItems->close();
        sync_product_stock($conn, array_keys($maspNeedSync));
    }

    /*
        Nếu COD chuyển sang completed thì ghi nhận payment_status = paid.
        Nếu hủy/failed thì restore stock và cập nhật payment_status phù hợp.
    */
    $paymentStatusMoi = $paymentStatus;

    if ($phuongThuc === 'COD' && $trangThaiMoi === 'completed') {
        $paymentStatusMoi = 'paid';
    } elseif ($trangThaiMoi === 'cancelled' || $trangThaiMoi === 'delivery_failed') {
        if ($paymentStatus === 'paid') {
            $paymentStatusMoi = 'refunded';
        } elseif ($paymentStatus !== 'paid') {
            $paymentStatusMoi = 'failed';
        }
    }

    if ($trangThaiMoi === 'delivery_failed' && !$daTruKho) {
        throw new Exception("Đơn chưa trừ kho nên không thể xử lý giao thất bại.");
    }

    $stmtUp = $conn->prepare("
        UPDATE orders
        SET tinh_trang = ?, payment_status = ?
        WHERE ma_don = ?
    ");
    $stmtUp->bind_param("ssi", $trangThaiMoi, $paymentStatusMoi, $maDon);
    $stmtUp->execute();
    $stmtUp->close();

    $stmtLog = $conn->prepare("INSERT INTO order_status_logs (ma_don, status, note) VALUES (?, ?, ?)");
    $note = 'updated_by_admin';
    $stmtLog->bind_param("iss", $maDon, $trangThaiMoi, $note);
    $stmtLog->execute();
    $stmtLog->close();

    $conn->commit();

    echo json_encode([
        "status" => true,
        "message" => "Cập nhật trạng thái thành công!"
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    if (isset($conn) && $conn instanceof mysqli) {
        try { $conn->rollback(); } catch (Throwable $ignore) {}
    }

    echo json_encode([
        "status" => false,
        "message" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);

} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>