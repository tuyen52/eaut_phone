<?php
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/auth_session.php');
require_once('../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $currentUser = require_login();
    $userId = (int)($currentUser['user_id'] ?? 0);
    $username = (string)($currentUser['username'] ?? '');

    $masp = trim((string)($_GET['masp'] ?? ''));
    if ($masp === '') {
        json_response(false, 'Thiếu mã sản phẩm!', [], 400);
    }

    $hasOrderUserId = false;
    $chkOrderUserId = $conn->query("SHOW COLUMNS FROM orders LIKE 'user_id'");
    if ($chkOrderUserId && $chkOrderUserId->num_rows > 0) {
        $hasOrderUserId = true;
    }

    $hasOrderStatusCompleted = true;
    $stmt = null;

    if ($hasOrderUserId && $userId > 0) {
        $stmt = $conn->prepare("\n            SELECT 1\n            FROM orders o\n            INNER JOIN order_details od ON o.ma_don = od.ma_don\n            WHERE o.user_id = ?\n              AND od.masp = ?\n              AND o.tinh_trang = 'completed'\n            LIMIT 1\n        ");
        $stmt->bind_param('is', $userId, $masp);
    } else {
        $stmt = $conn->prepare("\n            SELECT 1\n            FROM orders o\n            INNER JOIN order_details od ON o.ma_don = od.ma_don\n            WHERE o.username = ?\n              AND od.masp = ?\n              AND o.tinh_trang IN ('Đã nhận hàng', 'Hoàn thành', 'completed')\n            LIMIT 1\n        ");
        $stmt->bind_param('ss', $username, $masp);
    }

    $stmt->execute();
    $rs = $stmt->get_result();
    $bought = ($rs && $rs->num_rows > 0);
    $stmt->close();

    echo json_encode([
        'status' => true,
        'bought' => $bought
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    echo json_encode([
        'status' => false,
        'bought' => false,
        'message' => 'Có lỗi xảy ra khi kiểm tra đơn hàng.'
    ], JSON_UNESCAPED_UNICODE);
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>