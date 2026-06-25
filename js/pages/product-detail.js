// js/pages/product-detail.js

var sanPhamHienTai = null;
var selectedRating = 0;

// --- [MỚI] Biến thể màu / RAM / ROM ---
var variantsHienTai = [];
var selectedVariant = null;
var selectedColor = null;
var selectedRam = null;
var selectedRom = null;

// --- [MỚI] Đổi ảnh theo biến thể ---
function applyVariantImage(p, v) {
    var img = (v && v.hinh_anh && String(v.hinh_anh).trim() !== '') ? v.hinh_anh : (p && p.img ? p.img : '');
    if (!img) return;

    var smallImg = document.querySelector('.picture img');
    if (smallImg) {
        smallImg.src = img;
        smallImg.removeAttribute('width');
        smallImg.removeAttribute('height');
    }

    var bigImg = document.getElementById('bigimg');
    if (bigImg) {
        bigImg.src = img;
        bigImg.removeAttribute('width');
        bigImg.removeAttribute('height');
    }

    if (typeof renderSmallImages === 'function') {
        renderSmallImages(img);
    }
}

window.onload = function () {
    khoiTao(); // core/init.js

    // Lấy tên sản phẩm từ URL
    var nameProduct = window.location.href.split('?')[1];
    if (!nameProduct) { showNotFound(); return; }

    nameProduct = decodeURIComponent(nameProduct.split('-').join(' '));
    // list_products được tải từ DB ở init.js
    sanPhamHienTai = getListProducts().find(p => p.name.toUpperCase() === nameProduct.toUpperCase());

    if (!sanPhamHienTai) { showNotFound(); return; }

    // Render giao diện
    renderProductDetail(sanPhamHienTai);
    renderSuggestion(sanPhamHienTai, getListProducts());

    // Load variants màu cho sản phẩm hiện tại
    loadVariantsForProduct(sanPhamHienTai);

    // Gọi API tải bình luận từ Database
    displayReviews();

    // Setup form
    setupReviewForm();
}

function showNotFound() {
    var div = document.getElementById('productNotFound');
    if (div) div.style.display = 'block';
    var detail = document.querySelector('.chitietSanpham');
    if (detail) detail.style.display = 'none';
}

/* =========================================================
   VARIANT MÀU / RAM / ROM
   - API: php/get-product-variants.php?masp=...
   ========================================================= */

function loadVariantsForProduct(p) {
    var picker = document.getElementById('variantPicker');
    var optionsDiv = document.getElementById('variantOptions');
    var hintDiv = document.getElementById('variantHint');

    if (!picker || !optionsDiv || !hintDiv) return;

    picker.style.display = 'block';
    optionsDiv.innerHTML = '<span style="color:#777">Đang tải biến thể...</span>';
    hintDiv.className = 'variant_hint';
    hintDiv.innerText = 'Vui lòng chọn màu, RAM và bộ nhớ trước khi mua.';

    fetch('php/get-product-variants.php?masp=' + encodeURIComponent(p.masp))
        .then(res => res.json())
        .then(list => {
            if (!Array.isArray(list)) list = [];
            variantsHienTai = list;
            resetVariantSelection();
            renderVariantOptions(p, list);
            applyVariantImage(p, null);
        })
        .catch(err => {
            console.error(err);
            optionsDiv.innerHTML = '<span style="color:red">Lỗi tải danh sách biến thể!</span>';
        });
}

function resetVariantSelection() {
    selectedVariant = null;
    selectedColor = null;
    selectedRam = null;
    selectedRom = null;
}

