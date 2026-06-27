// js/admin/warehouse.js

var currentStockList = [];
var __warehouseKeyword = '';
var __warehouseStockFilter = 'all';
var __whModalState = { masp: '', variants: [], mode: 'view' };

function formatVariantStockLabel(v) {
    if (!v) return '';
    var color = (v.ten_mau || '').trim();
    var ram = (v.ram || '').trim();
    var rom = (v.rom || '').trim();
    var parts = [color, ram, rom].filter(Boolean);
    if (parts.length) return parts.join(' | ');
    if (v.variant_id) return 'Variant #' + v.variant_id;
    return 'Không rõ';
}

function getStockLevelClass(qty) {
    qty = parseInt(qty || 0);
    if (qty <= 0) return 'out';
    if (qty <= 10) return 'low';
    return 'ok';
}

function getStockLevelText(qty) {
    qty = parseInt(qty || 0);
    if (qty <= 0) return 'Hết hàng';
    if (qty <= 10) return 'Sắp hết';
    return 'Còn hàng';
}

function getProductByMasp(masp) {
    return currentStockList.find(function (p) { return p.masp === masp; }) || null;
}

function initWarehouseModal() {
    var overlay = document.getElementById('warehouseModalOverlay');
    if (!overlay) return;

    var closeBtn = document.getElementById('warehouseModalClose');
    if (closeBtn && !closeBtn.__whBound) {
        closeBtn.__whBound = true;
        closeBtn.addEventListener('click', closeWarehouseModal);
    }

    if (!overlay.__whBound) {
        overlay.__whBound = true;
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeWarehouseModal();
        });
    }

    if (!document.__whEscBound) {
        document.__whEscBound = true;
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeWarehouseModal();
        });
    }
}

function openWarehouseModal() {
    initWarehouseModal();
    var overlay = document.getElementById('warehouseModalOverlay');
    if (overlay) overlay.style.transform = 'scale(1)';
}

function closeWarehouseModal() {
    var overlay = document.getElementById('warehouseModalOverlay');
    if (overlay) overlay.style.transform = 'scale(0)';
}

function fetchVariantsForProduct(masp) {
    return fetch('php/get-product-variants.php?masp=' + encodeURIComponent(masp))
        .then(function (res) { return res.json(); })
        .then(function (list) { return Array.isArray(list) ? list : []; });
}

function addTableKhoHang() {
    var tc = document.querySelector('.khohang .table-content');
    if (!tc) return;

    initWarehouseModal();
    tc.innerHTML = '<div class="wh-loading"><i class="fa fa-spinner fa-spin"></i> Đang tải dữ liệu kho...</div>';

    fetch('php/get-products.php')
        .then(function (res) { return res.json(); })
        .then(function (data) {
            currentStockList = Array.isArray(data) ? data : [];
            renderWarehousePanel();
        })
        .catch(function (err) {
            console.error(err);
            tc.innerHTML = '<div class="wh-empty-state"><i class="fa fa-exclamation-triangle"></i>Lỗi kết nối Server!</div>';
        });
}

