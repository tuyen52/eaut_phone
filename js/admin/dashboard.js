// js/admin/dashboard.js
var __statsCharts = {};

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function addThongKe() {
    ensureDashboardUI();
    initDefaultFilters();
    loadStatistics();
}

function ensureDashboardUI() {
    if (!document.getElementById('statsStart')) return;

    var btn = document.getElementById('btnReloadStats');
    if (btn && !btn.__bound) {
        btn.__bound = true;
        btn.addEventListener('click', function () { loadStatistics(); });
    }

    var btnExport = document.getElementById('btnExportCsv');
    if (btnExport && !btnExport.__bound) {
        btnExport.__bound = true;
        btnExport.addEventListener('click', function () { exportStatsCSV(); });
    }
}

function initDefaultFilters() {
    var startEl = document.getElementById('statsStart');
    var endEl = document.getElementById('statsEnd');
    var groupEl = document.getElementById('statsGroup');
    var scopeEl = document.getElementById('statsScope');

    if (!startEl || !endEl) return;

    if (!endEl.value) endEl.value = toISODate(new Date());
    if (!startEl.value) {
        var end2 = parseISODate(endEl.value) || new Date();
        var start = new Date(end2.getTime());
        start.setDate(start.getDate() - 29);
        startEl.value = toISODate(start);
    }

    if (groupEl && !groupEl.value) groupEl.value = 'day';
    if (scopeEl && !scopeEl.value) scopeEl.value = 'completed';
}

