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

    $bought = false;
    if ($hasOrderUserId && $userId > 0) {
        $stmtBought = $conn->prepare("
            SELECT 1
            FROM orders o
            INNER JOIN order_details od ON o.ma_don = od.ma_don
            WHERE o.user_id = ?
              AND od.masp = ?
              AND o.tinh_trang = 'completed'
            LIMIT 1
        ");
        $stmtBought->bind_param('is', $userId, $masp);
    } else {
        $stmtBought = $conn->prepare("
            SELECT 1
            FROM orders o
            INNER JOIN order_details od ON o.ma_don = od.ma_don
            WHERE o.username = ?
              AND od.masp = ?
              AND o.tinh_trang IN ('Đã nhận hàng', 'Hoàn thành', 'completed')
            LIMIT 1
        ");
        $stmtBought->bind_param('ss', $username, $masp);
    }
    $stmtBought->execute();
    $bought = ($stmtBought->get_result()->num_rows > 0);
    $stmtBought->close();

    $hasRateUserId = false;
    $chkRateUserId = $conn->query("SHOW COLUMNS FROM rate LIKE 'user_id'");
    if ($chkRateUserId && $chkRateUserId->num_rows > 0) {
        $hasRateUserId = true;
    }

    $review = null;
    if ($hasRateUserId && $userId > 0) {
        $stmtReview = $conn->prepare("
            SELECT id, so_sao, binh_luan, ngay_dg
            FROM rate
            WHERE masp = ? AND user_id = ?
            LIMIT 1
        ");
        $stmtReview->bind_param('si', $masp, $userId);
    } else {
        $stmtReview = $conn->prepare("
            SELECT id, so_sao, binh_luan, ngay_dg
            FROM rate
            WHERE masp = ? AND username = ?
            LIMIT 1
        ");
        $stmtReview->bind_param('ss', $masp, $username);
    }
    $stmtReview->execute();
    $rsReview = $stmtReview->get_result();
    if ($rsReview->num_rows > 0) {
        $row = $rsReview->fetch_assoc();
        $review = [
            'id' => (int)$row['id'],
            'rating' => (int)$row['so_sao'],
            'comment' => (string)$row['binh_luan'],
            'timestamp' => $row['ngay_dg']
        ];
    }
    $stmtReview->close();

    echo json_encode([
        'status' => true,
        'bought' => $bought,
        'reviewed' => $review !== null,
        'review' => $review
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    echo json_encode([
        'status' => false,
        'bought' => false,
        'reviewed' => false,
        'review' => null,
        'message' => 'Có lỗi xảy ra khi kiểm tra đánh giá.'
    ], JSON_UNESCAPED_UNICODE);
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