function renderWarehousePanel() {
    var tc = document.querySelector('.khohang .table-content');
    if (!tc) return;

    var total = currentStockList.length;
    var lowStock = currentStockList.filter(function (p) {
        var s = parseInt(p.inventory || 0);
        return s > 0 && s <= 10;
    }).length;
    var outStock = currentStockList.filter(function (p) {
        return parseInt(p.inventory || 0) <= 0;
    }).length;

    var s = `
        <div class="wh-toolbar">
            <div class="wh-toolbar-filters">
                <div class="wh-field">
                    <label for="warehouseSearchInput">Tìm sản phẩm</label>
                    <input id="warehouseSearchInput" type="text" placeholder="Mã SP hoặc tên sản phẩm..." value="${escapeHtml(__warehouseKeyword)}">
                </div>
                <div class="wh-field">
                    <label for="warehouseStockFilter">Lọc tồn kho</label>
                    <select id="warehouseStockFilter">
                        <option value="all">Tất cả sản phẩm</option>
                        <option value="instock">Còn hàng</option>
                        <option value="lowstock">Sắp hết (1–10)</option>
                        <option value="outstock">Hết hàng</option>
                    </select>
                </div>
                <button type="button" class="wh-btn-clear" id="warehouseClearBtn">
                    <i class="fa fa-eraser"></i> Xóa lọc
                </button>
            </div>
            <div class="wh-stats">
                <span class="wh-stat wh-stat-total">Tổng: ${total}</span>
                <span class="wh-stat wh-stat-low">Sắp hết: ${lowStock}</span>
                <span class="wh-stat wh-stat-out">Hết hàng: ${outStock}</span>
            </div>
        </div>
    `;

    s += renderWarehouseTableHTML(applyWarehouseFilters());
    tc.innerHTML = s;

    var sel = document.getElementById('warehouseStockFilter');
    if (sel) {
        sel.value = __warehouseStockFilter;
        sel.addEventListener('change', function () { filterWarehouseByStock(this.value); });
    }

    var inp = document.getElementById('warehouseSearchInput');
    if (inp) {
        inp.addEventListener('input', function () { filterWarehouseProducts(this.value); });
    }

    var clearBtn = document.getElementById('warehouseClearBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearWarehouseSearch);

    tc.querySelectorAll('.btn-wh-import').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var masp = btn.getAttribute('data-masp');
            if (masp) nhapHangTheoMau(masp);
        });
    });
    tc.querySelectorAll('.btn-wh-view').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var masp = btn.getAttribute('data-masp');
            if (masp) xemChiTietMau(masp);
        });
    });
}

function renderWarehouseTableHTML(list) {
    var s = `<table class="table-outline wh-table">
        <thead>
            <tr>
                <th>STT</th>
                <th>Mã SP</th>
                <th>Tên sản phẩm</th>
                <th>Tồn kho (tổng)</th>
                <th>Hành động</th>
            </tr>
        </thead>
        <tbody>`;

    if (!list || list.length === 0) {
        s += `<tr><td colspan="5"><div class="wh-empty-state"><i class="fa fa-inbox"></i>Không tìm thấy sản phẩm phù hợp.</div></td></tr>`;
    } else {
        list.forEach(function (p, i) {
            var stock = parseInt(p.inventory || 0);
            var stockCls = getStockLevelClass(stock);

            s += `<tr>
                <td>${i + 1}</td>
                <td><span class="wh-masp">${escapeHtml(p.masp)}</span></td>
                <td>
                    <div class="wh-product-cell">
                        <img src="${escapeHtml(p.img)}" alt="">
                        <span class="wh-product-name">${escapeHtml(p.name)}</span>
                    </div>
                </td>
                <td><span class="wh-stock-num wh-stock-${stockCls}">${stock}</span></td>
                <td>
                    <button type="button" class="btn-wh-import" data-masp="${escapeHtml(p.masp)}" title="Nhập kho">
                        <i class="fa fa-plus"></i> Nhập
                    </button>
                    <button type="button" class="btn-wh-view" data-masp="${escapeHtml(p.masp)}" title="Xem chi tiết">
                        <i class="fa fa-eye"></i> Xem
                    </button>
                </td>
            </tr>`;
        });
    }

    s += `</tbody></table>`;
    return s;
}

function applyWarehouseFilters() {
    var list = Array.isArray(currentStockList) ? currentStockList.slice() : [];
    var keyword = (__warehouseKeyword || '').trim().toUpperCase();

    if (keyword) {
        list = list.filter(function (p) {
            return String(p.name || '').toUpperCase().includes(keyword) ||
                String(p.masp || '').toUpperCase().includes(keyword);
        });
    }

    if (__warehouseStockFilter === 'instock') {
        list = list.filter(function (p) { return parseInt(p.inventory || 0) > 0; });
    } else if (__warehouseStockFilter === 'lowstock') {
        list = list.filter(function (p) {
            var stock = parseInt(p.inventory || 0);
            return stock > 0 && stock <= 10;
        });
    } else if (__warehouseStockFilter === 'outstock') {
        list = list.filter(function (p) { return parseInt(p.inventory || 0) <= 0; });
    }

    return list;
}

function filterWarehouseProducts(value) {
    __warehouseKeyword = value || '';
    renderWarehousePanel();
}

function filterWarehouseByStock(value) {
    __warehouseStockFilter = value || 'all';
    renderWarehousePanel();
}

function clearWarehouseSearch() {
    __warehouseKeyword = '';
    __warehouseStockFilter = 'all';
    renderWarehousePanel();
}

