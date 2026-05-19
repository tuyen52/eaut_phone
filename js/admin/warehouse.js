// js/admin/warehouse.js

var currentStockList = [];

// Hàm được gọi từ main.js khi bấm tab "Kho Hàng"
function addTableKhoHang() {
    var tc = document.querySelector('.khohang .table-content');
    if (!tc) return;

    tc.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fa fa-spinner fa-spin"></i> Đang tải dữ liệu kho...</div>';

    fetch('php/get-products.php')
        .then(res => res.json())
        .then(data => {
            currentStockList = Array.isArray(data) ? data : [];
            renderWarehouseTable(currentStockList);
        })
        .catch(err => {
            console.error(err);
            tc.innerHTML = '<h3 style="color:red; text-align:center">Lỗi kết nối Server!</h3>';
        });
}

function renderWarehouseTable(list) {
    var tc = document.querySelector('.khohang .table-content');

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
        s += `<tr><td colspan="5" style="text-align:center">Kho hàng trống.</td></tr>`;
    } else {
        list.forEach((p, i) => {
            var stock = parseInt(p.inventory || 0);

            s += `<tr>
                <td>${i + 1}</td>
                <td>${p.masp}</td>
                <td style="text-align:left">
                    <img src="${p.img}" style="width:30px; margin-right:5px; vertical-align:middle;">
                    ${p.name}
                </td>
                <td style="font-weight:bold">${stock}</td>
                <td>
                    <button onclick="nhapHangTheoMau('${p.masp}', '${escapeHtml(p.name)}')" 
                        style="background:#28a745; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:3px;">
                        <i class="fa fa-plus"></i> Nhập theo màu
                    </button>
                    <button onclick="xemChiTietMau('${p.masp}', '${escapeHtml(p.name)}')"
                        style="background:#007bff; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:3px; margin-left:6px;">
                        <i class="fa fa-eye"></i> Xem màu
                    </button>
                </td>
            </tr>`;
        });
    }

    s += `</tbody></table>`;
    tc.innerHTML = s;
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