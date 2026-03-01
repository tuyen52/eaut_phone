// js/pages/user.js

var currentUser = null;

window.onload = function () {
    khoiTao(); // init.js
    currentUser = getCurrentUser();

    if (!currentUser) {
        document.querySelector('.infoUser').innerHTML = '<h2 style="text-align:center; color:red; margin: 50px;">Bạn chưa đăng nhập!</h2>';
        return;
    }

    renderUserInfo();
    fetchOrderHistory(); // lấy đơn hàng mới nhất từ DB
};

// ======================= 1. THÔNG TIN USER =======================

function renderUserInfo() {
    var u = currentUser;
    document.querySelector('.infoUser').innerHTML = `
    <h3><i class="fa fa-user-circle"></i> Hồ sơ của bạn</h3>
    <table class="info-table">
        <tr>
            <td style="font-weight:bold; width: 150px;">Tên đăng nhập:</td>
            <td>
                <input type="text" value="${u.username}" disabled 
                       style="background-color: #eee; color: #555; cursor: not-allowed; border: 1px solid #ccc; font-weight: bold;">
                <i class="fa fa-lock" style="margin-left: 5px; color: #777;" title="Tên đăng nhập không thể thay đổi"></i>
            </td>
            <td></td>
        </tr>
        <tr>
            <td style="font-weight:bold;">Họ tên:</td>
            <td><input type="text" id="infoName" value="${u.ho} ${u.ten}"></td>
            <td><button onclick="updateInfo()"><i class="fa fa-pencil"></i> Cập nhật</button></td>
        </tr>
        <tr>
            <td style="font-weight:bold;">Email:</td>
            <td>
                <input type="text" value="${u.email}" disabled style="background-color: #f9f9f9; border: 1px solid #eee;">
            </td>
            <td></td>
        </tr>
        <tr>
            <td style="font-weight:bold;">Mật khẩu:</td>
            <td>**************</td>
            <td><button onclick="document.getElementById('passForm').style.display='block'"><i class="fa fa-key"></i> Đổi mật khẩu</button></td>
        </tr>
    </table>

    <div id="passForm" style="display:none; margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 15px;">
        <h4 style="margin-bottom: 10px;">Đổi mật khẩu</h4>
        <div style="display: flex; gap: 10px; align-items: center;">
            <input type="password" id="oldPass" placeholder="Mật khẩu cũ" style="padding: 5px;">
            <input type="password" id="newPass" placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" style="padding: 5px;">
            <button onclick="changePass()" style="background: #28a745; color: white; border: none; padding: 6px 12px; cursor: pointer;">Xác nhận</button>
            <button onclick="document.getElementById('passForm').style.display='none'" style="background: #dc3545; color: white; border: none; padding: 6px 12px; cursor: pointer;">Hủy</button>
        </div>
    </div>`;
}