function renderVariantTableRows(list) {
    if (!list.length) {
        return '<div class="wh-empty-state"><i class="fa fa-inbox"></i>Chưa có biến thể nào.</div>';
    }

    var rows = list.map(function (v, i) {
        var hex = String(v.ma_mau_hex || '');
        var safeHex = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#cbd5e1';
        var qty = parseInt(v.so_luong_ton || 0);
        var lvl = getStockLevelClass(qty);

        return `<tr>
            <td>${i + 1}</td>
            <td>
                <div class="wh-color-cell">
                    <span class="wh-swatch" style="background:${safeHex}"></span>
                    <span>${escapeHtml(v.ten_mau || '—')}</span>
                </div>
            </td>
            <td>${escapeHtml(v.ram || '—')}</td>
            <td>${escapeHtml(v.rom || '—')}</td>
            <td>
                <span class="wh-stock-badge ${lvl}">${qty}</span>
                <div class="wh-stock-subtext">${getStockLevelText(qty)}</div>
            </td>
        </tr>`;
    }).join('');

    return `<table class="warehouse-variant-table">
        <thead>
            <tr>
                <th>#</th>
                <th>Màu</th>
                <th>RAM</th>
                <th>ROM</th>
                <th>Tồn kho</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
    </table>`;
}

function showWarehouseViewModal(masp, list) {
    var product = getProductByMasp(masp);
    var name = product ? product.name : masp;
    var total = list.reduce(function (sum, v) { return sum + parseInt(v.so_luong_ton || 0); }, 0);
    var variantCount = list.length;

    __whModalState = { masp: masp, variants: list, mode: 'view' };

    document.getElementById('warehouseModalTitle').innerHTML =
        '<i class="fa fa-eye"></i> Chi tiết tồn kho';

    document.getElementById('warehouseModalBody').innerHTML = `
        <p class="warehouse-modal-subtitle">
            Sản phẩm: <strong>${escapeHtml(name)}</strong> · Mã: <strong>${escapeHtml(masp)}</strong>
        </p>
        <div class="wh-summary-row">
            <div class="wh-summary-card">
                <span>Tổng tồn kho</span>
                <b class="wh-stock-${getStockLevelClass(total)}">${total}</b>
            </div>
            <div class="wh-summary-card">
                <span>Số biến thể</span>
                <b>${variantCount}</b>
            </div>
        </div>
        ${renderVariantTableRows(list)}
    `;

    document.getElementById('warehouseModalFooter').innerHTML = `
        <button type="button" class="btn-wh-secondary" id="whModalBtnClose">Đóng</button>
        <button type="button" class="btn-wh-primary" id="whModalBtnGoImport">
            <i class="fa fa-plus"></i> Nhập kho
        </button>
    `;

    document.getElementById('whModalBtnClose').addEventListener('click', closeWarehouseModal);
    document.getElementById('whModalBtnGoImport').addEventListener('click', function () {
        showWarehouseImportModal(masp, list, '');
    });

    openWarehouseModal();
}

