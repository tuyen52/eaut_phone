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
            <div class="search-header" style="position: relative; left: 162px; top: 1px;">
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
                        <i class="fa fa-user"></i> Tài khoản
                    </a>
                    <div class="menuMember hide">
                        <a href="nguoidung.html">Trang người dùng</a>
                        <a href="javascript:logOut();">Đăng xuất</a>
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
        <span class="close" onclick="showTaiKhoan(false);">&times;</span>
        <div class="taikhoan">
            <ul class="tab-group">
                <li class="tab active"><a href="#login">Đăng nhập</a></li>
                <li class="tab"><a href="#signup">Đăng kí</a></li>
            </ul>
            <div class="tab-content">
                <div id="login">
                    <h1>Chào mừng bạn trở lại!</h1>
                    <form onsubmit="return logIn(this);">
                        <div class="field-wrap">
                            <label>Tên đăng nhập<span class="req">*</span></label>
                            <input name='username' type="text" required autocomplete="off" />
                        </div>
                        <div class="field-wrap">
                            <label>Mật khẩu<span class="req">*</span></label>
                            <input name="pass" type="password" required autocomplete="off" />
                        </div>
                        
                        <p class="forgot"><a href="forgot-pass.html" style="color:#288ad6;">Quên mật khẩu?</a></p>
                        
                        <button type="submit" class="button button-block">Đăng nhập</button>
                    </form>
                </div>
                <div id="signup" style="display: none;">
                    <h1>Đăng kí miễn phí</h1>
                    <form onsubmit="return signUp(this);">
                        <div class="top-row">
                            <div class="field-wrap">
                                <label>Họ<span class="req">*</span></label>
                                <input name="ho" type="text" required autocomplete="off" />
                            </div>
                            <div class="field-wrap">
                                <label>Tên<span class="req">*</span></label>
                                <input name="ten" type="text" required autocomplete="off" />
                            </div>
                        </div>
                        <div class="field-wrap">
                            <label>Địa chỉ Email<span class="req">*</span></label>
                            <input name="email" type="email" required autocomplete="off" />
                        </div>
                        <div class="field-wrap">
                            <label>Tên đăng nhập<span class="req">*</span></label>
                            <input name="newUser" type="text" required autocomplete="off" />
                        </div>
                        <div class="field-wrap">
                            <label>Mật khẩu<span class="req">*</span></label>
                            <input name="newPass" type="password" required autocomplete="off" />
                        </div>
                        <button type="submit" class="button button-block">Tạo tài khoản</button>
                    </form>
                </div>
            </div>
        </div>
    </div>`);
}
function capNhat_ThongTin_CurrentUser() {
    var u = getCurrentUser();
    var cartNumber = document.querySelector('.cart-number');
    var memberLink = document.querySelector('.member > a');
    var menuMember = document.querySelector('.menuMember');

    if (u) {
        var totalQty = 0;
        if (u.products) {
            for (var p of u.products) totalQty += (p.soluong || 0);
        }
        if (cartNumber) cartNumber.innerHTML = totalQty;

        if (memberLink && memberLink.childNodes[2]) {
            memberLink.childNodes[2].nodeValue = ' ' + u.username;
        }
        if (menuMember) menuMember.classList.remove('hide');
    } else {
        if (cartNumber) cartNumber.innerHTML = '0';
        if (memberLink && memberLink.childNodes[2]) {
            memberLink.childNodes[2].nodeValue = ' Tài khoản';
        }
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