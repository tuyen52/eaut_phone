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
    <div class="product-form-panel">
        <div class="product-form-header">
            <h2><i class="fa fa-pencil-square-o"></i> Sửa sản phẩm: ${escapeHtml(sp.name)}</h2>
            <span class="close close-modal" onclick="this.closest('.overlay').style.transform='scale(0)';">&times;</span>
        </div>
        ${getProductFormTabsHtml()}
        <div class="product-form-body">
            <form>
                <table class="overlayTable product-form-table table-outline table-content table-header">
                    <tr class="pf-tab pf-tab-basic"><td>Mã sản phẩm:</td><td><input type="text" value="${escapeHtml(sp.masp)}" readonly></td></tr>
                    <tr class="pf-tab pf-tab-basic"><td>Tên sản phẩm:</td><td><input type="text" value="${escapeHtml(sp.name)}" required></td></tr>

                    <tr class="pf-tab pf-tab-basic"><td>Hãng:</td><td>
                        <select name="chonCompany">
                            ${["Apple", "Samsung", "Oppo", "Nokia", "Huawei", "Xiaomi", "Realme", "Vivo"]
        .map(c => `<option value="${c}" ${sp.company == c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </td></tr>

                    <tr class="pf-tab pf-tab-basic"><td>Hình ảnh:</td><td>
                        <img class="hinhDaiDien" id="anhSua" src="${escapeHtml(sp.img)}">
                        <div class="product-form-upload-row">
                            <input class="admin-image-file" type="file" accept="image/*" data-target="anhSua">
                            <button type="button" class="btn-form-secondary" onclick="uploadAdminImage(this.previousElementSibling, 'anhSua')">
                                <i class="fa fa-upload"></i> Upload ảnh
                            </button>
                        </div>
                    </td></tr>

                    <tr class="pf-tab pf-tab-basic"><td>Giá tiền:</td><td><input type="text" value="${escapeHtml(String(sp.price))}" required></td></tr>
                    <tr class="pf-tab pf-tab-basic"><td>Giới thiệu sản phẩm:</td><td><textarea rows="4">${escapeHtml(sp.gioi_thieu_san_pham || '')}</textarea></td></tr>

                    <tr class="pf-tab pf-tab-basic"><td>Tồn kho (tổng):</td><td>
                        <input type="number" value="${sp.inventory || 0}" readonly>
                        <small class="form-hint">Tự tính = tổng tồn kho các biến thể</small>
                    </td></tr>

                    <tr class="pf-tab pf-tab-basic"><td>Khuyến mãi:</td><td>
                        <select>
                            <option value="">Không</option>
                            <option value="tragop" ${sp.promo.name == 'tragop' ? 'selected' : ''}>Trả góp</option>
                            <option value="giamgia" ${sp.promo.name == 'giamgia' ? 'selected' : ''}>Giảm giá</option>
                            <option value="giareonline" ${sp.promo.name == 'giareonline' ? 'selected' : ''}>Giá rẻ online</option>
                            <option value="moiramat" ${sp.promo.name == 'moiramat' ? 'selected' : ''}>Mới ra mắt</option>
                        </select>
                    </td></tr>

                    <tr class="pf-tab pf-tab-basic"><td>Giá trị KM:</td><td><input type="text" value="${escapeHtml(sp.promo.value || '')}"></td></tr>

                    ${getVariantSectionHtml('khungSuaSanPham')}

                    <tr class="pf-tab pf-tab-specs"><td>Màn hình:</td><td><input type="text" value="${escapeHtml(sp.detail.screen || '')}"></td></tr>
                    <tr class="pf-tab pf-tab-specs"><td>HĐH:</td><td><input type="text" value="${escapeHtml(sp.detail.os || '')}"></td></tr>
                    <tr class="pf-tab pf-tab-specs"><td>Cam sau:</td><td><input type="text" value="${escapeHtml(sp.detail.camara || '')}"></td></tr>
                    <tr class="pf-tab pf-tab-specs"><td>Cam trước:</td><td><input type="text" value="${escapeHtml(sp.detail.camaraFront || '')}"></td></tr>
                    <tr class="pf-tab pf-tab-specs"><td>CPU:</td><td><input type="text" value="${escapeHtml(sp.detail.cpu || '')}"></td></tr>
                    <tr class="pf-tab pf-tab-specs"><td>RAM:</td><td><input type="text" value="${escapeHtml(sp.detail.ram || '')}"></td></tr>
                    <tr class="pf-tab pf-tab-specs"><td>ROM:</td><td><input type="text" value="${escapeHtml(sp.detail.rom || '')}"></td></tr>
                    <tr class="pf-tab pf-tab-specs"><td>Pin:</td><td><input type="text" value="${escapeHtml(sp.detail.battery || '')}"></td></tr>
                </table>
            </form>
        </div>
        <div class="product-form-footer">
            <button type="button" onclick="suaSanPham('${escapeHtml(sp.masp)}')">
                <i class="fa fa-save"></i> Lưu thay đổi
            </button>
        </div>
    </div>`;
    khung.innerHTML = html;
    khung.style.transform = 'scale(1)';
    initProductFormTabs(khung);

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

// ======================= VARIANT UI (ADMIN) — nhóm theo màu + tab =======================

function getProductFormTabsHtml() {
    return `
        <div class="product-form-tabs">
            <button type="button" class="pf-tab-btn active" data-tab="basic"><i class="fa fa-info-circle"></i> Thông tin</button>
            <button type="button" class="pf-tab-btn" data-tab="variants"><i class="fa fa-th-large"></i> Biến thể</button>
            <button type="button" class="pf-tab-btn" data-tab="specs"><i class="fa fa-list-ul"></i> Thông số</button>
        </div>
    `;
}

function initProductFormTabs(khung) {
    if (!khung) return;
    var showTab = function (tab) {
        khung.querySelectorAll('.pf-tab-btn').forEach(function (b) {
            b.classList.toggle('active', b.getAttribute('data-tab') === tab);
        });
        khung.querySelectorAll('.pf-tab').forEach(function (row) {
            var match = row.classList.contains('pf-tab-' + tab);
            row.style.display = match ? '' : 'none';
        });
    };
    khung.querySelectorAll('.pf-tab-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            showTab(btn.getAttribute('data-tab'));
        });
    });
    showTab('basic');
}

