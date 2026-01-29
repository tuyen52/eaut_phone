// js/admin/main.js

window.onload = function() {
    // 1. Kiểm tra quyền Admin
    var admin = JSON.parse(window.localStorage.getItem('admin'));
    if(!admin) {
        document.body.innerHTML = `<h1 style="color:red; text-align:center; margin-top:50px;">Truy cập bị từ chối! <br> Bạn không phải là Admin.</h1>`;
        setTimeout(() => { window.location.href = 'index.html'; }, 2000);
        return;
    }

    // 2. Khởi tạo dữ liệu mặc định khi vào trang
    addThongKe(); // Mặc định hiển thị thống kê
    
    // 3. Sự kiện chuyển Tab (Sidebar)
    setupTabEvents();
}

function setupTabEvents() {
    var links = document.querySelectorAll('.sidebar .nav-link');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            // Nếu là nút Đăng xuất thì bỏ qua logic chuyển tab
            if(this.getAttribute('onclick')) return;

            e.preventDefault();
            
            // Xử lý Active Class
            var currentActive = document.querySelector('.nav-link.active');
            if(currentActive) currentActive.classList.remove('active');
            this.classList.add('active');

            // Ẩn tất cả các Section chính
            document.querySelectorAll('.main > div').forEach(d => d.style.display = 'none');
            
            // Lấy tên tab để hiển thị section tương ứng
            var tabName = this.innerText.trim();
            openTab(tabName);
        });
    });
}

function openTab(name) {
    switch(name) {
        case 'Trang Chủ':
            document.querySelector('.home').style.display = 'block';
            addThongKe();
            break;
        case 'Sản Phẩm':
            document.querySelector('.sanpham').style.display = 'block';
            addTableProducts();
            break;
        case 'Đơn Hàng':
            document.querySelector('.donhang').style.display = 'block';
            addTableDonHang();
            break;
        case 'Khách Hàng':
            document.querySelector('.khachhang').style.display = 'block';
            addTableKhachHang();
            break;
        case 'Bình luận':
            document.querySelector('.binhluan').style.display = 'block';
            addTableBinhLuan();
            break;
        case 'Kho Hàng':
            document.querySelector('.khohang').style.display = 'block';
            addTableKhoHang(); // Hàm này nằm bên products.js
            break;
    }
}

// Hàm Sắp xếp chung cho bảng Sản phẩm (Được gọi từ products.js)
var sortDirection = 1;
function sortTable(key, list, renderFunc) {
    sortDirection = -sortDirection;
    list.sort((a, b) => {
        var valA = a[key];
        var valB = b[key];
        
        // Xử lý giá tiền (loại bỏ dấu chấm để so sánh số)
        if(key === 'price') {
            valA = stringToNum(valA);
            valB = stringToNum(valB);
        }
        // Xử lý chuỗi
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return -1 * sortDirection;
        if (valA > valB) return 1 * sortDirection;
        return 0;
    });
    renderFunc(); // Vẽ lại bảng sau khi sort
}

function logOutAdmin() {
    window.localStorage.removeItem('admin');
    window.location.href = 'index.html';
}