// js/pages/user-profile.js

var currentUser = null;

window.onload = function () {
    khoiTao();
    currentUser = getCurrentUser();

    if (!currentUser) {
        document.querySelector('.infoUser').innerHTML =
            '<h2 style="text-align:center; color:red; margin: 20px 0;">Bạn chưa đăng nhập!</h2>';
        return;
    }

    renderUserInfo();
};

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

        <div class="uDivider"></div>
        <p style="margin:0; font-size:14px; color:#6b7280;">
            <i class="fa fa-file-text-o"></i>
            <a href="donhang-cua-toi.html" style="color:#0d6efd; text-decoration:underline;">Quản lý đơn hàng của tôi</a>
        </p>
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
