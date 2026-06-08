<?php
// php/add-review.php
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/auth_session.php');
require_once('../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

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

    /*
        Kiểm tra user đã mua và nhận hàng sản phẩm này chưa.
        Lấy luôn variant/màu từ đơn hợp lệ gần nhất.
    */
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
        $stmtBought->bind_param("is", $userId, $masp);
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
        $stmtBought->bind_param("ss", $username, $masp);
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

    $conn->begin_transaction();

    $rateHasUserId = false;
    $chkRateUserId = $conn->query("SHOW COLUMNS FROM rate LIKE 'user_id'");
    if ($chkRateUserId && $chkRateUserId->num_rows > 0) {
        $rateHasUserId = true;
    }

    if ($rateHasUserId && $userId > 0) {
        $stmtInsert = $conn->prepare("
            INSERT INTO rate (masp, user_id, username, variant_id, mau_sac, so_sao, binh_luan, ngay_dg)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ");

        if ($variantId === null || $variantId <= 0) {
            $nullVariant = null;
            $stmtInsert->bind_param(
                "sisssis",
                $masp,
                $userId,
                $username,
                $nullVariant,
                $mauSac,
                $star,
                $comment
            );
        } else {
            $stmtInsert->bind_param(
                "sisssis",
                $masp,
                $userId,
                $username,
                $variantId,
                $mauSac,
                $star,
                $comment
            );
        }
    } else {
        $stmtInsert = $conn->prepare("
            INSERT INTO rate (masp, username, variant_id, mau_sac, so_sao, binh_luan, ngay_dg)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");

        if ($variantId === null || $variantId <= 0) {
            $nullVariant = null;
            $stmtInsert->bind_param(
                "ssisis",
                $masp,
                $username,
                $nullVariant,
                $mauSac,
                $star,
                $comment
            );
        } else {
            $stmtInsert->bind_param(
                "ssisis",
                $masp,
                $username,
                $variantId,
                $mauSac,
                $star,
                $comment
            );
        }
    }

    $stmtInsert->execute();
    $stmtInsert->close();

    $stmtCal = $conn->prepare("
        SELECT AVG(so_sao) AS trung_binh, COUNT(*) AS so_luong
        FROM rate
        WHERE masp = ?
    ");
    $stmtCal->bind_param("s", $masp);
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
    $stmtUp->bind_param("iis", $newStar, $newCount, $masp);
    $stmtUp->execute();
    $stmtUp->close();

    $conn->commit();

    json_response(true, 'Gửi đánh giá thành công!');

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
?>