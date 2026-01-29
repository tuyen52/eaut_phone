// js/pages/cart.js

var currentCart = [];

window.onload = function () {
    khoiTao(); // core/init.js

    var currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Bạn chưa đăng nhập!');
        // Chuyển về trang chủ hoặc hiện form login tùy ý
        return;
    }
    currentCart = currentUser.products || [];
    renderCart();
}

// =============================================================
// 1. QUẢN LÝ HIỂN THỊ GIỎ HÀNG
// =============================================================

function renderCart() {
    var table = document.querySelector('.listSanPham');
    var html = `
    <tr>
        <th>Sản phẩm</th>
        <th>Giá</th>
        <th>Số lượng</th>
        <th>Thành tiền</th>
        <th>Xóa</th>
    </tr>`;

    if (currentCart.length === 0) {
        html += `<tr><td colspan="5" style="text-align:center; padding: 20px;">Giỏ hàng trống</td></tr>`;
        document.querySelector('.listSanPham').innerHTML = html;
        return;
    }

    var totalBill = 0;
    currentCart.forEach((item, index) => {
        var p = timKiemTheoMa(getListProducts(), item.ma);
        if(!p) return; 

        var price = parseInt(p.price.split('.').join(''));
        if(p.promo.name == 'giareonline') price = parseInt(p.promo.value.split('.').join(''));

        var thanhTien = price * item.soluong;
        totalBill += thanhTien;

        html += `
        <tr>
            <td style="display:flex; align-items:center; text-align:left; padding-left:10px;">
                <img src="${p.img}" style="width:50px; margin-right:10px;">
                <a href="chitietsanpham.html?${p.name.split(' ').join('-')}">${p.name}</a>
            </td>
            <td>${numToString(price)}₫</td>
            <td>
                <div class="buttons_added">
                    <input class="minus is-form" type="button" value="-" onclick="updateQty(${index}, -1)">
                    <input aria-label="quantity" class="input-qty" max="${p.inventory}" min="1" type="number" value="${item.soluong}" disabled>
                    <input class="plus is-form" type="button" value="+" onclick="updateQty(${index}, 1)">
                </div>
                <p style="font-size:12px; color:#777; margin-top:5px;">(Kho: ${p.inventory})</p>
            </td>
            <td>${numToString(thanhTien)}₫</td>
            <td><i class="fa fa-trash" onclick="removeItem(${index})"></i></td>
        </tr>`;
    });

    html += `
    <tr>
        <td colspan="3" style="text-align:right; font-weight:bold; font-size:18px;">Tổng tiền:</td>
        <td style="color:red; font-weight:bold; font-size:18px;">${numToString(totalBill)}₫</td>
        <td>
            <button class="btn-checkout" onclick="openPaymentModal()">Thanh toán</button>
        </td>
    </tr>`;

    table.innerHTML = html;
}

function updateQty(index, change) {
    var p = timKiemTheoMa(getListProducts(), currentCart[index].ma);
    var newQty = currentCart[index].soluong + change;

    // Check tồn kho phía Client (UX)
    if (newQty > parseInt(p.inventory)) {
        alert('Số lượng vượt quá tồn kho hiện tại!');
        return;
    }
    if (newQty < 1) return;

    currentCart[index].soluong = newQty;
    saveCart();
    renderCart();
}

function removeItem(index) {
    if(confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
        currentCart.splice(index, 1);
        saveCart();
        renderCart();
        animateCartNumber(); // header.js
    }
}

function saveCart() {
    var user = getCurrentUser();
    user.products = currentCart;
    setCurrentUser(user);
    updateSingleUserInList(user);
    capNhat_ThongTin_CurrentUser(); // header.js
}

// =============================================================
// 2. LOGIC THANH TOÁN (MODAL, QR CODE, LOCATION)
// =============================================================