function loadStatistics() {
    var start = document.getElementById('statsStart')?.value || '';
    var end = document.getElementById('statsEnd')?.value || '';
    var group = document.getElementById('statsGroup')?.value || 'day';
    var scope = document.getElementById('statsScope')?.value || 'completed';

    window.__lastStatsMeta = {
        start: start,
        end: end,
        group: group,
        scope: scope
    };

    var loading = document.getElementById('statsLoading');
    if (loading) loading.style.display = 'inline-block';

    var url = `php/admin/get-statistics.php?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&group=${encodeURIComponent(group)}&scope=${encodeURIComponent(scope)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (loading) loading.style.display = 'none';

            if (data && data.error) {
                showStatsError(data.message || 'Lỗi thống kê');
                return;
            }
            if (data && data.meta) {
                var startEl2 = document.getElementById('statsStart');
                var endEl2 = document.getElementById('statsEnd');
                var groupEl2 = document.getElementById('statsGroup');
                var scopeEl2 = document.getElementById('statsScope');
                if (startEl2) startEl2.value = data.meta.start || startEl2.value;
                if (endEl2) endEl2.value = data.meta.end || endEl2.value;
                if (groupEl2) groupEl2.value = data.meta.group || groupEl2.value;
                if (scopeEl2) scopeEl2.value = data.meta.scope || scopeEl2.value;
            }

            renderKPIs(data.kpis || {});
            renderCharts(data);
            renderTables(data);
        })
        .catch(err => {
            console.error(err);
            if (loading) loading.style.display = 'none';
            showStatsError('Lỗi kết nối Server thống kê!');
        });
}

function showStatsError(msg) {
    var box = document.getElementById('statsError');
    if (box) { box.style.display = 'block'; box.innerText = msg; }
}

// KPI
function setText(id, text) { var el = document.getElementById(id); if (el) el.innerText = text; }

function renderKPIs(k) {
    var box = document.getElementById('statsError');
    if (box) box.style.display = 'none';

    var revenue = Number(k.revenue || 0);
    var orders = Number(k.orders || 0);
    var units = Number(k.units || 0);
    var aov = Number(k.aov || 0);
    var cancelOrders = Number(k.cancel_orders || 0);
    var cancelRate = Number(k.cancel_rate || 0);
    var totalAllOrders = Number(k.total_orders_all_status || 0);

    setText('kpiRevenue', numToString(Math.round(revenue)) + ' ₫');
    setText('kpiOrders', orders.toString());
    setText('kpiUnits', units.toString());
    setText('kpiAov', numToString(Math.round(aov)) + ' ₫');
    setText('kpiCancel', cancelOrders.toString());
    setText('kpiCancelRate', Math.round(cancelRate * 100) + '%');
    var statusInfo = document.getElementById('statsLoading');
    if (statusInfo && totalAllOrders >= 0) {
        statusInfo.title = 'Tổng đơn theo mọi trạng thái: ' + totalAllOrders;
    }
}

// Charts
function destroyChart(id) {
    if (__statsCharts[id]) {
        try { __statsCharts[id].destroy(); } catch (e) {}
        delete __statsCharts[id];
    }
}

function renderCharts(data) {
    destroyChart('chartRevenue');
    destroyChart('chartStatus');
    destroyChart('chartBrand');
    destroyChart('chartTopProducts');
    destroyChart('chartTopVariants');

    drawRevenueChart(data.revenue_series || []);
    drawStatusChart(data.status_breakdown || []);
    drawBrandChart(data.brand_summary || []);
    drawTopProductsChart(data.top_products || []);
    drawTopVariantsChart(data.top_variants || []);
}

function drawRevenueChart(series) {
    var canvas = document.getElementById('chartRevenue');
    if (!canvas) return;

    var labels = series.map(x => x.period);
    var values = series.map(x => Number(x.revenue || 0));

    __statsCharts['chartRevenue'] = new Chart(canvas, {
        type: 'line',
        data: { labels, datasets: [{ label: 'Doanh thu', data: values, fill: false, borderWidth: 2, pointRadius: 2 }] },
        options: {
            responsive: true,
            maintainAspectRatio: false, // [MỚI]
            title: { display: true, text: 'Doanh thu theo thời gian', fontSize: 18 },
            tooltips: { callbacks: { label: t => ' ' + numToString(Math.round(t.yLabel)) + ' ₫' } },
            scales: { yAxes: [{ ticks: { beginAtZero: true, callback: v => numToString(v) } }] }
        }
    });
}

function drawStatusChart(list) {
    var canvas = document.getElementById('chartStatus');
    if (!canvas) return;

    var sorted = (list || []).slice().sort((a,b) => (b.count||0) - (a.count||0));
    var top = sorted.slice(0, 6);
    var rest = sorted.slice(6);
    if (rest.length) top.push({ status: 'Khác', count: rest.reduce((s,x)=>s+(Number(x.count||0)),0) });

    var labels = top.map(x => x.status);
    var values = top.map(x => Number(x.count || 0));
    var colors = labels.map(() => getRandomColor());

    __statsCharts['chartStatus'] = new Chart(canvas, {
        type: 'doughnut',
        data: { labels, datasets: [{ data: values, backgroundColor: colors, borderColor:'#fff', borderWidth:1 }] },
        options: {
            responsive: true,
            maintainAspectRatio: false, // [MỚI]
            title: { display: true, text: 'Tỷ trọng đơn theo trạng thái', fontSize: 18 },
            legend: { position: 'bottom' }
        }
    });
}

function drawBrandChart(list) {
    var canvas = document.getElementById('chartBrand');
    if (!canvas) return;

    var labels = (list || []).map(x => x.brand);
    var values = (list || []).map(x => Number(x.revenue || 0));
    var colors = labels.map(() => getRandomColor());

    __statsCharts['chartBrand'] = new Chart(canvas, {
        type: 'bar',
        data: { labels, datasets: [{ label:'Doanh thu theo hãng', data: values, backgroundColor: colors, borderColor:'#fff', borderWidth:1 }] },
        options: {
            responsive: true,
            maintainAspectRatio: false, // [MỚI]
            title: { display: true, text: 'Doanh thu theo hãng', fontSize: 18 },
            tooltips: { callbacks: { label: (t,d)=> `${d.labels[t.index]}: ${numToString(Math.round(d.datasets[0].data[t.index]||0))} ₫` } },
            scales: { yAxes: [{ ticks: { beginAtZero: true, callback: v => numToString(v) } }] }
        }
    });
}

function drawTopProductsChart(list) {
    var canvas = document.getElementById('chartTopProducts');
    if (!canvas) return;

    var labels = (list || []).map(x => x.name);
    var values = (list || []).map(x => Number(x.revenue || 0));
    var colors = labels.map(() => getRandomColor());

    __statsCharts['chartTopProducts'] = new Chart(canvas, {
        type: 'horizontalBar',
        data: { labels, datasets: [{ label:'Top sản phẩm (doanh thu)', data: values, backgroundColor: colors, borderColor:'#fff', borderWidth:1 }] },
        options: {
            responsive: true,
            maintainAspectRatio: false, // [MỚI]
            title: { display: true, text: 'Top 10 sản phẩm theo doanh thu', fontSize: 18 },
            tooltips: { callbacks: { label: t => ' ' + numToString(Math.round(t.xLabel)) + ' ₫' } },
            scales: { xAxes: [{ ticks: { beginAtZero: true, callback: v => numToString(v) } }] }
        }
    });
}

function drawTopVariantsChart(list) {
    var canvas = document.getElementById('chartTopVariants');
    if (!canvas) return;

    var labels = (list || []).map(x => `${x.product_name} - ${x.color_name}`);
    var values = (list || []).map(x => Number(x.units || 0));
    var colors = labels.map(() => getRandomColor());

    __statsCharts['chartTopVariants'] = new Chart(canvas, {
        type: 'bar',
        data: { labels, datasets: [{ label:'Top màu (số lượng)', data: values, backgroundColor: colors, borderColor:'#fff', borderWidth:1 }] },
        options: {
            responsive: true,
            maintainAspectRatio: false, // [MỚI]
            title: { display: true, text: 'Top 10 màu bán chạy (theo số lượng)', fontSize: 18 },
            legend: { display:false },
            scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
        }
    });
}

// Tables + CSV (giữ như cũ)
function renderTables(data) {
    window.__lastStatsTopProducts = data.top_products || [];
    window.__lastStatsTopVariants = data.top_variants || [];
    renderTopProductsTable(data.top_products || []);
    renderTopVariantsTable(data.top_variants || []);
}

function renderTopProductsTable(list) {
    var div = document.getElementById('topProductsTable');
    if (!div) return;
    if (!list.length) { div.innerHTML = '<div style="padding:10px;color:#777;">Chưa có dữ liệu.</div>'; return; }

    var html = `<table class="table-outline" style="margin:0;">
        <tr><th>#</th><th>Mã</th><th>Tên</th><th>Hãng</th><th>Số lượng</th><th>Doanh thu</th></tr>`;
    list.forEach((x,i) => {
        html += `<tr>
            <td>${i+1}</td><td>${x.masp}</td>
            <td style="text-align:left;">${escapeHtml(x.name)}</td>
            <td>${escapeHtml(x.brand)}</td>
            <td>${x.units}</td>
            <td style="color:#d0021b;font-weight:bold;">${numToString(Math.round(x.revenue))} ₫</td>
        </tr>`;
    });
    div.innerHTML = html + `</table>`;
}

