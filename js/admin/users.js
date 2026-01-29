// js/admin/users.js

var sortUserDir = 1;       // Hướng sắp xếp (1: tăng, -1: giảm)
var currentListUser = [];  // Biến toàn cục lưu danh sách user tải từ Server

// ======================= QUẢN LÝ KHÁCH HÀNG =======================

// Hàm được gọi khi bấm vào tab "Khách Hàng"
function addTableKhachHang() {
    var tc = document.querySelector('.khachhang .table-content');
    if (!tc) return;

    // Hiển thị trạng thái đang tải (Loading...)
    tc.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fa fa-spinner fa-spin"></i> Đang tải dữ liệu...</div>';

    // Gọi API PHP để lấy danh sách user từ MySQL
    fetch('php/admin/get-users.php')
        .then(response => {
            if (!response.ok) throw new Error("Lỗi kết nối Server");
            return response.json();
        })
        .then(data => {
            currentListUser = data; // Lưu dữ liệu vào biến toàn cục
            updateUserFooterUI();   // Vẽ chân trang (ô tìm kiếm)
            renderUserTable(currentListUser); // Vẽ bảng
        })
        .catch(err => {
            console.error(err);
            tc.innerHTML = '<h3 style="text-align:center; color:red">Không thể lấy dữ liệu từ Server!</h3>';
        });
}

// Hàm vẽ bảng HTML từ danh sách dữ liệu
function renderUserTable(list) {
    var tc = document.querySelector('.khachhang .table-content');
    
    var s = `<table class="table-outline">
    <thead>
        <tr>
            <th>STT</th>
            <th onclick="sortUserTable('hoten')" style="cursor:pointer">Họ tên <i class="fa fa-sort"></i></th>
            <th onclick="sortUserTable('email')" style="cursor:pointer">Email <i class="fa fa-sort"></i></th>
            <th onclick="sortUserTable('user')" style="cursor:pointer">Tài khoản <i class="fa fa-sort"></i></th>
            <th>Hành động</th>
        </tr>
    </thead>
    <tbody>`;

    if (list.length === 0) {
        s += `<tr><td colspan="5" style="text-align:center; padding:20px;">Không tìm thấy khách hàng nào.</td></tr>`;
    } else {
        list.forEach((u, i) => {
            // Logic hiển thị nút Switch (Khóa/Mở)
            // PHP trả về u.off = true nếu bị khóa
            var isChecked = u.off ? '' : 'checked'; 
            var titleLock = u.off ? 'Mở' : 'Khóa';

            s += `<tr>
                <td style="width: 5%">${i + 1}</td>
                <td style="width: 25%">${u.ho} ${u.ten}</td>
                <td style="width: 30%">${u.email}</td>
                <td style="width: 15%">${u.username}</td>
                <td style="width: 15%">
                    <div class="tooltip">
                        <label class="switch">
                            <input type="checkbox" ${isChecked} onchange="voHieuHoaUser('${u.username}', this)">
                            <span class="slider round"></span>
                        </label>
                        <span class="tooltiptext">${titleLock}</span>
                    </div>
                    <div class="tooltip">
                        <i class="fa fa-remove" onclick="xoaUser('${u.username}')" style="cursor:pointer; color:red; margin-left:10px;"></i>
                        <span class="tooltiptext">Xóa</span>
                    </div>
                </td>
            </tr>`;
        });
    }
    s += `</tbody></table>`;
    tc.innerHTML = s;
}

// ======================= LOGIC TƯƠNG TÁC SERVER =======================

// Hàm Khóa / Mở khóa tài khoản
function voHieuHoaUser(username, checkbox) {
    // Nếu checkbox bỏ chọn -> Tức là muốn KHÓA (lock = true)
    // Nếu checkbox được chọn -> Tức là muốn MỞ (lock = false)
    var wantToLock = !checkbox.checked;

    fetch('php/admin/lock-user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, lock: wantToLock })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status) {
            // Cập nhật tooltip thành công
            var tooltip = checkbox.parentElement.nextElementSibling;
            tooltip.innerText = wantToLock ? 'Mở' : 'Khóa';
            
            // Cập nhật luôn vào biến local để tìm kiếm/sort vẫn đúng
            var user = currentListUser.find(u => u.username == username);
            if(user) user.off = wantToLock;
            
        } else {
            alert("Lỗi: " + data.message);
            checkbox.checked = !checkbox.checked; // Hoàn tác checkbox nếu lỗi
        }
    })
    .catch(err => {
        console.error(err);
        alert("Lỗi kết nối Server khi khóa tài khoản.");
        checkbox.checked = !checkbox.checked;
    });
}

// Hàm Xóa tài khoản
function xoaUser(username) {
    if (!confirm('CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn tài khoản ' + username + ' và toàn bộ đơn hàng liên quan.\nBạn có chắc chắn muốn tiếp tục?')) {
        return;
    }

    fetch('php/admin/delete-user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status) {
            alert(data.message);
            // Xóa user khỏi danh sách hiện tại và vẽ lại bảng (đỡ phải gọi API lại)
            currentListUser = currentListUser.filter(u => u.username !== username);
            renderUserTable(currentListUser);
        } else {
            alert("Lỗi: " + data.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Lỗi kết nối Server khi xóa tài khoản.");
    });
}

// ======================= GIAO DIỆN PHỤ TRỢ (TÌM KIẾM & SORT) =======================

// Cập nhật thanh công cụ chân trang (Chỉ gọi 1 lần khi load)
function updateUserFooterUI() {
    var footer = document.querySelector('.khachhang .table-footer');
    if (!footer) return;
    
    // Kiểm tra nếu đã có nội dung rồi thì thôi không render lại để tránh mất focus input
    if(footer.innerHTML.trim() !== "") return;

    footer.innerHTML = `
        <select id="kieuTimKhachHang">
            <option value="ten">Tìm theo họ tên</option>
            <option value="email">Tìm theo email</option>
            <option value="taikhoan">Tìm theo tài khoản</option>
        </select>
        <input type="text" placeholder="Tìm kiếm người dùng..." onkeyup="timKiemNguoiDung(this)">
    `;
}

// Hàm tìm kiếm (Lọc trên danh sách đã tải về)
function timKiemNguoiDung(inp) {
    var type = document.getElementById('kieuTimKhachHang').value;
    var txt = inp.value.toUpperCase();

    var filteredList = currentListUser.filter(u => {
        var stringToCheck = "";
        if (type == 'ten') stringToCheck = u.ho + " " + u.ten;
        else if (type == 'email') stringToCheck = u.email;
        else if (type == 'taikhoan') stringToCheck = u.username;

        return stringToCheck.toUpperCase().indexOf(txt) > -1;
    });

    renderUserTable(filteredList);
}

// Hàm sắp xếp
function sortUserTable(type) {
    sortUserDir = -sortUserDir; // Đảo chiều sắp xếp

    currentListUser.sort((a, b) => {
        var valA = "", valB = "";
        
        if (type == 'hoten') {
            valA = (a.ho + " " + a.ten).toUpperCase();
            valB = (b.ho + " " + b.ten).toUpperCase();
        } else if (type == 'email') {
            valA = a.email.toUpperCase();
            valB = b.email.toUpperCase();
        } else if (type == 'user') {
            valA = a.username.toUpperCase();
            valB = b.username.toUpperCase();
        }

        if (valA < valB) return -1 * sortUserDir;
        if (valA > valB) return 1 * sortUserDir;
        return 0;
    });

    renderUserTable(currentListUser);
}