// js/pages/home.js

// Biến toàn cục lưu trạng thái bộ lọc
var filtersFromUrl = {
    company: '',
    search: '',
    price: '',
    promo: '',
    star: '',
    page: 1,
    sort: {
        by: '',
        type: 'ascending'
    }
}

var soLuongSanPhamMaxTrongMotTrang = 15;

window.onload = function() {
    khoiTao(); // Hàm từ core/init.js

    // 1. CẬP NHẬT DỮ LIỆU SAO ĐÁNH GIÁ (QUAN TRỌNG)
    // Tính toán lại star và rateCount từ dữ liệu bình luận thực tế
    if (typeof list_products !== 'undefined') {
        list_products.forEach(p => {
            var ratingInfo = getRatingInfo(p.masp); // Hàm từ core/utils.js
            // Chỉ cập nhật nếu có đánh giá
            if(ratingInfo.rateCount > 0){
                p.star = ratingInfo.star;
                p.rateCount = ratingInfo.rateCount;
            }
        });

        // [SỬA LỖI QUAN TRỌNG]: Lưu ngược lại vào Database để các hàm vẽ giao diện đọc được dữ liệu mới
        setListProducts(list_products); 
    }

    // 2. SETUP GIAO DIỆN CƠ BẢN
    setupBanner();
    setupCompanyMenu();
    setupFilterDropdowns(); 

    // 3. XỬ LÝ URL & HIỂN THỊ
    var urlFilters = getFilterFromURL(); 

    if (urlFilters.length > 0) {
        // ==> CÓ BỘ LỌC
        document.querySelector('.contain-products').style.display = 'block';
        document.querySelector('.contain-khungSanPham').style.display = 'none';
        document.querySelector('.banner').style.display = 'none';
        
        phanTich_URL(urlFilters);
        addAllChoosedFilter();

    } else {
        // ==> TRANG CHỦ MẶC ĐỊNH
        document.querySelector('.contain-products').style.display = 'none';
        document.querySelector('.contain-khungSanPham').style.display = 'block';
        
        renderHomeSections();
    }
};

// ================================================================
// PHẦN 1: LOGIC XỬ LÝ URL VÀ LỌC DỮ LIỆU
// ================================================================

function getFilterFromURL() {
    var fullLocation = window.location.href;
    var searchSplit = fullLocation.split('?');
    return searchSplit[1] ? searchSplit[1].split('&') : [];
}

function phanTich_URL(filters) {
    var result = copyObject(getListProducts()); // Lấy danh sách từ LocalStorage (lúc này đã được update)

    for (var i = 0; i < filters.length; i++) {
        var [key, value] = filters[i].split('=');
        value = decodeURIComponent(value);

        switch (key) {
            case 'search':
                value = value.split('+').join(' ');
                filtersFromUrl.search = value;
                result = timKiemTheoTen(result, value);
                break;

            case 'price':
                filtersFromUrl.price = value;
                var [min, max] = value.split('-');
                result = timKiemTheoGiaTien(result, parseInt(min), parseInt(max));
                break;

            case 'company':
                filtersFromUrl.company = value;
                result = result.filter(p => p.company.toUpperCase() === value.toUpperCase());
                break;

            case 'star':
                filtersFromUrl.star = value;
                result = result.filter(p => p.star >= parseInt(value));
                break;

            case 'promo':
                filtersFromUrl.promo = value;
                result = result.filter(p => p.promo.name === value);
                break;

            case 'page':
                filtersFromUrl.page = parseInt(value);
                break;

            case 'sort':
                var [by, type] = value.split('-');
                filtersFromUrl.sort = { by, type };
                
                result.sort(function(a, b) {
                    var valA, valB;
                    if (by === 'price') { valA = stringToNum(a.price); valB = stringToNum(b.price); }
                    else if (by === 'star') { valA = a.star; valB = b.star; }
                    else if (by === 'rateCount') { valA = a.rateCount; valB = b.rateCount; }
                    else { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); }

                    if (valA < valB) return type === 'decrease' ? 1 : -1;
                    if (valA > valB) return type === 'decrease' ? -1 : 1;
                    return 0;
                });
                break;
        }
    }

    var totalPages = Math.ceil(result.length / soLuongSanPhamMaxTrongMotTrang);
    if(filtersFromUrl.page > totalPages) filtersFromUrl.page = totalPages || 1;

    var start = (filtersFromUrl.page - 1) * soLuongSanPhamMaxTrongMotTrang;
    var end = start + soLuongSanPhamMaxTrongMotTrang;
    var pageProducts = result.slice(start, end);

    renderProductsToDOM(pageProducts);
    themNutPhanTrang(totalPages, filtersFromUrl.page);
}

