// js/pages/user-profile.js

var currentUser = null;

window.onload = function () {
    khoiTao();
    currentUser = getCurrentUser();

    if (!currentUser) {
        document.querySelector('.infoUser').innerHTML = `
            <div class="profileEmpty">
                <div class="profileEmpty-icon"><i class="fa fa-user-circle"></i></div>
                <h2>Bạn chưa đăng nhập</h2>
                <p>Đăng nhập để xem và cập nhật thông tin tài khoản</p>
                <button type="button" class="uBtn uBtnPrimary" onclick="checkTaiKhoan()">
                    <i class="fa fa-sign-in"></i> Đăng nhập ngay
                </button>
            </div>`;
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
        <div class="profileHero">
            <div class="profileHero-content">
                <div class="avatarCircle">${getInitials(u)}</div>
                <div class="profileMeta">
                    <div class="uName">${escapeHtml(u.username)}</div>
                    <div class="uSub">${escapeHtml(u.email || '')}</div>
                </div>
            </div>
        </div>

        <div class="profileSection">
            <h3 class="profileSection-title">Thông tin cá nhân</h3>
            <div class="profileFields">
                <div class="profileField">
                    <label for="infoUsername">Tên đăng nhập</label>
                    <input class="uInput" id="infoUsername" type="text" value="${escapeHtml(u.username)}" disabled>
                </div>
                <div class="profileField">
                    <label for="infoName">Họ tên</label>
                    <div class="profileFieldRow">
                        <input class="uInput" type="text" id="infoName" value="${escapeHtml(((u.ho || '') + ' ' + (u.ten || '')).trim())}" placeholder="Nhập họ và tên">
                        <button type="button" class="uBtn uBtnPrimary" onclick="updateInfo()">Cập nhật</button>
                    </div>
                </div>
                <div class="profileField">
                    <label for="infoEmail">Email</label>
                    <input class="uInput" id="infoEmail" type="text" value="${escapeHtml(u.email || '')}" disabled>
                </div>
            </div>
        </div>

        <div class="profileSection">
            <h3 class="profileSection-title">Bảo mật</h3>
            <button type="button" class="uBtn uBtnOutline" onclick="togglePassForm(true)">Đổi mật khẩu</button>
            <div id="passForm" style="display:none;">
                <div class="profileField">
                    <label for="oldPass">Mật khẩu cũ</label>
                    <input class="uInput" type="password" id="oldPass" placeholder="Nhập mật khẩu hiện tại">
                </div>
                <div class="profileField">
                    <label for="newPass">Mật khẩu mới</label>
                    <input class="uInput" type="password" id="newPass" placeholder="Tối thiểu 6 ký tự">
                </div>
                <div class="profilePassActions">
                    <button type="button" class="uBtn uBtnDanger" onclick="togglePassForm(false)">Hủy</button>
                    <button type="button" class="uBtn uBtnSuccess" onclick="changePass()">Xác nhận</button>
                </div>
            </div>
        </div>

        <div class="profileQuickLink">
            <a href="donhang-cua-toi.html">Đơn hàng của tôi <i class="fa fa-angle-right"></i></a>
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
