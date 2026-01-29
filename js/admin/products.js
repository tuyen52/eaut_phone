// js/admin/products.js

var decrease = true; 

// ======================= QUẢN LÝ SẢN PHẨM =======================

function addTableProducts() {
    var tc = document.querySelector('.sanpham .table-content');
    if (!tc) return;

    // Lúc này list_products đã được load từ DB ở init.js rồi, nhưng ta nên fetch lại cho chắc chắn mới nhất
    fetch('php/get-products.php')
    .then(res => res.json())
    .then(data => {
        list_products = data;
        renderProductTable(list_products);
    });
}

function renderProductTable(list) {
    var tc = document.querySelector('.sanpham .table-content');
    var s = `<table class="table-outline hideImg">`;

    // Sắp xếp theo mã
    list.sort((a,b) => (a.masp || '').localeCompare(b.masp || ''));

    for (var i = 0; i < list.length; i++) {
        var p = list[i];
         if (!p) continue;
         var productNameForLink = (p.name || '').split(' ').join('-'); 

        s += `<tr>
            <td style="width: 5%">${i + 1}</td>
            <td style="width: 10%">${p.masp}</td>
            <td style="width: 40%">
                <a title="Xem chi tiết" target="_blank" href="chitietsanpham.html?${productNameForLink}"> ${p.name} </a>
                <img src="${p.img}" alt="${p.name}"> 
            </td>
            <td style="width: 15%">${numToString(parseInt(p.price))}</td>
            <td style="width: 15%">${promoToStringValue(p.promo)}</td>
            <td style="width: 15%">
                <div class="tooltip">
                    <i class="fa fa-wrench" onclick="addKhungSuaSanPham('${p.masp}')"></i>
                    <span class="tooltiptext">Sửa</span>
                </div>
                <div class="tooltip">
                    <i class="fa fa-trash" onclick="xoaSanPham('${p.masp}', '${p.name}')"></i> 
                    <span class="tooltiptext">Xóa</span>
                </div>
            </td>
        </tr>`;
    }
    s += `</table>`;
    tc.innerHTML = s;
}

// ======================= CRUD SẢN PHẨM (GỌI API PHP) =======================

// 1. Thêm sản phẩm
function themSanPham() {
    var newSp = layThongTinSanPhamTuTable('khungThemSanPham');
    if (!newSp) return;

    // Gọi API PHP
    fetch('php/admin/add-product.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSp)
    })
    .then(res => res.json())
    .then(data => {
        if(data.status) {
            alert(data.message);
            document.getElementById('khungThemSanPham').style.transform = 'scale(0)';
            addTableProducts(); // Tải lại bảng từ DB
        } else {
            alert("Lỗi: " + data.message);
        }
    })
    .catch(err => alert("Lỗi kết nối Server!"));
}

// 2. Xóa sản phẩm
function xoaSanPham(masp, tensp) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm "' + tensp + '"?')) {
        fetch('php/admin/delete-product.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ masp: masp })
        })
        .then(res => res.json())
        .then(data => {
            if(data.status) {
                alert(data.message);
                addTableProducts(); // Tải lại bảng
            } else {
                alert("Lỗi: " + data.message);
            }
        })
        .catch(err => alert("Lỗi kết nối Server!"));
    }
}

// 3. Sửa sản phẩm
function addKhungSuaSanPham(masp) {
    var sp = list_products.find(p => p.masp == masp);
    if (!sp) return;

    var khung = document.getElementById('khungSuaSanPham');
    var html = `
    <span class="close" onclick="this.parentElement.style.transform = 'scale(0)';">&times;</span>
    <form>
        <table class="overlayTable table-outline table-content table-header">
            <tr><th colspan="2">Sửa Sản Phẩm: ${sp.name}</th></tr>
            <tr><td>Mã sản phẩm:</td><td><input type="text" value="${sp.masp}" readonly></td></tr>
            <tr><td>Tên sản phẩm:</td><td><input type="text" value="${sp.name}" required></td></tr>
            <tr><td>Hãng:</td><td>
                <select name="chonCompany">
                    ${["Apple", "Samsung", "Oppo", "Nokia", "Huawei", "Xiaomi", "Realme", "Vivo"]
                      .map(c => `<option value="${c}" ${sp.company==c?'selected':''}>${c}</option>`).join('')}
                </select>
            </td></tr>
            <tr><td>Hình:</td><td>
                <img class="hinhDaiDien" id="anhSua" src="${sp.img}">
                <input type="file" accept="image/*" onchange="capNhatAnhSanPham(this.files, 'anhSua')">
            </td></tr>
            <tr><td>Giá tiền:</td><td><input type="text" value="${sp.price}" required></td></tr>
            <tr><td>Tồn kho:</td><td><input type="number" value="${sp.inventory||0}"></td></tr>
            <tr><td>Khuyến mãi:</td><td>
                <select>
                    <option value="">Không</option>
                    <option value="tragop" ${sp.promo.name=='tragop'?'selected':''}>Trả góp</option>
                    <option value="giamgia" ${sp.promo.name=='giamgia'?'selected':''}>Giảm giá</option>
                    <option value="giareonline" ${sp.promo.name=='giareonline'?'selected':''}>Giá rẻ online</option>
                    <option value="moiramat" ${sp.promo.name=='moiramat'?'selected':''}>Mới ra mắt</option>
                </select>
            </td></tr>
            <tr><td>Giá trị KM:</td><td><input type="text" value="${sp.promo.value||''}"></td></tr>
            <tr><th colspan="2">Thông số kĩ thuật</th></tr>
            <tr><td>Màn hình:</td><td><input type="text" value="${sp.detail.screen||''}"></td></tr>
            <tr><td>HĐH:</td><td><input type="text" value="${sp.detail.os||''}"></td></tr>
            <tr><td>Cam sau:</td><td><input type="text" value="${sp.detail.camara||''}"></td></tr>
            <tr><td>Cam trước:</td><td><input type="text" value="${sp.detail.camaraFront||''}"></td></tr>
            <tr><td>CPU:</td><td><input type="text" value="${sp.detail.cpu||''}"></td></tr>
            <tr><td>RAM:</td><td><input type="text" value="${sp.detail.ram||''}"></td></tr>
            <tr><td>ROM:</td><td><input type="text" value="${sp.detail.rom||''}"></td></tr>
            <tr><td>Pin:</td><td><input type="text" value="${sp.detail.battery||''}"></td></tr>
            <tr><td colspan="2" class="table-footer">
                <button type="button" onclick="suaSanPham('${sp.masp}')">LƯU THAY ĐỔI</button>
            </td></tr>
        </table>
    </form>`;
    khung.innerHTML = html;
    khung.style.transform = 'scale(1)';
}

