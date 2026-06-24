// js/admin/warehouse.js

var currentStockList = [];
var __warehouseKeyword = '';
var __warehouseStockFilter = 'all';

// Hàm được gọi từ main.js khi bấm tab "Kho Hàng"
function addTableKhoHang() {
    var tc = document.querySelector('.khohang .table-content');
    if (!tc) return;

    tc.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fa fa-spinner fa-spin"></i> Đang tải dữ liệu kho...</div>';

    fetch('php/get-products.php')
        .then(res => res.json())
        .then(data => {
            currentStockList = Array.isArray(data) ? data : [];
            renderWarehousePanel();
        })
        .catch(err => {
            console.error(err);
            tc.innerHTML = '<h3 style="color:red; text-align:center">Lỗi kết nối Server!</h3>';
        });
}

function renderWarehousePanel() {
    var tc = document.querySelector('.khohang .table-content');
    if (!tc) return;

    var total = currentStockList.length;
    var lowStock = currentStockList.filter(function (p) {
        return parseInt(p.inventory || 0) > 0 && parseInt(p.inventory || 0) <= 10;
    }).length;
    var outStock = currentStockList.filter(function (p) {
        return parseInt(p.inventory || 0) <= 0;
    }).length;

    var s = `
        <div class="warehouseToolbar" style="display:flex; flex-wrap:wrap; gap:12px; justify-content:space-between; align-items:end; margin-bottom:14px;">
            <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:end;">
                <div>
                    <label style="display:block; font-size:12px; color:#6b7280; margin-bottom:6px; font-weight:600;">Tìm sản phẩm</label>
                    <input id="warehouseSearchInput" type="text" placeholder="Nhập mã SP hoặc tên sản phẩm..." value="${escapeHtml(__warehouseKeyword)}"
                        oninput="filterWarehouseProducts(this.value)"
                        style="min-width:320px; max-width:100%; padding:10px 12px; border:1px solid #d1d5db; border-radius:10px; outline:none;">
                </div>
                <div>
                    <label style="display:block; font-size:12px; color:#6b7280; margin-bottom:6px; font-weight:600;">Lọc tồn kho</label>
                    <select id="warehouseStockFilter" onchange="filterWarehouseByStock(this.value)"
                        style="min-width:180px; padding:10px 12px; border:1px solid #d1d5db; border-radius:10px; background:#fff; outline:none;">
                        <option value="all">Tất cả sản phẩm</option>
                        <option value="instock">Còn hàng</option>
                        <option value="lowstock">Sắp hết hàng (1-10)</option>
                        <option value="outstock">Hết hàng</option>
                    </select>
                </div>
                <button onclick="clearWarehouseSearch()" style="height:40px; padding:0 14px; border:none; border-radius:10px; background:#eef2ff; color:#3730a3; font-weight:700; cursor:pointer;">
                    <i class="fa fa-eraser"></i> Xóa lọc
                </button>
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <span style="padding:8px 12px; border-radius:999px; background:#eff6ff; color:#1d4ed8; font-weight:700; font-size:13px;">Tổng: ${total}</span>
                <span style="padding:8px 12px; border-radius:999px; background:#fef3c7; color:#92400e; font-weight:700; font-size:13px;">Sắp hết: ${lowStock}</span>
                <span style="padding:8px 12px; border-radius:999px; background:#fee2e2; color:#b91c1c; font-weight:700; font-size:13px;">Hết hàng: ${outStock}</span>
            </div>
        </div>
    `;

    var filtered = applyWarehouseFilters();
    s += renderWarehouseTableHTML(filtered);
    tc.innerHTML = s;

    var sel = document.getElementById('warehouseStockFilter');
    if (sel) sel.value = __warehouseStockFilter;
}

function renderWarehouseTableHTML(list) {
    var s = `<table class="table-outline">
        <thead>
            <tr>
                <th>STT</th>
                <th>Mã SP</th>
                <th>Tên sản phẩm</th>
                <th>Tồn kho (tổng)</th>
                <th>Hành động</th>
            </tr>
        </thead>
        <tbody>`;

    if (!list || list.length === 0) {
        s += `<tr><td colspan="5" style="text-align:center; padding:16px; color:#6b7280;">Không tìm thấy sản phẩm phù hợp.</td></tr>`;
    } else {
        list.forEach((p, i) => {
            var stock = parseInt(p.inventory || 0);
            var stockColor = stock <= 0 ? '#dc2626' : (stock <= 10 ? '#d97706' : '#16a34a');

            s += `<tr>
                <td>${i + 1}</td>
                <td>${p.masp}</td>
                <td style="text-align:left">
                    <img src="${p.img}" style="width:30px; height:30px; object-fit:cover; margin-right:8px; vertical-align:middle; border-radius:6px;">
                    ${p.name}
                </td>
                <td style="font-weight:bold; color:${stockColor}">${stock}</td>
                <td>
                    <button onclick="nhapHangTheoMau('${p.masp}', '${escapeHtml(p.name)}')" 
                        style="background:#28a745; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:6px;">
                        <i class="fa fa-plus"></i> Nhập theo màu
                    </button>
                    <button onclick="xemChiTietMau('${p.masp}', '${escapeHtml(p.name)}')"
                        style="background:#007bff; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:6px; margin-left:6px;">
                        <i class="fa fa-eye"></i> Xem màu
                    </button>
                </td>
            </tr>`;
        });
    }

    s += `</tbody></table>`;
    return s;
}

