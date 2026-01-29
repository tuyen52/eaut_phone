// js/components/product-card.js

// Hàm này nhận vào object Product và trả về chuỗi HTML
function renderProductCardHTML(p) {
    // 1. Xử lý sao đánh giá
    var rating = "";
    if (p.rateCount > 0) {
        for (var i = 1; i <= 5; i++) {
            rating += (i <= p.star) ? `<i class="fa fa-star"></i>` : `<i class="fa fa-star-o"></i>`;
        }
        rating += `<span>${p.rateCount} đánh giá</span>`;
    }

    // 2. Xử lý giá tiền
    var price = `<strong>${p.price}&#8363;</strong>`;
    if (p.promo && p.promo.name == "giareonline") {
        price = `<strong>${p.promo.value}&#8363;</strong><span>${p.price}&#8363;</span>`;
    }

    // 3. Tạo link chi tiết (Thay khoảng trắng bằng dấu -)
    var chitietSp = 'chitietsanpham.html?' + (p.name ? p.name.split(' ').join('-') : '');

    // 4. Tạo Promo Label (Dùng class Promo trong core/classes.js)
    var promoObj = new Promo(p.promo.name, p.promo.value);
    
    // 5. Kết hợp thành HTML
    return `
    <li class="sanPham">
        <a href="${chitietSp}">
            <img src="${p.img}" alt="${p.name}">
            <h3>${p.name}</h3>
            <div class="price">${price}</div>
            <div class="ratingresult">${rating}</div>
            ${promoObj.toWeb()}
            <div class="tooltip">
                <button class="themvaogio" onclick="themVaoGioHang('${p.masp}', '${p.name}'); return false;">
                    <span class="tooltiptext" style="font-size: 15px;">Thêm vào giỏ</span>
                    +
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