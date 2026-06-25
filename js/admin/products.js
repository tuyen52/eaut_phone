// js/admin/products.js

var decrease = true;

// ======================= QUẢN LÝ SẢN PHẨM =======================

function addTableProducts() {
    var tc = document.querySelector('.sanpham .table-content');
    if (!tc) return;

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

    list.sort((a, b) => (a.masp || '').localeCompare(b.masp || ''));

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
    ensureVariantSection('khungThemSanPham');

    var newSp = layThongTinSanPhamTuTable('khungThemSanPham');
    if (!newSp) return;

    fetch('php/admin/add-product.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSp)
    })
        .then(res => res.json())
        .then(data => {
            if (data.status) {
                alert(data.message);
                document.getElementById('khungThemSanPham').style.transform = 'scale(0)';
                addTableProducts();
            } else {
                alert("Lỗi: " + data.message);
            }
        })
        .catch(() => alert("Lỗi kết nối Server!"));
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
                if (data.status) {
                    alert(data.message);
                    addTableProducts();
                } else {
                    alert("Lỗi: " + data.message);
                }
            })
            .catch(() => alert("Lỗi kết nối Server!"));
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
        .map(c => `<option value="${c}" ${sp.company == c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
            </td></tr>

            <tr><td>Hình:</td><td>
                <img class="hinhDaiDien" id="anhSua" src="${sp.img}">
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:8px;">
                    <input class="admin-image-file" type="file" accept="image/*" data-target="anhSua">
                    <button type="button" onclick="uploadAdminImage(this.previousElementSibling, 'anhSua')">Upload ảnh</button>
                </div>
            </td></tr>

            <tr><td>Giá tiền:</td><td><input type="text" value="${sp.price}" required></td></tr>
            <tr><td>Giới thiệu sản phẩm:</td><td><textarea rows="4" style="width:100%">${sp.gioi_thieu_san_pham || ''}</textarea></td></tr>

            <tr><td>Tồn kho (tổng):</td><td>
                <input type="number" value="${sp.inventory || 0}" readonly>
                <small style="display:block;color:#777;margin-top:4px">Tự tính = tổng tồn kho theo màu</small>
            </td></tr>

            <tr><td>Khuyến mãi:</td><td>
                <select>
                    <option value="">Không</option>
                    <option value="tragop" ${sp.promo.name == 'tragop' ? 'selected' : ''}>Trả góp</option>
                    <option value="giamgia" ${sp.promo.name == 'giamgia' ? 'selected' : ''}>Giảm giá</option>
                    <option value="giareonline" ${sp.promo.name == 'giareonline' ? 'selected' : ''}>Giá rẻ online</option>
                    <option value="moiramat" ${sp.promo.name == 'moiramat' ? 'selected' : ''}>Mới ra mắt</option>
                </select>
            </td></tr>

            <tr><td>Giá trị KM:</td><td><input type="text" value="${sp.promo.value || ''}"></td></tr>

            <!-- Variant -->
            <tr><th colspan="2">Biến thể màu (Variant)</th></tr>
            <tr class="variant_section">
                <td colspan="2">
                    <div style="padding:6px 0">
                        <div style="display:flex; gap:8px; font-weight:bold; margin-bottom:6px; align-items:center;">
                            <div style="flex:2">Tên màu</div>
                            <div style="flex:1">Mã hex</div>
                            <div style="flex:2">Ảnh theo màu</div>
                            <div style="flex:1">Tồn kho</div>
                            <div style="width:40px"></div>
                        </div>
                        <div class="variant_rows"></div>
                        <div style="margin-top:8px">
                            <button type="button" onclick="addVariantRow('khungSuaSanPham')">+ Thêm màu</button>
                            <small style="display:block;color:#777;margin-top:6px">
                                Có thể dán link ảnh (img/...jpg) hoặc chọn file để upload lên server.
                            </small>
                        </div>
                    </div>
                </td>
            </tr>

            <tr><th colspan="2">Thông số kĩ thuật</th></tr>
            <tr><td>Màn hình:</td><td><input type="text" value="${sp.detail.screen || ''}"></td></tr>
            <tr><td>HĐH:</td><td><input type="text" value="${sp.detail.os || ''}"></td></tr>
            <tr><td>Cam sau:</td><td><input type="text" value="${sp.detail.camara || ''}"></td></tr>
            <tr><td>Cam trước:</td><td><input type="text" value="${sp.detail.camaraFront || ''}"></td></tr>
            <tr><td>CPU:</td><td><input type="text" value="${sp.detail.cpu || ''}"></td></tr>
            <tr><td>RAM:</td><td><input type="text" value="${sp.detail.ram || ''}"></td></tr>
            <tr><td>ROM:</td><td><input type="text" value="${sp.detail.rom || ''}"></td></tr>
            <tr><td>Pin:</td><td><input type="text" value="${sp.detail.battery || ''}"></td></tr>

            <tr><td colspan="2" class="table-footer">
                <button type="button" onclick="suaSanPham('${sp.masp}')">LƯU THAY ĐỔI</button>
            </td></tr>
        </table>
    </form>`;
    khung.innerHTML = html;
    khung.style.transform = 'scale(1)';

    loadVariantsIntoFrame('khungSuaSanPham', masp);
}

