// js/admin/orders.js

var currentOrderList = [];
var __orderKeyword = '';
var __orderSearchType = 'all';
var __orderStatusFilter = 'all';
var __orderPaymentFilter = 'all';
var __orderFromDate = '';
var __orderToDate = '';

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatDateTime(value) {
    if (!value) return '—';
    var dt = new Date(String(value).replace(' ', 'T'));
    if (isNaN(dt.getTime())) return String(value);
    var pad = function (n) { return n < 10 ? '0' + n : String(n); };
    return pad(dt.getDate()) + '/' + pad(dt.getMonth() + 1) + '/' + dt.getFullYear() +
        ' ' + pad(dt.getHours()) + ':' + pad(dt.getMinutes());
}

function normalizeText(str) {
    return String(str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function getOrderByMaDon(maDon) {
    return currentOrderList.find(function (d) {
        return String(d.maDon) === String(maDon);
    }) || null;
}

function initOrderModal() {
    var overlay = document.getElementById('orderModalOverlay');
    if (!overlay) return;

    var closeBtn = document.getElementById('orderModalClose');
    if (closeBtn && !closeBtn.__odBound) {
        closeBtn.__odBound = true;
        closeBtn.addEventListener('click', closeOrderModal);
    }

    if (!overlay.__odBound) {
        overlay.__odBound = true;
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeOrderModal();
        });
    }

    if (!document.__odEscBound) {
        document.__odEscBound = true;
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeOrderModal();
        });
    }
}

function openOrderModal() {
    initOrderModal();
    var overlay = document.getElementById('orderModalOverlay');
    if (overlay) overlay.style.transform = 'scale(1)';
}

function closeOrderModal() {
    var overlay = document.getElementById('orderModalOverlay');
    if (overlay) overlay.style.transform = 'scale(0)';
}

function getOrderStats(list) {
    list = Array.isArray(list) ? list : [];
    var pending = list.filter(function (d) {
        return String(d.tinhTrang || '').toLowerCase() === 'pending';
    }).length;
    var completed = list.filter(function (d) {
        return String(d.tinhTrang || '').toLowerCase() === 'completed';
    }).length;
    return { total: list.length, pending: pending, completed: completed };
}

function addTableDonHang() {
    var tc = document.querySelector('.donhang .table-content');
    if (!tc) return;

    initOrderModal();
    tc.innerHTML = '<div class="od-loading"><i class="fa fa-spinner fa-spin"></i> Đang tải đơn hàng...</div>';

    fetch('php/admin/get-orders.php')
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data && data.error) {
                tc.innerHTML = '<div class="od-empty-state"><i class="fa fa-exclamation-triangle"></i>' + escapeHtml(data.error) + '</div>';
                return;
            }
            currentOrderList = Array.isArray(data) ? data : [];
            renderOrderPanel();
        })
        .catch(function (err) {
            console.error(err);
            tc.innerHTML = '<div class="od-empty-state"><i class="fa fa-exclamation-triangle"></i>Lỗi kết nối Server!</div>';
        });
}

function applyOrderFilters(list) {
    list = Array.isArray(list) ? list.slice() : [];
    var keyword = normalizeText(__orderKeyword);

    if (__orderStatusFilter !== 'all') {
        list = list.filter(function (d) {
            return String(d.tinhTrang || '').toLowerCase() === __orderStatusFilter;
        });
    }

    if (__orderPaymentFilter === 'cod') {
        list = list.filter(function (d) { return String(d.pttt || '').toUpperCase() !== 'VNPAY'; });
    } else if (__orderPaymentFilter === 'vnpay') {
        list = list.filter(function (d) { return String(d.pttt || '').toUpperCase() === 'VNPAY'; });
    } else if (__orderPaymentFilter !== 'all') {
        list = list.filter(function (d) {
            return String(d.paymentStatus || 'unpaid').toLowerCase() === __orderPaymentFilter;
        });
    }

    if (__orderFromDate) {
        var from = new Date(__orderFromDate);
        from.setHours(0, 0, 0, 0);
        list = list.filter(function (d) {
            return new Date(d.ngayMua).getTime() >= from.getTime();
        });
    }

    if (__orderToDate) {
        var to = new Date(__orderToDate);
        to.setHours(23, 59, 59, 999);
        list = list.filter(function (d) {
            return new Date(d.ngayMua).getTime() <= to.getTime();
        });
    }

    if (keyword) {
        list = list.filter(function (d) {
            var ma = normalizeText(d.maDon);
            var khach = normalizeText(d.khachHang);
            var sdt = normalizeText(d.sdt);
            var pttt = normalizeText(d.pttt);
            var pay = normalizeText(d.paymentStatus);

            if (__orderSearchType === 'ma') return ma.includes(keyword);
            if (__orderSearchType === 'khach') return khach.includes(keyword);
            if (__orderSearchType === 'sdt') return sdt.includes(keyword);
            if (__orderSearchType === 'pttt') return pttt.includes(keyword);
            if (__orderSearchType === 'paymentStatus') return pay.includes(keyword);

            return ma.includes(keyword) || khach.includes(keyword) || sdt.includes(keyword) ||
                pttt.includes(keyword) || pay.includes(keyword);
        });
    }

    return list;
}

