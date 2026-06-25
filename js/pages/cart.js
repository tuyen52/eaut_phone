// js/pages/cart.js
// Giỏ hàng theo variant_id (màu): hiển thị màu + check kho theo variant
// Đã nâng cấp checkout hỗ trợ:
// - COD
// - VNPAY Sandbox

var currentCart = [];
var variantCache = {}; // variant_id -> {ten_mau, ma_mau_hex, so_luong_ton, gia_ban, ram, rom}

window.onload = function () {
    khoiTao();

    var currentUser = getCurrentUser();
    if (!currentUser) {
        renderCartLoginEmpty();
        return;
    }

    currentCart = normalizeCart(currentUser.products || []);

    upgradeOldItemsToVariant()
        .then(loadVariantInfoForCart)
        .then(() => {
            saveCart();
            renderCart();
        })
        .catch(err => {
            console.error(err);
            renderCart();
        });
};

function normalizeCart(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map(it => {
        if (!it || typeof it !== 'object') return null;
        if (it.masp && !it.ma) it.ma = it.masp;
        if (it.so_luong && !it.soluong) it.soluong = it.so_luong;
        return {
            ma: it.ma,
            soluong: parseInt(it.soluong || 1),
            variant_id: (it.variant_id !== undefined && it.variant_id !== null && it.variant_id !== '') ? parseInt(it.variant_id) : null,
            mau_sac: it.mau_sac || null,
            ma_mau_hex: it.ma_mau_hex || null,
            ram: it.ram || null,
            rom: it.rom || null
        };
    }).filter(Boolean);
}

function fetchJson(url) {
    return fetch(url).then(r => r.json());
}

function findProduct(masp) {
    try {
        return timKiemTheoMa(getListProducts(), masp);
    } catch (e) {
        return null;
    }
}

// Nâng cấp giỏ cũ (chưa có variant_id)
function upgradeOldItemsToVariant() {
    var tasks = currentCart.map(item => {
        if (item.variant_id) return Promise.resolve();

        return fetchJson('php/get-product-variants.php?masp=' + encodeURIComponent(item.ma))
            .then(list => {
                if (!Array.isArray(list) || list.length === 0) return;

                var v = list.find(x => (x.ten_mau || '').toLowerCase() === 'mặc định') || list[0];
                if (!v) return;

                item.variant_id = parseInt(v.variant_id);
                item.mau_sac = item.mau_sac || v.ten_mau || null;
                item.ma_mau_hex = item.ma_mau_hex || v.ma_mau_hex || null;

                variantCache[item.variant_id] = {
                    ten_mau: v.ten_mau,
                    ma_mau_hex: v.ma_mau_hex,
                    ram: v.ram || null,
                    rom: v.rom || null,
                    so_luong_ton: parseInt(v.so_luong_ton || 0),
                    gia_ban: parseInt(v.gia_ban || 0)
                };
            })
            .catch(() => {});
    });

    return Promise.all(tasks).then(() => {});
}

// Load tồn kho theo variant
function loadVariantInfoForCart() {
    var ids = Array.from(new Set(currentCart.map(x => x.variant_id).filter(Boolean)));
    var tasks = ids.map(id => {
        if (variantCache[id]) return Promise.resolve();
        return fetchJson('php/get-variant.php?variant_id=' + encodeURIComponent(id))
            .then(v => {
                if (v && !v.error) {
                    variantCache[id] = {
                        ten_mau: v.ten_mau,
                        ma_mau_hex: v.ma_mau_hex,
                        ram: v.ram || null,
                        rom: v.rom || null,
                        so_luong_ton: parseInt(v.so_luong_ton || 0),
                        gia_ban: parseInt(v.gia_ban || 0)
                    };
                }
            })
            .catch(() => {});
    });
    return Promise.all(tasks).then(() => {});
}

function getItemStock(item, productObj) {
    if (item.variant_id && variantCache[item.variant_id]) {
        return parseInt(variantCache[item.variant_id].so_luong_ton || 0);
    }
    return parseInt(productObj && productObj.inventory ? productObj.inventory : 0);
}

function getItemColor(item) {
    var v = item.variant_id ? variantCache[item.variant_id] : null;
    return {
        name: item.mau_sac || (v ? v.ten_mau : null),
        hex: item.ma_mau_hex || (v ? v.ma_mau_hex : null) || '#000000',
        ram: item.ram || (v ? v.ram : null),
        rom: item.rom || (v ? v.rom : null)
    };
}

function clearLocalCart() {
    var user = getCurrentUser();
    if (!user) return;

    user.products = [];
    currentCart = [];

    setCurrentUser(user);
    updateSingleUserInList(user);
    capNhat_ThongTin_CurrentUser();
}

function getItemPrice(item, productObj) {
    if (!productObj) return 0;
    var variantGiaBan = 0;
    if (item.variant_id && variantCache[item.variant_id]) {
        variantGiaBan = parseInt(variantCache[item.variant_id].gia_ban || 0);
    }
    return getEffectiveProductPrice(productObj, variantGiaBan);
}

