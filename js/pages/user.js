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
                <div class="uName">${u.username}</div>
                <div class="uSub">${(u.email || '')}</div>
            </div>
        </div>

        <h3 style="margin:0 0 10px 0;"><i class="fa fa-user-circle"></i> Hồ sơ</h3>

        <div class="formRow">
            <label>Tên đăng nhập</label>
            <input class="uInput" type="text" value="${u.username}" disabled>
            <span style="color:#6b7280;font-size:12px;"><i class="fa fa-lock"></i></span>
        </div>

        <div class="formRow">
            <label>Họ tên</label>
            <input class="uInput" type="text" id="infoName" value="${(u.ho || '')} ${(u.ten || '')}".trim()>
            <button class="uBtn uBtnPrimary" onclick="updateInfo()"><i class="fa fa-pencil"></i> Cập nhật</button>
        </div>

        <div class="formRow">
            <label>Email</label>
            <input class="uInput" type="text" value="${u.email || ''}" disabled>
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
    if (fullname.length < 1) { alert('Vui lòng nhập họ tên đầy đủ'); return; }

    var hoMoi = fullname[0];
    var tenMoi = fullname.slice(1).join(' ');

    fetch('php/update-user-info.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: currentUser.username,
            ho: hoMoi,
            ten: tenMoi
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.status) {
                alert(data.message);
                currentUser.ho = hoMoi;
                currentUser.ten = tenMoi;
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

    if (!oldPass || !newPass) { alert('Vui lòng nhập đầy đủ thông tin!'); return; }
    if (newPass.length < 6) { alert('Mật khẩu mới quá ngắn (tối thiểu 6 ký tự)!'); return; }

    fetch('php/change-password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: currentUser.username,
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
    if (st === 'Chờ xử lý') return '#ff9800';
    if (st === 'Đang giao hàng') return '#17a2b8';
    if (st === 'Đã nhận hàng') return '#0d6efd';
    if (st === 'Hoàn thành') return '#28a745';
    return '#6c757d';
}

function renderTrackingBar(status) {
    var idx = getStatusIndex(status);

    if (idx === -1) {
        return `<div class="trackWrap"><span class="statusBadge" style="background:#dc3545">Đơn đã bị hủy</span></div>`;
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

    var orders = Array.isArray(currentUser.donhang) ? currentUser.donhang : [];

    // filter status
    if (__orderFilterStatus !== 'all') {
        if (__orderFilterStatus === 'Hủy') {
            orders = orders.filter(o => String(o.tinhTrang || '').toLowerCase().includes('hủy'));
        } else {
            orders = orders.filter(o => (o.tinhTrang || '') === __orderFilterStatus);
        }
    }

    // search by maDon
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
        var total = parseInt(dh.tongtien) || 0;
        var st = dh.tinhTrang || '';
        var badgeBg = statusBadgeColor(st);

        var spHTML = (dh.sp || []).map(s => {
            var p = null;
            try { p = timKiemTheoMa(getListProducts(), s.ma); } catch (e) {}
            var tenSP = p ? p.name : ("Sản phẩm #" + s.ma);

            var mauTxt = '';
            if (s.mau_sac) mauTxt = ` <span class="colorTag">(${s.mau_sac})</span>`;
            else if (s.variant_id) mauTxt = ` <span style="color:#777;font-size:13px;">(Variant #${s.variant_id})</span>`;

            var reviewLink = '';
            if ((st === 'Đã nhận hàng' || st === 'Hoàn thành') && p) {
                var linkName = p.name.split(' ').join('-');
                reviewLink = ` <a href="chitietsanpham.html?${linkName}" target="_blank" style="color:#288ad6; font-size:13px; text-decoration:underline;">
                                <i class="fa fa-star-o"></i> Viết đánh giá</a>`;
            }

            return `<div class="itemLine">- ${tenSP}${mauTxt} <b>x${s.soluong}</b>${reviewLink}</div>`;
        }).join('');

        var actionBtn = '';
        if (st === 'Đang giao hàng') {
            actionBtn = `<button class="uBtn uBtnSuccess" onclick="userNhanHang(${maDon})">Đã nhận được hàng</button>`;
        } else if (st === 'Chờ xử lý') {
            actionBtn = `<button class="uBtn uBtnDanger" onclick="userHuyDon(${maDon})">Hủy đơn</button>`;
        }

        html += `
            <div class="orderItem">
                <div class="orderTop">
                    <div>
                        <div class="orderCode">Đơn #${maDon}</div>
                        <div class="orderDate">${new Date(dh.ngaymua).toLocaleString()}</div>
                    </div>
                    <div>
                        <span class="statusBadge" style="background:${badgeBg}">${st}</span>
                    </div>
                </div>

                ${renderTrackingBar(st)}

                <div class="orderBody" style="margin-top:10px;">
                    <div>${spHTML}</div>

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