function renderOrderPanel() {
    var tc = document.querySelector('.donhang .table-content');
    if (!tc) return;

    var stats = getOrderStats(currentOrderList);
    var filtered = applyOrderFilters(currentOrderList);

    var html = `
        <div class="wh-toolbar od-toolbar">
            <div class="wh-toolbar-filters">
                <div class="wh-field">
                    <label for="orderSearchType">Tìm theo</label>
                    <select id="orderSearchType">
                        <option value="all">Tất cả trường</option>
                        <option value="ma">Mã đơn</option>
                        <option value="khach">Tên khách</option>
                        <option value="sdt">Số điện thoại</option>
                        <option value="pttt">PT thanh toán</option>
                        <option value="paymentStatus">TT thanh toán</option>
                    </select>
                </div>
                <div class="wh-field">
                    <label for="orderSearchInput">Từ khóa</label>
                    <input id="orderSearchInput" type="text" placeholder="Nhập từ khóa..." value="${escapeHtml(__orderKeyword)}">
                </div>
                <div class="wh-field">
                    <label for="orderStatusFilter">Trạng thái đơn</label>
                    <select id="orderStatusFilter">
                        <option value="all">Tất cả</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="processing">Chuẩn bị hàng</option>
                        <option value="shipping">Đang giao</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                        <option value="delivery_failed">Giao thất bại</option>
                    </select>
                </div>
                <div class="wh-field">
                    <label for="orderPaymentFilter">Thanh toán</label>
                    <select id="orderPaymentFilter">
                        <option value="all">Tất cả</option>
                        <option value="cod">COD</option>
                        <option value="vnpay">VNPay</option>
                        <option value="unpaid">Chưa thanh toán</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="failed">Thanh toán lỗi</option>
                    </select>
                </div>
                <div class="wh-field">
                    <label for="orderFromDate">Từ ngày</label>
                    <input id="orderFromDate" type="date" value="${escapeHtml(__orderFromDate)}">
                </div>
                <div class="wh-field">
                    <label for="orderToDate">Đến ngày</label>
                    <input id="orderToDate" type="date" value="${escapeHtml(__orderToDate)}">
                </div>
                <button type="button" class="wh-btn-clear" id="orderClearBtn">
                    <i class="fa fa-eraser"></i> Xóa lọc
                </button>
            </div>
            <div class="wh-stats">
                <span class="wh-stat wh-stat-total">Tổng: ${stats.total}</span>
                <span class="wh-stat od-stat-pending">Chờ xử lý: ${stats.pending}</span>
                <span class="wh-stat od-stat-done">Hoàn thành: ${stats.completed}</span>
                <span class="wh-stat od-stat-showing">Hiển thị: ${filtered.length}</span>
            </div>
        </div>
    `;

    html += renderOrderTableHTML(filtered);
    tc.innerHTML = html;

    bindOrderToolbarEvents();
    bindOrderTableEvents(tc);
}

