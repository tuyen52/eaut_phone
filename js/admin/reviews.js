// js/admin/reviews.js

var currentReviewList = [];
var __reviewKeyword = '';
var __reviewSearchType = 'all';
var __reviewStarFilter = 'all';
var __reviewSortCol = 'date';
var __reviewSortDir = -1;
var __rvModalState = { mode: 'view', review: null };

function formatReviewVariantLabel(r) {
    if (!r) return '';
    var color = (r.mau_sac || r.ten_mau || '').trim();
    var ram = (r.ram || '').trim();
    var rom = (r.rom || '').trim();
    var parts = [color, ram, rom].filter(Boolean);
    if (parts.length) return parts.join(' | ');
    if (r.variant_id) return 'Variant #' + r.variant_id;
    return '—';
}

function normalizeText(str) {
    return String(str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatReviewDate(raw) {
    var d = new Date(raw || 0);
    if (isNaN(d.getTime())) return '—';
    var pad = function (n) { return n < 10 ? '0' + n : String(n); };
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() +
        ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function renderStarsHtml(rating) {
    rating = parseInt(rating || 0);
    if (rating < 0) rating = 0;
    if (rating > 5) rating = 5;
    var html = '<span class="rv-stars">';
    for (var j = 1; j <= 5; j++) {
        html += '<i class="fa ' + (j <= rating ? 'fa-star' : 'fa-star-o') + '"></i>';
    }
    html += '</span><span class="rv-rating-num">' + rating + '/5</span>';
    return html;
}

function truncateComment(text, maxLen) {
    text = String(text || '').trim();
    maxLen = maxLen || 72;
    if (text.length <= maxLen) return { short: text, truncated: false };
    return { short: text.slice(0, maxLen).trim() + '…', truncated: true };
}

function initReviewModal() {
    var overlay = document.getElementById('reviewModalOverlay');
    if (!overlay) return;

    var closeBtn = document.getElementById('reviewModalClose');
    if (closeBtn && !closeBtn.__rvBound) {
        closeBtn.__rvBound = true;
        closeBtn.addEventListener('click', closeReviewModal);
    }

    if (!overlay.__rvBound) {
        overlay.__rvBound = true;
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeReviewModal();
        });
    }

    if (!document.__rvEscBound) {
        document.__rvEscBound = true;
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeReviewModal();
        });
    }
}

function openReviewModal() {
    initReviewModal();
    var overlay = document.getElementById('reviewModalOverlay');
    if (overlay) overlay.style.transform = 'scale(1)';
}

function closeReviewModal() {
    var overlay = document.getElementById('reviewModalOverlay');
    if (overlay) overlay.style.transform = 'scale(0)';
    __rvModalState = { mode: 'view', review: null };
}

function getReviewStats(list) {
    list = Array.isArray(list) ? list : [];
    var total = list.length;
    var sum = 0;
    var lowCount = 0;
    list.forEach(function (r) {
        var s = parseInt(r.so_sao || 0);
        sum += s;
        if (s > 0 && s <= 2) lowCount++;
    });
    var avg = total ? (sum / total).toFixed(1) : '0.0';
    return { total: total, avg: avg, lowCount: lowCount };
}

function addTableBinhLuan() {
    var tc = document.querySelector('.binhluan .table-content');
    if (!tc) return;

    initReviewModal();
    tc.innerHTML = '<div class="rv-loading"><i class="fa fa-spinner fa-spin"></i> Đang tải bình luận...</div>';

    fetch('php/admin/get-all-reviews.php')
        .then(function (res) {
            if (!res.ok) throw new Error('Lỗi kết nối Server');
            return res.json();
        })
        .then(function (data) {
            currentReviewList = Array.isArray(data) ? data : [];
            renderReviewPanel();
        })
        .catch(function (err) {
            console.error(err);
            tc.innerHTML = '<div class="rv-empty-state"><i class="fa fa-exclamation-triangle"></i>Lỗi kết nối Server!</div>';
        });
}

function applyReviewFilters(list) {
    list = Array.isArray(list) ? list.slice() : [];
    var keyword = normalizeText(__reviewKeyword);

    if (__reviewStarFilter !== 'all') {
        var star = parseInt(__reviewStarFilter, 10);
        list = list.filter(function (r) { return parseInt(r.so_sao || 0) === star; });
    }

    if (keyword) {
        list = list.filter(function (r) {
            var rating = parseInt(r.so_sao || 0);
            var mau = formatReviewVariantLabel(r);
            var user = normalizeText(r.username);
            var product = normalizeText(r.ten_sp);
            var masp = normalizeText(r.masp);
            var color = normalizeText(mau);
            var content = normalizeText(r.binh_luan);
            var dateText = normalizeText(formatReviewDate(r.ngay_dg));
            var saoText = normalizeText(String(rating));

            if (__reviewSearchType === 'nguoidung') return user.includes(keyword);
            if (__reviewSearchType === 'sanpham') return product.includes(keyword);
            if (__reviewSearchType === 'masp') return masp.includes(keyword);
            if (__reviewSearchType === 'mau') return color.includes(keyword);
            if (__reviewSearchType === 'noidung') return content.includes(keyword);
            if (__reviewSearchType === 'sao') return saoText.includes(keyword);

            return (user + ' ' + product + ' ' + masp + ' ' + color + ' ' + content + ' ' + dateText + ' ' + saoText).includes(keyword);
        });
    }

    return list;
}

