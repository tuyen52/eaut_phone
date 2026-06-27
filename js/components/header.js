// js/components/header.js

function addTopNav() {
    document.write(`
	<div class="top-nav group">
        <section>
            <div class="social-top-nav">
                <a href="#" class="fa fa-facebook"></a>
                <a href="#" class="fa fa-twitter"></a>
                <a href="#" class="fa fa-google"></a>
                <a href="#" class="fa fa-youtube"></a>
            </div>
            <ul class="top-nav-quicklink flexContain">
                <li><a href="index.html"><i class="fa fa-home"></i> Trang chủ</a></li>
                <li><a href="tintuc.html"><i class="fa fa-newspaper-o"></i> Tin tức</a></li>
                <li><a href="gioithieu.html"><i class="fa fa-info-circle"></i> Giới thiệu</a></li>
                <li><a href="trungtambaohanh.html"><i class="fa fa-wrench"></i> Bảo hành</a></li>
                <li><a href="lienhe.html"><i class="fa fa-phone"></i> Liên hệ</a></li>
            </ul>
        </section>
    </div>`);
}

function addHeader() {
    document.write(`
	<div class="header group">
        <div class="logo">
            <a href="index.html">
                <img src="img/logo.jpg" alt="Trang chủ Smartphone Store" title="Trang chủ Smartphone Store">
            </a>
        </div>
        <div class="content">
            <div class="search-header">
                <form class="input-search" action="index.html">
                    <div class="autocomplete">
                        <input id="search-box" name="search" autocomplete="off" type="text" placeholder="Nhập từ khóa tìm kiếm...">
                        <button type="submit">
                            <i class="fa fa-search"></i> Tìm kiếm
                        </button>
                    </div>
                </form>
                
                <div class="tags"><strong>Từ khóa: </strong></div>
            </div>
            
            <div class="tools-member">
                <div class="member">
                    <a href="javascript:checkTaiKhoan()">
                        <i class="fa fa-user"></i>
                        <span class="member-label">Tài khoản</span>
                    </a>
                    <div class="menuMember hide">
                        <div class="menuMember-head">
                            <div class="menuMember-avatar" id="menuMemberAvatar">U</div>
                            <div class="menuMember-meta">
                                <strong id="menuMemberName">Khách</strong>
                                <span>Quản lý tài khoản của bạn</span>
                            </div>
                        </div>
                        <nav class="menuMember-nav">
                            <a href="nguoidung.html" class="menuMember-link">
                                <i class="fa fa-user-o"></i>
                                <span>Thông tin tài khoản</span>
                                <i class="fa fa-angle-right menuMember-arrow"></i>
                            </a>
                            <a href="donhang-cua-toi.html" class="menuMember-link">
                                <i class="fa fa-file-text-o"></i>
                                <span>Đơn hàng của tôi</span>
                                <i class="fa fa-angle-right menuMember-arrow"></i>
                            </a>
                        </nav>
                        <div class="menuMember-foot">
                            <a href="javascript:logOut();" class="menuMember-link menuMember-logout">
                                <i class="fa fa-sign-out"></i>
                                <span>Đăng xuất</span>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="cart">
                    <a href="giohang.html">
                        <i class="fa fa-shopping-cart"></i>
                        <span>Giỏ hàng</span>
                        <span class="cart-number">0</span>
                    </a>
                </div>
            </div>
        </div>
    </div>`);
}
function addContainTaiKhoan() {
    document.write(`
	<div class="containTaikhoan">
        <button type="button" class="auth-close" onclick="showTaiKhoan(false);" aria-label="Đóng">&times;</button>
        <div class="taikhoan">
            <div class="auth-brand">
                <div class="auth-brand__icon"><i class="fa fa-mobile"></i></div>
                <div class="auth-brand__text">
                    <h1>EAUT PHONE</h1>
                    <p>Đăng nhập hoặc tạo tài khoản để mua sắm</p>
                </div>
            </div>
            <ul class="tab-group">
                <li class="tab active"><a href="#login">Đăng nhập</a></li>
                <li class="tab"><a href="#signup">Đăng ký</a></li>
            </ul>
            <div class="tab-content">
                <div id="login" class="auth-panel">
                    <h2>Chào mừng trở lại</h2>
                    <p class="auth-subtitle">Đăng nhập để thanh toán và theo dõi đơn hàng.</p>
                    <form class="auth-form" onsubmit="return logIn(this);">
                        <div class="field-wrap">
                            <label>Tên đăng nhập<span class="req">*</span></label>
                            <input name='username' type="text" required autocomplete="username" placeholder="Nhập tên đăng nhập" />
                        </div>
                        <div class="field-wrap">
                            <label>Mật khẩu<span class="req">*</span></label>
                            <input name="pass" type="password" required autocomplete="current-password" placeholder="Nhập mật khẩu" />
                        </div>
                        <div class="auth-meta-row">
                            <p class="forgot"><a href="forgot-pass.html">Quên mật khẩu?</a></p>
                        </div>
                        <button type="submit" class="button button-block">Đăng nhập</button>
                    </form>
                </div>
                <div id="signup" class="auth-panel" style="display: none;">
                    <h2>Tạo tài khoản</h2>
                    <p class="auth-subtitle">Đăng ký để lưu giỏ hàng và quản lý đơn hàng.</p>
                    <form class="auth-form" onsubmit="return signUp(this);">
                        <div class="top-row">
                            <div class="field-wrap">
                                <label>Họ<span class="req">*</span></label>
                                <input name="ho" type="text" required autocomplete="given-name" placeholder="Họ" />
                            </div>
                            <div class="field-wrap">
                                <label>Tên<span class="req">*</span></label>
                                <input name="ten" type="text" required autocomplete="family-name" placeholder="Tên" />
                            </div>
                        </div>
                        <div class="field-wrap">
                            <label>Email<span class="req">*</span></label>
                            <input name="email" type="email" required autocomplete="email" placeholder="email@example.com" />
                        </div>
                        <div class="field-wrap">
                            <label>Tên đăng nhập<span class="req">*</span></label>
                            <input name="newUser" type="text" required autocomplete="username" placeholder="Chọn tên đăng nhập" />
                        </div>
                        <div class="field-wrap">
                            <label>Mật khẩu<span class="req">*</span></label>
                            <input name="newPass" type="password" required autocomplete="new-password" placeholder="Tối thiểu 6 ký tự" />
                        </div>
                        <button type="submit" class="button button-block button-signup">Tạo tài khoản</button>
                    </form>
                </div>
            </div>
        </div>
    </div>`);
}
function getMenuMemberInitials(u) {
    if (!u) return 'U';
    var name = ((u.ho || '') + ' ' + (u.ten || '')).trim();
    if (name) {
        var parts = name.split(' ').filter(Boolean);
        var a = parts[0] ? parts[0][0] : 'U';
        var b = parts.length > 1 ? parts[parts.length - 1][0] : '';
        return (a + b).toUpperCase();
    }
    return (u.username || 'U').slice(0, 1).toUpperCase();
}