function bindOrderToolbarEvents() {
    var typeSel = document.getElementById('orderSearchType');
    if (typeSel) {
        typeSel.value = __orderSearchType;
        typeSel.addEventListener('change', function () {
            __orderSearchType = this.value;
            renderOrderPanel();
        });
    }

    var inp = document.getElementById('orderSearchInput');
    if (inp) {
        inp.addEventListener('input', function () {
            __orderKeyword = this.value;
            renderOrderPanel();
        });
    }

    var statusSel = document.getElementById('orderStatusFilter');
    if (statusSel) {
        statusSel.value = __orderStatusFilter;
        statusSel.addEventListener('change', function () {
            __orderStatusFilter = this.value;
            renderOrderPanel();
        });
    }

    var paySel = document.getElementById('orderPaymentFilter');
    if (paySel) {
        paySel.value = __orderPaymentFilter;
        paySel.addEventListener('change', function () {
            __orderPaymentFilter = this.value;
            renderOrderPanel();
        });
    }

    var fromInp = document.getElementById('orderFromDate');
    if (fromInp) {
        fromInp.addEventListener('change', function () {
            __orderFromDate = this.value;
            renderOrderPanel();
        });
    }

    var toInp = document.getElementById('orderToDate');
    if (toInp) {
        toInp.addEventListener('change', function () {
            __orderToDate = this.value;
            renderOrderPanel();
        });
    }

    var clearBtn = document.getElementById('orderClearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            __orderKeyword = '';
            __orderSearchType = 'all';
            __orderStatusFilter = 'all';
            __orderPaymentFilter = 'all';
            __orderFromDate = '';
            __orderToDate = '';
            renderOrderPanel();
        });
    }
}

function bindOrderTableEvents(tc) {
    tc.querySelectorAll('.btn-od-view').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var maDon = btn.getAttribute('data-ma-don');
            var order = getOrderByMaDon(maDon);
            if (order) showOrderDetailModal(order);
        });
    });

    tc.querySelectorAll('.btn-od-action').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var maDon = btn.getAttribute('data-ma-don');
            var status = btn.getAttribute('data-status');
            if (maDon && status) showOrderStatusModal(maDon, status);
        });
    });

    tc.querySelectorAll('.btn-od-delete').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var maDon = btn.getAttribute('data-ma-don');
            if (maDon) showOrderDeleteModal(maDon);
        });
    });
}

function renderOrderTableHTML(list) {
    var html = `<div class="od-table-wrap"><table class="table-outline od-table">
        <thead>
            <tr>
                <th>Mã</th>
                <th>Khách hàng</th>
                <th>Liên hệ</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Ngày giờ</th>
                <th>PT TT</th>
                <th>TT TT</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
            </tr>
        </thead>
        <tbody>`;

    if (!list.length) {
        html += '<tr><td colspan="10"><div class="od-empty-state"><i class="fa fa-inbox"></i>Không tìm thấy đơn hàng phù hợp.</div></td></tr>';
    } else {
        list.forEach(function (d) {
            html += `<tr>
                <td><span class="od-order-id">#${escapeHtml(d.maDon)}</span></td>
                <td><span class="od-customer" title="${escapeHtml(d.khachHang || '')}">${escapeHtml(d.khachHang || '—')}</span></td>
                <td>${renderContactCell(d)}</td>
                <td>${renderProductsCell(d.sp || [])}</td>
                <td><span class="od-amount">${numToString(parseInt(d.tongTien || 0))}₫</span></td>
                <td><span class="od-date">${formatDateTime(d.ngayMua)}</span></td>
                <td>${renderPaymentMethod(d.pttt)}</td>
                <td>${renderPaymentStatus(d.paymentStatus)}</td>
                <td>${renderOrderStatusLabel(d.tinhTrang)}</td>
                <td><div class="od-actions">${buildOrderActions(d)}</div></td>
            </tr>`;
        });
    }

    html += '</tbody></table></div>';
    return html;
}

function renderContactCell(d) {
    return `<div class="od-contact">
        <span class="od-phone"><i class="fa fa-phone"></i> ${escapeHtml(d.sdt || '—')}</span>
        <span class="od-address" title="${escapeHtml(d.diaChi || '')}">${escapeHtml(d.diaChi || '—')}</span>
    </div>`;
}

function renderProductsCell(items) {
    if (!items.length) return '<span class="od-no-product">Không có SP</span>';

    var lines = items.map(function (it) {
        var tenSP = it.product_name_snapshot || it.ma_sp || '';
        var variant = (it.variant_name_snapshot && String(it.variant_name_snapshot).trim())
            ? String(it.variant_name_snapshot).trim()
            : ((it.mau_sac && String(it.mau_sac).trim()) ? String(it.mau_sac).trim() : '');
        var qty = parseInt(it.so_luong || 0);
        var variantHtml = variant
            ? ' <span class="od-variant">(' + escapeHtml(variant) + ')</span>'
            : '';

        return `<div class="od-product-line">- ${escapeHtml(tenSP)}${variantHtml} <b>x${qty}</b></div>`;
    }).join('');

    return '<div class="od-products">' + lines + '</div>';
}