function renderVariantOptions(p, variants) {
    var optionsDiv = document.getElementById('variantOptions');
    var hintDiv = document.getElementById('variantHint');
    if (!optionsDiv || !hintDiv) return;

    if (!variants.length) {
        optionsDiv.innerHTML = '<span style="color:#777">Chưa có biến thể cho sản phẩm này.</span>';
        return;
    }

    var colors = [];
    variants.forEach(v => {
        if (!colors.some(c => c.ten_mau === v.ten_mau)) colors.push(v);
    });

    optionsDiv.innerHTML = colors.map(v => {
        var outOfStock = (parseInt(v.so_luong_ton) || 0) <= 0;
        var disabledClass = outOfStock ? 'disabled' : '';
        var note = outOfStock ? ' (Hết)' : '';
        var hex = v.ma_mau_hex || '#000000';

        return `<div class="variant_btn ${disabledClass}"
                     data-color="${escapeHtml(v.ten_mau)}"
                     data-disabled="${outOfStock ? 1 : 0}"
                     title="${escapeHtml(v.ten_mau)}${note}">
                    <span class="swatch" style="background:${hex}"></span>
                    <span>${escapeHtml(v.ten_mau)}${note}</span>
                </div>`;
    }).join('');

    var btns = optionsDiv.querySelectorAll('.variant_btn');
    btns.forEach(btn => {
        btn.addEventListener('click', function () {
            if (btn.getAttribute('data-disabled') == '1') return;
            selectedColor = btn.getAttribute('data-color');
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedVariant = null;
            selectedRam = null;
            selectedRom = null;
            renderRamRomPicker(p, variants, selectedColor);
            applyVariantImage(p, { hinh_anh: v.hinh_anh });
            hintDiv.className = 'variant_hint ok';
            hintDiv.innerText = 'Đã chọn màu: ' + selectedColor + '. Vui lòng chọn RAM và bộ nhớ.';
            updateStockAndBuyButton(p);
        });
    });

    renderRamRomPicker(p, variants, selectedColor);
    updateStockAndBuyButton(p);
}

function renderRamRomPicker(p, variants, color) {
    var comboArea = document.getElementById('variantComboArea');
    if (!comboArea) return;

    var filtered = color ? variants.filter(v => v.ten_mau === color) : variants.slice();
    var rams = [];
    var roms = [];

    filtered.forEach(v => {
        if (v.ram && !rams.includes(v.ram)) rams.push(v.ram);
        if (v.rom && !roms.includes(v.rom)) roms.push(v.rom);
    });

    var ramHtml = rams.length
        ? rams.map(r => `<button type="button" class="variant_choice" data-ram="${escapeHtml(r)}">${escapeHtml(r)}</button>`).join('')
        : '<span style="color:#aaa;font-size:13px;">Chưa có dữ liệu RAM</span>';

    var romHtml = roms.length
        ? roms.map(r => `<button type="button" class="variant_choice" data-rom="${escapeHtml(r)}">${escapeHtml(r)}</button>`).join('')
        : '<span style="color:#aaa;font-size:13px;">Chưa có dữ liệu bộ nhớ</span>';

    comboArea.innerHTML = `
        <hr class="variant_divider">
        <div class="variant_section">
            <div class="variant_section_label">RAM</div>
            <div class="variant_choice_group" id="ramChoices">${ramHtml}</div>
        </div>
        <hr class="variant_divider">
        <div class="variant_section">
            <div class="variant_section_label">Bộ nhớ trong</div>
            <div class="variant_choice_group" id="romChoices">${romHtml}</div>
        </div>
    `;

    var ramBtns = comboArea.querySelectorAll('[data-ram]');
    var romBtns = comboArea.querySelectorAll('[data-rom]');

    ramBtns.forEach(btn => btn.addEventListener('click', function () {
        selectedRam = btn.getAttribute('data-ram');
        ramBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedRom = null;
        renderRomChoices(p, filtered, selectedRam);
        updateSelectedVariantFromChoices(p, filtered);
    }));

    romBtns.forEach(btn => btn.addEventListener('click', function () {
        selectedRom = btn.getAttribute('data-rom');
        romBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateSelectedVariantFromChoices(p, filtered);
    }));
}