function applyReviewSort(list) {
    list = list.slice();
    var col = __reviewSortCol;
    var dir = __reviewSortDir;

    list.sort(function (a, b) {
        var valA, valB;
        if (col === 'rating') {
            valA = parseInt(a.so_sao || 0);
            valB = parseInt(b.so_sao || 0);
        } else if (col === 'date') {
            valA = new Date(a.ngay_dg || 0).getTime();
            valB = new Date(b.ngay_dg || 0).getTime();
        } else if (col === 'user') {
            valA = normalizeText(a.username);
            valB = normalizeText(b.username);
        } else if (col === 'product') {
            valA = normalizeText(a.ten_sp);
            valB = normalizeText(b.ten_sp);
        } else {
            return 0;
        }

        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
    });

    return list;
}

function getSortIcon(col) {
    if (__reviewSortCol !== col) return '<i class="fa fa-sort rv-sort-icon"></i>';
    return __reviewSortDir > 0
        ? '<i class="fa fa-sort-asc rv-sort-icon active"></i>'
        : '<i class="fa fa-sort-desc rv-sort-icon active"></i>';
}

function renderReviewPanel() {
    var tc = document.querySelector('.binhluan .table-content');
    if (!tc) return;

    var stats = getReviewStats(currentReviewList);
    var filtered = applyReviewSort(applyReviewFilters(currentReviewList));

    var html = `
        <div class="wh-toolbar rv-toolbar">
            <div class="wh-toolbar-filters">
                <div class="wh-field">
                    <label for="reviewSearchType">Tìm theo</label>
                    <select id="reviewSearchType">
                        <option value="all">Tất cả trường</option>
                        <option value="nguoidung">Người dùng</option>
                        <option value="sanpham">Sản phẩm</option>
                        <option value="masp">Mã SP</option>
                        <option value="mau">Biến thể</option>
                        <option value="noidung">Nội dung</option>
                        <option value="sao">Số sao</option>
                    </select>
                </div>
                <div class="wh-field">
                    <label for="reviewSearchInput">Từ khóa</label>
                    <input id="reviewSearchInput" type="text" placeholder="Nhập từ khóa tìm kiếm..." value="${escapeHtml(__reviewKeyword)}">
                </div>
                <div class="wh-field">
                    <label for="reviewStarFilter">Lọc sao</label>
                    <select id="reviewStarFilter">
                        <option value="all">Tất cả mức sao</option>
                        <option value="5">5 sao</option>
                        <option value="4">4 sao</option>
                        <option value="3">3 sao</option>
                        <option value="2">2 sao</option>
                        <option value="1">1 sao</option>
                    </select>
                </div>
                <button type="button" class="wh-btn-clear" id="reviewClearBtn">
                    <i class="fa fa-eraser"></i> Xóa lọc
                </button>
            </div>
            <div class="wh-stats">
                <span class="wh-stat wh-stat-total">Tổng: ${stats.total}</span>
                <span class="wh-stat rv-stat-avg"><i class="fa fa-star"></i> TB: ${stats.avg}</span>
                <span class="wh-stat rv-stat-low">Thấp (1–2★): ${stats.lowCount}</span>
                <span class="wh-stat rv-stat-showing">Hiển thị: ${filtered.length}</span>
            </div>
        </div>
    `;

    html += renderReviewTableHTML(filtered);
    tc.innerHTML = html;

    var typeSel = document.getElementById('reviewSearchType');
    if (typeSel) {
        typeSel.value = __reviewSearchType;
        typeSel.addEventListener('change', function () {
            __reviewSearchType = this.value;
            renderReviewPanel();
        });
    }

    var inp = document.getElementById('reviewSearchInput');
    if (inp) {
        inp.addEventListener('input', function () {
            __reviewKeyword = this.value;
            renderReviewPanel();
        });
    }

    var starSel = document.getElementById('reviewStarFilter');
    if (starSel) {
        starSel.value = __reviewStarFilter;
        starSel.addEventListener('change', function () {
            __reviewStarFilter = this.value;
            renderReviewPanel();
        });
    }

    var clearBtn = document.getElementById('reviewClearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            __reviewKeyword = '';
            __reviewSearchType = 'all';
            __reviewStarFilter = 'all';
            renderReviewPanel();
        });
    }

    tc.querySelectorAll('th[data-sort]').forEach(function (th) {
        th.addEventListener('click', function () {
            var col = th.getAttribute('data-sort');
            if (__reviewSortCol === col) {
                __reviewSortDir = -__reviewSortDir;
            } else {
                __reviewSortCol = col;
                __reviewSortDir = col === 'date' ? -1 : 1;
            }
            renderReviewPanel();
        });
    });

    tc.querySelectorAll('.btn-rv-view').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var id = parseInt(btn.getAttribute('data-id'), 10);
            var review = currentReviewList.find(function (r) { return parseInt(r.id) === id; });
            if (review) showReviewDetailModal(review);
        });
    });

    tc.querySelectorAll('.btn-rv-delete').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var id = parseInt(btn.getAttribute('data-id'), 10);
            var masp = btn.getAttribute('data-masp') || '';
            var review = currentReviewList.find(function (r) { return parseInt(r.id) === id; });
            if (review) showReviewDeleteModal(review);
        });
    });
}

