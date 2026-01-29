// js/core/auth.js

// --- LOGIC ĐĂNG NHẬP (GỌI API) ---
function logIn(form) {
    var name = form.username.value.trim();
    var pass = form.pass.value.trim();

    if (!name || !pass) {
        alert('Vui lòng nhập tên đăng nhập và mật khẩu.');
        return false;
    }

    // Gửi dữ liệu sang PHP
    fetch('php/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, pass: pass })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === true) {
            alert(data.message);
            
            // Lưu thông tin user vào LocalStorage để các trang khác biết đã đăng nhập
            // (Dữ liệu này giờ đây lấy từ Database thật)
            setCurrentUser(data.user);

            // Kiểm tra quyền Admin
            if (data.user.role === 'admin') {
                window.localStorage.setItem('admin', JSON.stringify(data.user));
                window.location.href = 'admin.html';
            } else {
                showTaiKhoan(false);
                location.reload();
            }
        } else {
            alert(data.message); // Sai mật khẩu hoặc bị khóa
        }
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra khi kết nối Server.');
    });

    return false; // Chặn form load lại trang
}

// --- LOGIC ĐĂNG KÝ (GỌI API) ---
function signUp(form) {
    var ho = form.ho.value.trim();
    var ten = form.ten.value.trim();
    var email = form.email.value.trim();
    var username = form.newUser.value.trim();
    var pass = form.newPass.value.trim();

    if (!ho || !ten || !email || !username || !pass) {
        alert('Vui lòng điền đầy đủ thông tin.');
        return false;
    }
    if (pass.length < 6) {
        alert('Mật khẩu phải tối thiểu 6 ký tự.');
        return false;
    }

    fetch('php\/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ho: ho, ten: ten, email: email, username: username, pass: pass })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === true) {
            alert(data.message);
            // Tự động đăng nhập luôn hoặc bắt người dùng đăng nhập lại
            // Ở đây ta cho reload để người dùng tự đăng nhập
            location.reload();
        } else {
            alert(data.message); // Lỗi trùng tên hoặc lỗi khác
        }
    })
    .catch(error => {
        console.error('Lỗi:', error);
    });

    return false;
}

// --- CÁC HÀM HỖ TRỢ CŨ (GIỮ NGUYÊN) ---
function logOut() {
    if(window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        window.localStorage.removeItem('CurrentUser');
        window.localStorage.removeItem('admin');
        location.reload();
    }
}

function checkTaiKhoan() {
    if (!getCurrentUser()) {
        showTaiKhoan(true);
    }
}

function showTaiKhoan(show) {
    var div = document.getElementsByClassName('containTaikhoan')[0];
    if(div) div.style.transform = (show ? "scale(1)" : "scale(0)");
}