function updateInfo() {
    var fullname = document.getElementById('infoName').value.trim().split(' ');
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
                location.reload();
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

                document.getElementById('passForm').style.display = 'none';
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

// ======================= 2. ĐƠN HÀNG (CÓ MÀU/VARIANT + TRACKING) =======================

function fetchOrderHistory() {
    var container = document.querySelector('.listDonHang');
    container.innerHTML = '<h3>Lịch sử đơn hàng</h3><p style="text-align:center; padding: 20px;"><i class="fa fa-spinner fa-spin"></i> Đang tải dữ liệu...</p>';

    fetch('php/get-order-history.php?username=' + encodeURIComponent(currentUser.username))
        .then(res => res.json())
        .then(data => {
            currentUser.donhang = data;
            setCurrentUser(currentUser);
            renderOrderHistory();
        })
        .catch(err => {
            console.error(err);
            container.innerHTML = '<h3 style="color:red; text-align:center">Lỗi kết nối server khi tải đơn hàng!</h3>';
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

function renderTrackingBar(status) {
    var idx = getStatusIndex(status);

    if (idx === -1) {
        return `<div style="margin-top:8px; color:#dc3545; font-weight:bold;">Đơn đã bị hủy</div>`;
    }

    var steps = ['Chờ xử lý', 'Đang giao', 'Đã nhận', 'Hoàn thành'];
    var html = `<div style="display:flex; gap:10px; align-items:center; margin-top:10px; flex-wrap:wrap;">`;

    steps.forEach((label, i) => {
        var done = i <= idx;
        html += `
            <div style="display:flex; align-items:center; gap:6px;">
                <span style="width:14px;height:14px;border-radius:50%;border:1px solid #ccc;background:${done ? '#28a745' : '#fff'};display:inline-block;"></span>
                <span style="font-size:12px; ${done ? 'font-weight:bold;color:#28a745' : 'color:#777'}">${label}</span>
            </div>
            ${i < steps.length - 1 ? '<span style="color:#ccc">—</span>' : ''}
        `;
    });

    html += `</div>`;
    return html;
}

function renderOrderHistory() {
    var container = document.querySelector('.listDonHang');
    container.innerHTML = '<h3>Lịch sử đơn hàng</h3>';

    if (!currentUser.donhang || currentUser.donhang.length === 0) {
        container.innerHTML += '<p style="text-align:center; padding: 20px;">Bạn chưa có đơn hàng nào.</p>';
        return;
    }

    var orders = currentUser.donhang;

    orders.forEach(dh => {
        var spHTML = (dh.sp || []).map(s => {
            var p = timKiemTheoMa(getListProducts(), s.ma);
            var tenSP = p ? p.name : ("Sản phẩm #" + s.ma);

            // [MỚI] Hiện màu/variant trong lịch sử đơn
            var mauTxt = '';
            if (s.mau_sac) mauTxt = ` <span style="color:#0056b3;">(${s.mau_sac})</span>`;
            else if (s.variant_id) mauTxt = ` <span style="color:#777;">(Variant #${s.variant_id})</span>`;

            var reviewLink = '';
            if ((dh.tinhTrang === 'Đã nhận hàng' || dh.tinhTrang === 'Hoàn thành') && p) {
                var linkName = p.name.split(' ').join('-');
                reviewLink = `<a href="chitietsanpham.html?${linkName}" target="_blank" style="color:#288ad6; font-size:13px; text-decoration:underline; margin-left:10px;"><i class="fa fa-star-o"></i> Viết đánh giá</a>`;
            }

            return `<p style="margin:5px 0;">- ${tenSP}${mauTxt} [x${s.soluong}] ${reviewLink}</p>`;
        }).join('');

        var total = parseInt(dh.tongtien) || 0;

        var actionBtn = '';
        var maDon = dh.maDon;

        if (dh.tinhTrang === 'Đang giao hàng') {
            actionBtn = `<button class="btn-user-action confirm" onclick="userNhanHang(${maDon})">Đã nhận được hàng</button>`;
        } else if (dh.tinhTrang === 'Chờ xử lý') {
            actionBtn = `<button class="btn-user-action cancel" onclick="userHuyDon(${maDon})">Hủy đơn hàng</button>`;
        }

        var statusColor = '#007bff';
        if (String(dh.tinhTrang || '').includes('Hủy')) statusColor = '#dc3545';
        if (dh.tinhTrang === 'Hoàn thành' || dh.tinhTrang === 'Đã nhận hàng') statusColor = '#28a745';

        container.innerHTML += `
        <div class="donhang-item">
            <div style="display:flex; justify-content:space-between; border-bottom:1px dashed #eee; padding-bottom:10px; margin-bottom:10px;">
                <b>Mã đơn: #${maDon}</b>
                <span style="color:#888">${new Date(dh.ngaymua).toLocaleString()}</span>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:15px; flex-wrap:wrap;">
                <div style="flex: 2; min-width: 260px;">${spHTML}</div>
                <div style="flex: 1; min-width: 220px; text-align:right; padding-left:15px; border-left: 1px solid #f0f0f0">
                    <p>Tổng tiền: <strong style="color:#d0021b; font-size:18px;">${numToString(total)}₫</strong></p>
                    <p style="margin: 10px 0;">Trạng thái: <b style="color:${statusColor}">${dh.tinhTrang}</b></p>
                    ${renderTrackingBar(dh.tinhTrang)}
                    <div style="margin-top:10px;">${actionBtn}</div>
                </div>
            </div>
        </div>`;
    });
}

// ======================= 3. UPDATE TRẠNG THÁI ĐƠN (USER) =======================

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