// js/core/cart.js

// Thêm sản phẩm vào giỏ (Có kiểm tra tồn kho Real-time)
async function themVaoGioHang(masp, tensp) {
    var user = getCurrentUser();
    
    // 1. Kiểm tra đăng nhập
    if (!user) {
        alert('Bạn cần đăng nhập để mua hàng!');
        showTaiKhoan(true);
        return;
    }
    if (user.off) {
        alert('Tài khoản của bạn đang bị khóa!');
        return;
    }

    // 2. GỌI API KIỂM TRA TỒN KHO THỰC TẾ (Không dùng dữ liệu local cũ nữa)
    try {
        let response = await fetch('php/check-stock.php?masp=' + masp);
        let data = await response.json();
        
        var realStock = 0;
        if(data.status) {
            realStock = parseInt(data.stock);
        } else {
            alert("Sản phẩm không còn tồn tại hoặc lỗi hệ thống!");
            return;
        }

        // 3. Logic kiểm tra giỏ hàng
        if (!user.products) user.products = [];

        var existingItem = user.products.find(item => item.ma == masp);
        var slHienTaiTrongGio = existingItem ? parseInt(existingItem.soluong) : 0;

        // [QUAN TRỌNG] Kiểm tra: Số lượng định mua > Tồn kho thực tế
        if (slHienTaiTrongGio + 1 > realStock) {
            alert(`Rất tiếc, kho chỉ còn ${realStock} sản phẩm '${tensp}'. Bạn không thể mua thêm!`);
            return; // Dừng ngay, không thêm vào giỏ
        }

        // 4. Nếu đủ hàng thì mới thêm
        if (existingItem) {
            existingItem.soluong++;
        } else {
            user.products.push({
                "ma": masp,
                "soluong": 1,
                "date": new Date().toISOString()
            });
        }

        // 5. Lưu lại và cập nhật giao diện
        setCurrentUser(user);
        updateSingleUserInList(user);
        animateCartNumber();
        capNhat_ThongTin_CurrentUser();
        
        // Thông báo thành công
        alert(`Đã thêm '${tensp}' vào giỏ hàng thành công!`);

    } catch (err) {
        console.error("Lỗi kiểm tra tồn kho:", err);
        alert("Lỗi kết nối Server, vui lòng thử lại!");
    }
}

// Lấy tổng số lượng (Giữ nguyên)
function getTotalCartQty() {
    var u = getCurrentUser();
    if(!u || !u.products) return 0;
    return u.products.reduce((sum, item) => sum + (item.soluong || 0), 0);
}