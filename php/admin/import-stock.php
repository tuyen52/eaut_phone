<?php
// php/admin/import-stock.php
// API nhập kho cũ theo masp. Dự án mới nên ưu tiên import-variant-stock.php.

header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/admin_auth.php');
require_once('../../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $data = read_json_body();

    $masp = trim($data['masp'] ?? '');
    $soLuong = (int)($data['so_luong'] ?? 0);

    if ($masp === '') {
        json_response(false, 'Thiếu mã sản phẩm!', [], 400);
    }

    if ($soLuong <= 0) {
        json_response(false, 'Số lượng nhập phải lớn hơn 0!', [], 400);
    }

    $conn->begin_transaction();

    // Kiểm tra sản phẩm tồn tại
    $stmtCheck = $conn->prepare("SELECT masp FROM products WHERE masp = ? LIMIT 1");
    $stmtCheck->bind_param("s", $masp);
    $stmtCheck->execute();
    $rsCheck = $stmtCheck->get_result();

    if ($rsCheck->num_rows === 0) {
        throw new Exception('Không tìm thấy sản phẩm cần nhập kho!');
    }

    $stmtCheck->close();

    // Lưu lịch sử nhập kho
    $stmtLog = $conn->prepare("INSERT INTO nhap_kho (masp, so_luong_nhap) VALUES (?, ?)");
    $stmtLog->bind_param("si", $masp, $soLuong);
    $stmtLog->execute();
    $stmtLog->close();

    // Cộng tồn kho tổng theo kiểu cũ
    $stmtUpdate = $conn->prepare("
        UPDATE products
        SET so_luong_ton = so_luong_ton + ?
        WHERE masp = ?
    ");
    $stmtUpdate->bind_param("is", $soLuong, $masp);
    $stmtUpdate->execute();

    if ($stmtUpdate->affected_rows <= 0) {
        throw new Exception('Không thể cập nhật tồn kho!');
    }

    $stmtUpdate->close();

    $conn->commit();

    json_response(true, "Đã nhập thêm {$soLuong} sản phẩm vào kho!");

} catch (Throwable $e) {
    if (isset($conn) && $conn instanceof mysqli) {
        try { $conn->rollback(); } catch (Throwable $ignore) {}
    }

    error_log('Import stock error: ' . $e->getMessage());
    json_response(false, $e->getMessage(), [], 400);

} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>