function suaSanPham(masp) {
    var spData = layThongTinSanPhamTuTable('khungSuaSanPham');
    if (!spData) return;
    spData.masp = masp; 

    // Gọi API PHP
    fetch('php/admin/update-product.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spData)
    })
    .then(res => res.json())
    .then(data => {
        if(data.status) {
            alert(data.message);
            document.getElementById('khungSuaSanPham').style.transform = 'scale(0)';
            addTableProducts(); 
        } else {
            alert("Lỗi: " + data.message);
        }
    })
    .catch(err => alert("Lỗi kết nối Server!"));
}

// Helper: Lấy dữ liệu từ form (Dùng chung cho Thêm & Sửa)
function layThongTinSanPhamTuTable(idFrame) {
    var khung = document.getElementById(idFrame);
    var inputs = khung.querySelectorAll('input');
    var selects = khung.querySelectorAll('select');
    // Lưu ý: src ảnh ở đây là chuỗi đường dẫn (ví dụ: img/products/a.jpg)
    // Để upload ảnh thật bạn cần form-data, ở đây ta giả lập giữ nguyên đường dẫn
    var img = khung.querySelector('img').src; 
    // Do src trả về full url (http://localhost...), ta chỉ lấy phần đuôi
    if(img.includes('img/')) img = img.substring(img.indexOf('img/'));

    var masp = inputs[0].value;
    var name = inputs[1].value;
    var price = inputs[3].value;
    var inventory = parseInt(inputs[4].value) || 0;
    var promoVal = inputs[5].value;
    
    if(!name || !price) { alert('Vui lòng điền tên và giá'); return false; }

    return {
        masp: masp,
        name: name,
        company: selects[0].value,
        img: img,
        price: price, // Giữ nguyên chuỗi để PHP xử lý
        star: 0, rateCount: 0,
        inventory: inventory,
        promo: { name: selects[1].value, value: promoVal },
        detail: {
            screen: inputs[6].value,
            os: inputs[7].value,
            camara: inputs[8].value,
            camaraFront: inputs[9].value,
            cpu: inputs[10].value,
            ram: inputs[11].value,
            rom: inputs[12].value,
            battery: inputs[13].value
        }
    };
}

// Helper: Preview ảnh
function capNhatAnhSanPham(files, idImg) {
    if (files && files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById(idImg).src = e.target.result;
        };
        reader.readAsDataURL(files[0]);
    }
}

// Helper: Auto tạo mã SP
function autoMaSanPham(company) {
    var select = document.querySelector('#khungThemSanPham select[name="chonCompany"]');
    var inputMasp = document.getElementById('maspThem');
    
    var comp = company || select.value;
    var prefix = comp.substring(0, 3).toUpperCase();
    
    var maxID = 0;
    list_products.forEach(p => {
        if(p.masp.startsWith(prefix)) {
            var num = parseInt(p.masp.substring(3));
            if(num > maxID) maxID = num;
        }
    });
    inputMasp.value = prefix + (maxID + 1);
}

function promoToStringValue(pr) {
    if(!pr) return '';
    switch(pr.name) {
        case 'tragop': return 'Góp ' + pr.value + '%';
        case 'giamgia': return 'Giảm ' + pr.value;
        case 'giareonline': return 'Online ' + pr.value;
        case 'moiramat': return 'Mới';
    }
    return '';
}