function renderPaymentMethod(pttt) {
    var text = String(pttt || 'COD').toUpperCase();
    if (text === 'VNPAY') {
        return '<span class="od-badge od-badge-vnpay">VNPay</span>';
    }
    return '<span class="od-badge od-badge-cod">COD</span>';
}

function renderPaymentStatus(status) {
    var s = String(status || 'unpaid').trim().toLowerCase();
    if (s === 'paid') return '<span class="od-badge od-badge-paid">Đã TT</span>';
    if (s === 'failed') return '<span class="od-badge od-badge-failed">Lỗi TT</span>';
    if (s === 'refunded') return '<span class="od-badge od-badge-refund">Hoàn tiền</span>';
    return '<span class="od-badge od-badge-unpaid">Chưa TT</span>';
}

function metaByStatus(status) {
    var s = String(status || 'pending').toLowerCase();
    var map = {
        pending: { icon: 'fa-clock-o', cls: 'pending', label: 'Chờ xử lý' },
        confirmed: { icon: 'fa-check-circle', cls: 'confirmed', label: 'Đã xác nhận' },
        processing: { icon: 'fa-cube', cls: 'processing', label: 'Chuẩn bị hàng' },
        shipping: { icon: 'fa-truck', cls: 'shipping', label: 'Đang giao' },
        completed: { icon: 'fa-check', cls: 'completed', label: 'Hoàn thành' },
        cancelled: { icon: 'fa-times-circle', cls: 'cancelled', label: 'Đã hủy' },
        delivery_failed: { icon: 'fa-exclamation-triangle', cls: 'failed', label: 'Giao thất bại' }
    };
    return map[s] || { icon: 'fa-circle', cls: 'default', label: status || '—' };
}

function renderOrderStatusLabel(status) {
    var meta = metaByStatus(status);
    return '<span class="od-status od-status-' + meta.cls + '"><i class="fa ' + meta.icon + '"></i> ' + escapeHtml(meta.label) + '</span>';
}

function buildOrderActions(d) {
    var maDon = escapeHtml(d.maDon);
    var tinhTrang = String(d.tinhTrang || 'pending').toLowerCase();
    var btns = '<button type="button" class="btn-od-view" data-ma-don="' + maDon + '" title="Xem chi tiết"><i class="fa fa-eye"></i></button>';

    if (tinhTrang === 'pending') {
        btns += actionBtn(maDon, 'confirmed', 'check', 'Xác nhận', 'primary');
        btns += actionBtn(maDon, 'cancelled', 'times', 'Hủy', 'danger');
    } else if (tinhTrang === 'confirmed') {
        btns += actionBtn(maDon, 'processing', 'cube', 'Chuẩn bị', 'primary');
        btns += actionBtn(maDon, 'cancelled', 'times', 'Hủy', 'danger');
    } else if (tinhTrang === 'processing') {
        btns += actionBtn(maDon, 'shipping', 'truck', 'Giao VC', 'primary');
        btns += actionBtn(maDon, 'cancelled', 'times', 'Hủy', 'danger');
    } else if (tinhTrang === 'shipping') {
        btns += actionBtn(maDon, 'completed', 'check-circle', 'Hoàn tất', 'success');
        btns += actionBtn(maDon, 'delivery_failed', 'exclamation-triangle', 'Giao lỗi', 'warn');
    } else if (tinhTrang === 'completed') {
        btns += '<button type="button" class="btn-od-delete" data-ma-don="' + maDon + '" title="Xóa đơn"><i class="fa fa-trash"></i></button>';
    } else if (tinhTrang === 'cancelled' || tinhTrang === 'delivery_failed') {
        btns += '<button type="button" class="btn-od-delete" data-ma-don="' + maDon + '" title="Xóa đơn"><i class="fa fa-trash"></i></button>';
    } else {
        btns += '<button type="button" class="btn-od-delete" data-ma-don="' + maDon + '" title="Xóa đơn"><i class="fa fa-trash"></i></button>';
    }

    return '<div class="od-actions-row">' + btns + '</div>';
}

function actionBtn(maDon, status, icon, title, type) {
    return '<button type="button" class="btn-od-action btn-od-' + type + '" data-ma-don="' + maDon + '" data-status="' + status + '" title="' + escapeHtml(title) + '"><i class="fa fa-' + icon + '"></i></button>';
}

function statusLabelVi(status) {
    return metaByStatus(status).label;
}