function timKiemTheoGiaTien(list, min, max) {
    return list.filter(p => {
        var gia = stringToNum(p.price);
        return gia >= min && (max === 0 ? true : gia <= max);
    });
}

function renderProductsToDOM(list) {
    var ul = document.getElementById('products');
    var thongbao = document.getElementById('khongCoSanPham');
    ul.innerHTML = '';

    if (list.length === 0) {
        thongbao.style.display = 'block';
        thongbao.style.width = "auto";
        thongbao.style.opacity = "1";
    } else {
        thongbao.style.display = 'none';
        list.forEach(p => {
            var productObj = new Product(p.masp, p.name, p.img, p.price, p.star, p.rateCount, p.promo);
            ul.innerHTML += renderProductCardHTML(productObj);
        });
    }
}

// ================================================================
// PHẦN 2: PHÂN TRANG
// ================================================================

function themNutPhanTrang(soTrang, trangHienTai) {
    var divPhanTrang = document.querySelector('.pagination');
    divPhanTrang.innerHTML = '';

    if (soTrang <= 1) return;

    var url = createLinkFilter('remove', 'page'); 
    url += (url.indexOf('?') > -1 ? '&' : '?');

    if (trangHienTai > 1) {
        divPhanTrang.innerHTML += `<a href="${url}page=${trangHienTai - 1}"><i class="fa fa-angle-left"></i></a>`;
    }

    for (var i = 1; i <= soTrang; i++) {
        if (i == trangHienTai) {
            divPhanTrang.innerHTML += `<a href="javascript:;" class="current">${i}</a>`;
        } else {
            divPhanTrang.innerHTML += `<a href="${url}page=${i}">${i}</a>`;
        }
    }

    if (trangHienTai < soTrang) {
        divPhanTrang.innerHTML += `<a href="${url}page=${trangHienTai + 1}"><i class="fa fa-angle-right"></i></a>`;
    }
}

// ================================================================
// PHẦN 3: RENDER TRANG CHỦ MẶC ĐỊNH
// ================================================================

function renderHomeSections() {
    var div = document.querySelector('.contain-khungSanPham');
    div.innerHTML = '';

    var list = getListProducts(); // Bây giờ list này đã có số sao mới nhất
    var yellow_red = ['#ff9c00', '#ec1f1f'];
    var blue = ['#42bcf4', '#004c70'];
    var green = ['#5de272', '#007012'];
    
    var limit = (window.innerWidth < 1200 ? 4 : 5); 

    // 1. Sản phẩm bán chạy
    var banChay = getTopSellingProducts(limit);
    if (banChay.length === 0) banChay = list.slice(0, limit); 
    addKhungSanPham('SẢN PHẨM BÁN CHẠY', yellow_red, banChay, div, 'sort=rateCount-decrease');

    // 2. Nổi bật nhất (Nhiều sao)
    var noiBat = list.filter(p => p.star >= 3).slice(0, limit);
    addKhungSanPham('NỔI BẬT NHẤT', yellow_red, noiBat, div, 'star=3&sort=rateCount-decrease');

    // 3. Mới ra mắt
    var moiRaMat = list.filter(p => p.promo.name === 'moiramat').slice(0, limit);
    addKhungSanPham('SẢN PHẨM MỚI', blue, moiRaMat, div, 'promo=moiramat&sort=rateCount-decrease');

    // 4. Trả góp
    var traGop = list.filter(p => p.promo.name === 'tragop').slice(0, limit);
    addKhungSanPham('TRẢ GÓP 0%', yellow_red, traGop, div, 'promo=tragop');

    // 5. Giá sốc Online
    var giaSoc = list.filter(p => p.promo.name === 'giareonline').slice(0, limit);
    addKhungSanPham('GIÁ SỐC ONLINE', green, giaSoc, div, 'promo=giareonline');

    // 6. Giảm giá lớn
    var giamGia = list.filter(p => p.promo.name === 'giamgia').slice(0, limit);
    addKhungSanPham('GIẢM GIÁ LỚN', yellow_red, giamGia, div, 'promo=giamgia');
    
    // 7. Giá rẻ cho mọi nhà (Dưới 3tr)
    var giaRe = list.filter(p => stringToNum(p.price) <= 3000000).slice(0, limit);
    addKhungSanPham('GIÁ RẺ CHO MỌI NHÀ', green, giaRe, div, 'price=0-3000000');
}