function applyWarehouseFilters() {
    var list = Array.isArray(currentStockList) ? currentStockList.slice() : [];
    var keyword = (__warehouseKeyword || '').trim().toUpperCase();

    if (keyword) {
        list = list.filter(function (p) {
            return String(p.name || '').toUpperCase().includes(keyword) || String(p.masp || '').toUpperCase().includes(keyword);
        });
    }

    if (__warehouseStockFilter === 'instock') {
        list = list.filter(function (p) { return parseInt(p.inventory || 0) > 0; });
    } else if (__warehouseStockFilter === 'lowstock') {
        list = list.filter(function (p) {
            var stock = parseInt(p.inventory || 0);
            return stock > 0 && stock <= 10;
        });
    } else if (__warehouseStockFilter === 'outstock') {
        list = list.filter(function (p) { return parseInt(p.inventory || 0) <= 0; });
    }

    return list;
}

function filterWarehouseProducts(value) {
    __warehouseKeyword = value || '';
    renderWarehousePanel();
}

function filterWarehouseByStock(value) {
    __warehouseStockFilter = value || 'all';
    renderWarehousePanel();
}

function clearWarehouseSearch() {
    __warehouseKeyword = '';
    __warehouseStockFilter = 'all';
    renderWarehousePanel();
}

// ====== Xem chi tiết màu (variant) ======
function xemChiTietMau(masp, tensp) {
    fetch('php/get-product-variants.php?masp=' + encodeURIComponent(masp))
        .then(res => res.json())
        .then(list => {
            if (!Array.isArray(list) || list.length === 0) {
                alert('Sản phẩm này chưa có màu (variant).');
                return;
            }

            var msg = 'Các màu của: ' + tensp + '\n\n';
            list.forEach((v, idx) => {
                msg += `${idx + 1}) ${v.ten_mau} (${v.ma_mau_hex}) - Kho: ${v.so_luong_ton} - VariantID: ${v.variant_id}\n`;
            });
            alert(msg);
        })
        .catch(() => alert('Lỗi tải danh sách màu!'));
}

// ====== Nhập kho theo màu ======
function nhapHangTheoMau(masp, tensp) {
    fetch('php/get-product-variants.php?masp=' + encodeURIComponent(masp))
        .then(res => res.json())
        .then(list => {
            if (!Array.isArray(list) || list.length === 0) {
                alert('Sản phẩm này chưa có màu (variant). Vui lòng vào sửa sản phẩm để thêm màu trước.');
                return;
            }

            // chọn màu
            var chooseMsg = `Chọn màu để nhập kho cho: ${tensp}\n\n`;
            list.forEach((v, idx) => {
                chooseMsg += `${idx + 1}) ${v.ten_mau} (${v.ma_mau_hex}) - Kho hiện tại: ${v.so_luong_ton}\n`;
            });
            chooseMsg += `\nNhập số thứ tự (1-${list.length}):`;

            var idxStr = prompt(chooseMsg);
            if (idxStr === null) return;
            var idx = parseInt(idxStr);
            if (isNaN(idx) || idx < 1 || idx > list.length) {
                alert('Bạn chọn không hợp lệ!');
                return;
            }

            var vPick = list[idx - 1];

            // nhập số lượng
            var slStr = prompt(`Nhập số lượng muốn thêm cho màu "${vPick.ten_mau}" (Kho hiện tại: ${vPick.so_luong_ton})`);
            if (slStr === null) return;
            var sl = parseInt(slStr);
            if (isNaN(sl) || sl <= 0) {
                alert('Số lượng không hợp lệ!');
                return;
            }

            // gọi API nhập kho theo variant
            fetch('php/admin/import-variant-stock.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    variant_id: vPick.variant_id,
                    so_luong: sl
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status) {
                        alert(data.message);
                        addTableKhoHang();
                    } else {
                        alert('Lỗi: ' + data.message);
                    }
                })
                .catch(() => alert('Lỗi kết nối Server!'));
        })
        .catch(() => alert('Lỗi tải danh sách màu!'));
}

// Logic Tìm kiếm nhanh (Client-side)
function timKiemKhoHang(inp) {
    var txt = (inp.value || '').toUpperCase();
    var filtered = currentStockList.filter(p =>
        (p.name || '').toUpperCase().includes(txt) || (p.masp || '').toUpperCase().includes(txt)
    );
    renderWarehouseTable(filtered);
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}