function capNhat_ThongTin_CurrentUser() {
    var u = getCurrentUser();
    var cartNumber = document.querySelector('.cart-number');
    var memberLabel = document.querySelector('.member-label');
    var menuMember = document.querySelector('.menuMember');
    var menuAvatar = document.getElementById('menuMemberAvatar');
    var menuName = document.getElementById('menuMemberName');

    if (u) {
        var totalQty = 0;
        if (u.products) {
            for (var p of u.products) totalQty += (p.soluong || 0);
        }
        if (cartNumber) cartNumber.innerHTML = totalQty;

        if (memberLabel) memberLabel.textContent = u.username;
        if (menuAvatar) menuAvatar.textContent = getMenuMemberInitials(u);
        if (menuName) menuName.textContent = u.username;
        if (menuMember) menuMember.classList.remove('hide');
    } else {
        if (cartNumber) cartNumber.innerHTML = '0';
        if (memberLabel) memberLabel.textContent = 'Tài khoản';
        if (menuMember) menuMember.classList.add('hide');
    }
}

function animateCartNumber() {
    var cn = document.querySelector('.cart-number');
    if (cn) {
        cn.style.transform = 'scale(1.5)';
        cn.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
        cn.style.color = 'white';
        setTimeout(() => {
            cn.style.transform = 'scale(1)';
            cn.style.backgroundColor = 'transparent';
            cn.style.color = 'red';
        }, 500);
    }
}

function setupEventTaiKhoan() {
    var taikhoan = document.getElementsByClassName('taikhoan')[0];
    if (!taikhoan) return;
    
    var inputs = taikhoan.getElementsByTagName('input');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('blur', function() {
            if (this.value === '') this.previousElementSibling.classList.remove('active', 'highlight');
            else this.previousElementSibling.classList.remove('highlight');
        });
        inputs[i].addEventListener('focus', function() {
            this.previousElementSibling.classList.add('active', 'highlight');
        });
    }

    var tabs = taikhoan.querySelectorAll('.tab-group .tab a');
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            var parent = this.parentElement;
            parent.classList.add('active');
            var siblings = parent.parentElement.children;
            for(var sib of siblings) {
                if(sib !== parent) sib.classList.remove('active');
            }

            var target = this.getAttribute('href');
            document.querySelector('.tab-content > div').style.display = 'none';
            document.querySelector('.tab-content > div:nth-child(2)').style.display = 'none';
            document.querySelector(target).style.display = 'block';
        });
    });
}