function renderTopVariantsTable(list) {
    var div = document.getElementById('topVariantsTable');
    if (!div) return;
    if (!list.length) { div.innerHTML = '<div style="padding:10px;color:#777;">Chưa có dữ liệu.</div>'; return; }

    var html = `<table class="table-outline" style="margin:0;">
        <tr><th>#</th><th>Sản phẩm</th><th>Màu</th><th>SL</th><th>Doanh thu</th></tr>`;
    list.forEach((x,i) => {
        var swatch = x.color_hex ? `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;border:1px solid #ccc;background:${x.color_hex};margin-right:6px;"></span>` : '';
        html += `<tr>
            <td>${i+1}</td>
            <td style="text-align:left;">${escapeHtml(x.product_name)} <small style="color:#777">(${x.masp})</small></td>
            <td style="text-align:left;">${swatch}${escapeHtml(x.color_name || '')}</td>
            <td>${x.units}</td>
            <td style="color:#d0021b;font-weight:bold;">${numToString(Math.round(x.revenue))} ₫</td>
        </tr>`;
    });
    div.innerHTML = html + `</table>`;
}

function exportStatsCSV() {
    var meta = window.__lastStatsMeta || {};
    var start = meta.start || (document.getElementById('statsStart')?.value || '');
    var end = meta.end || (document.getElementById('statsEnd')?.value || '');
    var group = meta.group || (document.getElementById('statsGroup')?.value || 'day');
    var scope = meta.scope || (document.getElementById('statsScope')?.value || 'completed');
    var generatedAt = new Date();

    var rows = [];
    rows.push(['EAUT PHONE - BÁO CÁO THỐNG KÊ DOANH THU']);
    rows.push(['Đồ án tốt nghiệp - Hệ thống bán điện thoại EAUT Phone']);
    rows.push(['Ngày xuất báo cáo', generatedAt.toLocaleString('vi-VN')]);
    rows.push(['Từ ngày', start]);
    rows.push(['Đến ngày', end]);
    rows.push(['Kiểu nhóm dữ liệu', group]);
    rows.push(['Phạm vi', scope]);
    rows.push([]);
    rows.push(['SECTION','RANK','MASP','NAME','BRAND_OR_COLOR','UNITS','REVENUE']);
    (window.__lastStatsTopProducts || []).forEach((x,i) => rows.push(['TOP_PRODUCTS', i+1, x.masp, x.name, x.brand, x.units, Math.round(x.revenue)]));
    (window.__lastStatsTopVariants || []).forEach((x,i) => rows.push(['TOP_VARIANTS', i+1, x.masp, x.product_name, x.color_name, x.units, Math.round(x.revenue)]));
    rows.push([]);
    rows.push(['Ghi chú', 'Báo cáo xuất từ hệ thống thống kê của EAUT Phone']);

    var csv = rows.map(function (r) {
        return r.map(function (cell) {
            return `"${String(cell == null ? '' : cell).replace(/"/g,'""')}"`;
        }).join(',');
    }).join('\n');

    downloadText(`report_${start || 'from'}_${end || 'to'}.csv`, csv);
}

function downloadText(filename, text) {
    var blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function toISODate(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth()+1).padStart(2,'0');
    var day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
}

function parseISODate(s) {
    if (!s) return null;
    var t = new Date(s + 'T00:00:00');
    return isNaN(t.getTime()) ? null : t;
}