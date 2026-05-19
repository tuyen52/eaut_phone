// js/components/footer.js

function addFooter() {
    document.write(`
    <div id="alert" style="opacity: 0; z-index: -1;"> 
        <span id="closebtn">&otimes;</span> 
    </div>
    <div class="copy-right">
        <p>
            <a href="index.html">EAUT PHONE</a> - All rights reserved © 2026 - Designed by
            <span style="color: #eee; font-weight: bold">NGUYEN DANG TUYEN</span>
        </p>
    </div>`);
}

function addPlc() {
    document.write(`
    <div class="plc">
        <section>
            <ul class="flexContain">
                <li>Giao hàng hỏa tốc trong 1 giờ</li>
                <li>Thanh toán linh hoạt: tiền mặt, visa / master, trả góp</li>
                <li>Trải nghiệm sản phẩm tại nhà</li>
                <li>Lỗi đổi tại nhà trong 1 ngày</li>
                <li>Hỗ trợ suốt thời gian sử dụng.<br>Hotline: <a href="tel:12345678" style="color: #288ad6;">12345678</a></li>
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