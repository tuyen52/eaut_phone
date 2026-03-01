// js/admin/orders.js

var currentOrderList = [];
var sortOrderDirection = 1;

// ======================= QUẢN LÝ ĐƠN HÀNG =======================

function addTableDonHang() {
    var tc = document.querySelector('.donhang .table-content');
    if (!tc) return;

    tc.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fa fa-spinner fa-spin"></i> Đang tải đơn hàng...</div>';

    updateOrderFooterUI();

    fetch('php/admin/get-orders.php')
        .then(res => res.json())
        .then(data => {
            if (data && data.error) {
                tc.innerHTML = '<h3 style="text-align:center; color:red">' + data.error + '</h3>';
                return;
            }
            currentOrderList = Array.isArray(data) ? data : [];
            renderOrderTable(currentOrderList);
        })
        .catch(err => {
            console.error(err);
            tc.innerHTML = '<h3 style="text-align:center; color:red">Lỗi kết nối Server!</h3>';
        });
}

function renderOrderTable(list) {
    var tc = document.querySelector('.donhang .table-content');

    var s = `<table class="table-outline hideImg">
    <thead>
        <tr>
            <th>Mã</th>
            <th>Khách hàng</th>
            <th>Liên hệ</th>
            <th>Sản phẩm</th>
            <th>Tổng tiền</th>
            <th>Ngày giờ</th>
            <th>Thanh toán</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
        </tr>
    </thead>
    <tbody>`;

    if (!list || list.length === 0) {
        s += `<tr><td colspan="9" style="text-align:center; padding: 20px;">Không tìm thấy đơn hàng nào.</td></tr>`;
    } else {
        list.forEach(d => {
            // 1) Danh sách sản phẩm (kèm màu/variant)
            var spString = (d.sp || []).map(it => {
                var productInfo = (typeof list_products !== 'undefined' && Array.isArray(list_products))
                    ? list_products.find(p => p.masp == it.ma_sp)
                    : null;
                var tenSP = productInfo ? productInfo.name : it.ma_sp;

                var mau = (it.mau_sac && String(it.mau_sac).trim() !== '') ? String(it.mau_sac).trim() : null;
                var vtxt = '';

                if (mau) vtxt = ` <span style="color:#0056b3;">(${mau})</span>`;
                else if (it.variant_id) vtxt = ` <span style="color:#777;">(Variant #${it.variant_id})</span>`;

                return `<p style="margin:0; font-size:12px;">- ${tenSP}${vtxt} <b>x${it.so_luong}</b></p>`;
            }).join('');

            // 2) Phương thức thanh toán
            var ptttDisplay = d.pttt || 'COD';
            if (ptttDisplay.includes('Chuyển khoản')) {
                ptttDisplay = `<span style="color:#0056b3; font-weight:bold; font-size:12px;">${ptttDisplay}</span>`;
            } else {
                ptttDisplay = `<span style="font-size:12px;">${ptttDisplay}</span>`;
            }

            // 3) Liên hệ
            var contactInfo = `
                <div style="font-size:13px;"><b>${d.sdt || ''}</b></div>
                <div style="font-size:11px; color:#555; max-width: 150px;">${d.diaChi || ''}</div>
            `;

            // 4) Nút hành động
            var btnAction = '';
            if (d.tinhTrang === 'Chờ xử lý') {
                btnAction += `<div class="tooltip"><i class="fa fa-check" style="color:green; cursor:pointer; font-size:1.2em;" onclick="capNhatTrangThai(${d.maDon}, 'Đang giao hàng')"></i><span class="tooltiptext">Duyệt</span></div>`;
                btnAction += `<div class="tooltip"><i class="fa fa-remove" style="color:red; cursor:pointer; margin-left:15px; font-size:1.2em;" onclick="capNhatTrangThai(${d.maDon}, 'Đã hủy')"></i><span class="tooltiptext">Hủy đơn</span></div>`;
            } else if (d.tinhTrang === 'Đang giao hàng') {
                btnAction += `<span style="font-size:11px; color:#888;">Đang giao...</span>`;
                btnAction += `<div class="tooltip"><i class="fa fa-remove" style="color:red; cursor:pointer; margin-left:10px" onclick="capNhatTrangThai(${d.maDon}, 'Đã hủy')"></i><span class="tooltiptext">Hủy đơn</span></div>`;
            } else if (d.tinhTrang === 'Đã nhận hàng') {
                btnAction += `<div class="tooltip"><i class="fa fa-check-circle" style="color:#28a745; cursor:pointer; font-size: 1.5em;" onclick="capNhatTrangThai(${d.maDon}, 'Hoàn thành')"></i><span class="tooltiptext">Duyệt</span></div>`;
            } else {
                btnAction += `<div class="tooltip"><i class="fa fa-trash" style="color:#aaa; cursor:pointer" onclick="xoaDonHangVinhVien(${d.maDon})"></i><span class="tooltiptext">Xóa</span></div>`;
            }

            s += `<tr>
                <td style="text-align:center"><b>#${d.maDon}</b></td>
                <td>${d.khachHang || ''}</td>
                <td>${contactInfo}</td>
                <td>${spString}</td>
                <td style="color:#d0021b; font-weight:bold;">${numToString(parseInt(d.tongTien || 0))}₫</td>
                <td style="font-size:12px;">${new Date(d.ngayMua).toLocaleString()}</td>
                <td>${ptttDisplay}</td>
                <td><span style="color:${getColorByStatus(d.tinhTrang)}; font-weight:bold; font-size:12px;">${d.tinhTrang}</span></td>
                <td style="text-align:center">${btnAction}</td>
            </tr>`;
        });
    }

    s += `</tbody></table>`;
    tc.innerHTML = s;
}

