// js/pages/product-detail.js

var sanPhamHienTai = null;
var selectedRating = 0; 

window.onload = function() {
    khoiTao(); // core/init.js

    // Lấy tên sản phẩm từ URL
    var nameProduct = window.location.href.split('?')[1];
    if(!nameProduct) { showNotFound(); return; }

    nameProduct = decodeURIComponent(nameProduct.split('-').join(' '));
    // list_products được tải từ DB ở init.js
    sanPhamHienTai = getListProducts().find(p => p.name.toUpperCase() === nameProduct.toUpperCase());

    if(!sanPhamHienTai) { showNotFound(); return; }

    // Render giao diện
    renderProductDetail(sanPhamHienTai);
    renderSuggestion(sanPhamHienTai, getListProducts());

    // [MỚI] Gọi API tải bình luận từ Database
    displayReviews(); 
    
    // Setup form
    setupReviewForm();
}

function showNotFound() {
    var div = document.getElementById('productNotFound');
    if(div) div.style.display = 'block';
    var detail = document.querySelector('.chitietSanpham');
    if(detail) detail.style.display = 'none';
}

function renderProductDetail(p) {
    document.title = p.name + ' - Thế giới điện thoại';
    var div = document.querySelector('.chitietSanpham');
    
    div.querySelector('h1').innerText = 'Điện thoại ' + p.name;
    document.getElementById('review-product-name').innerText = 'Đánh giá & Nhận xét về ' + p.name;
    
    // Hiển thị sao và số đánh giá lấy từ dữ liệu sản phẩm (đã được update từ DB)
    div.querySelector('.rating').innerHTML = generateStarHTML(p.star, p.rateCount);

    div.querySelector('.picture img').src = p.img;
    document.getElementById('bigimg').src = p.img;
    
    var priceArea = div.querySelector('.area_price');
    if(p.promo.name !== 'giareonline') {
        priceArea.innerHTML = `<strong>${p.price}₫</strong>` + new Promo(p.promo.name, p.promo.value).toWeb();
    } else {
        priceArea.innerHTML = `<strong>${p.promo.value}₫</strong> <span>${p.price}₫</span>`;
    }
    
    document.getElementById('detailPromo').innerText = getPromoDetailString(p);

    var infoUl = div.querySelector('.info');
    infoUl.innerHTML = '';
    var d = p.detail || {};
    var specs = {'Màn hình': d.screen, 'HĐH': d.os, 'Cam sau': d.camara, 'Cam trước': d.camaraFront, 'CPU': d.cpu, 'RAM': d.ram, 'Bộ nhớ': d.rom, 'Pin': d.battery};
    for(var k in specs) if(specs[k]) infoUl.innerHTML += `<li><p>${k}</p><div>${specs[k]}</div></li>`;

    var btnMua = document.getElementById('buyButton');
    var stockDiv = document.querySelector('.stock_status');
    var stock = parseInt(p.inventory) || 0;

    if(stock > 0) {
        stockDiv.innerHTML = `Còn hàng: ${stock}`;
        stockDiv.className = 'stock_status available';
        btnMua.onclick = function() { themVaoGioHang(p.masp, p.name); };
        btnMua.classList.remove('disabled');
        btnMua.querySelector('b').innerHTML = '<i class="fa fa-cart-plus"></i> Thêm vào giỏ hàng';
    } else {
        stockDiv.innerHTML = 'Hết hàng';
        stockDiv.className = 'stock_status unavailable';
        btnMua.classList.add('disabled');
        btnMua.onclick = null;
        btnMua.querySelector('b').innerText = 'Hết hàng';
    }

    renderSmallImages(p.img);
}

