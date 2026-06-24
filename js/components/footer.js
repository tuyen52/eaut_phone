// js/components/footer.js

function loadEautChatbotAssets() {
    if (window.__eautChatbotAssetsLoaded) return;
    var path = (window.location.pathname || '').toLowerCase();
    if (path.indexOf('admin.html') !== -1) return;

    window.__eautChatbotAssetsLoaded = true;
    document.write('<link rel="stylesheet" href="css/chatbot.css">');
    document.write('<script src="js/components/chatbot.js"><\/script>');
}

function addFooter() {
    loadEautChatbotAssets();
    document.write(`
    <div id="alert" style="opacity: 0; z-index: -1;">
        <span id="closebtn">&otimes;</span>
    </div>

    <footer class="site-footer">
        <div class="site-footer__inner">
            <div class="site-footer__brand">
                <a class="site-footer__logo" href="index.html">EAUT PHONE</a>
                <p class="site-footer__desc">Hệ thống mua sắm điện thoại chính hãng, giá tốt, hỗ trợ tận tâm và giao hàng nhanh trên toàn quốc.</p>
                <div class="site-footer__badges">
                    <span><i class="fa fa-shield"></i> Chính hãng</span>
                    <span><i class="fa fa-truck"></i> Giao nhanh</span>
                    <span><i class="fa fa-refresh"></i> Đổi trả</span>
                </div>
            </div>

            <div class="site-footer__links">
                <h4>Khám phá</h4>
                <a href="index.html"><i class="fa fa-home"></i> Trang chủ</a>
                <a href="gioithieu.html"><i class="fa fa-info-circle"></i> Giới thiệu</a>
                <a href="lienhe.html"><i class="fa fa-phone"></i> Liên hệ</a>
                <a href="trungtambaohanh.html"><i class="fa fa-wrench"></i> Bảo hành</a>
            </div>

            <div class="site-footer__links">
                <h4>Hỗ trợ</h4>
                <a href="nguoidung.html"><i class="fa fa-user"></i> Tài khoản của tôi</a>
                <a href="giohang.html"><i class="fa fa-shopping-cart"></i> Giỏ hàng</a>
                <a href="javascript:void(0)"><i class="fa fa-credit-card"></i> Thanh toán an toàn</a>
                <a href="tel:12345678"><i class="fa fa-headphones"></i> 12345678</a>
            </div>

            <div class="site-footer__contact">
                <h4>Thông tin liên hệ</h4>
                <p><i class="fa fa-map-marker"></i> EAUT PHONE - Website thực hành</p>
                <p><i class="fa fa-envelope"></i> support@eautphone.vn</p>
                <p><i class="fa fa-clock-o"></i> Hỗ trợ 24/7</p>
            </div>
        </div>

        <div class="copy-right">
            <p>
                <a href="index.html">EAUT PHONE</a>
                <span>- All rights reserved © 2026 - Designed by</span>
                <span style="color: #fff; font-weight: 700">NGUYEN DANG TUYEN</span>
            </p>
        </div>
    </footer>`);
}

function addPlc() {
    document.write(`
    <div class="plc">
        <section>
            <ul class="flexContain">
                <li><i class="fa fa-truck"></i> Giao hàng hỏa tốc trong 1 giờ</li>
                <li><i class="fa fa-credit-card"></i> Thanh toán linh hoạt: tiền mặt, visa / master, trả góp</li>
                <li><i class="fa fa-home"></i> Trải nghiệm sản phẩm tại nhà</li>
                <li><i class="fa fa-refresh"></i> Lỗi đổi tại nhà trong 1 ngày</li>
                <li><i class="fa fa-phone"></i> Hotline: <a href="tel:12345678">12345678</a></li>
            </ul>
        </section>
    </div>`);
}

// --- Hộp thông báo (Alert Box) ---
function addAlertBox(text, bgcolor, textcolor, time) {
    var al = document.getElementById('alert');
    if (!al) return;

    if (al.firstChild && al.firstChild.nodeType === 3) al.firstChild.nodeValue = text;
    else al.insertBefore(document.createTextNode(text), al.firstChild);

    al.style.backgroundColor = bgcolor;
    al.style.color = textcolor || 'white';
    al.style.opacity = 1;
    al.style.zIndex = 200;

    if (al.timer) clearTimeout(al.timer);

    if (time) {
        al.timer = setTimeout(function () {
            al.style.opacity = 0;
            al.style.zIndex = -1;
        }, time);
    }
}

function addEventCloseAlertButton() {
    var closeBtn = document.getElementById('closebtn');
    if(closeBtn) {
        closeBtn.onclick = function() {
            var alertBox = this.parentElement;
            alertBox.style.opacity = 0;
            alertBox.style.zIndex = -1;
        }
    }
}