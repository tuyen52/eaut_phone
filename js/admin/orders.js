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
                var tenSP = it.product_name_snapshot || it.ma_sp;
                var safeTenSP = escapeHtml(tenSP);
                var safeMau = escapeHtml(it.variant_name_snapshot || it.mau_sac || '');
                var safeVariantId = escapeHtml(it.variant_id || '');

                var mau = (it.variant_name_snapshot && String(it.variant_name_snapshot).trim() !== '')
                    ? String(it.variant_name_snapshot).trim()
                    : ((it.mau_sac && String(it.mau_sac).trim() !== '') ? String(it.mau_sac).trim() : null);
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
            var statusTimelineHtml = renderTimeline(d.timeline || []);
            var statusLabelHtml = renderOrderStatusLabel(d.tinhTrang);

            var contactInfo = `
                <div style="font-size:13px;"><b>${escapeHtml(d.sdt || '')}</b></div>
                <div style="font-size:11px; color:#555; max-width:150px;">${escapeHtml(d.diaChi || '')}</div>
            `;

            var btnAction = buildOrderActions(d);
            var detailButton = `<button type="button" class="btnGhost" style="padding:4px 8px; font-size:12px; margin-left:8px;" onclick='openOrderDetailModal(${JSON.stringify(d).replace(/'/g, "&#39;")})'>Xem chi tiết</button>`;
            s += `<tr>
                <td style="text-align:center"><b>#${d.maDon}</b></td>
                <td title="${escapeHtml(d.khachHang || '')}">${escapeHtml(d.khachHang || '')}</td>
                <td title="${escapeHtml(d.sdt || '')} — ${escapeHtml(d.diaChi || '')}">${contactInfo}</td>
                <td>${spString}</td>
                <td style="color:#d0021b; font-weight:bold;">${numToString(parseInt(d.tongTien || 0))}₫</td>
                <td style="font-size:12px;">${formatDateTime(d.ngayMua)}</td>
                <td>${paymentMethodHtml}</td>
                <td>${paymentStatusHtml}</td>
                <td title="${escapeHtml(d.tinhTrang || '')}">${statusLabelHtml}</td>
                <td style="text-align:center">${btnAction}${detailButton}</td>
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
    var s = String(status || 'unpaid').trim().toLowerCase();

    if (s === 'paid') {
        return `<span style="display:inline-block; padding:4px 8px; border-radius:999px; background:#e7f7ed; color:#1e7e34; font-weight:bold; font-size:12px;">Paid</span>`;
    }
    if (s === 'failed') {
        return `<span style="display:inline-block; padding:4px 8px; border-radius:999px; background:#fdeaea; color:#c82333; font-weight:bold; font-size:12px;">Failed</span>`;
    }
    if (s === 'refunded') {
        return `<span style="display:inline-block; padding:4px 8px; border-radius:999px; background:#f0e7ff; color:#6f42c1; font-weight:bold; font-size:12px;">Refunded</span>`;
    }
    return `<span style="display:inline-block; padding:4px 8px; border-radius:999px; background:#fff4db; color:#b26a00; font-weight:bold; font-size:12px;">Unpaid</span>`;
}

function buildOrderActions(d) {
    var btnAction = '';
    var tinhTrang = String(d.tinhTrang || 'pending').toLowerCase();
    var pttt = (d.pttt || '').toUpperCase();
    var paymentStatus = String(d.paymentStatus || 'unpaid').toLowerCase();

    if (tinhTrang === 'pending') {
        btnAction += `<div class="tooltip"><i class="fa fa-check" style="color:green; cursor:pointer; font-size:1.2em;" onclick="capNhatTrangThai(${d.maDon}, 'confirmed')"></i><span class="tooltiptext">Xác nhận đơn</span></div>`;
        btnAction += `<div class="tooltip"><i class="fa fa-remove" style="color:red; cursor:pointer; margin-left:10px; font-size:1.2em;" onclick="capNhatTrangThai(${d.maDon}, 'cancelled')"></i><span class="tooltiptext">Hủy đơn</span></div>`;
        return btnAction;
    }

    if (tinhTrang === 'confirmed') {
        btnAction += `<div class="tooltip"><i class="fa fa-cube" style="color:#17a2b8; cursor:pointer; font-size:1.2em;" onclick="capNhatTrangThai(${d.maDon}, 'processing')"></i><span class="tooltiptext">Chuyển chuẩn bị hàng</span></div>`;
        btnAction += `<div class="tooltip"><i class="fa fa-remove" style="color:red; cursor:pointer; margin-left:10px; font-size:1.2em;" onclick="capNhatTrangThai(${d.maDon}, 'cancelled')"></i><span class="tooltiptext">Hủy đơn</span></div>`;
        return btnAction;
    }

    if (tinhTrang === 'processing') {
        btnAction += `<div class="tooltip"><i class="fa fa-truck" style="color:#007bff; cursor:pointer; font-size:1.2em;" onclick="capNhatTrangThai(${d.maDon}, 'shipping')"></i><span class="tooltiptext">Bàn giao vận chuyển</span></div>`;
        btnAction += `<div class="tooltip"><i class="fa fa-remove" style="color:red; cursor:pointer; margin-left:10px; font-size:1.2em;" onclick="capNhatTrangThai(${d.maDon}, 'cancelled')"></i><span class="tooltiptext">Hủy đơn</span></div>`;
        return btnAction;
    }

    if (tinhTrang === 'shipping') {
        btnAction += `<div class="tooltip"><i class="fa fa-check-circle" style="color:#28a745; cursor:pointer; font-size:1.5em;" onclick="capNhatTrangThai(${d.maDon}, 'completed')"></i><span class="tooltiptext">Giao thành công</span></div>`;
        btnAction += `<div class="tooltip"><i class="fa fa-exclamation-triangle" style="color:#dc3545; cursor:pointer; margin-left:10px; font-size:1.2em;" onclick="capNhatTrangThai(${d.maDon}, 'delivery_failed')"></i><span class="tooltiptext">Giao thất bại</span></div>`;
        return btnAction;
    }

    if (tinhTrang === 'completed') {
        btnAction += `<span style="color:#28a745; font-size:12px; font-weight:bold;">Đã hoàn tất</span>`;
        return btnAction;
    }

    if (tinhTrang === 'cancelled' || tinhTrang === 'delivery_failed') {
        btnAction += `<span style="color:#dc3545; font-size:12px; font-weight:bold;">Đã kết thúc</span>`;
        return btnAction;
    }

    btnAction += `<div class="tooltip"><i class="fa fa-trash" style="color:#aaa; cursor:pointer" onclick="xoaDonHangVinhVien(${d.maDon})"></i><span class="tooltiptext">Xóa</span></div>`;
    return btnAction;
}

function getColorByStatus(status) {
    var s = String(status || 'pending').toLowerCase();
    if (s === 'pending') return '#b26a00';
    if (s === 'confirmed') return '#ff9800';
    if (s === 'processing') return '#17a2b8';
    if (s === 'shipping') return '#007bff';
    if (s === 'completed') return '#28a745';
    if (s === 'cancelled' || s === 'delivery_failed') return '#dc3545';
    return '#333';
}

function capNhatTrangThai(maDon, trangThaiMoi) {
    var msg = 'Xác nhận chuyển đơn hàng #' + maDon + ' sang trạng thái: "' + trangThaiMoi + '"?';
    if ((trangThaiMoi || '').includes('cancel') || (trangThaiMoi || '').includes('delivery_failed')) msg += '\nLưu ý: Không thể hoàn tác!';

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

function renderOrderStatusLabel(status) {
    var s = String(status || 'pending').toLowerCase();
    var meta = {
        pending: ['#b26a00', 'fa-clock-o', 'Chờ xử lý'],
        confirmed: ['#ff9800', 'fa-check-circle', 'Đã xác nhận'],
        processing: ['#17a2b8', 'fa-cube', 'Đang chuẩn bị'],
        shipping: ['#007bff', 'fa-truck', 'Đang giao'],
        completed: ['#28a745', 'fa-check', 'Hoàn thành'],
        cancelled: ['#dc3545', 'fa-times-circle', 'Đã hủy'],
        delivery_failed: ['#dc3545', 'fa-exclamation-triangle', 'Giao thất bại']
    }[s] || ['#777', 'fa-circle', status || ''];

    return '<span style="display:inline-flex; align-items:center; gap:6px; padding:4px 8px; border-radius:999px; background:' + meta[0] + '15; color:' + meta[0] + '; border:1px solid ' + meta[0] + '30; font-size:11px; font-weight:bold; white-space:nowrap;"><i class="fa ' + meta[1] + '"></i>' + escapeHtml(meta[2]) + '</span>';
}

function renderCompactTimelineSummary(timeline) {
    if (!Array.isArray(timeline) || timeline.length === 0) return '';
    var last = timeline[timeline.length - 1] || {};
    var meta = metaByStatusCompact(last.status || last.label);
    return '<div style="padding:6px 0 2px;">' +
        '<span style="display:inline-flex; align-items:center; gap:6px; padding:4px 9px; border-radius:999px; background:' + meta.color + '15; color:' + meta.color + '; font-size:11px; font-weight:bold; border:1px solid ' + meta.color + '30;">' +
        '<i class="fa ' + meta.icon + '"></i>' +
        escapeHtml(meta.label) +
        '</span>' +
    '</div>';
}

function renderTimeline(timeline) {
    if (!Array.isArray(timeline) || timeline.length === 0) return '<div style="padding:8px; color:#777; font-size:12px;">Chưa có timeline.</div>';

    var latest = timeline[timeline.length - 1] || {};
    var latestMeta = metaByStatusCompact(latest.status || latest.label);

    var html = '<div style="margin:8px 0 0; padding:10px 12px; background:linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%); border:1px solid #e9edf3; border-radius:12px; box-shadow:0 4px 14px rgba(15, 23, 42, 0.04); overflow-x:auto;">';
    html += '<div style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:8px; min-width:fit-content;">';
    html += '<div style="display:flex; flex-direction:column; gap:2px; min-width:max-content;">';
    html += '<div style="font-size:12px; font-weight:800; color:#334155; text-transform:uppercase; letter-spacing:.3px;">Timeline trạng thái</div>';
    html += '<div style="font-size:11px; color:#64748b;">Dòng tiến trình ngang</div>';
    html += '</div>';
    html += '<div style="display:inline-flex; align-items:center; gap:8px; padding:5px 10px; border-radius:999px; background:' + latestMeta.color + '12; color:' + latestMeta.color + '; border:1px solid ' + latestMeta.color + '25; font-size:11px; font-weight:800; white-space:nowrap; min-width:max-content;">';
    html += '<i class="fa ' + latestMeta.icon + '"></i>' + escapeHtml(latestMeta.label);
    html += '</div>';
    html += '</div>';

    html += '<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(135px, 1fr)); gap:8px;">';
    timeline.forEach(function (item) {
        var meta = metaByStatusCompact(item.status || item.label);
        var timeText = item.created_at ? formatDateTime(item.created_at) : '';
        html += '<div title="' + escapeHtml((item.label || meta.label || '') + (timeText ? ' - ' + timeText : '')) + '" style="display:flex; align-items:flex-start; gap:8px; padding:8px 10px; border-radius:12px; background:' + meta.color + '10; color:' + meta.color + '; border:1px solid ' + meta.color + '20; min-width:0;">';
        html += '<div style="width:28px; height:28px; flex:0 0 28px; display:inline-flex; align-items:center; justify-content:center; border-radius:50%; background:#fff; box-shadow:0 3px 10px rgba(15, 23, 42, 0.08); color:' + meta.color + ';"><i class="fa ' + meta.icon + '"></i></div>';
        html += '<div style="min-width:0; flex:1;">';
        html += '<div style="font-size:11px; font-weight:800; line-height:1.15; word-break:break-word;">' + escapeHtml(meta.label) + '</div>';
        html += '<div style="font-size:9px; opacity:.82; margin-top:2px; line-height:1.15; word-break:break-word;">' + (timeText ? escapeHtml(timeText) : 'Chưa có thời gian') + '</div>';
        html += '</div>';
        html += '</div>';
    });
    html += '</div>';
    html += '</div>';
    return html;
}

function metaByStatusCompact(status) {
    var s = String(status || '').toLowerCase();
    if (s === 'pending') return { icon: 'fa-clock-o', color: '#b26a00', label: 'Chờ xử lý' };
    if (s === 'confirmed') return { icon: 'fa-check-circle', color: '#ff9800', label: 'Đã xác nhận' };
    if (s === 'processing') return { icon: 'fa-cube', color: '#17a2b8', label: 'Đang chuẩn bị' };
    if (s === 'shipping') return { icon: 'fa-truck', color: '#007bff', label: 'Đang giao' };
    if (s === 'completed') return { icon: 'fa-check', color: '#28a745', label: 'Hoàn thành' };
    if (s === 'cancelled') return { icon: 'fa-times-circle', color: '#dc3545', label: 'Đã hủy' };
    if (s === 'delivery_failed') return { icon: 'fa-exclamation-triangle', color: '#dc3545', label: 'Giao thất bại' };
    return { icon: 'fa-circle', color: '#777', label: status || '' };
}

function openOrderDetailModal(order) {
    if (!order) return;

    var existing = document.getElementById('orderDetailModal');
    if (existing) existing.remove();

    var products = (order.sp || []).map(function (it) {
        var tenSP = it.product_name_snapshot || it.ma_sp || '';
        var variant = it.variant_name_snapshot || it.mau_sac || '';
        var qty = parseInt(it.so_luong || 0);
        var price = parseInt(it.don_gia || 0);
        return `
            <div style="display:flex; gap:12px; padding:12px 0; border-bottom:1px solid #eef2f7;">
                <div style="width:54px; height:54px; border-radius:12px; background:#f4f7fb; display:flex; align-items:center; justify-content:center; overflow:hidden; flex:0 0 54px;">
                    <i class="fa fa-mobile" style="color:#94a3b8; font-size:20px;"></i>
                </div>
                <div style="flex:1; min-width:0;">
                    <div style="font-weight:700; color:#1f2937; font-size:14px; line-height:1.4;">${escapeHtml(tenSP)}</div>
                    <div style="margin-top:4px; font-size:12px; color:#64748b;">${variant ? 'Màu: ' + escapeHtml(variant) : 'Không có màu'}</div>
                </div>
                <div style="text-align:right; flex:0 0 auto;">
                    <div style="font-size:12px; color:#64748b;">x${qty}</div>
                    <div style="font-size:13px; font-weight:700; color:#dc2626;">${numToString(price)}đ</div>
                </div>
            </div>`;
    }).join('');

    var timeline = renderTimeline(order.timeline || []);

    var html = `
        <div id="orderDetailModal" style="position:fixed; inset:0; z-index:99999; background:rgba(15,23,42,.55); display:flex; align-items:center; justify-content:center; padding:20px;">
            <div style="width:min(980px, 100%); max-height:92vh; overflow:hidden; background:#fff; border-radius:18px; box-shadow:0 20px 60px rgba(0,0,0,.22); display:flex; flex-direction:column;">
                <div style="padding:18px 22px; border-bottom:1px solid #edf2f7; display:flex; align-items:center; justify-content:space-between; gap:12px; background:linear-gradient(180deg,#ffffff 0%,#fbfdff 100%);">
                    <div>
                        <div style="font-size:12px; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:.4px;">Chi tiết đơn hàng</div>
                        <div style="font-size:20px; font-weight:800; color:#0f172a; margin-top:4px;">#${escapeHtml(order.maDon)}</div>
                    </div>
                    <button type="button" onclick="document.getElementById('orderDetailModal').remove()" style="width:38px; height:38px; border:none; border-radius:12px; background:#f1f5f9; color:#334155; cursor:pointer; font-size:18px;">&times;</button>
                </div>

                <div style="padding:18px 22px; overflow:auto;">
                    <div style="display:grid; grid-template-columns: 1.2fr .8fr; gap:18px;">
                        <div style="min-width:0;">
                            <div style="padding:16px; border:1px solid #e5eaf2; border-radius:16px; background:#fff; margin-bottom:16px;">
                                <div style="font-size:14px; font-weight:800; color:#0f172a; margin-bottom:10px;">Thông tin đơn hàng</div>
                                <div style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:12px; font-size:13px; color:#334155;">
                                    <div><span style="color:#64748b;">Khách hàng:</span><br><b>${escapeHtml(order.khachHang || '')}</b></div>
                                    <div><span style="color:#64748b;">Ngày mua:</span><br><b>${formatDateTime(order.ngayMua)}</b></div>
                                    <div><span style="color:#64748b;">Số điện thoại:</span><br><b>${escapeHtml(order.sdt || '')}</b></div>
                                    <div><span style="color:#64748b;">Thanh toán:</span><br><b>${escapeHtml(order.pttt || '')}</b></div>
                                    <div><span style="color:#64748b;">Trạng thái đơn:</span><br>${renderOrderStatusLabel(order.tinhTrang)}</div>
                                    <div><span style="color:#64748b;">Trạng thái thanh toán:</span><br>${renderPaymentStatus(order.paymentStatus)}</div>
                                </div>
                                <div style="margin-top:12px; font-size:13px; color:#334155;"><span style="color:#64748b;">Địa chỉ:</span><br><b>${escapeHtml(order.diaChi || '')}</b></div>
                            </div>

                            <div style="padding:16px; border:1px solid #e5eaf2; border-radius:16px; background:#fff;">
                                <div style="font-size:14px; font-weight:800; color:#0f172a; margin-bottom:6px;">Sản phẩm trong đơn</div>
                                <div style="max-height:300px; overflow:auto; padding-right:4px;">${products || '<div style="padding:10px 0; color:#64748b; font-size:13px;">Không có sản phẩm.</div>'}</div>
                            </div>
                        </div>

                        <div style="min-width:0;">
                            <div style="padding:16px; border:1px solid #e5eaf2; border-radius:16px; background:#f8fbff; margin-bottom:16px;">
                                <div style="font-size:14px; font-weight:800; color:#0f172a; margin-bottom:10px;">Tóm tắt thanh toán</div>
                                <div style="display:flex; flex-direction:column; gap:10px; font-size:13px; color:#334155;">
                                    <div style="display:flex; justify-content:space-between; gap:10px;"><span>Tổng tiền</span><b style="color:#dc2626;">${numToString(parseInt(order.tongTien || 0))}đ</b></div>
                                    <div style="display:flex; justify-content:space-between; gap:10px;"><span>Mã VNPay</span><b>${escapeHtml(order.vnp_txn_ref || '')}</b></div>
                                    <div style="display:flex; justify-content:space-between; gap:10px;"><span>Mã giao dịch</span><b>${escapeHtml(order.vnp_transaction_no || '')}</b></div>
                                    <div style="display:flex; justify-content:space-between; gap:10px;"><span>Mã phản hồi</span><b>${escapeHtml(order.vnp_response_code || '')}</b></div>
                                    <div style="display:flex; justify-content:space-between; gap:10px;"><span>Thanh toán lúc</span><b>${escapeHtml(order.paid_at || 'Chưa ghi nhận')}</b></div>
                                </div>
                            </div>

                            <div style="padding:16px; border:1px solid #e5eaf2; border-radius:16px; background:#fff;">
                                <div style="font-size:14px; font-weight:800; color:#0f172a; margin-bottom:10px;">Timeline xử lý</div>
                                ${timeline}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', html);
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