function buildCheckoutProducts() {
    var tongTien = 0;
    var listProducts = getListProducts();

    var danhSachSanPhamGuiDi = currentCart.map(item => {
        var p = listProducts.find(x => x.masp == item.ma);
        var price = getItemPrice(item, p);

        tongTien += price * item.soluong;

        return {
            masp: item.ma,
            variant_id: item.variant_id || null,
            mau_sac: item.mau_sac || null,
            ram: item.ram || null,
            rom: item.rom || null,
            so_luong: item.soluong,
            gia: price
        };
    });

    return {
        tongTien: tongTien,
        sanPham: danhSachSanPhamGuiDi
    };
}

// =============================================================
// 1. QUẢN LÝ HIỂN THỊ GIỎ HÀNG
// =============================================================

function renderCartLoginEmpty() {
    var table = document.querySelector('.listSanPham');
    if (!table) return;
    table.innerHTML = `
        <tr><td colspan="5">
            <div class="cartLoginEmpty">
                <div class="cartLoginEmpty-icon"><i class="fa fa-shopping-cart"></i></div>
                <h2>Bạn chưa đăng nhập</h2>
                <p>Đăng nhập để xem giỏ hàng và đặt mua sản phẩm</p>
                <button type="button" class="cartBtnPrimary" onclick="checkTaiKhoan()">Đăng nhập ngay</button>
            </div>
        </td></tr>`;
}

function renderCart() {
    var table = document.querySelector('.listSanPham');
    var html = `
    <thead><tr>
        <th>Sản phẩm</th>
        <th>Giá</th>
        <th>Số lượng</th>
        <th>Thành tiền</th>
        <th></th>
    </tr></thead><tbody>`;

    if (currentCart.length === 0) {
        html += `
        <tr><td colspan="5">
            <div class="cartEmpty">
                <div class="cartEmpty-icon"><i class="fa fa-shopping-basket"></i></div>
                <h2>Giỏ hàng trống</h2>
                <p>Hãy thêm sản phẩm yêu thích vào giỏ để tiếp tục mua sắm</p>
                <a href="index.html">Tiếp tục mua sắm</a>
            </div>
        </td></tr></tbody>`;
        table.innerHTML = html;
        return;
    }

    var totalBill = 0;

    currentCart.forEach((item, index) => {
        var p = findProduct(item.ma);
        if (!p) return;

        var price = getItemPrice(item, p);

        var stock = getItemStock(item, p);
        var color = getItemColor(item);

        if (stock > 0 && item.soluong > stock) item.soluong = stock;

        var thanhTien = price * item.soluong;
        totalBill += thanhTien;

        html += `
        <tr>
            <td class="cartProductCell" data-label="Sản phẩm">
                <div class="cartProductRow">
                    <img class="cartProductImg" src="${p.img}" alt="">
                    <div class="cartProductInfo">
                        <a href="chitietsanpham.html?${p.name.split(' ').join('-')}">${p.name}</a>
                        <div class="cartProductMeta">
                            Màu:
                            <span class="cartColorDot" style="background:${color.hex};"></span>
                            <span class="cartColorName">${color.name || 'Chưa rõ'}</span>
                        </div>
                        <div class="cartSpec">RAM ${color.ram || item.ram || '—'} · ROM ${color.rom || item.rom || '—'}</div>
                    </div>
                </div>
            </td>
            <td class="cartPriceCell" data-label="Giá">${numToString(price)}₫</td>
            <td data-label="Số lượng">
                <div class="soluong">
                    <button type="button" onclick="updateQty(${index}, -1)">−</button>
                    <input type="text" value="${item.soluong}" disabled>
                    <button type="button" onclick="updateQty(${index}, 1)">+</button>
                </div>
                <div class="cartStockHint">Còn ${stock} sp</div>
            </td>
            <td class="cartSubtotalCell" data-label="Thành tiền">${numToString(thanhTien)}₫</td>
            <td data-label="">
                <span class="cartRemoveBtn" onclick="removeItem(${index})" title="Xóa"><i class="fa fa-trash"></i></span>
            </td>
        </tr>`;
    });

    html += `
    <tr class="cartSummaryRow">
        <td colspan="3" class="cartSummaryLabel">Tổng tiền</td>
        <td class="cartSummaryTotal">${numToString(totalBill)}₫</td>
        <td class="cartSummaryActions">
            <button type="button" class="btn-checkout" onclick="openPaymentModal()">Thanh toán</button>
        </td>
    </tr></tbody>`;

    table.innerHTML = html;
}

function updateQty(index, change) {
    var p = findProduct(currentCart[index].ma);
    var stock = getItemStock(currentCart[index], p);

    var newQty = currentCart[index].soluong + change;

    if (newQty > stock) {
        alert('Số lượng vượt quá tồn kho của màu này!');
        return;
    }
    if (newQty < 1) return;

    currentCart[index].soluong = newQty;
    saveCart();
    renderCart();
}

function removeItem(index) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
        currentCart.splice(index, 1);
        saveCart();
        renderCart();
        if (typeof animateCartNumber === 'function') animateCartNumber();
    }
}