function showWarehouseImportModal(masp, list, preselectVariantId) {
    var product = getProductByMasp(masp);
    var name = product ? product.name : masp;

    __whModalState = { masp: masp, variants: list, mode: 'import' };

    var options = list.map(function (v) {
        var label = formatVariantStockLabel(v);
        var selected = String(v.variant_id) === String(preselectVariantId) ? ' selected' : '';
        return `<option value="${v.variant_id}"${selected}>${escapeHtml(label)} — Kho: ${v.so_luong_ton}</option>`;
    }).join('');

    document.getElementById('warehouseModalTitle').innerHTML =
        '<i class="fa fa-plus-circle"></i> Nhập kho biến thể';

    document.getElementById('warehouseModalBody').innerHTML = `
        <p class="warehouse-modal-subtitle">
            Sản phẩm: <strong>${escapeHtml(name)}</strong> · Mã: <strong>${escapeHtml(masp)}</strong>
        </p>
        <div class="wh-import-form">
            <div class="wh-form-group">
                <label for="whImportVariant">Chọn biến thể (Màu / RAM / ROM)</label>
                <select id="whImportVariant">${options}</select>
            </div>
            <div class="wh-form-group">
                <label for="whImportQty">Số lượng nhập thêm</label>
                <input id="whImportQty" type="number" min="1" step="1" value="1" placeholder="VD: 10">
            </div>
            <div class="wh-import-preview" id="whImportPreview"></div>
        </div>
    `;

    document.getElementById('warehouseModalFooter').innerHTML = `
        <button type="button" class="btn-wh-secondary" id="whModalBtnBack">
            <i class="fa fa-arrow-left"></i> Xem tồn kho
        </button>
        <button type="button" class="btn-wh-secondary" id="whModalBtnClose2">Hủy</button>
        <button type="button" class="btn-wh-primary" id="whModalBtnSubmit">
            <i class="fa fa-check"></i> Xác nhận nhập
        </button>
    `;

    var sel = document.getElementById('whImportVariant');
    var qtyInp = document.getElementById('whImportQty');
    var preview = document.getElementById('whImportPreview');

    function updatePreview() {
        var vid = parseInt(sel.value, 10);
        var v = list.find(function (x) { return parseInt(x.variant_id) === vid; });
        var add = parseInt(qtyInp.value, 10);
        if (!v || isNaN(add) || add <= 0) {
            preview.className = 'wh-import-preview empty';
            preview.textContent = 'Chọn biến thể và nhập số lượng hợp lệ.';
            return;
        }
        var after = parseInt(v.so_luong_ton || 0) + add;
        preview.className = 'wh-import-preview';
        preview.innerHTML = '<i class="fa fa-info-circle"></i> ' +
            escapeHtml(formatVariantStockLabel(v)) +
            ': <strong>' + v.so_luong_ton + '</strong> → <strong>' + after + '</strong> (+' + add + ')';
    }

    sel.addEventListener('change', updatePreview);
    qtyInp.addEventListener('input', updatePreview);
    updatePreview();

    document.getElementById('whModalBtnBack').addEventListener('click', function () {
        showWarehouseViewModal(masp, list);
    });
    document.getElementById('whModalBtnClose2').addEventListener('click', closeWarehouseModal);
    document.getElementById('whModalBtnSubmit').addEventListener('click', function () {
        submitWarehouseImport(masp, list);
    });

    openWarehouseModal();
}

function submitWarehouseImport(masp, list) {
    var sel = document.getElementById('whImportVariant');
    var qtyInp = document.getElementById('whImportQty');
    var btn = document.getElementById('whModalBtnSubmit');

    if (!sel || !qtyInp) return;

    var variantId = parseInt(sel.value, 10);
    var qty = parseInt(qtyInp.value, 10);

    if (isNaN(variantId) || variantId <= 0) {
        alert('Vui lòng chọn biến thể.');
        return;
    }
    if (isNaN(qty) || qty <= 0) {
        alert('Số lượng nhập phải lớn hơn 0.');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang lưu...';
    }

    fetch('php/admin/import-variant-stock.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant_id: variantId, so_luong: qty })
    })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data.status) {
                closeWarehouseModal();
                addTableKhoHang();
            } else {
                alert('Lỗi: ' + (data.message || 'Không thể nhập kho'));
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa fa-check"></i> Xác nhận nhập';
                }
            }
        })
        .catch(function () {
            alert('Lỗi kết nối Server!');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa fa-check"></i> Xác nhận nhập';
            }
        });
}

function xemChiTietMau(masp) {
    fetchVariantsForProduct(masp)
        .then(function (list) {
            if (!list.length) {
                alert('Sản phẩm này chưa có biến thể (màu/RAM/ROM). Vui lòng thêm trong Sửa sản phẩm.');
                return;
            }
            showWarehouseViewModal(masp, list);
        })
        .catch(function () { alert('Lỗi tải danh sách biến thể!'); });
}

function nhapHangTheoMau(masp) {
    fetchVariantsForProduct(masp)
        .then(function (list) {
            if (!list.length) {
                alert('Sản phẩm này chưa có biến thể. Vui lòng thêm màu + RAM/ROM trong Sửa sản phẩm.');
                return;
            }
            showWarehouseImportModal(masp, list, '');
        })
        .catch(function () { alert('Lỗi tải danh sách biến thể!'); });
}

function timKiemKhoHang(inp) {
    __warehouseKeyword = (inp && inp.value) ? inp.value : '';
    renderWarehousePanel();
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', initWarehouseModal);