function getVariantSectionHtml(frameId) {
    return `
        <tr class="pf-tab pf-tab-variants variant_section">
            <td colspan="2" class="pf-tab-cell-full">
                <div class="variant-editor">
                    <div class="variant-groups"></div>
                    <div class="variant-toolbar">
                        <button type="button" class="btn-add-variant" onclick="addColorGroup('${frameId}')">
                            <i class="fa fa-plus"></i> Thêm màu mới
                        </button>
                        <small class="form-hint">Biến thể được nhóm theo màu. Mỗi màu có nhiều cấu hình RAM/ROM — bấm mũi tên để thu gọn.</small>
                    </div>
                </div>
            </td>
        </tr>
    `;
}

function ensureVariantSection(frameId) {
    var khung = document.getElementById(frameId);
    if (!khung) return;

    var table = khung.querySelector('table');
    if (!table) return;

    if (khung.querySelector('.variant_section')) {
        initProductFormTabs(khung);
        return;
    }

    var trs = Array.from(table.querySelectorAll('tr'));
    var specsRow = trs.find(tr => tr.classList.contains('pf-tab-specs') || tr.textContent.toLowerCase().includes('thông số'));
    var insertPoint = specsRow ? specsRow : trs[trs.length - 1];

    insertPoint.insertAdjacentHTML('beforebegin', getVariantSectionHtml(frameId));

    if (!khung.querySelector('.variant-color-group')) {
        addColorGroup(frameId, { ten_mau: 'Mặc định', ma_mau_hex: '#000000', so_luong_ton: 0 });
    }

    var invInput = findInputByLabel(khung, 'Tồn kho');
    if (invInput) invInput.readOnly = true;

    initProductFormTabs(khung);
    updateInventoryFromVariants(frameId);
}

function renderVariantRows(frameId, variants) {
    var khung = document.getElementById(frameId);
    if (!khung) return;
    var groupsDiv = khung.querySelector('.variant-groups');
    if (!groupsDiv) return;

    groupsDiv.innerHTML = '';

    if (!Array.isArray(variants) || variants.length === 0) {
        addColorGroup(frameId, { ten_mau: 'Mặc định', ma_mau_hex: '#000000', so_luong_ton: 0 });
        return;
    }

    var byColor = {};
    variants.forEach(function (v) {
        var key = (v.ten_mau || 'Mặc định').trim();
        if (!byColor[key]) byColor[key] = [];
        byColor[key].push(v);
    });

    Object.keys(byColor).forEach(function (color) {
        var list = byColor[color];
        var group = buildColorGroupElement(frameId, list[0]);
        groupsDiv.appendChild(group);
        list.forEach(function (v) { appendConfigRow(group, v); });
        updateGroupCount(group);
    });

    updateInventoryFromVariants(frameId);
}

