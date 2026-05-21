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
    if (!tc) return;

    var s = `<table class="table-outline hideImg">
    <thead>
        <tr>
            <th>Mã</th>
            <th>Khách hàng</th>
            <th>Liên hệ</th>
            <th>Sản phẩm</th>
            <th>Tổng tiền</th>
            <th>Ngày giờ</th>
            <th>PT thanh toán</th>
            <th>TT thanh toán</th>
            <th>Trạng thái đơn</th>
            <th>Hành động</th>
        </tr>
    </thead>
    <tbody>`;

    if (!list || list.length === 0) {
        s += `<tr><td colspan="10" style="text-align:center; padding:20px;">Không tìm thấy đơn hàng nào.</td></tr>`;
    } else {
        list.forEach(d => {
            var spString = (d.sp || []).map(it => {
                var productInfo = (typeof list_products !== 'undefined' && Array.isArray(list_products))
                    ? list_products.find(p => p.masp == it.ma_sp)
                    : null;
                var tenSP = productInfo ? productInfo.name : it.ma_sp;

                var safeTenSP = escapeHtml(tenSP);
                var safeMau = escapeHtml(mau || '');
                var safeVariantId = escapeHtml(it.variant_id || '');

                var mau = (it.mau_sac && String(it.mau_sac).trim() !== '') ? String(it.mau_sac).trim() : null;
                var vtxt = '';

                if (mau) {
                    vtxt = ` <span style="color:#0056b3;">(${safeMau})</span>`;
                } else if (it.variant_id) {
                    vtxt = ` <span style="color:#777;">(Variant #${safeVariantId})</span>`;
                }

                return `<p style="margin:0; font-size:12px;">- ${safeTenSP}${vtxt} <b>x${parseInt(it.so_luong || 0)}</b></p>`;
            }).join('');

            var paymentMethodHtml = renderPaymentMethod(d.pttt);
            var paymentStatusHtml = renderPaymentStatus(d.paymentStatus);

            var contactInfo = `
                <div style="font-size:13px;"><b>${escapeHtml(d.sdt || '')}</b></div>
                <div style="font-size:11px; color:#555; max-width:150px;">${escapeHtml(d.diaChi || '')}</div>
            `;

            var btnAction = buildOrderActions(d);

            s += `<tr>
                <td style="text-align:center"><b>#${d.maDon}</b></td>
                <td title="${escapeHtml(d.khachHang || '')}">${escapeHtml(d.khachHang || '')}</td>
                <td title="${escapeHtml(d.sdt || '')} — ${escapeHtml(d.diaChi || '')}">${contactInfo}</td>
                <td>${spString}</td>
                <td style="color:#d0021b; font-weight:bold;">${numToString(parseInt(d.tongTien || 0))}₫</td>
                <td style="font-size:12px;">${formatDateTime(d.ngayMua)}</td>
                <td>${paymentMethodHtml}</td>
                <td>${paymentStatusHtml}</td>
                <td title="${escapeHtml(d.tinhTrang || '')}"><span style="color:${getColorByStatus(d.tinhTrang)}; font-weight:bold; font-size:12px;">${escapeHtml(d.tinhTrang || '')}</span></td>
                <td style="text-align:center">${btnAction}</td>
            </tr>`;
        });
    }

    s += `</tbody></table>`;
    tc.innerHTML = s;
}

function renderPaymentMethod(pttt) {
    var text = pttt || 'COD';

    if (text === 'VNPAY') {
        return `<span style="display:inline-block; padding:4px 8px; border-radius:999px; background:#e8f1ff; color:#0056b3; font-weight:bold; font-size:12px;">VNPAY</span>`;
    }

    return `<span style="display:inline-block; padding:4px 8px; border-radius:999px; background:#f3f4f6; color:#333; font-weight:bold; font-size:12px;">COD</span>`;
}

function renderPaymentStatus(status) {
    var s = (status || 'Pending').trim();

    if (s === 'Paid') {
        return `<span style="display:inline-block; padding:4px 8px; border-radius:999px; background:#e7f7ed; color:#1e7e34; font-weight:bold; font-size:12px;">Paid</span>`;
    }
    if (s === 'Failed') {
        return `<span style="display:inline-block; padding:4px 8px; border-radius:999px; background:#fdeaea; color:#c82333; font-weight:bold; font-size:12px;">Failed</span>`;
    }
    return `<span style="display:inline-block; padding:4px 8px; border-radius:999px; background:#fff4db; color:#b26a00; font-weight:bold; font-size:12px;">Pending</span>`;
}