function saveCart() {
    var user = getCurrentUser();
    user.products = currentCart;
    setCurrentUser(user);
    updateSingleUserInList(user);
    capNhat_ThongTin_CurrentUser();
}

// =============================================================
// 2. LOGIC THANH TOÁN
// =============================================================
async function openPaymentModal() {
    if (currentCart.length === 0) {
        alert('Giỏ hàng trống!');
        return;
    }

    await loadVariantInfoForCart();

    for (let item of currentCart) {
        let p = findProduct(item.ma);
        let stock = getItemStock(item, p);

        if (!item.variant_id) {
            alert('Có sản phẩm chưa có màu trong giỏ. Vui lòng vào chi tiết chọn màu.');
            return;
        }
        if (item.soluong > stock) {
            alert(`Có sản phẩm vượt kho màu. Vui lòng giảm số lượng. (Kho: ${stock})`);
            renderCart();
            return;
        }
        if (stock <= 0) {
            alert('Có màu đã hết hàng trong giỏ. Vui lòng xóa hoặc chọn màu khác.');
            return;
        }
    }

    var user = getCurrentUser();
    document.getElementById('paymentModal').style.display = 'block';
    document.getElementById('hoTen').value = ((user.ho || '') + ' ' + (user.ten || '')).trim();
    document.getElementById('soDienThoai').value = '';

    var total = 0;
    currentCart.forEach(item => {
        var p = findProduct(item.ma);
        if (p) {
            total += getItemPrice(item, p) * item.soluong;
        }
    });

    document.getElementById('paymentTotal').innerText = numToString(total) + "₫";

    var checked = document.querySelector('input[name="paymentMethod"]:checked');
    togglePaymentMethod(checked ? checked.value : 'COD');
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

function togglePaymentMethod(method) {
    var vnpayInfo = document.getElementById('vnpayInfo');
    if (vnpayInfo) {
        vnpayInfo.style.display = (method === 'VNPAY') ? 'block' : 'none';
    }
}

// Location giữ nguyên
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

    var url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    fetch(url)
        .then(r => r.json())
        .then(data => {
            diaChiInput.value = data.display_name ? data.display_name : ("Tọa độ: " + lat + ", " + lon);
        })
        .catch(() => {
            diaChiInput.value = "";
            diaChiInput.placeholder = "Không lấy được địa chỉ cụ thể.";
        });
}

function showError(error) {
    alert("Lỗi định vị: " + error.message);
}
let isSubmittingPayment = false;

function processPayment() {
    if (isSubmittingPayment) {
        alert('Hệ thống đang xử lý yêu cầu thanh toán, vui lòng đợi...');
        return;
    }

    var user = getCurrentUser();
    var hoten = document.getElementById('hoTen').value.trim();
    var sdt = document.getElementById('soDienThoai').value.trim();
    var diachi = document.getElementById('diaChi').value.trim();
    var ptttInput = document.querySelector('input[name="paymentMethod"]:checked');
    var pttt = ptttInput ? ptttInput.value : 'COD';

    if (!hoten) {
        alert('Vui lòng nhập họ tên người nhận!');
        return;
    }

    var phoneRegex = /^(84|0[3|5|7|8|9])[0-9]{8}$/;
    if (!sdt || !phoneRegex.test(sdt)) {
        alert('Số điện thoại không hợp lệ!');
        return;
    }

    if (!diachi || diachi.length < 10) {
        alert('Vui lòng nhập địa chỉ chi tiết!');
        return;
    }

    var checkout = buildCheckoutProducts();
    var tongTien = checkout.tongTien;
    var danhSachSanPhamGuiDi = checkout.sanPham;

        var dataToSend = {
        tong_tien: tongTien,
        ho_ten: hoten,
        sdt: sdt,
        dia_chi: diachi,
        phuong_thuc: pttt,
        payment_method_code: pttt,
        san_pham: danhSachSanPhamGuiDi
        };

    isSubmittingPayment = true;

     fetch('php/thanhtoan.php', {
     method: 'POST',
     credentials: 'same-origin',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(dataToSend)
     })
    .then(r => r.json())
    .then(data => {
        if (data.status == true) {

            // COD: đặt hàng xong thì xóa giỏ
            if (pttt === 'COD') {
                clearLocalCart();
                closePaymentModal();
                renderCart();

                alert("ĐẶT HÀNG THÀNH CÔNG!\n" + data.message);
                window.location.href = 'donhang-cua-toi.html';
                return;
            }

            // VNPAY: không xóa giỏ ở đây
            if (pttt === 'VNPAY' && data.payment_url) {
                closePaymentModal();

                alert('Hệ thống đã tạo phiên thanh toán VNPay tạm. Đơn hàng chỉ được tạo sau khi VNPay trả kết quả thành công hoặc thất bại.');

                window.location.href = data.payment_url;
             return;
            }

            isSubmittingPayment = false;
            alert("Lỗi: Không tạo được link thanh toán VNPay.");
        } else {
            isSubmittingPayment = false;
            alert('Lỗi: ' + data.message);
        }
    })
    .catch(err => {
        isSubmittingPayment = false;
        console.error(err);
        alert('Lỗi kết nối Server!');
    });
}