function suaSanPham(masp) {
    var spData = layThongTinSanPhamTuTable('khungSuaSanPham');
    if (!spData) return;
    spData.masp = masp;

    fetch('php/admin/update-product.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spData)
    })
        .then(res => res.json())
        .then(data => {
            if (data.status) {
                alert(data.message);
                document.getElementById('khungSuaSanPham').style.transform = 'scale(0)';
                addTableProducts();
            } else {
                alert("Lỗi: " + data.message);
            }
        })
        .catch(() => alert("Lỗi kết nối Server!"));
}

// ======================= VARIANT UI (ADMIN) =======================

function ensureVariantSection(frameId) {
    var khung = document.getElementById(frameId);
    if (!khung) return;

    var table = khung.querySelector('table');
    if (!table) return;

    if (khung.querySelector('.variant_section')) return;

    var trs = Array.from(table.querySelectorAll('tr'));
    var specsRow = trs.find(tr => tr.textContent.toLowerCase().includes('thông số'));
    var insertPoint = specsRow ? specsRow : trs[trs.length - 1];

    var html = `
        <tr><th colspan="2">Biến thể màu (Variant)</th></tr>
        <tr class="variant_section">
            <td colspan="2">
                <div style="padding:6px 0">
                    <div style="display:flex; gap:8px; font-weight:bold; margin-bottom:6px; align-items:center;">
                        <div style="flex:2">Tên màu</div>
                        <div style="flex:1">Mã hex</div>
                        <div style="flex:2">Ảnh theo màu</div>
                        <div style="flex:1">Tồn kho</div>
                        <div style="width:40px"></div>
                    </div>
                    <div class="variant_rows"></div>
                    <div style="margin-top:8px">
                        <button type="button" onclick="addVariantRow('${frameId}')">+ Thêm màu</button>
                        <small style="display:block;color:#777;margin-top:6px">
                            Có thể dán link ảnh (img/...jpg) hoặc chọn file để upload lên server.
                        </small>
                    </div>
                </div>
            </td>
        </tr>
    `;

    insertPoint.insertAdjacentHTML('beforebegin', html);

    if (khung.querySelectorAll('.variant_row').length === 0) {
        addVariantRow(frameId, { variant_id: 0, ten_mau: 'Mặc định', ma_mau_hex: '#000000', so_luong_ton: 0 });
    }

    var invInput = findInputByLabel(khung, 'Tồn kho');
    if (invInput) invInput.readOnly = true;

    updateInventoryFromVariants(frameId);
}

