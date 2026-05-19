// js/pages/user.js

var currentUser = null;
var __orderFilterStatus = 'all';
var __orderSearch = '';
var __profileCollapsed = false;

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

    var parts = name.split(/\s+/).filter(Boolean);
    var a = parts[0] ? parts[0][0] : 'U';
    var b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (a + b).toUpperCase();
}

function getFullName(u) {
    return ((u.ho || '') + ' ' + (u.ten || '')).replace(/\s+/g, ' ').trim();
}

function splitFullName(fullName) {
    var parts = String(fullName || '').trim().replace(/\s+/g, ' ').split(' ').filter(Boolean);

    if (parts.length === 0) {
        return { ho: '', ten: '' };
    }

    if (parts.length === 1) {
        return { ho: '', ten: parts[0] };
    }

    return {
        ho: parts.slice(0, -1).join(' '),
        ten: parts[parts.length - 1]
    };
}

function renderUserInfo() {
    var u = currentUser;
    var info = document.querySelector('.infoUser');
    if (!info) return;

    var fullName = getFullName(u);
    var displayName = fullName || u.username || 'Người dùng';

    info.innerHTML = `
        <div class="userProfileBox">
            <div class="profileTopBox">
                <div class="profileHeaderFixed">
                    <div class="avatarCircle">${getInitials(u)}</div>

                    <div class="profileMetaFixed">
                        <div class="uNameFixed" title="${escapeHtml(displayName)}">${escapeHtml(displayName)}</div>
                        <div class="uSubFixed" title="${escapeHtml(u.email || '')}">${escapeHtml(u.email || '')}</div>
                    </div>
                </div>

                <button type="button" class="profileCollapseBtn" onclick="toggleProfilePanel()">
                    <i id="profileToggleIcon" class="fa ${__profileCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'}"></i>
                    <span id="profileToggleText">${__profileCollapsed ? 'Mở hồ sơ' : 'Thu gọn hồ sơ'}</span>
                </button>
            </div>

            <div id="profileBody" class="profileBody ${__profileCollapsed ? 'collapsed' : 'expanded'}">
                <h3 class="profileSectionTitle">
                    <i class="fa fa-user-circle"></i> Hồ sơ
                </h3>

                <div class="profileFormRow">
                    <label for="profileUsername">Tên đăng nhập</label>
                    <div class="profileInputOnly">
                        <input id="profileUsername" class="uInput" type="text" value="${escapeHtml(u.username)}" disabled>
                    </div>
                </div>

                <div class="profileFormRow">
                    <label for="infoName">Họ tên</label>
                    <div class="profileInputAction">
                        <input class="uInput" type="text" id="infoName" value="${escapeHtml(fullName)}" placeholder="Nhập họ và tên">
                        <button id="btnUpdateInfo" class="uBtn uBtnPrimary" onclick="updateInfo()">
                            <i class="fa fa-pencil"></i> Cập nhật
                        </button>
                    </div>
                </div>

                <div class="profileFormRow">
                    <label for="profileEmail">Email</label>
                    <div class="profileInputOnly">
                        <input id="profileEmail" class="uInput" type="text" value="${escapeHtml(u.email || '')}" disabled>
                    </div>
                </div>

                <div class="uDivider"></div>

                <h3 class="profileSectionTitle">
                    <i class="fa fa-key"></i> Bảo mật
                </h3>

                <div class="profileSecurityActions">
                    <button class="uBtn uBtnPrimary" onclick="togglePassForm(true)">
                        <i class="fa fa-key"></i> Đổi mật khẩu
                    </button>
                </div>

                <div id="passForm" style="display:none; margin-top:12px;">
                    <div class="profileFormRow">
                        <label for="oldPass">Mật khẩu cũ</label>
                        <div class="profileInputOnly">
                            <input class="uInput" type="password" id="oldPass" placeholder="Mật khẩu cũ">
                        </div>
                    </div>

                    <div class="profileFormRow">
                        <label for="newPass">Mật khẩu mới</label>
                        <div class="profileInputOnly">
                            <input class="uInput" type="password" id="newPass" placeholder="Mật khẩu mới tối thiểu 6 ký tự">
                        </div>
                    </div>

                    <div class="profilePassActions">
                        <button class="uBtn uBtnSuccess" onclick="changePass()">
                            <i class="fa fa-check"></i> Xác nhận
                        </button>

                        <button class="uBtn uBtnDanger" onclick="togglePassForm(false)">
                            <i class="fa fa-times"></i> Hủy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function toggleProfilePanel() {
    var body = document.getElementById('profileBody');
    var icon = document.getElementById('profileToggleIcon');
    var text = document.getElementById('profileToggleText');

    if (!body) return;

    __profileCollapsed = !__profileCollapsed;

    if (__profileCollapsed) {
        body.classList.remove('expanded');
        body.classList.add('collapsed');

        if (icon) {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        }

        if (text) text.innerText = 'Mở hồ sơ';
    } else {
        body.classList.remove('collapsed');
        body.classList.add('expanded');

        if (icon) {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        }

        if (text) text.innerText = 'Thu gọn hồ sơ';
    }
}

function togglePassForm(show) {
    var form = document.getElementById('passForm');
    if (!form) return;
    form.style.display = show ? 'block' : 'none';
}

function updateInfo() {
    var input = document.getElementById('infoName');
    var btn = document.getElementById('btnUpdateInfo');

    if (!input) {
        alert('Không tìm thấy ô nhập họ tên!');
        return;
    }

    var fullName = input.value.trim().replace(/\s+/g, ' ');

    if (!fullName) {
        alert('Vui lòng nhập họ tên!');
        input.focus();
        return;
    }

    if (!currentUser || !currentUser.username) {
        alert('Không tìm thấy tài khoản đang đăng nhập. Vui lòng đăng nhập lại!');
        return;
    }

    var nameParts = splitFullName(fullName);

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang lưu...';
    }

    fetch('php/update-user-info.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: currentUser.username,
            ho: nameParts.ho,
            ten: nameParts.ten
        })
    })
    .then(res => res.text())
    .then(text => {
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error('PHP không trả về JSON hợp lệ: ' + text);
        }
    })
    .then(data => {
        if (data.status) {
            alert(data.message || 'Cập nhật họ tên thành công!');

            if (data.user) {
                currentUser.ho = data.user.ho || '';
                currentUser.ten = data.user.ten || '';
                currentUser.email = data.user.email || currentUser.email;
                if (data.user.role) currentUser.role = data.user.role;
            } else {
                currentUser.ho = nameParts.ho;
                currentUser.ten = nameParts.ten;
            }

            setCurrentUser(currentUser);

            if (typeof updateSingleUserInList === 'function') {
                updateSingleUserInList(currentUser);
            }

            renderUserInfo();
        } else {
            alert('Lỗi: ' + (data.message || 'Không thể cập nhật họ tên!'));
        }
    })
    .catch(err => {
        console.error(err);
        alert('Lỗi cập nhật họ tên: ' + err.message);
    })
    .finally(() => {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa fa-pencil"></i> Cập nhật';
        }
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

    fetch('php/get-order-history.php?username=' + encodeURIComponent(currentUser.username))
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
    var s = (status || 'Pending').trim();

    if (s === 'Paid') {
        return `<span class="statusBadge" style="background:#28a745">Đã thanh toán</span>`;
    }
    if (s === 'Failed') {
        return `<span class="statusBadge" style="background:#dc3545">Thanh toán thất bại</span>`;
    }
    return `<span class="statusBadge" style="background:#b26a00">Chờ thanh toán</span>`;
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
        var paymentStatus = dh.paymentStatus || 'Pending';
        var pttt = dh.phuongThucTT || 'COD';
        var badgeBg = statusBadgeColor(st);

        var spHTML = (dh.sp || []).map(s => {
            var p = null;
            try { p = timKiemTheoMa(getListProducts(), s.ma); } catch (e) {}
            var tenSP = p ? p.name : ("Sản phẩm #" + s.ma);

            var mauTxt = '';
            if (s.mau_sac) {
                mauTxt = ` <span class="colorTag">(${escapeHtml(s.mau_sac)})</span>`;
            } else if (s.variant_id) {
                mauTxt = ` <span style="color:#777;font-size:13px;">(Variant #${s.variant_id})</span>`;
            }

            var reviewLink = '';
            if ((st === 'Đã nhận hàng' || st === 'Hoàn thành') && p) {
                var linkName = p.name.split(' ').join('-');
                reviewLink = ` <a href="chitietsanpham.html?${linkName}" target="_blank" style="color:#288ad6; font-size:13px; text-decoration:underline;">
                                <i class="fa fa-star-o"></i> Viết đánh giá</a>`;
            }

            return `<div class="itemLine">- ${escapeHtml(tenSP)}${mauTxt} <b>x${s.soluong}</b>${reviewLink}</div>`;
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

        html += `
            <div class="orderItem">
                <div class="orderTop">
                    <div>
                        <div class="orderCode">Đơn #${maDon}</div>
                        <div class="orderDate">${formatDateTime(dh.ngaymua)}</div>
                    </div>
                    <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
                        ${paymentMethodBadge(pttt)}
                        ${paymentStatusBadge(paymentStatus)}
                        <span class="statusBadge" style="background:${badgeBg}">${escapeHtml(st)}</span>
                    </div>
                </div>

                ${renderTrackingBar(st)}

                <div class="orderBody" style="margin-top:10px;">
                    <div>
                        ${spHTML}
                        ${extraVnpayInfo}
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

function updateOrderStatusAPI(maDon, status) {
    fetch('php/admin/update-order-status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maDon: maDon, trangThai: status })
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

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}