function renderReviewTableHTML(list) {
    var html = `<table class="table-outline rv-table">
        <thead>
            <tr>
                <th>STT</th>
                <th class="rv-th-sort" data-sort="user">Người dùng ${getSortIcon('user')}</th>
                <th class="rv-th-sort" data-sort="product">Sản phẩm ${getSortIcon('product')}</th>
                <th>Biến thể</th>
                <th>Nội dung</th>
                <th class="rv-th-sort" data-sort="rating">Đánh giá ${getSortIcon('rating')}</th>
                <th class="rv-th-sort" data-sort="date">Ngày giờ ${getSortIcon('date')}</th>
                <th>Hành động</th>
            </tr>
        </thead>
        <tbody>`;

    if (!list.length) {
        html += '<tr><td colspan="8"><div class="rv-empty-state"><i class="fa fa-inbox"></i>Không tìm thấy bình luận phù hợp.</div></td></tr>';
    } else {
        list.forEach(function (r, i) {
            var rating = parseInt(r.so_sao || 0);
            var mau = formatReviewVariantLabel(r);
            var hex = String(r.ma_mau_hex || '');
            var safeHex = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#cbd5e1';
            var img = escapeHtml(r.hinh_anh || '');
            var commentInfo = truncateComment(r.binh_luan);
            var safeCommentShort = escapeHtml(commentInfo.short);
            var safeCommentFull = escapeHtml(r.binh_luan);
            var safeUsername = escapeHtml(r.username);
            var safeProductName = escapeHtml(r.ten_sp);
            var safeMasp = escapeHtml(r.masp);
            var safeMau = escapeHtml(mau);
            var safeDate = escapeHtml(formatReviewDate(r.ngay_dg));
            var id = parseInt(r.id || 0);

            html += `<tr>
                <td>${i + 1}</td>
                <td>
                    <div class="rv-user-cell">
                        <span class="rv-user-avatar"><i class="fa fa-user"></i></span>
                        <span class="rv-user-name" title="${safeUsername}">${safeUsername}</span>
                    </div>
                </td>
                <td>
                    <div class="rv-product-cell">
                        <img src="${img}" alt="" onerror="this.style.visibility='hidden'">
                        <div class="rv-product-meta">
                            <span class="rv-product-name" title="${safeProductName}">${safeProductName}</span>
                            <span class="rv-product-code">${safeMasp}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="rv-variant-cell" title="${safeMau}">
                        <span class="rv-swatch" style="background:${safeHex}"></span>
                        <span>${safeMau}</span>
                    </div>
                </td>
                <td>
                    <div class="rv-comment-cell" title="${safeCommentFull}">${safeCommentShort || '<em class="rv-no-comment">Không có nội dung</em>'}</div>
                </td>
                <td><div class="rv-rating-cell">${renderStarsHtml(rating)}</div></td>
                <td><span class="rv-date">${safeDate}</span></td>
                <td>
                    <button type="button" class="btn-rv-view" data-id="${id}" title="Xem chi tiết">
                        <i class="fa fa-eye"></i>
                    </button>
                    <button type="button" class="btn-rv-delete" data-id="${id}" data-masp="${safeMasp}" title="Xóa bình luận">
                        <i class="fa fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        });
    }

    html += '</tbody></table>';
    return html;
}

function showReviewDetailModal(r) {
    __rvModalState = { mode: 'view', review: r };
    var rating = parseInt(r.so_sao || 0);
    var mau = formatReviewVariantLabel(r);
    var hex = String(r.ma_mau_hex || '');
    var safeHex = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#cbd5e1';

    document.getElementById('reviewModalTitle').innerHTML =
        '<i class="fa fa-eye"></i> Chi tiết bình luận';

    document.getElementById('reviewModalBody').innerHTML = `
        <div class="rv-detail-grid">
            <div class="rv-detail-item">
                <span>Người dùng</span>
                <b>${escapeHtml(r.username)}</b>
            </div>
            <div class="rv-detail-item">
                <span>Sản phẩm</span>
                <b>${escapeHtml(r.ten_sp)}</b>
                <small>${escapeHtml(r.masp)}</small>
            </div>
            <div class="rv-detail-item">
                <span>Biến thể</span>
                <b><span class="rv-swatch" style="background:${safeHex}"></span> ${escapeHtml(mau)}</b>
            </div>
            <div class="rv-detail-item">
                <span>Đánh giá</span>
                <b>${renderStarsHtml(rating)}</b>
            </div>
            <div class="rv-detail-item">
                <span>Thời gian</span>
                <b>${escapeHtml(formatReviewDate(r.ngay_dg))}</b>
            </div>
        </div>
        <div class="rv-detail-comment">
            <label>Nội dung bình luận</label>
            <p>${escapeHtml(r.binh_luan) || '<em>Không có nội dung</em>'}</p>
        </div>
    `;

    document.getElementById('reviewModalFooter').innerHTML = `
        <button type="button" class="btn-rv-secondary" id="rvModalBtnClose">Đóng</button>
        <button type="button" class="btn-rv-danger" id="rvModalBtnDelete">
            <i class="fa fa-trash"></i> Xóa bình luận
        </button>
    `;

    document.getElementById('rvModalBtnClose').addEventListener('click', closeReviewModal);
    document.getElementById('rvModalBtnDelete').addEventListener('click', function () {
        showReviewDeleteModal(r);
    });

    openReviewModal();
}

function showReviewDeleteModal(r) {
    __rvModalState = { mode: 'delete', review: r };
    var preview = truncateComment(r.binh_luan, 120).short;

    document.getElementById('reviewModalTitle').innerHTML =
        '<i class="fa fa-exclamation-triangle"></i> Xác nhận xóa';

    document.getElementById('reviewModalBody').innerHTML = `
        <div class="rv-delete-warning">
            <p>Bạn có chắc muốn xóa bình luận này? Hệ thống sẽ tính lại điểm sao trung bình của sản phẩm.</p>
        </div>
        <div class="rv-delete-preview">
            <div><strong>${escapeHtml(r.username)}</strong> · ${renderStarsHtml(r.so_sao)}</div>
            <div class="rv-delete-product">${escapeHtml(r.ten_sp)} <small>(${escapeHtml(r.masp)})</small></div>
            <blockquote>${escapeHtml(preview) || '<em>Không có nội dung</em>'}</blockquote>
        </div>
    `;

    document.getElementById('reviewModalFooter').innerHTML = `
        <button type="button" class="btn-rv-secondary" id="rvModalBtnCancel">Hủy</button>
        <button type="button" class="btn-rv-danger" id="rvModalBtnConfirm">
            <i class="fa fa-trash"></i> Xác nhận xóa
        </button>
    `;

    document.getElementById('rvModalBtnCancel').addEventListener('click', closeReviewModal);
    document.getElementById('rvModalBtnConfirm').addEventListener('click', function () {
        submitDeleteReview(r);
    });

    openReviewModal();
}

function submitDeleteReview(r) {
    var btn = document.getElementById('rvModalBtnConfirm');
    var id = parseInt(r.id || 0);
    var masp = String(r.masp || '');

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang xóa...';
    }

    fetch('php/admin/delete-review.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, masp: masp })
    })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data.status) {
                closeReviewModal();
                addTableBinhLuan();
            } else {
                alert('Lỗi: ' + (data.message || 'Không thể xóa bình luận'));
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa fa-trash"></i> Xác nhận xóa';
                }
            }
        })
        .catch(function () {
            alert('Lỗi kết nối Server!');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa fa-trash"></i> Xác nhận xóa';
            }
        });
}

function timKiemBinhLuan(inp) {
    __reviewKeyword = (inp && inp.value) ? inp.value : '';
    renderReviewPanel();
}

function sortReviewTable(type) {
    if (__reviewSortCol === type) {
        __reviewSortDir = -__reviewSortDir;
    } else {
        __reviewSortCol = type;
        __reviewSortDir = type === 'date' ? -1 : 1;
    }
    renderReviewPanel();
}

function xoaBinhLuan(id, masp) {
    var review = currentReviewList.find(function (r) {
        return parseInt(r.id) === parseInt(id) && String(r.masp) === String(masp);
    });
    if (review) showReviewDeleteModal(review);
}

document.addEventListener('DOMContentLoaded', initReviewModal);