function openPaymentModal() {
    var user = getCurrentUser();
    if(currentCart.length === 0) {
        alert('Giỏ hàng trống!');
        return;
    }
    document.getElementById('paymentModal').style.display = 'block';
    
    // Auto fill thông tin
    document.getElementById('hoTen').value = (user.ho + ' ' + user.ten).trim();
    document.getElementById('soDienThoai').value = ''; 

    // Tính tổng tiền
    var total = 0;
    currentCart.forEach(item => {
        var p = timKiemTheoMa(getListProducts(), item.ma);
        if(p) {
            var price = stringToNum(p.price);
            if(p.promo.name == 'giareonline') price = stringToNum(p.promo.value);
            total += price * item.soluong;
        }
    });
    
    document.getElementById('paymentTotal').innerText = numToString(total) + "₫";

    // --- SINH MÃ VẬN ĐƠN (TRANSACTION CODE) ---
    // Cấu trúc: DH + NgàyTháng + SốNgẫuNhiên (VD: DH121299)
    var date = new Date();
    var day = String(date.getDate()).padStart(2, '0');
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var randomNum = Math.floor(Math.random() * 900) + 100; 
    var transCode = "DH" + day + month + randomNum;

    // Lưu mã này vào biến toàn cục window để dùng khi bấm nút "Đặt hàng"
    window.currentTransactionCode = transCode;

    // --- CẤU HÌNH QR CODE VIETQR ---
    var bankId = "MB"; // Ngân hàng (MB, VCB, TCB, ACB...)
    var accountNo = "1140160149732"; // <--- THAY SỐ TÀI KHOẢN CỦA BẠN VÀO ĐÂY
    var accountName = "NGUYEN DANG TUYEN"; // <--- THAY TÊN CHỦ TÀI KHOẢN VÀO ĐÂY
    
    // Nội dung chuyển khoản: EAUT [Mã Đơn]
    var content = "EAUT " + transCode; 
    
    // Tạo link ảnh QR
    var qrSrc = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.jpg?amount=${total}&addInfo=${content}&accountName=${accountName}`;
    
    var qrImg = document.getElementById('qrImage');
    if(qrImg) qrImg.src = qrSrc;
    
    var qrContent = document.getElementById('qrContent');
    if(qrContent) qrContent.innerText = content;
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

function togglePaymentMethod(method) {
    var qrDiv = document.getElementById('qrInfo');
    if (method === 'Banking') {
        qrDiv.style.display = 'block';
    } else {
        qrDiv.style.display = 'none';
    }
}

// --- TÍNH NĂNG ĐỊNH VỊ (LOCATION) ---
function getLocation() {
    var diaChiInput = document.getElementById('diaChi');
    
    if (navigator.geolocation) {
        diaChiInput.placeholder = "Đang lấy vị trí...";
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Trình duyệt không hỗ trợ định vị.");
    }
}

function showPosition(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var diaChiInput = document.getElementById('diaChi');

    // Dùng API Nominatim (OpenStreetMap) miễn phí
    var url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

    fetch(url)
    .then(response => response.json())
    .then(data => {
        if(data.display_name) {
            diaChiInput.value = data.display_name;
        } else {
            diaChiInput.value = "Tọa độ: " + lat + ", " + lon;
        }
    })
    .catch(error => {
        console.error(error);
        diaChiInput.value = "";
        diaChiInput.placeholder = "Không lấy được địa chỉ cụ thể.";
    });
}

function showError(error) {
    alert("Lỗi định vị: " + error.message);
}

// =============================================================
// 3. XỬ LÝ GỬI ĐƠN HÀNG (SUBMIT)
// =============================================================

function processPayment() {
    var user = getCurrentUser();
    var hoten = document.getElementById('hoTen').value.trim();
    var sdt = document.getElementById('soDienThoai').value.trim();
    var diachi = document.getElementById('diaChi').value.trim();
    var ptttInput = document.querySelector('input[name="paymentMethod"]:checked');
    var pttt = ptttInput ? ptttInput.value : 'COD';

    // --- 1. Validate Form (Kiểm tra dữ liệu) ---
    if (!hoten) { alert('Vui lòng nhập họ tên người nhận!'); return; }
    
    // Regex kiểm tra SĐT Việt Nam (10 số, đầu 0)
    var phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    if (!sdt || !phoneRegex.test(sdt)) { 
        alert('Số điện thoại không hợp lệ (Phải là 10 số)!'); 
        return; 
    }

    if (!diachi || diachi.length < 10) { 
        alert('Vui lòng nhập địa chỉ chi tiết (Số nhà, đường...)!'); 
        return; 
    }

    // --- 2. Logic "Giả lập" xác nhận chuyển khoản ---
    if (pttt === 'Banking') {
        var xacNhan = confirm("BẠN CÓ CHẮC CHẮN ĐÃ CHUYỂN KHOẢN CHƯA?\n\nHệ thống sẽ lưu mã giao dịch để Admin đối soát.\nNếu chưa chuyển tiền, đơn hàng sẽ bị hủy.");
        if (!xacNhan) return; // Nếu khách bấm Cancel thì dừng lại
    }

    // --- 3. Chuẩn bị dữ liệu gửi PHP ---
    var tongTien = 0;
    var listProducts = getListProducts();
    
    var danhSachSanPhamGuiDi = currentCart.map(item => {
        var p = listProducts.find(x => x.masp == item.ma);
        var price = 0;
        if(p) {
            price = parseInt(p.price.split('.').join(''));
            if(p.promo.name == 'giareonline') price = parseInt(p.promo.value.split('.').join(''));
        }
        tongTien += price * item.soluong;

        return {
            masp: item.ma,
            so_luong: item.soluong,
            gia: price 
        };
    });

    // Xử lý chuỗi phương thức thanh toán để lưu vào DB
    if(pttt === 'Banking') {
        var code = window.currentTransactionCode || "UNKNOWN";
        pttt = "Chuyển khoản (Mã GD: " + code + ")";
    } else {
        pttt = "Thanh toán khi nhận hàng (COD)";
    }

    var dataToSend = {
        username: user.username,
        tong_tien: tongTien,
        ho_ten: hoten,
        sdt: sdt,
        dia_chi: diachi,
        phuong_thuc: pttt,
        san_pham: danhSachSanPhamGuiDi
    };

    // --- 4. Gửi API ---
    fetch('php/thanhtoan.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status == true) {
            // Reset giỏ hàng
            user.products = [];
            currentCart = [];
            setCurrentUser(user); 
            updateSingleUserInList(user);
            capNhat_ThongTin_CurrentUser();

            alert("ĐẶT HÀNG THÀNH CÔNG!\n" + data.message); 
            
            closePaymentModal();
            renderCart(); 
            
            // Chuyển hướng sang trang quản lý đơn hàng
            window.location.href = 'nguoidung.html';
        } else {
            alert('Lỗi: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Lỗi kết nối Server!');
    });
}