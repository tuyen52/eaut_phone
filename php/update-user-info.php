<?php
header('Content-Type: application/json; charset=utf-8');
require_once('../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!is_array($data)) {
        throw new Exception("Không nhận được dữ liệu JSON hợp lệ!");
    }

    $username = trim($data['username'] ?? '');
    $ho = trim($data['ho'] ?? '');
    $ten = trim($data['ten'] ?? '');

    if ($username === '') {
        throw new Exception("Thiếu username!");
    }

    if ($ho === '' && $ten === '') {
        throw new Exception("Họ tên không được để trống!");
    }

    // Kiểm tra tài khoản có tồn tại không
    $stmtCheck = $conn->prepare("SELECT username FROM users WHERE username = ? LIMIT 1");
    $stmtCheck->bind_param("s", $username);
    $stmtCheck->execute();
    $resultCheck = $stmtCheck->get_result();

    if ($resultCheck->num_rows === 0) {
        throw new Exception("Không tìm thấy tài khoản cần cập nhật!");
    }

    $stmtCheck->close();

    // Cập nhật họ tên
    $stmtUpdate = $conn->prepare("UPDATE users SET ho = ?, ten = ? WHERE username = ?");
    $stmtUpdate->bind_param("sss", $ho, $ten, $username);
    $stmtUpdate->execute();
    $stmtUpdate->close();

    // Lấy lại thông tin mới nhất để cập nhật localStorage phía JS
    $stmtUser = $conn->prepare("SELECT username, ho, ten, email, role FROM users WHERE username = ? LIMIT 1");
    $stmtUser->bind_param("s", $username);
    $stmtUser->execute();
    $resultUser = $stmtUser->get_result();
    $user = $resultUser->fetch_assoc();
    $stmtUser->close();

    echo json_encode([
        "status" => true,
        "message" => "Cập nhật họ tên thành công!",
        "user" => $user
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(400);

    echo json_encode([
        "status" => false,
        "message" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

$conn->close();
?>