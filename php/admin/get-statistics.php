<?php
// php/admin/get-statistics.php
header('Content-Type: application/json');
require_once('../../connect.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

function isoDateOrNull($s) {
    $s = trim((string)$s);
    if ($s === '') return null;
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $s)) return null;
    return $s;
}

try {
    // Detect orders date column: ngay_mua or ngaymua
    $dateCol = 'ngay_mua';
    $chk = $conn->query("SHOW COLUMNS FROM orders LIKE 'ngaymua'");
    if ($chk && $chk->num_rows > 0) $dateCol = 'ngaymua';

    // Params
    $start = isoDateOrNull($_GET['start'] ?? '');
    $end   = isoDateOrNull($_GET['end'] ?? '');
    $group = strtolower(trim($_GET['group'] ?? 'day')); // day|month
    $scope = strtolower(trim($_GET['scope'] ?? 'completed')); // completed|all

    // Default range: last 30 days (inclusive)
    if (!$end) $end = date('Y-m-d');
    if (!$start) $start = date('Y-m-d', strtotime($end . ' -29 days'));

    // Normalize group
    if ($group !== 'month') $group = 'day';

    // DateTime boundaries (inclusive)
    $startDT = $start . ' 00:00:00';
    $endDT   = $end   . ' 23:59:59';

    // Revenue scope condition
    // - completed: Hoàn thành + Đã nhận hàng
    // - all: trừ các trạng thái có chữ "hủy"
    $scopeWhere = "";
    if ($scope === 'all') {
        $scopeWhere = "LOWER(o.tinh_trang) NOT LIKE '%hủy%'";
    } else {
        $scopeWhere = "o.tinh_trang IN ('Hoàn thành','Đã nhận hàng')";
        $scope = 'completed';
    }

    // ---------- KPI ----------
    $sqlKpi = "
        SELECT
            COUNT(DISTINCT o.ma_don) AS orders,
            IFNULL(SUM(od.so_luong), 0) AS units,
            IFNULL(SUM(od.so_luong * od.don_gia), 0) AS revenue
        FROM orders o
        JOIN order_details od ON o.ma_don = od.ma_don
        WHERE o.$dateCol BETWEEN ? AND ?
          AND $scopeWhere
    ";
    $stmt = $conn->prepare($sqlKpi);
    $stmt->bind_param("ss", $startDT, $endDT);
    $stmt->execute();
    $kpi = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    $orders = (int)($kpi['orders'] ?? 0);
    $units = (int)($kpi['units'] ?? 0);
    $revenue = (float)($kpi['revenue'] ?? 0);
    $aov = $orders > 0 ? ($revenue / $orders) : 0;

    // Orders by status (all statuses)
    $sqlStatus = "
        SELECT o.tinh_trang AS status,
               COUNT(*) AS count_orders,
               IFNULL(SUM(o.tong_tien), 0) AS sum_total
        FROM orders o
        WHERE o.$dateCol BETWEEN ? AND ?
        GROUP BY o.tinh_trang
        ORDER BY count_orders DESC
    ";
    $stmt = $conn->prepare($sqlStatus);
    $stmt->bind_param("ss", $startDT, $endDT);
    $stmt->execute();
    $rs = $stmt->get_result();
    $statusBreakdown = [];
    $totalAllOrders = 0;
    $cancelOrders = 0;
    while ($row = $rs->fetch_assoc()) {
        $cnt = (int)$row['count_orders'];
        $st = $row['status'];
        $totalAllOrders += $cnt;
        if (mb_stripos($st, 'hủy') !== false) $cancelOrders += $cnt;

        $statusBreakdown[] = [
            "status" => $st,
            "count" => $cnt,
            "sum_total" => (float)$row['sum_total']
        ];
    }
    $stmt->close();

    $cancelRate = $totalAllOrders > 0 ? ($cancelOrders / $totalAllOrders) : 0;

    // ---------- Revenue series ----------
    if ($group === 'month') {
        $periodExpr = "DATE_FORMAT(o.$dateCol, '%Y-%m')";
    } else {
        $periodExpr = "DATE(o.$dateCol)";
    }

    $sqlSeries = "
        SELECT $periodExpr AS period,
               IFNULL(SUM(od.so_luong * od.don_gia), 0) AS revenue,
               IFNULL(SUM(od.so_luong), 0) AS units,
               COUNT(DISTINCT o.ma_don) AS orders
        FROM orders o
        JOIN order_details od ON o.ma_don = od.ma_don
        WHERE o.$dateCol BETWEEN ? AND ?
          AND $scopeWhere
        GROUP BY period
        ORDER BY period ASC
    ";
    $stmt = $conn->prepare($sqlSeries);
    $stmt->bind_param("ss", $startDT, $endDT);
    $stmt->execute();
    $rs = $stmt->get_result();
    $revenueSeries = [];
    while ($row = $rs->fetch_assoc()) {
        $revenueSeries[] = [
            "period" => $row['period'],
            "revenue" => (float)$row['revenue'],
            "units" => (int)$row['units'],
            "orders" => (int)$row['orders']
        ];
    }
    $stmt->close();

    // ---------- Brand summary ----------
    $sqlBrand = "
        SELECT p.hang_sx AS brand,
               IFNULL(SUM(od.so_luong), 0) AS units,
               IFNULL(SUM(od.so_luong * od.don_gia), 0) AS revenue
        FROM orders o
        JOIN order_details od ON o.ma_don = od.ma_don
        JOIN products p ON od.masp = p.masp
        WHERE o.$dateCol BETWEEN ? AND ?
          AND $scopeWhere
        GROUP BY p.hang_sx
        ORDER BY revenue DESC
    ";
    $stmt = $conn->prepare($sqlBrand);
    $stmt->bind_param("ss", $startDT, $endDT);
    $stmt->execute();
    $rs = $stmt->get_result();
    $brandSummary = [];
    while ($row = $rs->fetch_assoc()) {
        $brandSummary[] = [
            "brand" => $row['brand'],
            "units" => (int)$row['units'],
            "revenue" => (float)$row['revenue']
        ];
    }
    $stmt->close();

    // ---------- Top products ----------
    $sqlTopProducts = "
        SELECT p.masp, p.ten_sp AS name, p.hang_sx AS brand,
               IFNULL(SUM(od.so_luong), 0) AS units,
               IFNULL(SUM(od.so_luong * od.don_gia), 0) AS revenue
        FROM orders o
        JOIN order_details od ON o.ma_don = od.ma_don
        JOIN products p ON od.masp = p.masp
        WHERE o.$dateCol BETWEEN ? AND ?
          AND $scopeWhere
        GROUP BY p.masp, p.ten_sp, p.hang_sx
        ORDER BY revenue DESC
        LIMIT 10
    ";
    $stmt = $conn->prepare($sqlTopProducts);
    $stmt->bind_param("ss", $startDT, $endDT);
    $stmt->execute();
    $rs = $stmt->get_result();
    $topProducts = [];
    while ($row = $rs->fetch_assoc()) {
        $topProducts[] = [
            "masp" => $row['masp'],
            "name" => $row['name'],
            "brand" => $row['brand'],
            "units" => (int)$row['units'],
            "revenue" => (float)$row['revenue']
        ];
    }
    $stmt->close();

    // ---------- Top variants / colors ----------
    $sqlTopVariants = "
        SELECT od.variant_id,
               od.masp,
               p.ten_sp AS product_name,
               COALESCE(pv.ten_mau, od.mau_sac, 'N/A') AS color_name,
               pv.ma_mau_hex AS color_hex,
               IFNULL(SUM(od.so_luong), 0) AS units,
               IFNULL(SUM(od.so_luong * od.don_gia), 0) AS revenue
        FROM orders o
        JOIN order_details od ON o.ma_don = od.ma_don
        JOIN products p ON od.masp = p.masp
        LEFT JOIN product_variants pv ON od.variant_id = pv.variant_id
        WHERE o.$dateCol BETWEEN ? AND ?
          AND $scopeWhere
        GROUP BY od.variant_id, od.masp, p.ten_sp, color_name, pv.ma_mau_hex
        ORDER BY units DESC, revenue DESC
        LIMIT 10
    ";
    $stmt = $conn->prepare($sqlTopVariants);
    $stmt->bind_param("ss", $startDT, $endDT);
    $stmt->execute();
    $rs = $stmt->get_result();
    $topVariants = [];
    while ($row = $rs->fetch_assoc()) {
        $topVariants[] = [
            "variant_id" => $row['variant_id'] !== null ? (int)$row['variant_id'] : null,
            "masp" => $row['masp'],
            "product_name" => $row['product_name'],
            "color_name" => $row['color_name'],
            "color_hex" => $row['color_hex'],
            "units" => (int)$row['units'],
            "revenue" => (float)$row['revenue']
        ];
    }
    $stmt->close();

    echo json_encode([
        "meta" => [
            "start" => $start,
            "end" => $end,
            "group" => $group,
            "scope" => $scope
        ],
        "kpis" => [
            "revenue" => $revenue,
            "orders" => $orders,
            "units" => $units,
            "aov" => $aov,
            "total_orders_all_status" => $totalAllOrders,
            "cancel_orders" => $cancelOrders,
            "cancel_rate" => $cancelRate
        ],
        "revenue_series" => $revenueSeries,
        "status_breakdown" => $statusBreakdown,
        "brand_summary" => $brandSummary,
        "top_products" => $topProducts,
        "top_variants" => $topVariants
    ]);
} catch (Exception $e) {
    echo json_encode([
        "error" => true,
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>