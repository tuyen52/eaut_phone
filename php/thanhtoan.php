<?php
// php/thanhtoan.php
header('Content-Type: application/json');
require_once('../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) throw new Exception("Dữ liệu gửi lên không hợp lệ (JSON).");

    $username  = trim($data['username'] ?? '');
    $tong_tien = (int)($data['tong_tien'] ?? 0);
    $san_pham  = $data['san_pham'] ?? [];

    $hoten  = $conn->real_escape_string(trim($data['ho_ten'] ?? '')); // bạn chưa lưu họ tên vào DB, giữ để sau dùng
    $sdt    = $conn->real_escape_string(trim($data['sdt'] ?? ''));
    $diachi = $conn->real_escape_string(trim($data['dia_chi'] ?? ''));
    $pttt   = $conn->real_escape_string(trim($data['phuong_thuc'] ?? 'COD'));

    if ($username === '') throw new Exception("Thiếu username.");
    if (!is_array($san_pham) || count($san_pham) === 0) throw new Exception("Giỏ hàng trống.");

    // ===== TRANSACTION =====
    $conn->begin_transaction();

    // 1) Tạo đơn hàng
    $sql_order = "INSERT INTO orders (username, tong_tien, tinh_trang, phuong_thuc_tt, dia_chi, so_dien_thoai)
                  VALUES ('$username', $tong_tien, 'Chờ xử lý', '$pttt', '$diachi', '$sdt')";
    $conn->query($sql_order);
    $ma_don = $conn->insert_id;

    // 2) Prepared statements

    // Nếu frontend không gửi variant_id -> tự chọn variant mặc định/đầu tiên của masp
    $stmtPickVariant = $conn->prepare("
        SELECT variant_id, ten_mau
        FROM product_variants
        WHERE masp = ?
        ORDER BY CASE WHEN ten_mau='Mặc định' THEN 0 ELSE 1 END, variant_id ASC
        LIMIT 1
    ");

    // Lock variant để tránh race condition khi trừ kho
    $stmtGetVariantForUpdate = $conn->prepare("
        SELECT variant_id, masp, ten_mau, so_luong_ton
        FROM product_variants
        WHERE variant_id = ?
        FOR UPDATE
    ");

    // Trừ kho variant (atomic)
    $stmtUpdateVariant = $conn->prepare("
        UPDATE product_variants
        SET so_luong_ton = so_luong_ton - ?
        WHERE variant_id = ? AND so_luong_ton >= ?
    ");

    // Insert order_details có variant
    $stmtInsertDetail = $conn->prepare("
        INSERT INTO order_details (ma_don, masp, variant_id, mau_sac, so_luong, don_gia)
        VALUES (?, ?, ?, ?, ?, ?)
    ");

    // Đồng bộ tồn kho tổng products (phòng trường hợp bạn chưa tạo trigger)
    $stmtSyncProduct = $conn->prepare("
        UPDATE products
        SET so_luong_ton = (
            SELECT IFNULL(SUM(v.so_luong_ton), 0)
            FROM product_variants v
            WHERE v.masp = ?
        )
        WHERE masp = ?
    ");

    $maspNeedSync = [];

    // 3) Check + trừ kho theo variant + lưu order_details
    foreach ($san_pham as $sp) {
        $masp = trim($sp['masp'] ?? '');
        $sl   = (int)($sp['so_luong'] ?? 0);
        $gia  = (int)($sp['gia'] ?? 0);

        $variant_id = (int)($sp['variant_id'] ?? 0);
        $mau_sac_in = trim($sp['mau_sac'] ?? '');

        if ($masp === '') throw new Exception("Thiếu masp trong giỏ hàng.");
        if ($sl <= 0) throw new Exception("Số lượng mua không hợp lệ.");
        if ($gia < 0) throw new Exception("Đơn giá không hợp lệ.");

        // Nếu chưa có variant_id -> pick mặc định
        if ($variant_id <= 0) {
            $stmtPickVariant->bind_param("s", $masp);
            $stmtPickVariant->execute();
            $rsPick = $stmtPickVariant->get_result();
            if ($rsPick->num_rows === 0) {
                throw new Exception("Sản phẩm '$masp' chưa có màu (variant) để mua.");
            }
            $pick = $rsPick->fetch_assoc();
            $variant_id = (int)$pick['variant_id'];
            if ($mau_sac_in === '') $mau_sac_in = $pick['ten_mau'];
        }

        // Lock & đọc kho variant
        $stmtGetVariantForUpdate->bind_param("i", $variant_id);
        $stmtGetVariantForUpdate->execute();
        $rsV = $stmtGetVariantForUpdate->get_result();
        if ($rsV->num_rows === 0) {
            throw new Exception("Không tìm thấy variant_id=$variant_id.");
        }

        $v = $rsV->fetch_assoc();
        if ($v['masp'] !== $masp) {
            throw new Exception("variant_id=$variant_id không thuộc sản phẩm $masp.");
        }

        $ten_mau = $v['ten_mau'];
        $stock   = (int)$v['so_luong_ton'];

        if ($sl > $stock) {
            throw new Exception("Màu '$ten_mau' của sản phẩm '$masp' chỉ còn $stock cái!");
        }

        // Trừ kho (atomic)
        $stmtUpdateVariant->bind_param("iii", $sl, $variant_id, $sl);
        $stmtUpdateVariant->execute();
        if ($stmtUpdateVariant->affected_rows === 0) {
            throw new Exception("Tồn kho màu '$ten_mau' vừa thay đổi, vui lòng thử lại!");
        }

        $mau_sac_final = ($mau_sac_in !== '') ? $mau_sac_in : $ten_mau;

        // Insert chi tiết đơn
        $stmtInsertDetail->bind_param("isisii", $ma_don, $masp, $variant_id, $mau_sac_final, $sl, $gia);
        $stmtInsertDetail->execute();

        $maspNeedSync[$masp] = true;
    }

    // 4) Sync tồn kho tổng products cho các masp liên quan
    foreach (array_keys($maspNeedSync) as $m) {
        $stmtSyncProduct->bind_param("ss", $m, $m);
        $stmtSyncProduct->execute();
    }

    $conn->commit();

    echo json_encode([
        "status" => true,
        "message" => "Đặt hàng thành công! Mã đơn: #" . $ma_don,
        "ma_don" => $ma_don
    ]);
} catch (Exception $e) {
    if (isset($conn)) {
        try { $conn->rollback(); } catch (Exception $ignore) {}
    }
    echo json_encode([
        "status" => false,
        "message" => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) $conn->close();
}
?>