function buildColorGroupElement(frameId, meta) {
    meta = meta || {};
    var ten_mau = (meta.ten_mau || '').trim();
    var hex = (meta.ma_mau_hex || '#000000').trim();
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) hex = '#000000';
    var imgV = (meta.hinh_anh || '').trim();

    var group = document.createElement('div');
    group.className = 'variant-color-group';
    group.innerHTML = `
        <div class="variant-color-header">
            <button type="button" class="btn-collapse" onclick="toggleColorGroup(this)" title="Thu gọn / mở rộng">
                <i class="fa fa-chevron-down"></i>
            </button>
            <span class="color-swatch" style="background:${hex}"></span>
            <input class="variant_group_name" type="text" placeholder="Tên màu" value="${escapeHtml(ten_mau)}">
            <input class="variant_group_hex" type="text" placeholder="#RRGGBB" value="${escapeHtml(hex)}">
            <div class="variant_imgwrap variant_group_imgwrap">
                <img class="variant_preview variant_group_preview" src="${escapeHtml(imgV)}" style="${imgV ? '' : 'display:none;'}">
                <input class="variant_group_img" type="text" placeholder="img/..." value="${escapeHtml(imgV)}">
                <label class="variant-upload-btn" title="Upload ảnh">
                    <input class="variant_group_file" type="file" accept="image/*">
                    <i class="fa fa-image"></i>
                </label>
            </div>
            <span class="variant-group-badge">0 cấu hình</span>
            <button type="button" class="btn-remove-group" onclick="removeColorGroup(this)" title="Xóa cả màu">
                <i class="fa fa-times"></i>
            </button>
        </div>
        <div class="variant-color-body">
            <div class="variant-config-head">
                <span>RAM</span><span>ROM</span><span>Tồn kho</span><span></span>
            </div>
            <div class="variant_rows"></div>
            <button type="button" class="btn-add-config" onclick="addConfigToGroup(this)">
                <i class="fa fa-plus"></i> Thêm cấu hình RAM/ROM
            </button>
        </div>
    `;

    wireColorGroupEvents(group, frameId);
    return group;
}

function wireColorGroupEvents(group, frameId) {
    var nameInput = group.querySelector('.variant_group_name');
    var hexInput = group.querySelector('.variant_group_hex');
    var imgInput = group.querySelector('.variant_group_img');
    var fileInput = group.querySelector('.variant_group_file');
    var previewImg = group.querySelector('.variant_group_preview');
    var swatch = group.querySelector('.color-swatch');

    var sync = function () { syncGroupRows(group); };

    if (nameInput) nameInput.addEventListener('input', sync);

    if (hexInput) {
        hexInput.addEventListener('blur', function () {
            var val = (hexInput.value || '').trim();
            if (!/^#[0-9A-Fa-f]{6}$/.test(val)) val = '#000000';
            hexInput.value = val;
            if (swatch) swatch.style.background = val;
            sync();
        });
        hexInput.addEventListener('input', function () {
            if (swatch && /^#[0-9A-Fa-f]{6}$/.test(hexInput.value.trim())) {
                swatch.style.background = hexInput.value.trim();
            }
        });
    }

    if (imgInput) {
        imgInput.addEventListener('blur', function () {
            var val = (imgInput.value || '').trim();
            if (val) {
                previewImg.style.display = '';
                previewImg.src = val;
            } else {
                previewImg.style.display = 'none';
                previewImg.src = '';
            }
            sync();
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', function () {
            if (!fileInput.files || !fileInput.files[0]) return;
            uploadImageFile(fileInput.files[0]).then(function (res) {
                if (res && res.status && res.path) {
                    imgInput.value = res.path;
                    previewImg.style.display = '';
                    previewImg.src = res.path;
                    sync();
                } else {
                    alert((res && res.message) ? res.message : 'Upload ảnh thất bại.');
                }
            }).catch(function () { alert('Không thể upload ảnh.'); });
        });
    }
}

function appendConfigRow(group, v) {
    v = v || {};
    var rowsDiv = group.querySelector('.variant_rows');
    if (!rowsDiv) return;

    var row = document.createElement('div');
    row.className = 'variant_row variant-config-row';
    row.setAttribute('data-variant-id', parseInt(v.variant_id || 0));
    row.innerHTML = `
        <input type="hidden" class="variant_name">
        <input type="hidden" class="variant_hex">
        <input type="hidden" class="variant_img">
        <input class="variant_ram" type="text" placeholder="8 GB" value="${escapeHtml(v.ram || '')}">
        <input class="variant_rom" type="text" placeholder="128 GB" value="${escapeHtml(v.rom || '')}">
        <input class="variant_stock" type="number" min="0" value="${isNaN(parseInt(v.so_luong_ton)) ? 0 : parseInt(v.so_luong_ton)}">
        <button type="button" class="btn-variant-remove" title="Xóa cấu hình" onclick="removeVariantRow(this)">
            <i class="fa fa-trash"></i>
        </button>
    `;

    rowsDiv.appendChild(row);
    row.querySelector('.variant_stock').addEventListener('input', function () {
        var khung = group.closest('[id^="khung"]');
        if (khung) updateInventoryFromVariants(khung.id);
    });
    syncGroupRows(group);
}

function syncGroupRows(group) {
    if (!group) return;
    var name = (group.querySelector('.variant_group_name')?.value || '').trim();
    var hex = (group.querySelector('.variant_group_hex')?.value || '').trim();
    var img = (group.querySelector('.variant_group_img')?.value || '').trim();
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) hex = '#000000';

    group.querySelectorAll('.variant_row').forEach(function (row) {
        var n = row.querySelector('.variant_name');
        var h = row.querySelector('.variant_hex');
        var i = row.querySelector('.variant_img');
        if (n) n.value = name;
        if (h) h.value = hex;
        if (i) i.value = img;
    });
}

