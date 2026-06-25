// js/core/cart.js
// Thêm vào giỏ theo VARIANT (màu) - lưu theo variant_id

async function themVaoGioHang(masp, tensp, variant_id, mau_sac, ma_mau_hex, soLuong, ram, rom) {
    soLuong = parseInt(soLuong || 1);

    var user = getCurrentUser();
    if (!user) {
        alert('Bạn cần đăng nhập để mua hàng!');
        if (typeof showTaiKhoan === 'function') showTaiKhoan(true);
        return;
    }
    if (user.off) {
        alert('Tài khoản của bạn đang bị khóa!');
        return;
    }
    if (!user.products) user.products = [];

    // Nếu chưa có variant_id -> cố gắng lấy variants
    if (!variant_id) {
        try {
            let res = await fetch('php/get-product-variants.php?masp=' + encodeURIComponent(masp));
            let list = await res.json();

            if (!Array.isArray(list) || list.length === 0) {
                alert("Sản phẩm chưa có màu để mua. Vui lòng báo admin nhập màu!");
                return;
            }

            if (list.length === 1) {
                let v = list[0];
                return themVaoGioHang(masp, tensp, v.variant_id, v.ten_mau, v.ma_mau_hex, soLuong);
            }

            alert('Bạn phải chọn màu trước khi thêm vào giỏ!');
            if (tensp) window.location.href = 'chitietsanpham.html?' + encodeURIComponent(tensp.split(' ').join('-'));
            return;
        } catch (e) {
            console.error(e);
            alert("Lỗi tải danh sách màu, vui lòng thử lại!");
            return;
        }
    }

    variant_id = parseInt(variant_id);

    // Check tồn kho theo variant real-time
    try {
        let resV = await fetch('php/get-variant.php?variant_id=' + encodeURIComponent(variant_id));
        let v = await resV.json();
        if (!v || v.error) {
            alert("Màu không hợp lệ / đã bị xóa. Vui lòng chọn lại!");
            return;
        }

        var stock = parseInt(v.so_luong_ton || 0);
        if (stock <= 0) {
            alert(`Màu '${v.ten_mau}' đã hết hàng!`);
            return;
        }

        // tìm item trùng theo (masp + variant_id)
        var item = user.products.find(x => (x.ma == masp || x.masp == masp) && parseInt(x.variant_id) === variant_id);
        var qtyInCart = item ? parseInt(item.soluong || item.so_luong || 0) : 0;

        if (qtyInCart + soLuong > stock) {
            alert(`Kho màu '${v.ten_mau}' chỉ còn ${stock}. Bạn không thể mua thêm!`);
            return;
        }

        var finalColorName = mau_sac || v.ten_mau || null;
        var finalHex = ma_mau_hex || v.ma_mau_hex || null;
        var finalRam = ram || v.ram || null;
        var finalRom = rom || v.rom || null;

        if (item) {
            item.soluong = qtyInCart + soLuong;
            item.mau_sac = finalColorName;
            item.ma_mau_hex = finalHex;
            item.ram = finalRam;
            item.rom = finalRom;
        } else {
            user.products.push({
                ma: masp,
                soluong: soLuong,
                variant_id: variant_id,
                mau_sac: finalColorName,
                ma_mau_hex: finalHex,
                ram: finalRam,
                rom: finalRom,
                date: new Date().toISOString()
            });
        }

        setCurrentUser(user);
        if (typeof updateSingleUserInList === 'function') updateSingleUserInList(user);
        if (typeof animateCartNumber === 'function') animateCartNumber();
        if (typeof capNhat_ThongTin_CurrentUser === 'function') capNhat_ThongTin_CurrentUser();

        alert(`Đã thêm '${tensp}' - ${finalColorName || 'màu'} vào giỏ hàng!`);
    } catch (e) {
        console.error(e);
        alert("Lỗi kết nối Server, vui lòng thử lại!");
    }
}

function getTotalCartQty() {
    var u = getCurrentUser();
    if (!u || !u.products) return 0;
    return u.products.reduce((sum, item) => sum + (parseInt(item.soluong || item.so_luong || 0)), 0);
}