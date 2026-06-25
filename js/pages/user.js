// js/pages/user.js

var currentUser = null;
var __orderFilterStatus = 'all';
var __orderSearch = '';

window.onload = function () {
    khoiTao();
    currentUser = getCurrentUser();

    if (!currentUser) {
        document.querySelector('.infoUser').innerHTML =
            '<h2 style="text-align:center; color:red; margin: 20px 0;">Bạn chưa đăng nhập!</h2>';
        document.querySelector('.listDonHang').innerHTML = '';
        return;
    }

    renderUserInfo();
    fetchOrderHistory();
};

// ======================= PROFILE =======================

function getInitials(u) {
    var name = ((u.ho || '') + ' ' + (u.ten || '')).trim();
    if (!name) return (u.username || 'U').slice(0, 2).toUpperCase();
    var parts = name.split(' ').filter(Boolean);
    var a = parts[0] ? parts[0][0] : 'U';
    var b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (a + b).toUpperCase();
}

function renderUserInfo() {
    var u = currentUser;
    var info = document.querySelector('.infoUser');

    info.innerHTML = `
        <div class="profileHeader">
            <div class="avatarCircle">${getInitials(u)}</div>
            <div class="profileMeta">
                <div class="uName">${escapeHtml(u.username)}</div>
                <div class="uSub">${escapeHtml(u.email || '')}</div>
            </div>
        </div>

        <h3 style="margin:0 0 10px 0;"><i class="fa fa-user-circle"></i> Hồ sơ</h3>

        <div class="formRow">
            <label>Tên đăng nhập</label>
            <input class="uInput" type="text" value="${escapeHtml(u.username)}" disabled>
            <span style="color:#6b7280;font-size:12px;"><i class="fa fa-lock"></i></span>
        </div>

        <div class="formRow">
            <label>Họ tên</label>
            <input class="uInput" type="text" id="infoName" value="${escapeHtml(((u.ho || '') + ' ' + (u.ten || '')).trim())}">
            <button class="uBtn uBtnPrimary" onclick="updateInfo()"><i class="fa fa-pencil"></i> Cập nhật</button>
        </div>

        <div class="formRow">
            <label>Email</label>
            <input class="uInput" type="text" value="${escapeHtml(u.email || '')}" disabled>
            <span></span>
        </div>

        <div class="uDivider"></div>

        <h3 style="margin:0 0 10px 0;"><i class="fa fa-key"></i> Bảo mật</h3>

        <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="uBtn uBtnPrimary" onclick="togglePassForm(true)"><i class="fa fa-key"></i> Đổi mật khẩu</button>
        </div>

        <div id="passForm" style="display:none; margin-top:12px;">
            <div class="formRow" style="grid-template-columns:1fr;">
                <label>Mật khẩu cũ</label>
                <input class="uInput" type="password" id="oldPass" placeholder="Mật khẩu cũ">
            </div>
            <div class="formRow" style="grid-template-columns:1fr;">
                <label>Mật khẩu mới</label>
                <input class="uInput" type="password" id="newPass" placeholder="Mật khẩu mới (tối thiểu 6 ký tự)">
            </div>
            <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:8px;">
                <button class="uBtn uBtnSuccess" onclick="changePass()"><i class="fa fa-check"></i> Xác nhận</button>
                <button class="uBtn uBtnDanger" onclick="togglePassForm(false)"><i class="fa fa-times"></i> Hủy</button>
            </div>
        </div>
    `;
}

function togglePassForm(show) {
    var form = document.getElementById('passForm');
    if (!form) return;
    form.style.display = show ? 'block' : 'none';
}

function updateInfo() {
    var fullname = document.getElementById('infoName').value.trim().split(' ').filter(Boolean);
    if (fullname.length < 1) {
        alert('Vui lòng nhập họ tên đầy đủ');
        return;
    }

    var hoMoi = fullname[0];
    var tenMoi = fullname.slice(1).join(' ');

    fetch('php/update-user-info.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ho: hoMoi,
            ten: tenMoi
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.status) {
                alert(data.message);

                if (data.user) {
                    currentUser = Object.assign(currentUser, data.user);
                } else {
                    currentUser.ho = hoMoi;
                    currentUser.ten = tenMoi;
                }

                setCurrentUser(currentUser);
                renderUserInfo();
            } else {
                alert("Lỗi: " + data.message);
            }
        })
        .catch(err => {
            console.error(err);
            alert("Lỗi kết nối Server!");
        });
}

