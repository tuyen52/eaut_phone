<?php
header('Content-Type: application/json');
require_once('../connect.php');

$masp = isset($_GET['masp']) ? trim($_GET['masp']) : '';
$include_variants = (isset($_GET['include_variants']) && $_GET['include_variants'] == '1');

function mapProductRowToJson($row) {
    return [
        "masp"      => $row['masp'],
        "name"      => $row['ten_sp'],
        "company"   => $row['hang_sx'],
        "img"       => $row['hinh_anh'],
        "price"     => $row['gia'],
        "star"      => (int)$row['so_sao'],
        "rateCount" => (int)$row['so_danh_gia'],
        "promo"     => [
            "name"  => $row['khuyen_mai_loai'],
            "value" => $row['khuyen_mai_gia_tri']
        ],
        "gioi_thieu_san_pham" => $row['gioi_thieu_san_pham'] ?? '',
        // [QUAN TRỌNG] Đã lấy được chi tiết từ DB
        "detail"    => [
            "screen" => $row['screen'],
            "os" => $row['os'],
            // JS cũ dùng từ 'camara' (lỗi chính tả cũ) nên ta map theo nó
            "camara" => $row['camera'],
            "camaraFront" => $row['camera_front'],
            "cpu" => $row['cpu'],
            "ram" => $row['ram'],
            "rom" => $row['rom'],
            "microUSB" => $row['micro_usb'],
            "battery" => $row['battery']
        ],
        "inventory" => (int)$row['so_luong_ton']
    ];
}

/* =========================
   Case 1: Lấy 1 sản phẩm theo masp
   GET php/get-products.php?masp=SP01&include_variants=1
   ========================= */
if ($masp !== '') {
    $stmt = $conn->prepare("SELECT * FROM products WHERE masp = ? LIMIT 1");
    $stmt->bind_param("s", $masp);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res && $res->num_rows > 0) {
        $row = $res->fetch_assoc();
        $sp = mapProductRowToJson($row);

        if ($include_variants) {
            $variants = [];
            $stmt2 = $conn->prepare("SELECT variant_id, masp, ten_mau, ma_mau_hex, so_luong_ton 
                                     FROM product_variants WHERE masp = ? ORDER BY variant_id ASC");
            $stmt2->bind_param("s", $masp);
            $stmt2->execute();
            $res2 = $stmt2->get_result();
            while ($v = $res2->fetch_assoc()) {
                $variants[] = [
                    "variant_id" => (int)$v['variant_id'],
                    "masp" => $v['masp'],
                    "ten_mau" => $v['ten_mau'],
                    "ma_mau_hex" => $v['ma_mau_hex'],
                    "so_luong_ton" => (int)$v['so_luong_ton']
                ];
            }
            $stmt2->close();
            $sp["variants"] = $variants;
        }

        echo json_encode($sp);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "NOT_FOUND", "message" => "Không tìm thấy sản phẩm"]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

/* =========================
   Case 2: Lấy danh sách sản phẩm (mặc định)
   GET php/get-products.php
   hoặc lấy kèm variants:
   GET php/get-products.php?include_variants=1
   ========================= */

$sql = "SELECT * FROM products";
$result = $conn->query($sql);

$mangSanPham = [];
$variantsByMasp = [];

if ($include_variants) {
    // Lấy tất cả variants 1 lần rồi group theo masp (tránh N+1 query)
    $vRes = $conn->query("SELECT variant_id, masp, ten_mau, ma_mau_hex, so_luong_ton FROM product_variants");
    if ($vRes && $vRes->num_rows > 0) {
        while ($v = $vRes->fetch_assoc()) {
            $m = $v['masp'];
            if (!isset($variantsByMasp[$m])) $variantsByMasp[$m] = [];
            $variantsByMasp[$m][] = [
                "variant_id" => (int)$v['variant_id'],
                "masp" => $v['masp'],
                "ten_mau" => $v['ten_mau'],
                "ma_mau_hex" => $v['ma_mau_hex'],
                "so_luong_ton" => (int)$v['so_luong_ton']
            ];
        }
    }
}

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $sp = mapProductRowToJson($row);

        if ($include_variants) {
            $m = $row['masp'];
            $sp["variants"] = isset($variantsByMasp[$m]) ? $variantsByMasp[$m] : [];
        }

        $mangSanPham[] = $sp;
    }
}

echo json_encode($mangSanPham);
$conn->close();
?>