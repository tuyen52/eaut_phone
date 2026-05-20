<?php
// php/admin/delete-review.php
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/admin_auth.php');
require_once('../../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $data = read_json_body();

    $id = (int)($data['id'] ?? 0);
    $masp = trim($data['masp'] ?? '');

    if ($id <= 0) {
        json_response(false, 'ID bình luận không hợp lệ!', [], 400);
    }

    if ($masp === '') {
        json_response(false, 'Thiếu mã sản phẩm!', [], 400);
    }

    $conn->begin_transaction();

    // Kiểm tra bình luận có tồn tại và đúng sản phẩm không
    $stmtCheck = $conn->prepare("SELECT id FROM rate WHERE id = ? AND masp = ? LIMIT 1");
    $stmtCheck->bind_param("is", $id, $masp);
    $stmtCheck->execute();
    $rsCheck = $stmtCheck->get_result();

    if ($rsCheck->num_rows === 0) {
        throw new Exception('Không tìm thấy bình luận cần xóa!');
    }

    $stmtCheck->close();

    // Xóa bình luận
    $stmtDelete = $conn->prepare("DELETE FROM rate WHERE id = ? AND masp = ?");
    $stmtDelete->bind_param("is", $id, $masp);
    $stmtDelete->execute();

    if ($stmtDelete->affected_rows <= 0) {
        throw new Exception('Không thể xóa bình luận!');
    }

    $stmtDelete->close();

    // Tính lại sao trung bình
    $stmtCal = $conn->prepare("
        SELECT AVG(so_sao) AS trung_binh, COUNT(*) AS so_luong
        FROM rate
        WHERE masp = ?
    ");
    $stmtCal->bind_param("s", $masp);
    $stmtCal->execute();
    $row = $stmtCal->get_result()->fetch_assoc();
    $stmtCal->close();

    $newStar = ((int)$row['so_luong'] > 0) ? round((float)$row['trung_binh']) : 0;
    $newCount = (int)$row['so_luong'];

    $stmtUpdate = $conn->prepare("
        UPDATE products
        SET so_sao = ?, so_danh_gia = ?
        WHERE masp = ?
    ");
    $stmtUpdate->bind_param("iis", $newStar, $newCount, $masp);
    $stmtUpdate->execute();
    $stmtUpdate->close();

    $conn->commit();

    json_response(true, 'Đã xóa bình luận và cập nhật lại số sao!');

} catch (Throwable $e) {
    if (isset($conn) && $conn instanceof mysqli) {
        try { $conn->rollback(); } catch (Throwable $ignore) {}
    }

    error_log('Delete review error: ' . $e->getMessage());
    json_response(false, $e->getMessage(), [], 400);

} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>