<?php
// php/admin/lock-user.php
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/admin_auth.php');
require_once('../../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $data = read_json_body();

    $userId = (int)($data['user_id'] ?? 0);
    $username = trim($data['username'] ?? '');

    $hasUserId = false;
    $chkUserId = $conn->query("SHOW COLUMNS FROM users LIKE 'user_id'");
    if ($chkUserId && $chkUserId->num_rows > 0) {
        $hasUserId = true;
    }

    if ($hasUserId) {
        if ($userId <= 0 || !array_key_exists('lock', $data)) {
            json_response(false, 'Thiếu dữ liệu đầu vào!', [], 400);
        }
    } else {
        if ($username === '' || !array_key_exists('lock', $data)) {
            json_response(false, 'Thiếu dữ liệu đầu vào!', [], 400);
        }
    }

    $wantLock = (bool)$data['lock'];
    $trangThaiMoi = $wantLock ? 0 : 1;

    // Không cho khóa admin
    if ($hasUserId) {
        $stmtCheck = $conn->prepare("SELECT user_id, username, role FROM users WHERE user_id = ? LIMIT 1");
        $stmtCheck->bind_param("i", $userId);
    } else {
        $stmtCheck = $conn->prepare("SELECT username, role FROM users WHERE username = ? LIMIT 1");
        $stmtCheck->bind_param("s", $username);
    }
    $stmtCheck->execute();
    $rsCheck = $stmtCheck->get_result();

    if ($rsCheck->num_rows === 0) {
        throw new Exception('Không tìm thấy tài khoản!');
    }

    $user = $rsCheck->fetch_assoc();
    $stmtCheck->close();

    if (($user['role'] ?? '') === 'admin') {
        throw new Exception('Không được khóa hoặc mở khóa tài khoản quản trị viên bằng chức năng này!');
    }

    $resolvedUserId = (int)($user['user_id'] ?? $userId);
    $resolvedUsername = (string)($user['username'] ?? $username);

    if ($hasUserId && $resolvedUserId > 0) {
        $stmtUpdate = $conn->prepare("
            UPDATE users
            SET trang_thai = ?
            WHERE user_id = ? AND role != 'admin'
        ");
        $stmtUpdate->bind_param("ii", $trangThaiMoi, $resolvedUserId);
    } else {
        $stmtUpdate = $conn->prepare("
            UPDATE users
            SET trang_thai = ?
            WHERE username = ? AND role != 'admin'
        ");
        $stmtUpdate->bind_param("is", $trangThaiMoi, $resolvedUsername);
    }
    $stmtUpdate->execute();

    if ($stmtUpdate->affected_rows < 0) {
        throw new Exception('Không thể cập nhật trạng thái tài khoản!');
    }

    $stmtUpdate->close();

    json_response(true, 'Cập nhật trạng thái thành công!');

} catch (Throwable $e) {
    error_log('Lock user error: ' . $e->getMessage());
    json_response(false, $e->getMessage(), [], 400);

} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>