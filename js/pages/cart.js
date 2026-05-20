// js/pages/cart.js
// Giỏ hàng theo variant_id (màu): hiển thị màu + check kho theo variant
// Đã nâng cấp checkout hỗ trợ:
// - COD
// - VNPAY Sandbox

var currentCart = [];
var variantCache = {}; // variant_id -> {ten_mau, ma_mau_hex, so_luong_ton}

window.onload = function () {
    khoiTao();

    var currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Bạn chưa đăng nhập!');
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
            ma_mau_hex: it.ma_mau_hex || null
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
                    so_luong_ton: parseInt(v.so_luong_ton || 0)
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
                        so_luong_ton: parseInt(v.so_luong_ton || 0)
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
        hex: item.ma_mau_hex || (v ? v.ma_mau_hex : null) || '#000000'
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

function buildCheckoutProducts() {
    var tongTien = 0;
    var listProducts = getListProducts();

    var danhSachSanPhamGuiDi = currentCart.map(item => {
        var p = listProducts.find(x => x.masp == item.ma);
        var price = 0;

        if (p) {
            price = parseInt(p.price.split('.').join(''));
            if (p.promo && p.promo.name == 'giareonline') {
                price = parseInt(p.promo.value.split('.').join(''));
            }
        }

        tongTien += price * item.soluong;

        return {
            masp: item.ma,
            variant_id: item.variant_id || null,
            mau_sac: item.mau_sac || null,
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
        table.innerHTML = html;
        return;
    }

    var totalBill = 0;

    currentCart.forEach((item, index) => {
        var p = findProduct(item.ma);
        if (!p) return;

        var price = parseInt(p.price.split('.').join(''));
        if (p.promo && p.promo.name == 'giareonline') {
            price = parseInt(p.promo.value.split('.').join(''));
        }

        var stock = getItemStock(item, p);
        var color = getItemColor(item);

        if (stock > 0 && item.soluong > stock) item.soluong = stock;

        var thanhTien = price * item.soluong;
        totalBill += thanhTien;

        html += `
        <tr>
            <td style="text-align:left; padding-left:10px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${p.img}" style="width:50px;">
                    <div>
                        <a href="chitietsanpham.html?${p.name.split(' ').join('-')}">${p.name}</a>
                        <div style="margin-top:6px; font-size:13px; color:#444;">
                            Màu:
                            <span style="display:inline-flex; align-items:center; gap:6px;">
                                <span style="width:14px;height:14px;border-radius:50%;border:1px solid #ccc;background:${color.hex};display:inline-block;"></span>
                                <b>${color.name || 'Chưa rõ'}</b>
                            </span>
                        </div>
                        <div style="margin-top:4px; font-size:12px; color:#777;">
                            Variant: ${item.variant_id || 'N/A'} | Kho màu: ${stock}
                        </div>
                    </div>
                </div>
            </td>
            <td>${numToString(price)}₫</td>
            <td>
                <div class="buttons_added">
                    <input class="minus is-form" type="button" value="-" onclick="updateQty(${index}, -1)">
                    <input aria-label="quantity" class="input-qty" min="1" type="number" value="${item.soluong}" disabled>
                    <input class="plus is-form" type="button" value="+" onclick="updateQty(${index}, 1)">
                </div>
                <p style="font-size:12px; color:#777; margin-top:5px;">(Kho màu: ${stock})</p>
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
            var price = stringToNum(p.price);
            if (p.promo && p.promo.name == 'giareonline') {
                price = stringToNum(p.promo.value);
            }
            total += price * item.soluong;
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

    var tongTien = 0;
    var listProducts = getListProducts();

    var danhSachSanPhamGuiDi = currentCart.map(item => {
        var p = listProducts.find(x => x.masp == item.ma);
        var price = 0;

        if (p) {
            price = parseInt(p.price.split('.').join(''));
            if (p.promo && p.promo.name == 'giareonline') {
                price = parseInt(p.promo.value.split('.').join(''));
            }
        }

        tongTien += price * item.soluong;

        return {
            masp: item.ma,
            variant_id: item.variant_id || null,
            mau_sac: item.mau_sac || null,
            so_luong: item.soluong,
            gia: price
        };
    });

    var dataToSend = {
        username: user.username,
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
                window.location.href = 'nguoidung.html';
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