function renderRomChoices(p, variants, ram) {
    var romChoices = document.getElementById('romChoices');
    if (!romChoices) return;
    var roms = [];
    variants.filter(v => !ram || v.ram === ram).forEach(v => {
        if (v.rom && !roms.includes(v.rom)) roms.push(v.rom);
    });
    romChoices.innerHTML = roms.length
        ? roms.map(r => `<button type="button" class="variant_choice" data-rom="${escapeHtml(r)}">${escapeHtml(r)}</button>`).join('')
        : '<span style="color:#aaa;font-size:13px;">Không có bộ nhớ phù hợp</span>';

    romChoices.querySelectorAll('[data-rom]').forEach(btn => btn.addEventListener('click', function () {
        selectedRom = btn.getAttribute('data-rom');
        romChoices.querySelectorAll('[data-rom]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateSelectedVariantFromChoices(p, variants);
    }));
}

function updateSelectedVariantFromChoices(p, variants) {
    if (!selectedColor || !selectedRam || !selectedRom) {
        updateStockAndBuyButton(p);
        return;
    }

    var v = variants.find(x => x.ten_mau === selectedColor && x.ram === selectedRam && x.rom === selectedRom);
    var hintDiv = document.getElementById('variantHint');

    if (!v) {
        selectedVariant = null;
        if (hintDiv) {
            hintDiv.className = 'variant_hint';
            hintDiv.innerText = 'Tổ hợp bạn chọn không tồn tại.';
        }
        updateStockAndBuyButton(p);
        return;
    }

    selectedVariant = v;
    applyVariantImage(p, v);
    if (hintDiv) {
        hintDiv.className = 'variant_hint ok';
        hintDiv.innerText = `Đã chọn: ${v.ten_mau} | ${v.ram} | ${v.rom}`;
    }
    updateStockAndBuyButton(p);
}

function updateStockAndBuyButton(p) {
    var btnMua = document.getElementById('buyButton');
    var stockDiv = document.querySelector('.stock_status');
    var hintDiv = document.getElementById('variantHint');
    if (!btnMua || !stockDiv) return;

    var totalStock = parseInt(p.inventory) || 0;

    if (totalStock <= 0) {
        btnMua.classList.add('disabled');
        btnMua.onclick = function (e) { if (e) e.preventDefault(); };
        stockDiv.innerHTML = 'Hết hàng';
        stockDiv.className = 'stock_status unavailable';
        return;
    }

    if (!selectedVariant) {
        stockDiv.innerHTML = `Còn hàng: ${totalStock} (tổng)`;
        stockDiv.className = 'stock_status available';

        btnMua.classList.add('disabled');
        btnMua.onclick = function (e) { if (e) e.preventDefault(); handleAddToCart(p); };
        btnMua.querySelector('b').innerHTML = '<i class="fa fa-cart-plus"></i> Chọn biến thể để mua';

        if (hintDiv) {
            hintDiv.className = 'variant_hint';
            hintDiv.innerText = 'Vui lòng chọn màu, RAM và bộ nhớ trước khi mua.';
        }
        return;
    }

    var variantStock = parseInt(selectedVariant.so_luong_ton) || 0;
    stockDiv.innerHTML = `Còn hàng: ${variantStock} (${selectedVariant.ten_mau} | ${selectedVariant.ram} | ${selectedVariant.rom})`;
    stockDiv.className = variantStock > 0 ? 'stock_status available' : 'stock_status unavailable';

    if (variantStock > 0) {
        btnMua.classList.remove('disabled');
        btnMua.onclick = function (e) { if (e) e.preventDefault(); handleAddToCart(p); };
        btnMua.querySelector('b').innerHTML = '<i class="fa fa-cart-plus"></i> Thêm vào giỏ hàng';
    } else {
        btnMua.classList.add('disabled');
        btnMua.onclick = function (e) { if (e) e.preventDefault(); handleAddToCart(p); };
        btnMua.querySelector('b').innerText = 'Hết hàng (biến thể đã chọn)';
    }
}

function handleAddToCart(p) {
    if (!selectedVariant) {
        alert('Bạn phải chọn đủ màu, RAM và bộ nhớ trước khi thêm vào giỏ / mua.');
        var picker = document.getElementById('variantPicker');
        if (picker) picker.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    var variantStock = parseInt(selectedVariant.so_luong_ton) || 0;
    if (variantStock <= 0) {
        alert('Biến thể bạn chọn hiện đã hết hàng. Vui lòng chọn cấu hình khác.');
        return;
    }

    themVaoGioHang(
        p.masp,
        p.name,
        selectedVariant.variant_id,
        selectedVariant.ten_mau,
        selectedVariant.ma_mau_hex,
        1,
        selectedVariant.ram,
        selectedVariant.rom
    );
}

function renderProductDetail(p) {
    document.title = p.name + ' - Thế giới điện thoại';
    var div = document.querySelector('.chitietSanpham');

    div.querySelector('h1').innerText = 'Điện thoại ' + p.name;
    document.getElementById('review-product-name').innerText = 'Đánh giá & Nhận xét về ' + p.name;

    div.querySelector('.rating').innerHTML = generateStarHTML(p.star, p.rateCount);

    div.querySelector('.picture img').src = p.img;
    document.getElementById('bigimg').src = p.img;

    var priceArea = div.querySelector('.area_price');
    var giaGoc = numToString(stringToNum(p.price));
    var giaKhuyenMai = (p.promo && p.promo.value != null)
        ? numToString(stringToNum(p.promo.value))
        : '';

    if (p.promo.name !== 'giareonline') {
        priceArea.innerHTML = `<strong>${giaGoc}₫</strong>` + new Promo(p.promo.name, p.promo.value).toWeb();
    } else {
        priceArea.innerHTML = `<strong>${giaKhuyenMai}₫</strong> <span>${giaGoc}₫</span>`;
    }

    document.getElementById('detailPromo').innerText = getPromoDetailString(p);

    var infoUl = div.querySelector('.info');
    infoUl.innerHTML = '';
    var d = p.detail || {};
    var specs = {
        'Màn hình': d.screen,
        'HĐH': d.os,
        'Cam sau': d.camara,
        'Cam trước': d.camaraFront,
        'CPU': d.cpu,
        'RAM': d.ram,
        'Bộ nhớ': d.rom,
        'Pin': d.battery
    };
    for (var k in specs) if (specs[k]) infoUl.innerHTML += `<li><p>${k}</p><div>${specs[k]}</div></li>`;

    var btnMua = document.getElementById('buyButton');
    var stockDiv = document.querySelector('.stock_status');
    var stock = parseInt(p.inventory) || 0;

    variantsHienTai = [];
    resetVariantSelection();

    if (stock > 0) {
        stockDiv.innerHTML = `Còn hàng: ${stock} (tổng)`;
        stockDiv.className = 'stock_status available';

        btnMua.classList.add('disabled');
        btnMua.onclick = function (e) { if (e) e.preventDefault(); handleAddToCart(p); };
        btnMua.querySelector('b').innerHTML = '<i class="fa fa-cart-plus"></i> Chọn biến thể để mua';
    } else {
        stockDiv.innerHTML = 'Hết hàng';
        stockDiv.className = 'stock_status unavailable';
        btnMua.classList.add('disabled');
        btnMua.onclick = function (e) { if (e) e.preventDefault(); };
        btnMua.querySelector('b').innerText = 'Hết hàng';
    }

    var introBox = document.getElementById('productIntro');
    var introContent = document.getElementById('productIntroContent');
    var introText = (p.gioi_thieu_san_pham || '').trim();
    if (introBox && introContent) {
        if (introText) {
            introBox.style.display = 'block';
            introContent.innerText = introText;
        } else {
            introBox.style.display = 'none';
            introContent.innerHTML = '';
        }
    }

    renderSmallImages(p.img);
}

function renderSmallImages(mainImg) {
    var owl = document.querySelector('.div_smallimg.owl-carousel');
    if (owl) {
        owl.innerHTML = '';
        owl.innerHTML += `<div class='item'><img src="${mainImg}" onclick="changepic(this.src)"></div>`;
        var demos = ["img/products/huawei-mate-20-pro-green-600x600.jpg", "img/chitietsanpham/oppo-f9-mau-do-1-org.jpg", "img/chitietsanpham/oppo-f9-mau-do-2-org.jpg"];
        demos.forEach(src => {
            owl.innerHTML += `<div class='item'><img src="${src}" onclick="changepic(this.src)"></div>`;
        });
        if (jQuery().owlCarousel) {
            $('.owl-carousel').trigger('destroy.owl.carousel');
            $('.owl-carousel').owlCarousel({ items: 5, loop: false, margin: 10, nav: false, dots: false });
        }
    }
}

function changepic(src) { document.getElementById("bigimg").src = src; }
function opencertain() { document.getElementById("overlaycertainimg").style.transform = "scale(1)"; }
function closecertain() { document.getElementById("overlaycertainimg").style.transform = "scale(0)"; }

// ====== (PHẦN CÒN LẠI GIỮ NGUYÊN FILE CỦA BẠN) ======
// Các hàm renderSuggestion, review, generateStarHTML, getPromoDetailString... giữ nguyên như đang có trong file của bạn.
// --- LOGIC GỢI Ý ---
function renderSuggestion(currentP, list) {
    var div = document.getElementById('goiYSanPham');
    if (!div) return;
    const giaHienTai = stringToNum(currentP.price);
    const sanPhamTuongTu = list.filter(p => p.masp !== currentP.masp).map(p => {
        const giaP = stringToNum(p.price);
        let diem = 0;
        if (Math.abs(giaP - giaHienTai) < 2000000) diem += 15;
        if (p.company === currentP.company) diem += 20;
        diem += (p.star || 0) * 2;
        return { ...p, diem: diem };
    });
    sanPhamTuongTu.sort((a, b) => b.diem - a.diem);
    var finalResult = sanPhamTuongTu.slice(0, 5);
    if (finalResult.length) {
        var s = `<div class="khungSanPham" style="border-color:#434aa8">
                    <h3 class="tenKhung" style="background-image: linear-gradient(120deg, #434aa8 0%, #004c70 50%, #434aa8 100%);">* SẢN PHẨM TƯƠNG TỰ *</h3>
                    <div class="listSpTrongKhung flexContain">`;
        finalResult.forEach(p => {
            var productObj = new Product(p.masp, p.name, p.img, p.price, p.star, p.rateCount, p.promo);
            s += renderProductCardHTML(productObj);
        });
        s += `</div></div>`;
        div.innerHTML = s;
    }
}

// --- LOGIC BÌNH LUẬN (DATABASE) ---

function checkDaMuaSanPham(user, masp) {
    if (!user.donhang || user.donhang.length === 0) return false;
    // user.donhang giờ đã được tải từ API (user.js)
    for (var don of user.donhang) {
        if (don.tinhTrang === 'Đã nhận hàng' || don.tinhTrang === 'Hoàn thành') {
            for (var sp of don.sp) {
                // API trả về masp hoặc ma, cần check kỹ
                if (sp.ma == masp || sp.masp == masp) return true;
            }
        }
    }
    return false;
}
function displayReviews() {
    var div = document.getElementById('reviews-list');
    div.innerHTML = '<p style="text-align:center">Đang tải đánh giá...</p>';

    fetch('php/get-reviews.php?masp=' + sanPhamHienTai.masp)
        .then(res => res.json())
        .then(list => {
            div.innerHTML = '';
            if (!Array.isArray(list) || list.length === 0) {
                div.innerHTML = '<p id="no-reviews" style="display:block; text-align:center; color:#777;">Chưa có đánh giá nào cho sản phẩm này.</p>';
                return;
            }

            list.forEach(r => {
                var rating = parseInt(r.rating || 0);
                if (rating < 0) rating = 0;
                if (rating > 5) rating = 5;

                var stars = '';
                for (var i = 1; i <= 5; i++) {
                    stars += `<i class="fa ${i <= rating ? 'fa-star' : 'fa-star-o'}"></i>`;
                }

                var mau = r.mau_sac ? r.mau_sac : (r.variant_id ? ('Variant #' + r.variant_id) : '');
                var safeMau = escapeHtml(mau);
                var safeUsername = escapeHtml(r.username);
                var safeComment = escapeHtml(r.comment).replace(/\n/g, '<br>');
                var safeTime = escapeHtml(new Date(r.timestamp).toLocaleString());

                var hex = String(r.ma_mau_hex || '');
                var safeHex = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#000000';

                var swatch = mau
                    ? `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;border:1px solid #ccc;background:${safeHex};margin-right:6px;"></span>`
                    : '';

                var mauHtml = mau
                    ? `<div style="margin-top:4px;font-size:12px;color:#0056b3;">Màu đã mua: ${swatch}<b>${safeMau}</b></div>`
                    : '';

                div.innerHTML += `
    <div class="review-item">
        <div class="reviewer-info">
            <b>${safeUsername}</b>
            <span style="font-size:12px; color:#999">(${safeTime})</span>
        </div>
        <div class="review-stars" style="color:orange">${stars}</div>
        ${mauHtml}
        <div class="review-comment">${safeComment}</div>
    </div>`;
            });
        })
        .catch(err => {
            console.error(err);
            div.innerHTML = '<p style="color:red">Lỗi tải đánh giá!</p>';
        });
}

function setupReviewForm() {
    var user = getCurrentUser();
    var formDiv = document.getElementById('write-review');
    var loginMsg = document.getElementById('loginToReview');

    // Tạo thông báo chưa mua hàng
    var notBoughtMsg = document.getElementById('notBoughtMsg');
    if (!notBoughtMsg) {
        notBoughtMsg = document.createElement('p');
        notBoughtMsg.id = 'notBoughtMsg';
        notBoughtMsg.style.display = 'none';
        notBoughtMsg.style.color = '#e10c00';
        notBoughtMsg.style.background = '#fff3cd';
        notBoughtMsg.style.padding = '10px';
        notBoughtMsg.style.textAlign = 'center';
        notBoughtMsg.style.borderRadius = '6px';
        document.getElementById('review-form-section').prepend(notBoughtMsg);
    }

    if (!user) {
        formDiv.style.display = 'none';
        loginMsg.style.display = 'block';
        notBoughtMsg.style.display = 'none';
        return;
    }

    fetch('php/check-bought-product.php?masp=' + encodeURIComponent(sanPhamHienTai.masp), {
        method: 'GET',
        credentials: 'same-origin'
    })
        .then(function (res) {
            if (!res.ok) throw new Error('CHECK_BUY_FAILED');
            return res.json();
        })
        .then(function (data) {
            if (data && data.bought === true) {
                formDiv.style.display = 'block';
                loginMsg.style.display = 'none';
                notBoughtMsg.style.display = 'none';
            } else {
                formDiv.style.display = 'none';
                loginMsg.style.display = 'none';
                notBoughtMsg.style.display = 'block';
                notBoughtMsg.innerText = 'Bạn cần mua và nhận hàng sản phẩm này để có thể viết đánh giá.';
            }
        })
        .catch(function () {
            // Fallback cũ để không làm thay đổi logic website
            if (!checkDaMuaSanPham(user, sanPhamHienTai.masp)) {
                formDiv.style.display = 'none';
                loginMsg.style.display = 'none';
                notBoughtMsg.style.display = 'block';
                notBoughtMsg.innerText = 'Bạn cần mua và nhận hàng sản phẩm này để có thể viết đánh giá.';
                return;
            }

            formDiv.style.display = 'block';
            loginMsg.style.display = 'none';
            notBoughtMsg.style.display = 'none';
        });
}

function submitReview() {
    var user = getCurrentUser();
    if (!user) { alert("Bạn cần đăng nhập!"); return; }

    var comment = document.getElementById('commentText').value.trim();
    if (selectedRating <= 0) { alert("Vui lòng chọn số sao!"); return; }
    if (comment.length < 5) { alert("Nhận xét quá ngắn!"); return; }

    // [MỚI] Suy ra màu đã mua từ lịch sử đơn (nếu có)
    var extra = null;
    if (user.donhang && Array.isArray(user.donhang)) {
        for (var don of user.donhang) {
            if (don.tinhTrang === 'Đã nhận hàng' || don.tinhTrang === 'Hoàn thành') {
                for (var sp of (don.sp || [])) {
                    if (sp.ma == sanPhamHienTai.masp || sp.masp == sanPhamHienTai.masp) {
                        extra = { variant_id: sp.variant_id || null, mau_sac: sp.mau_sac || null };
                        break;
                    }
                }
            }
            if (extra) break;
        }
    }

    var payload = {
        masp: sanPhamHienTai.masp,
        rating: selectedRating,
        comment: comment
    };

    if (extra && (extra.variant_id || extra.mau_sac)) {
        payload.variant_id = extra.variant_id;
        payload.mau_sac = extra.mau_sac;
    }

    fetch('php/add-review.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(resp => {
            // [MỚI] hỗ trợ cả status (chuẩn mới) và success (chuẩn cũ)
            var ok = (resp && (resp.status === true || resp.success === true));
            if (ok) {
                alert(resp.message || "Gửi đánh giá thành công!");
                resetReviewForm();
                displayReviews();
            } else {
                alert("Lỗi: " + (resp.message || "Không rõ lỗi"));
            }
        })
        .catch(() => alert("Lỗi kết nối Server!"));
}

// --- HELPER UI (Giữ nguyên) ---
function selectStar(rating) {
    selectedRating = rating;
    document.getElementById('starRatingInput').value = String(rating || 0);

    var stars = document.querySelectorAll('.star-rating .fa');
    stars.forEach((s, i) => {
        if (i < rating) {
            s.classList.add('selected');
            s.classList.remove('fa-star-o');
            s.classList.add('fa-star');
        } else {
            s.classList.remove('selected');
            s.classList.remove('fa-star');
            s.classList.add('fa-star-o');
        }
    });
}

function resetReviewForm() {
    selectedRating = 0;
    var ratingInput = document.getElementById('starRatingInput');
    if (ratingInput) ratingInput.value = '0';
    document.getElementById('commentText').value = '';
    var stars = document.querySelectorAll('.star-rating .fa');
    stars.forEach(s => { s.classList.remove('selected'); s.classList.remove('fa-star'); s.classList.add('fa-star-o'); });
}

function generateStarHTML(star, count) {
    var s = "";
    for (var i = 1; i <= 5; i++) s += (i <= star ? '<i class="fa fa-star"></i>' : '<i class="fa fa-star-o"></i>');
    s += `<span> ${count} đánh giá</span>`;
    return s;
}

function getPromoDetailString(p) {
    if (!p.promo) return "";
    if (p.promo.name === 'tragop') return `Trả góp 0% lãi suất.`;
    if (p.promo.name === 'giamgia') return `Giảm ngay ${p.promo.value}₫.`;
    if (p.promo.name === 'giareonline') return `Giá sốc online ${p.promo.value}₫.`;
    return `Nhiều ưu đãi hấp dẫn.`;
}