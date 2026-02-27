// js/core/cart.js
// Thêm sản phẩm vào giỏ (Có kiểm tra tồn kho Real-time)
// Thêm sản phẩm vào giỏ (chuẩn variant theo màu)
async function themVaoGioHang(masp, tensp, variant_id, mau_sac) {
    var user = getCurrentUser();

    if (!user) {
        alert('Bạn cần đăng nhập để mua hàng!');
        showTaiKhoan(true);
        return;
    }
    if (user.off) {
        alert('Tài khoản của bạn đang bị khóa!');
        return;
    }

    // Nếu sản phẩm có variants thì bắt buộc chọn
    if (variant_id && !mau_sac) {
        alert('Vui lòng chọn màu trước khi thêm vào giỏ!');
        return;
    }

    try {
        let url = '';
        if (variant_id) url = 'php/check-stock.php?variant_id=' + encodeURIComponent(variant_id);
        else url = 'php/check-stock.php?masp=' + encodeURIComponent(masp);

        let response = await fetch(url);
        let data = await response.json();

        if (!data.status) {
            alert("Sản phẩm/biến thể không còn tồn tại hoặc lỗi hệ thống!");
            return;
        }

        var realStock = parseInt(data.stock) || 0;
        if (realStock <= 0) {
            alert('Màu này hiện đang hết hàng!');
            return;
        }

        if (!user.products) user.products = [];

        // Gộp theo variant_id (chuẩn)
        var existingItem = null;
        if (variant_id) {
            existingItem = user.products.find(it => String(it.variant_id) === String(variant_id));
        } else {
            // fallback: gộp theo masp (cũ)
            existingItem = user.products.find(it => it.ma == masp && !it.variant_id);
        }

        var slHienTai = existingItem ? parseInt(existingItem.soluong) : 0;
        if (slHienTai + 1 > realStock) {
            alert(`Rất tiếc, kho chỉ còn ${realStock} sản phẩm '${tensp}'${mau_sac ? " ("+mau_sac+")" : ""}.`);
            return;
        }

        if (existingItem) {
            existingItem.soluong++;
            existingItem.ton_kho_variant = realStock;
        } else {
            user.products.push({
                ma: masp,
                variant_id: variant_id || null,
                mau_sac: mau_sac || null,
                ton_kho_variant: realStock, // để cart page giới hạn tăng số lượng
                soluong: 1,
                date: new Date().toISOString()
            });
        }

        setCurrentUser(user);
        updateSingleUserInList(user);
        animateCartNumber();
        capNhat_ThongTin_CurrentUser();

        alert(`Đã thêm '${tensp}'${mau_sac ? " ("+mau_sac+")" : ""} vào giỏ hàng!`);
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