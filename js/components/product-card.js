// js/components/product-card.js

// Hàm này nhận vào object Product và trả về chuỗi HTML
function renderProductCardHTML(p) {
    var rawMasp = String(p.masp || '');
    var rawName = String(p.name || '');
    var rawImg = String(p.img || '');

    var safeMasp = escapeHtml(rawMasp);
    var safeName = escapeHtml(rawName);
    var safeImg = escapeAttr(rawImg);

    // 1. Xử lý sao đánh giá
    var rating = "";
    var star = parseInt(p.star || 0);
    var rateCount = parseInt(p.rateCount || 0);

    if (star < 0) star = 0;
    if (star > 5) star = 5;

    if (rateCount > 0) {
        for (var i = 1; i <= 5; i++) {
            rating += (i <= star) ? `<i class="fa fa-star"></i>` : `<i class="fa fa-star-o"></i>`;
        }
        rating += `<span>${rateCount} đánh giá</span>`;
    }

    // 2. Chuẩn hóa giá tiền (products.gia = giá thấp nhất variant)
    var listPrice = stringToNum(p.price);
    var sellPrice = getEffectiveProductPrice(p, listPrice);

    var price = `<strong>${numToString(sellPrice)}&#8363;</strong>`;

    if (p.promo && p.promo.name === 'giareonline' && listPrice > sellPrice) {
        price = `<strong>${numToString(sellPrice)}&#8363;</strong><span>${numToString(listPrice)}&#8363;</span>`;
    }

    // 3. Link chi tiết
    var chitietSp = 'chitietsanpham.html?' + encodeURIComponent(rawName.split(' ').join('-'));

    // 4. Promo label
    var promoObj = new Promo(p.promo.name, p.promo.value);

    // 5. Dữ liệu truyền vào onclick, dùng encodeURIComponent để tránh phá HTML/JS
    var encodedMasp = encodeURIComponent(rawMasp);
    var encodedName = encodeURIComponent(rawName);

    return `
    <li class="sanPham">
        <a href="${chitietSp}">
            <img src="${safeImg}" alt="${safeName}">
            <h3>${safeName}</h3>
            <div class="price">${price}</div>
            <div class="ratingresult">${rating}</div>
            ${promoObj.toWeb()}
            <div class="tooltip">
                <button class="themvaogio" aria-label="Thêm vào giỏ" title="Thêm vào giỏ" onclick="themVaoGioHang(decodeURIComponent('${encodedMasp}'), decodeURIComponent('${encodedName}')); return false;">
                    <i class="fa fa-plus" aria-hidden="true"></i>
                </button>
            </div>
        </a>
    </li>`;
}

// Hàm Wrapper để thêm trực tiếp vào DOM (giữ tương thích code cũ)
function addProduct(p, ele, returnString) {
    if (!p) return;
    
    // Chuyển đổi dữ liệu thô thành Class (nếu chưa phải)
    // Lưu ý: Code cũ có thể truyền object thuần
    var promo = new Promo(p.promo.name, p.promo.value);
    var product = new Product(p.masp, p.name, p.img, p.price, p.star, p.rateCount, promo, p.detail, p.inventory);

    var html = renderProductCardHTML(product);

    if (returnString) return html;

    // Mặc định thêm vào id='products'
    var target = ele || document.getElementById('products');
    if (target) target.innerHTML += html;
}