function showOrderDetailModal(order) {
    var products = (order.sp || []).map(function (it) {
        var tenSP = it.product_name_snapshot || it.ma_sp || '';
        var variant = it.variant_name_snapshot || it.mau_sac || '';
        var qty = parseInt(it.so_luong || 0);
        var price = parseInt(it.don_gia || 0);
        return `<div class="od-detail-product">
            <div class="od-detail-product-icon"><i class="fa fa-mobile"></i></div>
            <div class="od-detail-product-info">
                <strong>${escapeHtml(tenSP)}</strong>
                <span>${variant ? escapeHtml(variant) : 'Không có biến thể'}</span>
            </div>
            <div class="od-detail-product-price">
                <span>x${qty}</span>
                <b>${numToString(price)}₫</b>
            </div>
        </div>`;
    }).join('');

    document.getElementById('orderModalTitle').innerHTML =
        '<i class="fa fa-eye"></i> Chi tiết đơn #' + escapeHtml(order.maDon);

    document.getElementById('orderModalBody').innerHTML = `
        <div class="od-detail-grid">
            <div class="od-detail-card">
                <h4>Thông tin đơn</h4>
                <div class="od-detail-rows">
                    <div><span>Khách hàng</span><b>${escapeHtml(order.khachHang || '—')}</b></div>
                    <div><span>Số điện thoại</span><b>${escapeHtml(order.sdt || '—')}</b></div>
                    <div><span>Ngày mua</span><b>${formatDateTime(order.ngayMua)}</b></div>
                    <div><span>Thanh toán</span><b>${renderPaymentMethod(order.pttt)} ${renderPaymentStatus(order.paymentStatus)}</b></div>
                    <div><span>Trạng thái</span><b>${renderOrderStatusLabel(order.tinhTrang)}</b></div>
                    <div class="od-detail-full"><span>Địa chỉ</span><b>${escapeHtml(order.diaChi || '—')}</b></div>
                </div>
            </div>
            <div class="od-detail-card od-detail-summary">
                <h4>Tóm tắt</h4>
                <div class="od-summary-row"><span>Tổng tiền</span><b class="od-amount">${numToString(parseInt(order.tongTien || 0))}₫</b></div>
                <div class="od-summary-row"><span>Mã VNPay</span><b>${escapeHtml(order.vnpTxnRef || order.vnp_txn_ref || '—')}</b></div>
                <div class="od-summary-row"><span>Mã giao dịch</span><b>${escapeHtml(order.vnpTransactionNo || order.vnp_transaction_no || '—')}</b></div>
                <div class="od-summary-row"><span>Thanh toán lúc</span><b>${escapeHtml(order.paidAt || order.paid_at || 'Chưa ghi nhận')}</b></div>
            </div>
        </div>
        <div class="od-detail-card">
            <h4>Sản phẩm</h4>
            <div class="od-detail-products">${products || '<p class="od-no-product">Không có sản phẩm.</p>'}</div>
        </div>
        <div class="od-detail-card">
            <h4>Timeline xử lý</h4>
            ${renderTimeline(order.timeline || [])}
        </div>
    `;

    document.getElementById('orderModalFooter').innerHTML =
        '<button type="button" class="btn-od-secondary" id="odModalBtnClose">Đóng</button>';

    document.getElementById('odModalBtnClose').addEventListener('click', closeOrderModal);
    openOrderModal();
}

function showOrderStatusModal(maDon, trangThaiMoi) {
    var order = getOrderByMaDon(maDon);
    var warn = (trangThaiMoi.indexOf('cancel') >= 0 || trangThaiMoi === 'delivery_failed');

    document.getElementById('orderModalTitle').innerHTML =
        '<i class="fa fa-refresh"></i> Cập nhật trạng thái';

    document.getElementById('orderModalBody').innerHTML = `
        ${warn ? '<div class="od-delete-warning"><p>Hành động này có thể không hoàn tác được.</p></div>' : ''}
        <p class="od-modal-text">Chuyển đơn <strong>#${escapeHtml(maDon)}</strong> sang trạng thái:</p>
        <div class="od-modal-status">${renderOrderStatusLabel(trangThaiMoi)}</div>
        ${order ? '<p class="od-modal-sub">Khách: ' + escapeHtml(order.khachHang || '') + ' · ' + numToString(parseInt(order.tongTien || 0)) + '₫</p>' : ''}
    `;

    document.getElementById('orderModalFooter').innerHTML = `
        <button type="button" class="btn-od-secondary" id="odModalBtnCancel">Hủy</button>
        <button type="button" class="btn-od-primary" id="odModalBtnConfirm"><i class="fa fa-check"></i> Xác nhận</button>
    `;

    document.getElementById('odModalBtnCancel').addEventListener('click', closeOrderModal);
    document.getElementById('odModalBtnConfirm').addEventListener('click', function () {
        submitOrderStatusUpdate(maDon, trangThaiMoi);
    });

    openOrderModal();
}

