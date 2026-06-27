// js/pages/user-orders.js

var currentUser = null;
var __orderFilterStatus = 'all';
var __orderSearch = '';

window.onload = function () {
    khoiTao();
    currentUser = getCurrentUser();

    if (!currentUser) {
        document.querySelector('.listDonHang').innerHTML = `
            <div class="ordersLoginEmpty">
                <div class="ordersLoginEmpty-icon"><i class="fa fa-file-text-o"></i></div>
                <h2>Bạn chưa đăng nhập</h2>
                <p>Đăng nhập để xem lịch sử đơn hàng</p>
                <button type="button" class="uBtn" onclick="checkTaiKhoan()">Đăng nhập ngay</button>
            </div>`;
        return;
    }

    fetchOrderHistory();
};

function fetchOrderHistory() {
    var container = document.querySelector('.listDonHang');
    container.innerHTML = `
        <div class="ordersToolbar">
            <h3 class="ordersToolbar-title">Danh sách đơn hàng</h3>
            <div class="ordersFilters">
                <select id="orderStatusFilter">
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="processing">Đang chuẩn bị</option>
                    <option value="shipping">Đang giao hàng</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                    <option value="delivery_failed">Giao thất bại</option>
                </select>
                <input id="orderSearch" type="text" placeholder="Tìm mã đơn (#123)">
                <button type="button" class="uBtn uBtnPrimary" id="btnReloadOrders">Tải lại</button>
            </div>
        </div>
        <div id="ordersList">
            <div class="ordersLoading"><i class="fa fa-spinner fa-spin"></i> Đang tải dữ liệu...</div>
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
                '<div class="ordersError">Lỗi kết nối server khi tải đơn hàng!</div>';
        });
}

function getStatusIndex(st) {
    if (!st) return 0;
    var s = String(st).toLowerCase();
    if (s === 'cancelled' || s === 'delivery_failed') return -1;
    if (s === 'pending') return 0;
    if (s === 'confirmed' || s === 'processing') return 1;
    if (s === 'shipping') return 2;
    if (s === 'completed') return 3;
    return 0;
}

function statusBadgeColor(st) {
    if (!st) return '#6c757d';
    var s = String(st).toLowerCase();
    if (s === 'cancelled' || s === 'delivery_failed') return '#dc3545';
    if (s === 'pending') return '#ff9800';
    if (s === 'confirmed') return '#ff9800';
    if (s === 'processing') return '#17a2b8';
    if (s === 'shipping') return '#17a2b8';
    if (s === 'completed') return '#28a745';
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
        var label = String(status).toLowerCase() === 'delivery_failed' ? 'Giao hàng thất bại' : 'Đơn đã bị hủy';
        return `<div class="trackWrap"><span class="statusBadge" style="background:#dc3545">${label}</span></div>`;
    }

    var steps = ['Chờ xử lý', 'Chuẩn bị hàng', 'Đang giao', 'Hoàn thành'];
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
        orders = orders.filter(o => (o.tinhTrang || '') === __orderFilterStatus);
    }

    if (__orderSearch) {
        var k = __orderSearch.replace('#', '').trim();
        orders = orders.filter(o => String(o.maDon).includes(k));
    }

    if (!orders.length) {
        listDiv.innerHTML = `
            <div class="ordersEmpty">
                <div class="ordersEmpty-icon"><i class="fa fa-inbox"></i></div>
                <p>Không có đơn phù hợp.</p>
            </div>`;
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
                reviewLink = ` <a href="chitietsanpham.html?${linkName}" target="_blank" rel="noopener noreferrer"><i class="fa fa-star-o"></i> Viết đánh giá</a>`;
            }

            return `<div class="itemLine">${safeTenSP}${mauTxt} · <b>x${parseInt(s.soluong || 0)}</b>${reviewLink}</div>`;
        }).join('');

        var actionBtn = '';
        if (st === 'shipping') {
            actionBtn = `<button class="uBtn uBtnSuccess" onclick="userNhanHang(${maDon})">Đã nhận được hàng</button>`;
        } else if (st === 'pending') {
            actionBtn = `<button class="uBtn uBtnDanger" onclick="userHuyDon(${maDon})">Hủy đơn</button>`;
        }

        var extraVnpayInfo = '';
        if (String(pttt).toUpperCase() === 'VNPAY') {
            extraVnpayInfo = `
                <div class="orderVnpayInfo">
                    ${dh.vnpTxnRef ? `<div>TxnRef: <b>${escapeHtml(dh.vnpTxnRef)}</b></div>` : ''}
                    ${dh.vnpTransactionNo ? `<div>TransactionNo: <b>${escapeHtml(dh.vnpTransactionNo)}</b></div>` : ''}
                    ${dh.paidAt ? `<div>Thanh toán lúc: <b>${escapeHtml(dh.paidAt)}</b></div>` : ''}
                </div>
            `;
        }

        var detailId = 'user-order-detail-' + maDon;
        var timelineHtml = renderUserTimeline(dh.timeline || []);
        var statusLabelHtml = renderUserStatusLabel(st);

        html += `
            <div class="orderItem">
                <div class="orderTop">
                    <div class="orderTop-main">
                        <div class="orderCode">
                            <span>Đơn #${maDon}</span>
                            <button type="button" class="uBtn uBtnPrimary uBtnSm" onclick="toggleUserOrderDetails('${detailId}')">Chi tiết</button>
                        </div>
                        <div class="orderDate">${escapeHtml(formatDateTime(dh.ngaymua))}</div>
                    </div>
                    <div class="orderBadges">
                        ${paymentMethodBadge(pttt)}
                        ${paymentStatusBadge(paymentStatus)}
                        ${statusLabelHtml}
                    </div>
                    ${dh.paymentStatusLabel ? `<div class="orderPaymentLabel">${escapeHtml(dh.paymentStatusLabel)}</div>` : ''}
                </div>

                <div id="${detailId}" class="orderDetailBox" style="display:none;">
                    <div class="orderBody">
                        <div class="orderProducts">
                            ${spHTML}
                            ${extraVnpayInfo}
                            ${timelineHtml}
                        </div>

                        <div class="orderRight">
                            <div class="orderTotalLabel">Tổng thanh toán</div>
                            <div class="orderTotalPrice">${numToString(total)}₫</div>
                            <div class="orderActions">
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

function userNhanHang(maDon) {
    if (!confirm('Xác nhận bạn đã nhận được hàng và sản phẩm nguyên vẹn?')) return;
    updateOrderStatusAPI(maDon, 'completed');
}

function userHuyDon(maDon) {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    updateOrderStatusAPI(maDon, 'cancelled');
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

    return '<span class="orderStatusPill" style="background:' + meta[0] + '15; color:' + meta[0] + '; border:1px solid ' + meta[0] + '30;"><i class="fa ' + meta[1] + '"></i> ' + escapeHtml(meta[2]) + '</span>';
}

function renderUserTimeline(timeline) {
    if (!Array.isArray(timeline) || !timeline.length) {
        return '<div class="orderTimeline"><div class="orderTimeline-empty">Chưa có timeline.</div></div>';
    }

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

    var html = '<div class="orderTimeline">';
    html += '<div class="orderTimeline-title">Tiến trình đơn hàng</div>';
    html += '<div class="orderTimeline-chips">';
    timeline.forEach(function (item) {
        var meta = metaByStatus(item.status || item.label);
        html += '<span class="orderTimeline-chip" title="' + escapeHtml((meta.label || '') + (item.created_at ? ' - ' + formatDateTime(item.created_at) : '')) + '" style="background:' + meta.color + '15; color:' + meta.color + '; border:1px solid ' + meta.color + '30;">';
        html += '<i class="fa ' + meta.icon + '"></i> ';
        html += escapeHtml(meta.label);
        html += '</span>';
    });
    html += '</div></div>';
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

function formatDateTime(value) {
    if (!value) return '';
    var dt = new Date(String(value).replace(' ', 'T'));
    if (isNaN(dt.getTime())) return value;
    return dt.toLocaleString('vi-VN');
}

function canWriteReviewStatus(status) {
    var s = String(status || '').trim().toLowerCase();
    return s === 'completed' || s === 'hoàn thành' || s === 'delivered';
}