function changePass() {
    var oldPass = document.getElementById('oldPass').value;
    var newPass = document.getElementById('newPass').value;

    if (!oldPass || !newPass) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
    }
    if (newPass.length < 6) {
        alert('Mật khẩu mới quá ngắn (tối thiểu 6 ký tự)!');
        return;
    }

    fetch('php/change-password.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            old_pass: oldPass,
            new_pass: newPass
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.status) {
                alert(data.message);

                if (currentUser.pass) currentUser.pass = newPass;
                if (currentUser.password) currentUser.password = newPass;

                setCurrentUser(currentUser);
                togglePassForm(false);

                document.getElementById('oldPass').value = '';
                document.getElementById('newPass').value = '';
            } else {
                alert("Lỗi: " + data.message);
            }
        })
        .catch(err => {
            console.error(err);
            alert("Lỗi kết nối Server!");
        });
}

// ======================= ORDERS =======================

function fetchOrderHistory() {
    var container = document.querySelector('.listDonHang');
    container.innerHTML = `
        <div class="ordersHeader">
            <h3><i class="fa fa-file-text-o"></i> Đơn hàng của bạn</h3>
            <div class="ordersFilters">
                <select id="orderStatusFilter">
                    <option value="all">Tất cả trạng thái</option>
                    <option value="Chờ thanh toán">Chờ thanh toán</option>
                    <option value="Chờ xử lý">Chờ xử lý</option>
                    <option value="Đang giao hàng">Đang giao hàng</option>
                    <option value="Đã nhận hàng">Đã nhận hàng</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Hủy">Đã hủy</option>
                </select>
                <input id="orderSearch" type="text" placeholder="Tìm theo mã đơn (#123)">
                <button class="uBtn uBtnPrimary" id="btnReloadOrders"><i class="fa fa-refresh"></i> Tải lại</button>
            </div>
        </div>
        <div id="ordersList">
            <p style="text-align:center; padding: 16px;"><i class="fa fa-spinner fa-spin"></i> Đang tải dữ liệu...</p>
        </div>
    `;

    document.getElementById('orderStatusFilter').value = __orderFilterStatus;
    document.getElementById('orderSearch').value = __orderSearch;

    document.getElementById('orderStatusFilter').addEventListener('change', function () {
        __orderFilterStatus = this.value;
        renderOrderHistory();
    });

    document.getElementById('orderSearch').addEventListener('input', function () {
        __orderSearch = this.value.trim();
        renderOrderHistory();
    });

    document.getElementById('btnReloadOrders').addEventListener('click', function () {
        fetchOrderHistory();
    });

    fetch('php/get-order-history.php', {
        credentials: 'same-origin'
    })
        .then(res => res.json())
        .then(data => {
            currentUser.donhang = Array.isArray(data) ? data : [];
            setCurrentUser(currentUser);
            renderOrderHistory();
        })
        .catch(err => {
            console.error(err);
            document.getElementById('ordersList').innerHTML =
                '<p style="text-align:center; color:red; padding: 16px;">Lỗi kết nối server khi tải đơn hàng!</p>';
        });
}

function getStatusIndex(st) {
    if (!st) return 0;
    if (String(st).toLowerCase().includes('hủy')) return -1;
    if (st === 'Chờ thanh toán') return -2;
    if (st === 'Chờ xử lý') return 0;
    if (st === 'Đang giao hàng') return 1;
    if (st === 'Đã nhận hàng') return 2;
    if (st === 'Hoàn thành') return 3;
    return 0;
}

function statusBadgeColor(st) {
    if (!st) return '#6c757d';
    var s = String(st).toLowerCase();
    if (s.includes('hủy')) return '#dc3545';
    if (st === 'Chờ thanh toán') return '#b26a00';
    if (st === 'Chờ xử lý') return '#ff9800';
    if (st === 'Đang giao hàng') return '#17a2b8';
    if (st === 'Đã nhận hàng') return '#0d6efd';
    if (st === 'Hoàn thành') return '#28a745';
    return '#6c757d';
}

function paymentStatusBadge(status) {
    var s = String(status || 'unpaid').trim().toLowerCase();

    if (s === 'paid') {
        return `<span class="statusBadge" style="background:#28a745">Đã thanh toán</span>`;
    }
    if (s === 'failed') {
        return `<span class="statusBadge" style="background:#dc3545">Thanh toán thất bại</span>`;
    }
    if (s === 'refunded') {
        return `<span class="statusBadge" style="background:#6f42c1">Đã hoàn tiền</span>`;
    }
    return `<span class="statusBadge" style="background:#b26a00">Chưa thanh toán</span>`;
}

function paymentMethodBadge(method) {
    var m = (method || 'COD').toUpperCase();
    if (m === 'VNPAY') {
        return `<span class="statusBadge" style="background:#0056b3">VNPay</span>`;
    }
    return `<span class="statusBadge" style="background:#6c757d">COD</span>`;
}