function renderSmallImages(mainImg) {
    var owl = document.querySelector('.div_smallimg.owl-carousel');
    if(owl) {
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

// --- LOGIC GỢI Ý ---
function renderSuggestion(currentP, list) {
    var div = document.getElementById('goiYSanPham');
    if(!div) return;
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
    if(finalResult.length) {
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
    if(!user.donhang || user.donhang.length === 0) return false;
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

// [THAY ĐỔI] Gọi API lấy bình luận
function displayReviews() {
    var div = document.getElementById('reviews-list');
    div.innerHTML = '<p style="text-align:center">Đang tải đánh giá...</p>';

    fetch('php/get-reviews.php?masp=' + sanPhamHienTai.masp)
    .then(res => res.json())
    .then(list => {
        div.innerHTML = '';
        if (list.length === 0) {
            div.innerHTML = '<p id="no-reviews" style="display:block; text-align:center; color:#777;">Chưa có đánh giá nào cho sản phẩm này.</p>';
        } else {
            list.forEach(r => {
                var stars = '';
                for(var i=1; i<=5; i++) stars += `<i class="fa ${i<=r.rating?'fa-star':'fa-star-o'}"></i>`;
                div.innerHTML += `
                <div class="review-item">
                    <div class="reviewer-info"><b>${r.username}</b> <span style="font-size:12px; color:#999">(${new Date(r.timestamp).toLocaleString()})</span></div>
                    <div class="review-stars" style="color:orange">${stars}</div>
                    <div class="review-comment">${r.comment.replace(/\n/g, '<br>')}</div>
                </div>`;
            });
        }
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
        notBoughtMsg.style.borderRadius = '5px';
        notBoughtMsg.innerHTML = '<i class="fa fa-exclamation-circle"></i> Bạn cần <b>mua sản phẩm này</b> và xác nhận <b>"Đã nhận hàng"</b> mới có thể viết đánh giá.';
        document.getElementById('review-form-section').appendChild(notBoughtMsg);
    }

    if(user) {
        loginMsg.style.display = 'none';
        
        // Cần đảm bảo user.donhang đã được load. 
        // Do trang detail không tự gọi fetchOrderHistory, ta kiểm tra nếu chưa có thì fetch nhẹ
        if(!user.donhang) {
             fetch('php/get-order-history.php?username=' + user.username)
            .then(res=>res.json())
            .then(data => {
                user.donhang = data;
                setCurrentUser(user);
                checkShowForm(user);
            });
        } else {
            checkShowForm(user);
        }

    } else {
        formDiv.style.display = 'none';
        notBoughtMsg.style.display = 'none';
        loginMsg.style.display = 'block';
    }

    function checkShowForm(u) {
        if (checkDaMuaSanPham(u, sanPhamHienTai.masp)) {
            formDiv.style.display = 'block';
            notBoughtMsg.style.display = 'none';
            resetReviewForm();
        } else {
            formDiv.style.display = 'none';
            notBoughtMsg.style.display = 'block';
        }
    }
}

// [THAY ĐỔI] Gửi đánh giá lên API
function handleReviewSubmit() {
    var user = getCurrentUser();
    
    if (!checkDaMuaSanPham(user, sanPhamHienTai.masp)) {
        alert('Lỗi: Bạn chưa mua sản phẩm này!');
        return;
    }

    var comment = document.getElementById('commentText').value.trim();
    if(selectedRating === 0) { alert('Vui lòng chọn số sao!'); return; }
    if(comment.length < 10) { alert('Nội dung đánh giá quá ngắn (tối thiểu 10 ký tự).'); return; }

    var data = {
        masp: sanPhamHienTai.masp,
        username: user.username,
        rating: selectedRating,
        comment: comment
    };

    fetch('php/add-review.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(resp => {
        if(resp.status) {
            alert(resp.message);
            displayReviews(); // Tải lại danh sách
            resetReviewForm();
        } else {
            alert("Lỗi: " + resp.message);
        }
    })
    .catch(err => alert("Lỗi kết nối Server!"));
}

// --- HELPER UI (Giữ nguyên) ---
function hoverStars(rating) {
    var stars = document.querySelectorAll('.star-rating .fa');
    stars.forEach((s, i) => {
        if(i < rating) { s.classList.remove('fa-star-o'); s.classList.add('fa-star'); } 
        else { s.classList.remove('fa-star'); s.classList.add('fa-star-o'); }
    });
}

function resetStars() {
    var stars = document.querySelectorAll('.star-rating .fa');
    stars.forEach(s => {
        if(!s.classList.contains('selected')) { s.classList.remove('fa-star'); s.classList.add('fa-star-o'); }
        else { s.classList.remove('fa-star-o'); s.classList.add('fa-star'); }
    });
}

function selectStar(rating) {
    selectedRating = rating;
    var stars = document.querySelectorAll('.star-rating .fa');
    stars.forEach((s, i) => {
        if(i < rating) { s.classList.add('selected'); s.classList.remove('fa-star-o'); s.classList.add('fa-star'); }
        else { s.classList.remove('selected'); s.classList.remove('fa-star'); s.classList.add('fa-star-o'); }
    });
}

function resetReviewForm() {
    selectedRating = 0;
    document.getElementById('commentText').value = '';
    var stars = document.querySelectorAll('.star-rating .fa');
    stars.forEach(s => { s.classList.remove('selected'); s.classList.remove('fa-star'); s.classList.add('fa-star-o'); });
}

function generateStarHTML(star, count) {
    var s = "";
    for(var i=1; i<=5; i++) s += (i<=star ? '<i class="fa fa-star"></i>' : '<i class="fa fa-star-o"></i>');
    s += `<span> ${count} đánh giá</span>`;
    return s;
}

function getPromoDetailString(p) {
    if(!p.promo) return "";
    if(p.promo.name === 'tragop') return `Trả góp 0% lãi suất.`;
    if(p.promo.name === 'giamgia') return `Giảm ngay ${p.promo.value}₫.`;
    if(p.promo.name === 'giareonline') return `Giá sốc online ${p.promo.value}₫.`;
    return `Nhiều ưu đãi hấp dẫn.`;
}