function addKhungSanPham(tenKhung, color, products, ele, filterQuery) {
	var gradient = `background-image: linear-gradient(120deg, ${color[0]} 0%, ${color[1]} 50%, ${color[0]} 100%);`
	var borderColor = `border-color: ${color[0]}`;
	var borderA = `border-left: 2px solid ${color[0]}; border-right: 2px solid ${color[0]};`;

	var s = `<div class="khungSanPham" style="${borderColor}">
				<h3 class="tenKhung" style="${gradient}">* ${tenKhung} *</h3>
				<div class="listSpTrongKhung flexContain">`;

	products.forEach(p => {
		s += renderProductCardHTML(new Product(p.masp, p.name, p.img, p.price, p.star, p.rateCount, p.promo));
	});

	s += `</div>
			<a class="xemTatCa" href="index.html?${filterQuery || ''}" style="${borderA}">
				Xem tất cả
			</a>
		</div> <hr>`;

	ele.innerHTML += s;
}

// ================================================================
// PHẦN 4: SETUP CÁC DROPDOWN FILTER & TAGS
// ================================================================

function addAllChoosedFilter() {
    var div = document.querySelector('.choosedFilter');
    div.innerHTML = '';

    if(window.location.href.includes('?')) {
        div.innerHTML += `<a id="deleteAllFilter" href="index.html"><h3>Xóa bộ lọc</h3></a>`;
    }

    if (filtersFromUrl.company) addTag('company', filtersFromUrl.company);
    if (filtersFromUrl.search) addTag('search', 'Tìm: "' + filtersFromUrl.search + '"');
    if (filtersFromUrl.price) {
        var [min, max] = filtersFromUrl.price.split('-');
        var text = (max === '0') ? `Trên ${min/1E6} triệu` : `Từ ${min/1E6} - ${max/1E6} triệu`;
        if(min==='0') text = `Dưới ${max/1E6} triệu`;
        addTag('price', text);
    }
    if (filtersFromUrl.promo) {
        var mapPromo = { 'tragop': 'Trả góp', 'giamgia': 'Giảm giá', 'giareonline': 'Giá rẻ online', 'moiramat': 'Mới ra mắt' };
        addTag('promo', mapPromo[filtersFromUrl.promo]);
    }
    if (filtersFromUrl.star) addTag('star', `Trên ${filtersFromUrl.star} sao`);
    if (filtersFromUrl.sort.by) {
        var text = (filtersFromUrl.sort.type == 'decrease' ? 'Giảm dần' : 'Tăng dần');
        var mapSort = {'price': 'Giá', 'star': 'Sao', 'rateCount': 'Đánh giá', 'name': 'Tên'};
        addTag('sort', `${mapSort[filtersFromUrl.sort.by]} ${text}`);
    }

    function addTag(type, textInside) {
        var link = createLinkFilter('remove', type);
        div.innerHTML += `<a href="${link}"><h3>${textInside} <i class="fa fa-close"></i></h3></a>`;
    }
}

function createLinkFilter(action, key, value) {
    var params = copyObject(filtersFromUrl);
    params.page = 1; 

    if (action === 'add') {
        if (key === 'sort') {
            params.sort = value; 
        } else {
            params[key] = value;
        }
    } else if (action === 'remove') {
        if (key === 'sort') params.sort = { by: '', type: '' };
        else params[key] = '';
    }

    var link = 'index.html?';
    var queries = [];
    if (params.company) queries.push(`company=${params.company}`);
    if (params.search) queries.push(`search=${params.search}`);
    if (params.price) queries.push(`price=${params.price}`);
    if (params.promo) queries.push(`promo=${params.promo}`);
    if (params.star) queries.push(`star=${params.star}`);
    if (params.sort.by) queries.push(`sort=${params.sort.by}-${params.sort.type}`);
    
    return link + queries.join('&');
}

