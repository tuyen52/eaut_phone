<?php
// php/add-review.php — verified purchase, 1 review / user / product, cho phep sua
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/auth_session.php');
require_once('../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

function recalculate_product_rating(mysqli $conn, string $masp): void
{
    $stmtCal = $conn->prepare("
        SELECT AVG(so_sao) AS trung_binh, COUNT(*) AS so_luong
        FROM rate
        WHERE masp = ?
    ");
    $stmtCal->bind_param('s', $masp);
    $stmtCal->execute();
    $cal = $stmtCal->get_result()->fetch_assoc();
    $stmtCal->close();

    $newStar = ((int)$cal['so_luong'] > 0) ? round((float)$cal['trung_binh']) : 0;
    $newCount = (int)$cal['so_luong'];

    $stmtUp = $conn->prepare("
        UPDATE products
        SET so_sao = ?, so_danh_gia = ?
        WHERE masp = ?
    ");
    $stmtUp->bind_param('iis', $newStar, $newCount, $masp);
    $stmtUp->execute();
    $stmtUp->close();
}

try {
    $currentUser = require_login();
    $userId = (int)($currentUser['user_id'] ?? 0);
    $username = (string)($currentUser['username'] ?? '');

    $data = read_json_body();

    $masp = trim($data['masp'] ?? '');
    $star = (int)($data['rating'] ?? 0);
    $comment = trim($data['comment'] ?? '');

    if ($masp === '') {
        json_response(false, 'Thiếu mã sản phẩm!', [], 400);
    }

    if ($star < 1 || $star > 5) {
        json_response(false, 'Số sao không hợp lệ!', [], 400);
    }

    if (mb_strlen($comment, 'UTF-8') < 5) {
        json_response(false, 'Bình luận quá ngắn!', [], 400);
    }

    $dateCol = 'ngay_mua';
    $chk = $conn->query("SHOW COLUMNS FROM orders LIKE 'ngaymua'");
    if ($chk && $chk->num_rows > 0) {
        $dateCol = 'ngaymua';
    }

    $ordersHasUserId = false;
    $chkUserId = $conn->query("SHOW COLUMNS FROM orders LIKE 'user_id'");
    if ($chkUserId && $chkUserId->num_rows > 0) {
        $ordersHasUserId = true;
    }

    if ($ordersHasUserId && $userId > 0) {
        $stmtBought = $conn->prepare("
            SELECT od.variant_id, od.mau_sac
            FROM orders o
            INNER JOIN order_details od ON o.ma_don = od.ma_don
            WHERE o.user_id = ?
              AND od.masp = ?
              AND o.tinh_trang = 'completed'
            ORDER BY o.$dateCol DESC, od.detail_id DESC
            LIMIT 1
        ");
        $stmtBought->bind_param('is', $userId, $masp);
    } else {
        $stmtBought = $conn->prepare("
            SELECT od.variant_id, od.mau_sac
            FROM orders o
            INNER JOIN order_details od ON o.ma_don = od.ma_don
            WHERE o.username = ?
              AND od.masp = ?
              AND o.tinh_trang IN ('Đã nhận hàng', 'Hoàn thành', 'completed')
            ORDER BY o.$dateCol DESC, od.detail_id DESC
            LIMIT 1
        ");
        $stmtBought->bind_param('ss', $username, $masp);
    }
    $stmtBought->execute();

    $rsBought = $stmtBought->get_result();
    if ($rsBought->num_rows === 0) {
        json_response(false, 'Bạn cần mua và nhận hàng sản phẩm này trước khi đánh giá!', [], 403);
    }

    $bought = $rsBought->fetch_assoc();
    $stmtBought->close();

    $variantId = $bought['variant_id'] !== null ? (int)$bought['variant_id'] : null;
    $mauSac = $bought['mau_sac'] ?? null;

    $rateHasUserId = false;
    $chkRateUserId = $conn->query("SHOW COLUMNS FROM rate LIKE 'user_id'");
    if ($chkRateUserId && $chkRateUserId->num_rows > 0) {
        $rateHasUserId = true;
    }

    $existingReviewId = null;
    if ($rateHasUserId && $userId > 0) {
        $stmtFind = $conn->prepare('SELECT id FROM rate WHERE masp = ? AND user_id = ? LIMIT 1');
        $stmtFind->bind_param('si', $masp, $userId);
    } else {
        $stmtFind = $conn->prepare('SELECT id FROM rate WHERE masp = ? AND username = ? LIMIT 1');
        $stmtFind->bind_param('ss', $masp, $username);
    }
    $stmtFind->execute();
    $rsFind = $stmtFind->get_result();
    if ($rsFind->num_rows > 0) {
        $existingReviewId = (int)$rsFind->fetch_assoc()['id'];
    }
    $stmtFind->close();

    $conn->begin_transaction();

    if ($existingReviewId !== null) {
        $stmtUpdate = $conn->prepare('
            UPDATE rate
            SET so_sao = ?, binh_luan = ?, ngay_dg = NOW()
            WHERE id = ?
        ');
        $stmtUpdate->bind_param('isi', $star, $comment, $existingReviewId);
        $stmtUpdate->execute();
        $stmtUpdate->close();
        $successMessage = 'Cập nhật đánh giá thành công!';
    } else {
        if ($rateHasUserId && $userId > 0) {
            $stmtInsert = $conn->prepare('
                INSERT INTO rate (masp, user_id, username, variant_id, mau_sac, so_sao, binh_luan, ngay_dg)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ');

            if ($variantId === null || $variantId <= 0) {
                $nullVariant = null;
                $stmtInsert->bind_param('sisssis', $masp, $userId, $username, $nullVariant, $mauSac, $star, $comment);
            } else {
                $stmtInsert->bind_param('sisssis', $masp, $userId, $username, $variantId, $mauSac, $star, $comment);
            }
        } else {
            $stmtInsert = $conn->prepare('
                INSERT INTO rate (masp, username, variant_id, mau_sac, so_sao, binh_luan, ngay_dg)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ');

            if ($variantId === null || $variantId <= 0) {
                $nullVariant = null;
                $stmtInsert->bind_param('ssisis', $masp, $username, $nullVariant, $mauSac, $star, $comment);
            } else {
                $stmtInsert->bind_param('ssisis', $masp, $username, $variantId, $mauSac, $star, $comment);
            }
        }

        $stmtInsert->execute();
        $stmtInsert->close();
        $successMessage = 'Gửi đánh giá thành công!';
    }

    recalculate_product_rating($conn, $masp);
    $conn->commit();

    json_response(true, $successMessage, [
        'updated' => $existingReviewId !== null
    ]);

} catch (Throwable $e) {
    if (isset($conn) && $conn instanceof mysqli) {
        try { $conn->rollback(); } catch (Throwable $ignore) {}
    }

    error_log('Add review error: ' . $e->getMessage());
    json_response(false, $e->getMessage(), [], 400);

} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