function renderTrackingBar(status) {
    var idx = getStatusIndex(status);

    if (idx === -1) {
        return `<div class="trackWrap"><span class="statusBadge" style="background:#dc3545">Đơn đã bị hủy</span></div>`;
    }

    if (idx === -2) {
        return `<div class="trackWrap"><span class="statusBadge" style="background:#b26a00">Đơn đang chờ thanh toán trực tuyến</span></div>`;
    }

    var steps = ['Chờ xử lý', 'Đang giao', 'Đã nhận', 'Hoàn thành'];
    var html = `<div class="trackWrap">`;
    steps.forEach((label, i) => {
        var done = i <= idx;
        html += `
            <span class="trackDot" style="background:${done ? '#28a745' : '#fff'}"></span>
            <span class="trackLabel ${done ? 'done' : ''}">${label}</span>
            ${i < steps.length - 1 ? `<span class="trackLine">—</span>` : ''}
        `;
    });
    html += `</div>`;
    return html;
}

function renderOrderHistory() {
    var listDiv = document.getElementById('ordersList');
    if (!listDiv) return;

    var orders = Array.isArray(currentUser.donhang) ? currentUser.donhang.slice() : [];

    if (__orderFilterStatus !== 'all') {
        if (__orderFilterStatus === 'Hủy') {
            orders = orders.filter(o => String(o.tinhTrang || '').toLowerCase().includes('hủy'));
        } else {
            orders = orders.filter(o => (o.tinhTrang || '') === __orderFilterStatus);
        }
    }

    if (__orderSearch) {
        var k = __orderSearch.replace('#', '').trim();
        orders = orders.filter(o => String(o.maDon).includes(k));
    }

    if (!orders.length) {
        listDiv.innerHTML = `<p style="text-align:center; color:#777; padding:16px;">Không có đơn phù hợp.</p>`;
        return;
    }

    var html = '';
    orders.forEach(dh => {
        var maDon = dh.maDon;
        var total = parseInt(dh.tongtien || 0);
        var st = dh.tinhTrang || '';
        var paymentStatus = dh.paymentStatus || 'unpaid';
        var pttt = dh.phuongThucTT || 'COD';

        var spHTML = (dh.sp || []).map(s => {
            var tenSP = s.product_name_snapshot || (s.masp || s.ma || '');
            var safeTenSP = escapeHtml(tenSP || ("Sản phẩm #" + s.ma));
            var safeMauSac = escapeHtml(s.variant_name_snapshot || s.mau_sac || '');
            var safeVariantId = escapeHtml(s.variant_id || '');

            var mauTxt = '';
            if (safeMauSac) {
                mauTxt = ` <span class="colorTag">(${safeMauSac})</span>`;
            } else if (s.variant_id) {
                mauTxt = ` <span style="color:#777;font-size:13px;">(Variant #${safeVariantId})</span>`;
            }

            var reviewLink = '';
            if (canWriteReviewStatus(st) || canWriteReviewStatus(dh.paymentStatus) || canWriteReviewStatus(dh.tinhTrangLabel)) {
                var linkName = encodeURIComponent((tenSP || '').split(' ').join('-'));
                reviewLink = ` <a href="chitietsanpham.html?${linkName}" target="_blank" rel="noopener noreferrer" style="color:#288ad6; font-size:13px; text-decoration:underline;">
                <i class="fa fa-star-o"></i> Viết đánh giá</a>`;
            }

            return `<div class="itemLine">- ${safeTenSP}${mauTxt} <b>x${parseInt(s.soluong || 0)}</b>${reviewLink}</div>`;
        }).join('');

        var actionBtn = '';
        if (st === 'Đang giao hàng') {
            actionBtn = `<button class="uBtn uBtnSuccess" onclick="userNhanHang(${maDon})">Đã nhận được hàng</button>`;
        } else if (st === 'Chờ xử lý' || st === 'Chờ thanh toán') {
            actionBtn = `<button class="uBtn uBtnDanger" onclick="userHuyDon(${maDon})">Hủy đơn</button>`;
        }

        var extraVnpayInfo = '';
        if (String(pttt).toUpperCase() === 'VNPAY') {
            extraVnpayInfo = `
                <div style="margin-top:8px; font-size:13px; color:#555; line-height:1.6;">
                    ${dh.vnpTxnRef ? `<div>TxnRef: <b>${escapeHtml(dh.vnpTxnRef)}</b></div>` : ''}
                    ${dh.vnpTransactionNo ? `<div>TransactionNo: <b>${escapeHtml(dh.vnpTransactionNo)}</b></div>` : ''}
                    ${dh.paidAt ? `<div>Thanh toán lúc: <b>${escapeHtml(dh.paidAt)}</b></div>` : ''}
                </div>
            `;
        }

        var detailId = 'user-order-detail-' + maDon;
        var timelineHtml = renderUserTimeline(dh.timeline || []);
        var statusLabelHtml = renderUserStatusLabel(st);
        var timelineBarHtml = renderTrackingBar(st);

        html += `
            <div class="orderItem">
                <div class="orderTop">
                    <div>
                        <div class="orderCode">Đơn #${maDon} <button class="uBtn uBtnPrimary" style="padding:4px 8px; font-size:12px; margin-left:8px;" onclick="toggleUserOrderDetails('${detailId}')">Xem chi tiết</button></div>
                        <div class="orderDate">${escapeHtml(formatDateTime(dh.ngaymua))}</div>
                    </div>
                    <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
                        ${paymentMethodBadge(pttt)}
                        ${paymentStatusBadge(paymentStatus)}
                        ${statusLabelHtml}
                    </div>
                    <div style="width:100%; text-align:right; font-size:12px; color:#6b7280; margin-top:6px;">
                        ${escapeHtml(dh.paymentStatusLabel || '')}
                    </div>
                </div>

                <div id="${detailId}" class="orderDetailBox" style="display:none; margin-top:10px;">
                    <div class="orderBody">
                        <div>
                            ${spHTML}
                            ${extraVnpayInfo}
                            ${timelineHtml}
                        </div>

                        <div class="orderRight">
                            <div style="font-size:13px;color:#6b7280;">Tổng thanh toán</div>
                            <div style="font-size:20px;font-weight:900;color:#d0021b;margin:6px 0 10px 0;">
                                ${numToString(total)}₫
                            </div>
                            <div style="display:flex; justify-content:flex-end; gap:8px; flex-wrap:wrap;">
                                ${actionBtn}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    listDiv.innerHTML = html;
}

// ======================= Update order status =======================

function userNhanHang(maDon) {
    if (!confirm('Xác nhận bạn đã nhận được hàng và sản phẩm nguyên vẹn?')) return;
    updateOrderStatusAPI(maDon, 'Đã nhận hàng');
}

function userHuyDon(maDon) {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    updateOrderStatusAPI(maDon, 'Đã hủy bởi Khách');
}

function toggleUserOrderDetails(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.display = (el.style.display === 'none' || el.style.display === '') ? 'block' : 'none';
}

function renderUserStatusLabel(status) {
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

function renderUserTimeline(timeline) {
    if (!Array.isArray(timeline) || !timeline.length) return '<div style="margin-top:10px; padding:10px; background:#fafafa; border:1px solid #eee; border-radius:8px; font-size:12px; color:#777;">Chưa có timeline.</div>';

    function metaByStatus(status) {
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

    var html = '<div style="margin-top:10px; padding:10px; background:#fafafa; border:1px solid #eee; border-radius:8px;">';
    html += '<div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:8px;">';
    html += '<div style="font-size:12px; font-weight:bold; color:#555;">Timeline đơn hàng</div>';
    html += '<div style="font-size:11px; color:#777;">Chế độ thu gọn</div>';
    html += '</div>';
    html += '<div style="display:flex; flex-wrap:wrap; gap:8px;">';
    timeline.forEach(function (item) {
        var meta = metaByStatus(item.status || item.label);
        html += '<span title="' + escapeHtml((meta.label || '') + (item.created_at ? ' - ' + formatDateTime(item.created_at) : '')) + '" style="display:inline-flex; align-items:center; gap:6px; padding:5px 10px; border-radius:999px; background:' + meta.color + '15; color:' + meta.color + '; font-weight:bold; font-size:11px; border:1px solid ' + meta.color + '30; white-space:nowrap;">';
        html += '<i class="fa ' + meta.icon + '"></i>';
        html += escapeHtml(meta.label);
        html += '</span>';
    });
    html += '</div>';
    html += '</div>';
    return html;
}

function updateOrderStatusAPI(maDon, status) {
fetch('php/admin/update-order-status.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        maDon: parseInt(maDon),
        trangThai: status
    })
})
        .then(res => res.json())
        .then(data => {
            if (data.status) {
                alert(data.message);
                fetchOrderHistory();
            } else {
                alert("Lỗi: " + data.message);
            }
        })
        .catch(err => {
            console.error(err);
            alert("Lỗi kết nối Server!");
        });
}

// ======================= Helpers =======================

function formatDateTime(value) {
    if (!value) return '';
    var dt = new Date(String(value).replace(' ', 'T'));
    if (isNaN(dt.getTime())) return value;
    return dt.toLocaleString('vi-VN');
}

function canWriteReviewStatus(status) {
    var s = String(status || '').trim().toLowerCase();
    return s === 'đã nhận hàng' || s === 'hoàn thành' || s === 'completed' || s === 'delivered';
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