function buildOrderActions(d) {
    var btnAction = '';
    var tinhTrang = d.tinhTrang || '';
    var pttt = (d.pttt || '').toUpperCase();
    var paymentStatus = d.paymentStatus || 'Pending';

    if (tinhTrang === 'Chờ thanh toán') {
        btnAction += `<span style="font-size:11px; color:#b26a00;">Chờ khách thanh toán</span>`;
        btnAction += `<div class="tooltip"><i class="fa fa-remove" style="color:red; cursor:pointer; margin-left:10px; font-size:1.2em;" onclick="capNhatTrangThai(${d.maDon}, 'Đã hủy')"></i><span class="tooltiptext">Hủy đơn</span></div>`;
        return btnAction;
    }

    if (tinhTrang === 'Chờ xử lý') {
        if (pttt === 'VNPAY' && paymentStatus !== 'Paid') {
            btnAction += `<span style="font-size:11px; color:#dc3545;">Chưa thanh toán</span>`;
            btnAction += `<div class="tooltip"><i class="fa fa-remove" style="color:red; cursor:pointer; margin-left:10px; font-size:1.2em;" onclick="capNhatTrangThai(${d.maDon}, 'Đã hủy')"></i><span class="tooltiptext">Hủy đơn</span></div>`;
            return btnAction;
        }

        btnAction += `<div class="tooltip"><i class="fa fa-check" style="color:green; cursor:pointer; font-size:1.2em;" onclick="capNhatTrangThai(${d.maDon}, 'Đang giao hàng')"></i><span class="tooltiptext">Duyệt giao hàng</span></div>`;
        btnAction += `<div class="tooltip"><i class="fa fa-remove" style="color:red; cursor:pointer; margin-left:15px; font-size:1.2em;" onclick="capNhatTrangThai(${d.maDon}, 'Đã hủy')"></i><span class="tooltiptext">Hủy đơn</span></div>`;
        return btnAction;
    }

    if (tinhTrang === 'Đang giao hàng') {
        btnAction += `<div class="tooltip"><i class="fa fa-truck" style="color:#007bff; cursor:pointer; font-size:1.2em;" onclick="capNhatTrangThai(${d.maDon}, 'Đã nhận hàng')"></i><span class="tooltiptext">Đã giao thành công</span></div>`;
        btnAction += `<div class="tooltip"><i class="fa fa-remove" style="color:red; cursor:pointer; margin-left:12px; font-size:1.2em;" onclick="capNhatTrangThai(${d.maDon}, 'Đã hủy')"></i><span class="tooltiptext">Hủy đơn</span></div>`;
        return btnAction;
    }

    if (tinhTrang === 'Đã nhận hàng') {
        btnAction += `<div class="tooltip"><i class="fa fa-check-circle" style="color:#28a745; cursor:pointer; font-size:1.5em;" onclick="capNhatTrangThai(${d.maDon}, 'Hoàn thành')"></i><span class="tooltiptext">Hoàn thành</span></div>`;
        return btnAction;
    }

    btnAction += `<div class="tooltip"><i class="fa fa-trash" style="color:#aaa; cursor:pointer" onclick="xoaDonHangVinhVien(${d.maDon})"></i><span class="tooltiptext">Xóa</span></div>`;
    return btnAction;
}

function getColorByStatus(status) {
    if (status == 'Chờ thanh toán') return '#b26a00';
    if (status == 'Chờ xử lý') return '#ff9800';
    if (status == 'Đang giao hàng') return '#17a2b8';
    if (status == 'Đã nhận hàng') return '#007bff';
    if (status == 'Hoàn thành') return '#28a745';
    if ((status || '').includes('Hủy')) return '#dc3545';
    return '#333';
}

function capNhatTrangThai(maDon, trangThaiMoi) {
    var msg = 'Xác nhận chuyển đơn hàng #' + maDon + ' sang trạng thái: "' + trangThaiMoi + '"?';
    if ((trangThaiMoi || '').includes('Hủy')) msg += '\nLưu ý: Không thể hoàn tác!';

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
                <option value="pttt">PT thanh toán</option>
                <option value="paymentStatus">TT thanh toán</option>
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
        return (!from || time >= from.getTime()) && (!to || time <= to.getTime());
    });

    renderOrderTable(filtered);
}

function timKiemDonHang(inp) {
    var type = document.getElementById('kieuTimDonHang').value;
    var txt = (inp.value || '').toUpperCase();

    var filtered = currentOrderList.filter(d => {
        var val = '';

        if (type == 'ma') val = String(d.maDon || '');
        else if (type == 'khach') val = d.khachHang || '';
        else if (type == 'sdt') val = d.sdt || '';
        else if (type == 'pttt') val = d.pttt || '';
        else if (type == 'paymentStatus') val = d.paymentStatus || '';

        return val.toUpperCase().includes(txt);
    });

    renderOrderTable(filtered);
}

function formatDateTime(value) {
    if (!value) return '';
    var dt = new Date(value.replace(' ', 'T'));
    if (isNaN(dt.getTime())) return value;
    return dt.toLocaleString('vi-VN');
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}