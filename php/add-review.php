<?php
header('Content-Type: application/json');
require_once('../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $data = json_decode(file_get_contents("php://input"), true);
    if(!$data) { echo json_encode(["status"=>false, "message"=>"Dữ liệu không hợp lệ"]); exit(); }

    $masp = trim($data['masp'] ?? '');
    $user = trim($data['username'] ?? '');
    $star = (int)($data['rating'] ?? 0);
    $cmt  = trim($data['comment'] ?? '');

    // Optional: frontend có thể gửi (nếu trang chi tiết có chọn màu)
    $variant_id_in = (int)($data['variant_id'] ?? 0);
    $mau_sac_in    = trim($data['mau_sac'] ?? '');

    if ($masp === '' || $user === '') throw new Exception("Thiếu masp/username");
    if ($star < 1 || $star > 5) throw new Exception("Số sao không hợp lệ");
    if (mb_strlen($cmt) < 5) throw new Exception("Bình luận quá ngắn");

    $date = date("Y-m-d H:i:s");

    // 1) Xác định màu đã mua (ưu tiên input, không thì suy ra từ đơn)
    $variant_id = null;
    $mau_sac = null;

    if ($variant_id_in > 0) {
        $variant_id = $variant_id_in;
        $mau_sac = ($mau_sac_in !== '') ? $mau_sac_in : null;
    } else {
        // Lấy variant_id/mau_sac từ đơn gần nhất đã nhận/hoàn thành
        $stmt = $conn->prepare("
            SELECT od.variant_id, od.mau_sac
            FROM orders o
            JOIN order_details od ON o.ma_don = od.ma_don
            WHERE o.username = ? AND od.masp = ?
              AND (o.tinh_trang = 'Đã nhận hàng' OR o.tinh_trang = 'Hoàn thành')
            ORDER BY o.ngay_mua DESC, od.detail_id DESC
            LIMIT 1
        ");
        $stmt->bind_param("ss", $user, $masp);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res && $res->num_rows > 0) {
            $row = $res->fetch_assoc();
            $variant_id = $row['variant_id'] !== null ? (int)$row['variant_id'] : null;
            $mau_sac = $row['mau_sac'] ?? null;
        }
        $stmt->close();
    }

    // 2) Insert vào rate (có variant_id + mau_sac)
    $stmtInsert = $conn->prepare("
        INSERT INTO rate (masp, username, variant_id, mau_sac, so_sao, binh_luan, ngay_dg)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    // variant_id có thể null => dùng i? không được, nên xử lý bằng set null khi <=0
    if ($variant_id === null || $variant_id <= 0) {
        $null = null;
        $stmtInsert->bind_param("ssissss", $masp, $user, $null, $mau_sac, $star, $cmt, $date);
    } else {
        $stmtInsert->bind_param("ssissss", $masp, $user, $variant_id, $mau_sac, $star, $cmt, $date);
    }
    $stmtInsert->execute();
    $stmtInsert->close();

    // 3) TÍNH TOÁN LẠI SAO TRUNG BÌNH CHO SẢN PHẨM
    $stmtCal = $conn->prepare("SELECT AVG(so_sao) as trung_binh, COUNT(*) as so_luong FROM rate WHERE masp = ?");
    $stmtCal->bind_param("s", $masp);
    $stmtCal->execute();
    $cal = $stmtCal->get_result()->fetch_assoc();
    $stmtCal->close();

    $newStar = round((float)$cal['trung_binh']);
    $newCount = (int)$cal['so_luong'];

    $stmtUp = $conn->prepare("UPDATE products SET so_sao = ?, so_danh_gia = ? WHERE masp = ?");
    $stmtUp->bind_param("iis", $newStar, $newCount, $masp);
    $stmtUp->execute();
    $stmtUp->close();

    echo json_encode(["status" => true, "message" => "Đánh giá thành công!"]);
} catch (Exception $e) {
    echo json_encode(["status" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>