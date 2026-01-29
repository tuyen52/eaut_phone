# 📱 EAUT PHONE - Website Thương Mại Điện Tử Bán Điện Thoại

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![PHP](https://img.shields.io/badge/backend-PHP-blue.svg)
![MySQL](https://img.shields.io/badge/database-MySQL-orange.svg)
![Frontend](https://img.shields.io/badge/frontend-HTML%2FCSS%2FJS-yellow.svg)

**EAUT PHONE** là đồ án chuyên ngành Công nghệ thông tin, mô phỏng một website thương mại điện tử hoàn chỉnh với đầy đủ các chức năng mua hàng cho người dùng và hệ thống quản trị (CMS) cho Admin.

---

## 🚀 Tính năng nổi bật

### 👤 Dành cho Khách hàng (Frontend)
- **Trang chủ:** Banner quảng cáo, sản phẩm nổi bật, sản phẩm mới, top bán chạy.
- **Tìm kiếm & Lọc:** - Tìm kiếm theo tên sản phẩm (Autocomplete).
  - Bộ lọc nâng cao: Theo hãng, mức giá (0-2tr, 2-4tr...), số sao đánh giá, khuyến mãi.
- **Giỏ hàng:** Thêm/Sửa/Xóa sản phẩm, tính tổng tiền tự động.
- **Thanh toán:** Đặt hàng, lưu đơn hàng vào Cơ sở dữ liệu.
- **Tài khoản:** - Đăng ký / Đăng nhập.
  - Quản lý thông tin cá nhân.
  - **Lịch sử đơn hàng:** Xem trạng thái (Chờ xử lý, Đã nhận...), Hủy đơn hàng.
  - **Đánh giá:** Bình luận và đánh giá sao cho sản phẩm đã mua.

### 🛠 Dành cho Quản trị viên (Admin Dashboard)
- **Thống kê (Dashboard):** Biểu đồ doanh thu, số lượng bán ra theo hãng.
- **Quản lý Sản phẩm:** Thêm mới, Sửa, Xóa, Cập nhật tồn kho, Quản lý hình ảnh.
- **Quản lý Đơn hàng:** Xem chi tiết đơn, Duyệt đơn, Hủy đơn, Xóa lịch sử đơn.
- **Quản lý Khách hàng:** Xem danh sách, Khóa/Mở khóa tài khoản người dùng.
- **Quản lý Tồn kho:** Cập nhật số lượng sản phẩm nhanh.

---

## 🛠 Công nghệ sử dụng

- **Frontend:** HTML5, CSS3, Javascript (ES6), jQuery, Owl Carousel (Slider), FontAwesome 4.7.
- **Backend:** PHP (Native).
- **Database:** MySQL (MariaDB).
- **Môi trường phát triển:** XAMPP, Visual Studio Code.

---

## ⚙️ Cài đặt và Hướng dẫn chạy

Để chạy dự án trên máy cục bộ (Localhost), hãy làm theo các bước sau:

### Bước 1: Chuẩn bị môi trường
1. Tải và cài đặt [XAMPP](https://www.apachefriends.org/).
2. Khởi động **Apache** và **MySQL** trong XAMPP Control Panel.

### Bước 2: Cài đặt mã nguồn
1. Truy cập thư mục `htdocs` của XAMPP (thường là `C:\xampp\htdocs`).
2. Tạo thư mục mới tên là `eaut_phone`.
3. Copy toàn bộ file dự án vào thư mục `eaut_phone`.

### Bước 3: Cấu hình Cơ sở dữ liệu (Database)
1. Truy cập `http://localhost/phpmyadmin`.
2. Tạo database mới có tên: `eaut_phone_db`.
3. Chọn database vừa tạo, vào tab **Import (Nhập)**.
4. Chọn file `eaut_phone_db.sql` (hoặc chạy đoạn mã SQL tạo bảng) để import cấu trúc bảng `products`, `users`, `orders`, `order_details`.

### Bước 4: Kiểm tra kết nối
1. Mở file `connect.php` trong code.
2. Đảm bảo thông tin cấu hình đúng với máy bạn (mặc định XAMPP là user: `root`, pass: rỗng).

### Bước 5: Chạy dự án
- **Trang chủ:** Truy cập [http://localhost/eaut_phone/index.html](http://localhost/eaut_phone/index.html)
- **Trang Admin:** Truy cập [http://localhost/eaut_phone/admin.html](http://localhost/eaut_phone/admin.html)

---

## 📂 Cấu trúc thư mục

```text
eaut_phone/
├── admin.html           # Giao diện Admin
├── index.html           # Trang chủ
├── connect.php          # Kết nối CSDL
├── css/                 # Stylesheet
├── js/                  
│   ├── admin/           # Logic JS cho Admin
│   ├── core/            # Logic cốt lõi (Auth, Database, Utils)
│   ├── components/      # Header, Footer, ProductCard
│   └── pages/           # Logic riêng từng trang (Home, Cart, User)
├── php/                 # API xử lý Backend
│   ├── login.php
│   ├── register.php
│   ├── thanhtoan.php
│   └── admin/           # API cho Admin
└── img/                 # Hình ảnh sản phẩm/Banner