function showOrderDeleteModal(maDon) {
    var order = getOrderByMaDon(maDon);

    document.getElementById('orderModalTitle').innerHTML =
        '<i class="fa fa-exclamation-triangle"></i> Xác nhận xóa';

    document.getElementById('orderModalBody').innerHTML = `
        <div class="od-delete-warning">
            <p>Xóa vĩnh viễn lịch sử đơn hàng <strong>#${escapeHtml(maDon)}</strong>? Không thể hoàn tác.</p>
        </div>
        ${order ? '<p class="od-modal-sub">Khách: ' + escapeHtml(order.khachHang || '') + ' · ' + formatDateTime(order.ngayMua) + '</p>' : ''}
    `;

    document.getElementById('orderModalFooter').innerHTML = `
        <button type="button" class="btn-od-secondary" id="odModalBtnCancel">Hủy</button>
        <button type="button" class="btn-od-danger" id="odModalBtnDelete"><i class="fa fa-trash"></i> Xóa đơn</button>
    `;

    document.getElementById('odModalBtnCancel').addEventListener('click', closeOrderModal);
    document.getElementById('odModalBtnDelete').addEventListener('click', function () {
        submitOrderDelete(maDon);
    });

    openOrderModal();
}

function submitOrderStatusUpdate(maDon, trangThaiMoi) {
    var btn = document.getElementById('odModalBtnConfirm');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang lưu...';
    }

    fetch('php/admin/update-order-status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maDon: maDon, trangThai: trangThaiMoi })
    })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data.status) {
                closeOrderModal();
                addTableDonHang();
            } else {
                alert('Lỗi: ' + (data.message || 'Không thể cập nhật'));
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa fa-check"></i> Xác nhận';
                }
            }
        })
        .catch(function () {
            alert('Lỗi kết nối Server!');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa fa-check"></i> Xác nhận';
            }
        });
}

function submitOrderDelete(maDon) {
    var btn = document.getElementById('odModalBtnDelete');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang xóa...';
    }

    fetch('php/admin/delete-order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maDon: maDon })
    })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data.status) {
                closeOrderModal();
                currentOrderList = currentOrderList.filter(function (d) {
                    return String(d.maDon) !== String(maDon);
                });
                renderOrderPanel();
            } else {
                alert('Lỗi: ' + (data.message || 'Không thể xóa'));
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa fa-trash"></i> Xóa đơn';
                }
            }
        })
        .catch(function () {
            alert('Lỗi kết nối Server!');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa fa-trash"></i> Xóa đơn';
            }
        });
}

function renderTimeline(timeline) {
    if (!Array.isArray(timeline) || !timeline.length) {
        return '<div class="od-timeline-empty">Chưa có timeline.</div>';
    }

    var html = '<div class="od-timeline">';
    timeline.forEach(function (item, i) {
        var meta = metaByStatus(item.status || item.label);
        var timeText = item.created_at ? formatDateTime(item.created_at) : '';
        html += `<div class="od-timeline-item od-status-${meta.cls}">
            <div class="od-timeline-dot"><i class="fa ${meta.icon}"></i></div>
            <div class="od-timeline-content">
                <strong>${escapeHtml(meta.label)}</strong>
                <span>${timeText || '—'}</span>
            </div>
        </div>`;
        if (i < timeline.length - 1) html += '<div class="od-timeline-line"></div>';
    });
    html += '</div>';
    return html;
}

function capNhatTrangThai(maDon, trangThaiMoi) {
    showOrderStatusModal(maDon, trangThaiMoi);
}

function xoaDonHangVinhVien(maDon) {
    showOrderDeleteModal(maDon);
}

function openOrderDetailModal(order) {
    if (typeof order === 'string') order = getOrderByMaDon(order);
    if (order) showOrderDetailModal(order);
}

function renderOrderTable(list) {
    renderOrderPanel();
}

function updateOrderFooterUI() {}

function locDonHangTheoKhoangNgay() {
    renderOrderPanel();
}

function timKiemDonHang(inp) {
    __orderKeyword = (inp && inp.value) ? inp.value : '';
    renderOrderPanel();
}

document.addEventListener('DOMContentLoaded', initOrderModal);