function getColorByStatus(status) {
    if (status == 'Chờ xử lý') return '#ff9800';
    if (status == 'Đang giao hàng') return '#17a2b8';
    if (status == 'Đã nhận hàng') return '#007bff';
    if (status == 'Hoàn thành') return '#28a745';
    if ((status || '').includes('Hủy')) return '#dc3545';
    return '#333';
}

// ======================= TƯƠNG TÁC SERVER =======================

function capNhatTrangThai(maDon, trangThaiMoi) {
    var msg = 'Xác nhận chuyển đơn hàng #' + maDon + ' sang trạng thái: "' + trangThaiMoi + '"?';
    if (trangThaiMoi === 'Đã hủy') msg += '\nLưu ý: Không thể hoàn tác!';

    if (!confirm(msg)) return;

    fetch('php/admin/update-order-status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maDon: maDon, trangThai: trangThaiMoi })
    })
        .then(res => res.json())
        .then(data => {
            if (data.status) {
                alert(data.message);
                addTableDonHang();
            } else {
                alert("Lỗi: " + data.message);
            }
        })
        .catch(() => alert("Lỗi kết nối Server!"));
}

function xoaDonHangVinhVien(maDon) {
    if (!confirm('Xóa vĩnh viễn lịch sử đơn hàng #' + maDon + '?')) return;

    fetch('php/admin/delete-order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maDon: maDon })
    })
        .then(res => res.json())
        .then(data => {
            if (data.status) {
                alert(data.message);
                currentOrderList = currentOrderList.filter(d => d.maDon != maDon);
                renderOrderTable(currentOrderList);
            } else {
                alert("Lỗi: " + data.message);
            }
        })
        .catch(() => alert("Lỗi kết nối Server!"));
}

// ======================= LỌC / TÌM KIẾM =======================

function updateOrderFooterUI() {
    var footer = document.querySelector('.donhang .table-footer');
    if (!footer) return;
    if (footer.innerHTML.trim() !== "") return;

    footer.innerHTML = `
        <div class="timTheoNgay">
            Từ: <input type="date" id="fromDate">
            Đến: <input type="date" id="toDate">
            <button onclick="locDonHangTheoKhoangNgay()"><i class="fa fa-search"></i> Lọc</button>
        </div>
        <div class="timKiemDonHang">
            <select id="kieuTimDonHang">
                <option value="ma">Mã đơn</option>
                <option value="khach">Tên khách</option>
                <option value="sdt">Số điện thoại</option>
                <option value="pttt">Thanh toán</option>
            </select>
            <input type="text" placeholder="Tìm kiếm..." onkeyup="timKiemDonHang(this)">
        </div>`;
}

function locDonHangTheoKhoangNgay() {
    var from = document.getElementById('fromDate').valueAsDate;
    var to = document.getElementById('toDate').valueAsDate;

    if (from) from.setHours(0, 0, 0, 0);
    if (to) to.setHours(23, 59, 59, 999);

    var filtered = currentOrderList.filter(d => {
        var time = new Date(d.ngayMua).getTime();
        return (!from || time >= from) && (!to || time <= to);
    });
    renderOrderTable(filtered);
}

function timKiemDonHang(inp) {
    var type = document.getElementById('kieuTimDonHang').value;
    var txt = inp.value.toUpperCase();

    var filtered = currentOrderList.filter(d => {
        var val = '';
        if (type == 'ma') val = d.maDon.toString();
        else if (type == 'khach') val = d.khachHang || '';
        else if (type == 'sdt') val = d.sdt || '';
        else if (type == 'pttt') val = d.pttt || '';

        return val.toUpperCase().includes(txt);
    });
    renderOrderTable(filtered);
}