function renderVariantRows(frameId, variants) {
    var khung = document.getElementById(frameId);
    if (!khung) return;
    var rowsDiv = khung.querySelector('.variant_rows');
    if (!rowsDiv) return;

    rowsDiv.innerHTML = '';

    if (!Array.isArray(variants) || variants.length === 0) {
        addVariantRow(frameId, { variant_id: 0, ten_mau: 'Mặc định', ma_mau_hex: '#000000', so_luong_ton: 0 });
        return;
    }

    variants.forEach(v => addVariantRow(frameId, v));
    updateInventoryFromVariants(frameId);
}

function addVariantRow(frameId, v) {
    var khung = document.getElementById(frameId);
    if (!khung) return;
    var rowsDiv = khung.querySelector('.variant_rows');
    if (!rowsDiv) return;

    v = v || {};
    var variant_id = parseInt(v.variant_id || 0);
    var ten_mau = (v.ten_mau || '').trim();
    var hex = (v.ma_mau_hex || '#000000').trim();
    var imgV = (v.hinh_anh || '').trim();
    var stock = parseInt(v.so_luong_ton || 0);

    var row = document.createElement('div');
    row.className = 'variant_row';
    row.setAttribute('data-variant-id', variant_id);
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.marginBottom = '6px';
    row.style.alignItems = 'center';

    var previewStyle = imgV ? '' : 'display:none;';
    row.innerHTML = `
        <input class="variant_name" style="flex:2" type="text" placeholder="VD: Đen" value="${escapeHtml(ten_mau)}">
        <input class="variant_hex" style="flex:1" type="text" placeholder="#RRGGBB" value="${escapeHtml(hex)}">

        <div class="variant_imgwrap" style="flex:2; display:flex; gap:6px; align-items:center;">
            <img class="variant_preview" src="${escapeHtml(imgV)}" style="width:34px;height:34px;object-fit:cover;border:1px solid #ddd;border-radius:4px; ${previewStyle}">
            <input class="variant_img" style="flex:1" type="text" placeholder="Ảnh màu (img/...jpg hoặc URL)" value="${escapeHtml(imgV)}">
            <label title="Chọn ảnh" style="width:38px;height:34px;display:flex;align-items:center;justify-content:center;border:1px solid #ddd;border-radius:4px;cursor:pointer;background:#fff;">
                <input class="variant_file" type="file" accept="image/*" style="display:none;">
                <i class="fa fa-image"></i>
            </label>
        </div>

        <input class="variant_stock" style="flex:1" type="number" min="0" value="${isNaN(stock) ? 0 : stock}">
        <button type="button" style="width:40px" title="Xóa" onclick="removeVariantRow(this)">X</button>
    `;

    rowsDiv.appendChild(row);

    var stockInput = row.querySelector('.variant_stock');
    var hexInput = row.querySelector('.variant_hex');
    var imgInput = row.querySelector('.variant_img');
    var fileInput = row.querySelector('.variant_file');
    var previewImg = row.querySelector('.variant_preview');

    stockInput.addEventListener('input', () => updateInventoryFromVariants(frameId));

    hexInput.addEventListener('blur', () => {
        var val = (hexInput.value || '').trim();
        if (!/^#[0-9A-Fa-f]{6}$/.test(val)) hexInput.value = '#000000';
    });

    imgInput.addEventListener('blur', () => {
        var val = (imgInput.value || '').trim();
        if (val) {
            previewImg.style.display = '';
            previewImg.src = val;
        } else {
            previewImg.style.display = 'none';
            previewImg.src = '';
        }
    });

    fileInput.addEventListener('change', () => {
        if (!fileInput.files || !fileInput.files[0]) return;
        uploadImageFile(fileInput.files[0]).then(function (res) {
            if (res && res.status && res.path) {
                imgInput.value = res.path;
                previewImg.style.display = '';
                previewImg.src = res.path;
            } else {
                alert((res && res.message) ? res.message : 'Upload ảnh thất bại.');
            }
        }).catch(function () {
            alert('Không thể upload ảnh.');
        });
    });

    updateInventoryFromVariants(frameId);
}

function removeVariantRow(btn) {
    var row = btn.closest('.variant_row');
    if (!row) return;

    var khung = btn.closest('[id]');
    row.remove();

    var rowsDiv = khung.querySelector('.variant_rows');
    if (rowsDiv && rowsDiv.querySelectorAll('.variant_row').length === 0) {
        addVariantRow(khung.id, { variant_id: 0, ten_mau: 'Mặc định', ma_mau_hex: '#000000', so_luong_ton: 0 });
    } else {
        updateInventoryFromVariants(khung.id);
    }
}

function updateInventoryFromVariants(frameId) {
    var khung = document.getElementById(frameId);
    if (!khung) return;

    var rows = khung.querySelectorAll('.variant_row');
    var total = 0;

    rows.forEach(r => {
        var stock = parseInt(r.querySelector('.variant_stock')?.value || 0);
        if (!isNaN(stock) && stock > 0) total += stock;
    });

    var invInput = findInputByLabel(khung, 'Tồn kho');
    if (invInput) invInput.value = total;
}

function loadVariantsIntoFrame(frameId, masp) {
    ensureVariantSection(frameId);

    fetch('php/get-product-variants.php?masp=' + encodeURIComponent(masp))
        .then(res => res.json())
        .then(list => {
            if (!Array.isArray(list)) list = [];
            renderVariantRows(frameId, list);
        })
        .catch(() => {
            renderVariantRows(frameId, [{ variant_id: 0, ten_mau: 'Mặc định', ma_mau_hex: '#000000', so_luong_ton: 0 }]);
        });
}

// ======================= Lấy dữ liệu từ form (có variants) =======================

function layThongTinSanPhamTuTable(idFrame) {
    var khung = document.getElementById(idFrame);
    if (!khung) return false;

    ensureVariantSection(idFrame);

    var imgEl = khung.querySelector('img');
    var img = imgEl ? imgEl.src : '';
    if (img.includes('img/')) img = img.substring(img.indexOf('img/'));

    var masp = getValueByLabel(khung, 'Mã sản phẩm');
    if (!masp) {
        var elM = khung.querySelector('#maspThem');
        if (elM) masp = elM.value;
    }

    var name = getValueByLabel(khung, 'Tên sản phẩm');
    var price = getValueByLabel(khung, 'Giá tiền');
    var inventory = parseInt(getValueByLabel(khung, 'Tồn kho') || '0') || 0;
    var introArea = khung.querySelectorAll('textarea');
    var gioiThieu = '';
    if (introArea && introArea.length) {
        var introIndex = introArea.length > 1 ? 1 : 0;
        gioiThieu = (introArea[introIndex].value || '').trim();
    }

    var companySel = findSelectByLabel(khung, 'Hãng');
    var company = companySel ? companySel.value : '';

    var promoSel = findSelectByLabel(khung, 'Khuyến mãi');
    var promoName = promoSel ? promoSel.value : '';
    var promoVal = getValueByLabel(khung, 'Giá trị KM');

    var detail = {
        screen: getValueByLabel(khung, 'Màn hình'),
        os: getValueByLabel(khung, 'HĐH'),
        camara: getValueByLabel(khung, 'Cam sau'),
        camaraFront: getValueByLabel(khung, 'Cam trước'),
        cpu: getValueByLabel(khung, 'CPU'),
        ram: getValueByLabel(khung, 'RAM'),
        rom: getValueByLabel(khung, 'ROM'),
        battery: getValueByLabel(khung, 'Pin')
    };

    var gioiThieu = '';
    var gioiThieuArea = khung.querySelector('textarea');
    if (gioiThieuArea) gioiThieu = gioiThieuArea.value.trim();

    if (!name || !price) { alert('Vui lòng điền tên và giá'); return false; }

    var variants = [];
    var rows = khung.querySelectorAll('.variant_row');

    rows.forEach(r => {
        var vid = parseInt(r.getAttribute('data-variant-id') || '0');
        var ten_mau = (r.querySelector('.variant_name')?.value || '').trim();
        var hex = (r.querySelector('.variant_hex')?.value || '').trim();
        var imgV = (r.querySelector('.variant_img')?.value || '').trim();
        if (imgV.indexOf('data:image') === 0) imgV = '';
        var stock = parseInt(r.querySelector('.variant_stock')?.value || '0');

        if (!ten_mau) return;
        if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) hex = '#000000';
        if (isNaN(stock) || stock < 0) stock = 0;

        variants.push({
            variant_id: vid,
            ten_mau: ten_mau,
            ma_mau_hex: hex,
            hinh_anh: imgV,
            so_luong_ton: stock
        });
    });

    if (variants.length === 0) {
        variants = [{ variant_id: 0, ten_mau: 'Mặc định', ma_mau_hex: '#000000', hinh_anh: img, so_luong_ton: inventory }];
    }

    var total = variants.reduce((sum, v) => sum + (parseInt(v.so_luong_ton || 0) || 0), 0);
    inventory = total;
    updateInventoryFromVariants(idFrame);

    return {
        masp: masp,
        name: name,
        company: company,
        img: img,
        price: price,
        star: 0, rateCount: 0,
        inventory: inventory,
        promo: { name: promoName, value: promoVal },
        detail: detail,
        gioi_thieu_san_pham: gioiThieu,

        variants: variants,
        variants_replace: 1
    };
}