function setupFilterDropdowns() {
    var prices = [
        {t: 'Dưới 2 triệu', v: '0-2000000'},
        {t: 'Từ 2 - 4 triệu', v: '2000000-4000000'},
        {t: 'Từ 4 - 7 triệu', v: '4000000-7000000'},
        {t: 'Từ 7 - 13 triệu', v: '7000000-13000000'},
        {t: 'Trên 13 triệu', v: '13000000-0'}
    ];
    fillDropdown('pricesRangeFilter', prices, 'price');

    var promos = [
        {t: 'Giảm giá', v: 'giamgia'},
        {t: 'Trả góp', v: 'tragop'},
        {t: 'Mới ra mắt', v: 'moiramat'},
        {t: 'Giá rẻ online', v: 'giareonline'}
    ];
    fillDropdown('promosFilter', promos, 'promo');

    var stars = [
        {t: 'Trên 3 sao', v: '3'},
        {t: 'Trên 4 sao', v: '4'},
        {t: 'Trên 5 sao', v: '5'}
    ];
    fillDropdown('starFilter', stars, 'star');

    var sorts = [
        {t: 'Giá tăng dần', v: {by: 'price', type: 'ascending'}},
        {t: 'Giá giảm dần', v: {by: 'price', type: 'decrease'}},
        {t: 'Tên A-Z', v: {by: 'name', type: 'ascending'}},
        {t: 'Tên Z-A', v: {by: 'name', type: 'decrease'}}
    ];
    fillDropdownSort('sortFilter', sorts);
}

function fillDropdown(cls, list, type) {
    var div = document.querySelector(`.${cls} .dropdown-content`);
    if(!div) return;
    div.innerHTML = '';
    list.forEach(item => {
        var link = createLinkFilter('add', type, item.v);
        div.innerHTML += `<a href="${link}">${item.t}</a>`;
    });
}

function fillDropdownSort(cls, list) {
    var div = document.querySelector(`.${cls} .dropdown-content`);
    if(!div) return;
    div.innerHTML = '';
    list.forEach(item => {
        var link = createLinkFilter('add', 'sort', item.v);
        div.innerHTML += `<a href="${link}">${item.t}</a>`;
    });
}

function setupBanner() {
    var bannerContainer = document.querySelector('.owl-carousel');
    if (!bannerContainer) return;
    var banners = ["img/banners/banner0.gif"];
    for (var i = 1; i <= 9; i++) banners.push("img/banners/banner" + i + ".png");
    var s = "";
    banners.forEach(b => s += `<div class='item'><a target='_blank' href='#'><img src='${b}'></a></div>`);
    bannerContainer.innerHTML = s;
    var owl = $('.owl-carousel');
    if (owl.length) owl.owlCarousel({ items: 1.5, margin: 100, center: true, loop: true, smartSpeed: 450, autoplay: true, autoplayTimeout: 3500 });
}

function setupCompanyMenu() {
    var companies = ["Apple", "Samsung", "Oppo", "Nokia", "Huawei", "Xiaomi", "Realme", "Vivo"];
    var menu = document.querySelector('.companyMenu');
    if (menu) {
        menu.innerHTML = '';
        companies.forEach(c => {
            var link = createLinkFilter('add', 'company', c);
            menu.innerHTML += `<a href="${link}"><img src="img/company/${c}.jpg"></a>`;
        });
    }
}

function filterProductsName(ele) {
    var filter = ele.value.toUpperCase();
    var listLi = document.getElementById('products').getElementsByTagName('li');
    var coSanPham = false;
    
    for (var i = 0; i < listLi.length; i++) {
        var name = listLi[i].getElementsByTagName('h3')[0].innerText;
        if (name.toUpperCase().indexOf(filter) > -1) {
            listLi[i].style.display = "";
            coSanPham = true;
        } else {
            listLi[i].style.display = "none";
        }
    }
    var tb = document.getElementById('khongCoSanPham');
    tb.style.display = coSanPham ? 'none' : 'block';
}

// ================================================================
// PHẦN 5: CÁC HÀM LOGIC BỔ SUNG
// ================================================================

function getTopSellingProducts(limit) {
    var listUser = getListUser(); 
    var counts = {}; 

    listUser.forEach(u => {
        if (u.donhang && Array.isArray(u.donhang)) {
            u.donhang.forEach(dh => {
                if (dh.tinhTrang === 'Hoàn thành' || dh.tinhTrang === 'Đã nhận hàng') {
                    if (dh.sp && Array.isArray(dh.sp)) {
                        dh.sp.forEach(item => {
                            if (!counts[item.ma]) counts[item.ma] = 0;
                            counts[item.ma] += parseInt(item.soluong || 1);
                        });
                    }
                }
            });
        }
    });

    var sortedArray = Object.keys(counts).map(key => {
        return { ma: key, qty: counts[key] };
    });

    sortedArray.sort((a, b) => b.qty - a.qty);

    var result = [];
    var listProd = getListProducts();
    var count = 0;
    
    for (var i = 0; i < sortedArray.length; i++) {
        var p = listProd.find(x => x.masp == sortedArray[i].ma);
        if (p) {
            result.push(p);
            count++;
        }
        if (count >= limit) break; 
    }

    return result;
}