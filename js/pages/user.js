// js/pages/user.js

var currentUser = null;

window.onload = function() {
    khoiTao(); // Hàm từ init.js
    currentUser = getCurrentUser();

    if(!currentUser) {
        document.querySelector('.infoUser').innerHTML = '<h2 style="text-align:center; color:red; margin: 50px;">Bạn chưa đăng nhập!</h2>';
        return;
    }

    renderUserInfo();
    
    // [QUAN TRỌNG] Gọi API lấy dữ liệu đơn hàng mới nhất từ Database
    fetchOrderHistory();
}

// ======================= 1. QUẢN LÝ THÔNG TIN USER (ĐÃ SỬA API & UI) =======================

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

// --- HÀM CẬP NHẬT THÔNG TIN (GỌI API PHP) ---
function updateInfo() {
    var fullname = document.getElementById('infoName').value.trim().split(' ');
    if(fullname.length < 1) { alert('Vui lòng nhập họ tên đầy đủ'); return; }
    
    // Tách họ và tên đơn giản (từ đầu tiên là họ, phần còn lại là tên)
    var hoMoi = fullname[0];
    var tenMoi = fullname.slice(1).join(' ');

    // Gọi API cập nhật lên Database
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
        if(data.status) {
            alert(data.message);
            
            // Cập nhật lại LocalStorage để hiển thị ngay mà không cần đăng nhập lại
            currentUser.ho = hoMoi;
            currentUser.ten = tenMoi;
            setCurrentUser(currentUser);
            
            // Tải lại trang để cập nhật giao diện
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

// --- HÀM ĐỔI MẬT KHẨU (GỌI API PHP) ---
function changePass() {
    var oldPass = document.getElementById('oldPass').value;
    var newPass = document.getElementById('newPass').value;
    
    if(!oldPass || !newPass) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
    }
    if(newPass.length < 6) {
        alert('Mật khẩu mới quá ngắn (tối thiểu 6 ký tự)!');
        return;
    }

    // Gọi API đổi mật khẩu
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
        if(data.status) {
            alert(data.message);
            
            // Cập nhật lại mật khẩu trong LocalStorage (để các tính năng client dùng nếu cần)
            if(currentUser.pass) currentUser.pass = newPass; 
            if(currentUser.password) currentUser.password = newPass; 
            
            setCurrentUser(currentUser);
            
            // Ẩn form và xóa trắng ô nhập
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

// ======================= 2. QUẢN LÝ ĐƠN HÀNG (DATABASE) =======================

// Hàm gọi API lấy danh sách đơn hàng của User hiện tại
function fetchOrderHistory() {
    var container = document.querySelector('.listDonHang');
    // Hiển thị loading trong lúc đợi Server trả lời
    container.innerHTML = '<h3>Lịch sử đơn hàng</h3><p style="text-align:center; padding: 20px;"><i class="fa fa-spinner fa-spin"></i> Đang tải dữ liệu...</p>';

    // Gọi file PHP chúng ta vừa tạo ở bước trước
    fetch('php/get-order-history.php?username=' + currentUser.username)
    .then(res => res.json())
    .then(data => {
        // Cập nhật dữ liệu mới nhất vào biến currentUser
        currentUser.donhang = data;
        
        // Lưu ngược lại LocalStorage để đồng bộ dữ liệu phiên làm việc
        setCurrentUser(currentUser); 
        
        // Vẽ lại giao diện với dữ liệu mới
        renderOrderHistory();
    })
    .catch(err => {
        console.error(err);
        container.innerHTML = '<h3 style="color:red; text-align:center">Lỗi kết nối server khi tải đơn hàng!</h3>';
    });
}

function renderOrderHistory() {
    var container = document.querySelector('.listDonHang');
    container.innerHTML = '<h3>Lịch sử đơn hàng</h3>';
    
    if(!currentUser.donhang || currentUser.donhang.length === 0) {
        container.innerHTML += '<p style="text-align:center; padding: 20px;">Bạn chưa có đơn hàng nào.</p>';
        return;
    }

    // Dữ liệu từ API đã được sắp xếp giảm dần theo ngày
    var orders = currentUser.donhang;

    orders.forEach((dh, i) => {
        // Tạo HTML danh sách sản phẩm trong từng đơn
        var spHTML = dh.sp.map(s => {
            // Tìm thông tin sản phẩm trong danh sách đã tải ở init.js
            var p = timKiemTheoMa(getListProducts(), s.ma);
            
            // Nếu tìm thấy sp thì lấy tên, không thì lấy mã
            var tenSP = p ? p.name : ("Sản phẩm #" + s.ma);
            
            // Logic hiển thị link "Viết đánh giá"
            var reviewLink = '';
            // Chỉ hiện khi đơn hàng đã hoàn tất hoặc đã nhận
            if ((dh.tinhTrang === 'Đã nhận hàng' || dh.tinhTrang === 'Hoàn thành') && p) {
                var linkName = p.name.split(' ').join('-');
                reviewLink = `<a href="chitietsanpham.html?${linkName}" target="_blank" style="color:#288ad6; font-size:13px; text-decoration:underline; margin-left:10px;"><i class="fa fa-star-o"></i> Viết đánh giá</a>`;
            }

            return `<p style="margin:5px 0;">- ${tenSP} [x${s.soluong}] ${reviewLink}</p>`;
        }).join('');

        // Tổng tiền lấy trực tiếp từ Database
        var total = parseInt(dh.tongtien) || 0;

        // Xử lý nút Hành Động
        var actionBtn = '';
        var maDon = dh.maDon; 

        // Nếu đang giao -> Hiện nút "Đã nhận hàng"
        if(dh.tinhTrang === 'Đang giao hàng') {
            actionBtn = `<button class="btn-user-action confirm" onclick="userNhanHang(${maDon})">Đã nhận được hàng</button>`;
        } 
        // Nếu chờ xử lý -> Hiện nút "Hủy đơn"
        else if(dh.tinhTrang === 'Chờ xử lý') {
            actionBtn = `<button class="btn-user-action cancel" onclick="userHuyDon(${maDon})">Hủy đơn hàng</button>`;
        }

        // Màu sắc trạng thái
        var statusColor = '#007bff'; // Màu xanh dương mặc định
        if(dh.tinhTrang.includes('Hủy')) statusColor = 'red';
        if(dh.tinhTrang === 'Hoàn thành' || dh.tinhTrang === 'Đã nhận hàng') statusColor = 'green';

        // Render ra HTML
        container.innerHTML += `
        <div class="donhang-item">
            <div style="display:flex; justify-content:space-between; border-bottom:1px dashed #eee; padding-bottom:10px; margin-bottom:10px;">
                <b>Mã đơn: #${maDon}</b>
                <span style="color:#888">${new Date(dh.ngaymua).toLocaleString()}</span>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items: center;">
                <div style="flex: 2;">${spHTML}</div>
                <div style="flex: 1; text-align:right; padding-left:15px; border-left: 1px solid #f0f0f0">
                    <p>Tổng tiền: <strong style="color:#d0021b; font-size:18px;">${numToString(total)}₫</strong></p>
                    <p style="margin: 10px 0;">Trạng thái: <b style="color:${statusColor}">${dh.tinhTrang}</b></p>
                    ${actionBtn}
                </div>
            </div>
        </div>`;
    });
}

// ======================= 3. TƯƠNG TÁC API CẬP NHẬT ĐƠN HÀNG =======================

function userNhanHang(maDon) {
    if(!confirm('Xác nhận bạn đã nhận được hàng và sản phẩm nguyên vẹn?')) return;
    
    // Gọi hàm cập nhật trạng thái lên Server
    updateOrderStatusAPI(maDon, 'Đã nhận hàng');
}

function userHuyDon(maDon) {
    if(!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    
    // Gọi hàm cập nhật trạng thái lên Server
    updateOrderStatusAPI(maDon, 'Đã hủy bởi Khách');
}

// Hàm chung để gọi API update-order-status.php
function updateOrderStatusAPI(maDon, status) {
    fetch('php/admin/update-order-status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maDon: maDon, trangThai: status })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status) {
            alert(data.message);
            // Quan trọng: Sau khi cập nhật xong, phải tải lại danh sách để thấy thay đổi
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