// ======================= Helpers nhỏ =======================

function findRowByLabel(khung, labelKeyword) {
    labelKeyword = (labelKeyword || '').toLowerCase();
    var trs = khung.querySelectorAll('tr');
    for (var i = 0; i < trs.length; i++) {
        var tds = trs[i].querySelectorAll('td');
        if (tds.length >= 1) {
            var label = (tds[0].innerText || '').toLowerCase();
            if (label.includes(labelKeyword)) return trs[i];
        }
    }
    return null;
}

function getValueByLabel(khung, labelKeyword) {
    var tr = findRowByLabel(khung, labelKeyword);
    if (!tr) return '';
    var input = tr.querySelector('input');
    var select = tr.querySelector('select');
    if (input) return input.value;
    if (select) return select.value;
    return '';
}

function findInputByLabel(khung, labelKeyword) {
    var tr = findRowByLabel(khung, labelKeyword);
    if (!tr) return null;
    return tr.querySelector('input');
}

function findSelectByLabel(khung, labelKeyword) {
    var tr = findRowByLabel(khung, labelKeyword);
    if (!tr) return null;
    return tr.querySelector('select');
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function uploadAdminImage(fileInput, idImg) {
    if (!fileInput || !fileInput.files || !fileInput.files[0]) return;

    var file = fileInput.files[0];
    uploadImageFile(file).then(function (res) {
        if (res && res.status && res.path) {
            var img = document.getElementById(idImg);
            if (img) img.src = res.path;
            fileInput.setAttribute('data-uploaded-path', res.path);
        } else {
            alert((res && res.message) ? res.message : 'Upload ảnh thất bại.');
        }
    }).catch(function () {
        alert('Không thể upload ảnh.');
    });
}

function autoMaSanPham(company) {
    var select = document.querySelector('#khungThemSanPham select[name="chonCompany"]');
    var inputMasp = document.getElementById('maspThem');

    var comp = company || (select ? select.value : 'UNK');
    var prefix = comp.substring(0, 3).toUpperCase();

    var maxID = 0;
    list_products.forEach(p => {
        if (p.masp && p.masp.startsWith(prefix)) {
            var num = parseInt(p.masp.substring(3));
            if (num > maxID) maxID = num;
        }
    });
    if (inputMasp) inputMasp.value = prefix + (maxID + 1);
}

function promoToStringValue(pr) {
    if (!pr) return '';
    switch (pr.name) {
        case 'tragop': return 'Góp ' + pr.value + '%';
        case 'giamgia': return 'Giảm ' + pr.value;
        case 'giareonline': return 'Online ' + pr.value;
        case 'moiramat': return 'Mới';
    }
    return '';
}

document.addEventListener('DOMContentLoaded', function () {
    ensureVariantSection('khungThemSanPham');
    updateInventoryFromVariants('khungThemSanPham');
});