function syncAllVariantGroups(frameId) {
    var khung = document.getElementById(frameId);
    if (!khung) return;
    khung.querySelectorAll('.variant-color-group').forEach(syncGroupRows);
}

function updateGroupCount(group) {
    var n = group.querySelectorAll('.variant_row').length;
    var badge = group.querySelector('.variant-group-badge');
    if (badge) badge.textContent = n + ' cấu hình';
}

function addColorGroup(frameId, meta) {
    meta = meta || {};
    var khung = document.getElementById(frameId);
    var groupsDiv = khung?.querySelector('.variant-groups');
    if (!groupsDiv) return null;

    var group = buildColorGroupElement(frameId, meta);
    groupsDiv.appendChild(group);
    appendConfigRow(group, {
        variant_id: 0,
        ram: meta.ram || '',
        rom: meta.rom || '',
        so_luong_ton: meta.so_luong_ton || 0
    });
    updateGroupCount(group);
    updateInventoryFromVariants(frameId);
    return group;
}

function addConfigToGroup(btn) {
    var group = btn.closest('.variant-color-group');
    if (!group) return;
    var khung = btn.closest('[id^="khung"]');
    appendConfigRow(group, { variant_id: 0, ram: '', rom: '', so_luong_ton: 0 });
    updateGroupCount(group);
    if (khung) updateInventoryFromVariants(khung.id);
}

function toggleColorGroup(btn) {
    var group = btn.closest('.variant-color-group');
    if (group) group.classList.toggle('is-collapsed');
}

function removeColorGroup(btn) {
    if (!confirm('Xóa cả nhóm màu này và tất cả cấu hình RAM/ROM?')) return;
    var khung = btn.closest('[id^="khung"]');
    var group = btn.closest('.variant-color-group');
    if (group) group.remove();

    if (khung && !khung.querySelector('.variant-color-group')) {
        addColorGroup(khung.id, { ten_mau: 'Mặc định', ma_mau_hex: '#000000' });
    }
    if (khung) updateInventoryFromVariants(khung.id);
}

function addVariantRow(frameId, v) {
    addColorGroup(frameId, v || {});
}

function removeVariantRow(btn) {
    var row = btn.closest('.variant_row');
    if (!row) return;

    var group = btn.closest('.variant-color-group');
    var khung = btn.closest('[id^="khung"]');
    row.remove();

    if (group) {
        updateGroupCount(group);
        if (group.querySelectorAll('.variant_row').length === 0) {
            group.remove();
        }
    }

    if (khung && !khung.querySelector('.variant-color-group')) {
        addColorGroup(khung.id, { ten_mau: 'Mặc định', ma_mau_hex: '#000000' });
    } else if (khung) {
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

    syncAllVariantGroups(idFrame);

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
            so_luong_ton: stock,
            ram: (r.querySelector('.variant_ram')?.value || '').trim(),
            rom: (r.querySelector('.variant_rom')?.value || '').trim()
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