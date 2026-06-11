// js/admin/reviews.js

var currentReviewList = [];   // Danh sách bình luận đã tải từ Server
var sortReviewDir = 1;        // Hướng sắp xếp

// ======================= QUẢN LÝ BÌNH LUẬN =======================

function addTableBinhLuan() {
    var tc = document.querySelector('.binhluan .table-content');
    if (!tc) return;

    tc.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fa fa-spinner fa-spin"></i> Đang tải dữ liệu...</div>';

    fetch('php/admin/get-all-reviews.php')
        .then(res => {
            if (!res.ok) throw new Error('Lỗi kết nối Server');
            return res.json();
        })
        .then(data => {
            currentReviewList = Array.isArray(data) ? data : [];
            updateReviewFooterUI();
            renderReviewTable(currentReviewList);
        })
        .catch(err => {
            console.error(err);
            tc.innerHTML = '<h3 style="color:red; text-align:center">Lỗi kết nối Server!</h3>';
        });
}

function updateReviewFooterUI() {
    var footer = document.querySelector('.binhluan .table-content');
    if (!footer) return;

    // Chỉ render phần tìm kiếm 1 lần ở đầu bảng
    var searchBox = document.getElementById('reviewSearchBox');
    if (searchBox) return;

    var parent = document.querySelector('.binhluan');
    if (!parent) return;

    var box = document.createElement('div');
    box.id = 'reviewSearchBox';
    box.style.cssText = 'display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-bottom:14px;';
    box.innerHTML = `
        <select id="kieuTimBinhLuan" style="padding:10px 12px; border:1px solid #d9e2ec; border-radius:8px; outline:none; min-width:170px;">
            <option value="nguoidung">Tìm theo người dùng</option>
            <option value="sanpham">Tìm theo sản phẩm</option>
            <option value="masp">Tìm theo mã SP</option>
            <option value="mau">Tìm theo màu</option>
            <option value="noidung">Tìm theo nội dung</option>
            <option value="sao">Tìm theo số sao</option>
        </select>
        <input id="inputTimBinhLuan" type="text" placeholder="Tìm kiếm bình luận..." style="flex:1; min-width:260px; padding:10px 12px; border:1px solid #d9e2ec; border-radius:8px; outline:none;">
        <button id="btnClearReviewSearch" type="button" style="background:#6c757d; color:#fff; border:none; padding:10px 14px; border-radius:8px; cursor:pointer;">
            <i class="fa fa-times"></i> Xóa tìm kiếm
        </button>
    `;

    parent.insertBefore(box, footer);

    var input = document.getElementById('inputTimBinhLuan');
    var select = document.getElementById('kieuTimBinhLuan');
    var clearBtn = document.getElementById('btnClearReviewSearch');

    if (input) {
        input.addEventListener('keyup', function () {
            timKiemBinhLuan(this);
        });
    }

    if (select) {
        select.addEventListener('change', function () {
            renderReviewTable(currentReviewList);
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (input) input.value = '';
            if (select) select.value = 'nguoidung';
            renderReviewTable(currentReviewList);
        });
    }
}

function normalizeText(str) {
    return String(str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function renderReviewTable(list) {
    var tc = document.querySelector('.binhluan .table-content');
    if (!tc) return;

    var keyword = normalizeText((document.getElementById('inputTimBinhLuan') || {}).value || '');
    var type = (document.getElementById('kieuTimBinhLuan') || {}).value || 'nguoidung';
    var filtered = Array.isArray(list) ? list.slice() : [];

    if (keyword) {
        filtered = filtered.filter(r => {
            var rating = parseInt(r.so_sao || 0);
            var mau = r.mau_sac ? r.mau_sac : (r.variant_id ? ('Variant #' + r.variant_id) : '');
            var user = normalizeText(r.username);
            var product = normalizeText(r.ten_sp);
            var masp = normalizeText(r.masp);
            var color = normalizeText(mau);
            var content = normalizeText(r.binh_luan);
            var dateText = normalizeText(new Date(r.ngay_dg).toLocaleString());
            var saoText = normalizeText(String(rating));

            if (type === 'nguoidung') return user.includes(keyword);
            if (type === 'sanpham') return product.includes(keyword);
            if (type === 'masp') return masp.includes(keyword);
            if (type === 'mau') return color.includes(keyword);
            if (type === 'noidung') return content.includes(keyword);
            if (type === 'sao') return saoText.includes(keyword);

            return (user + ' ' + product + ' ' + masp + ' ' + color + ' ' + content + ' ' + dateText + ' ' + saoText).includes(keyword);
        });
    }

    var s = `<table class="table-outline">
        <thead>
            <tr>
                <th>STT</th>
                <th>Người dùng</th>
                <th>Sản phẩm</th>
                <th>Màu</th>
                <th>Nội dung</th>
                <th onclick="sortReviewTable('rating')" style="cursor:pointer">Đánh giá <i class="fa fa-sort"></i></th>
                <th onclick="sortReviewTable('date')" style="cursor:pointer">Ngày giờ <i class="fa fa-sort"></i></th>
                <th>Hành động</th>
            </tr>
        </thead>
        <tbody>`;

    if (!filtered || filtered.length === 0) {
        s += `<tr><td colspan="8" style="text-align:center">Không tìm thấy bình luận phù hợp.</td></tr>`;
    } else {
        filtered.forEach((r, i) => {
            var rating = parseInt(r.so_sao || 0);
            if (rating < 0) rating = 0;
            if (rating > 5) rating = 5;

            var stars = '';
            for (let j = 1; j <= 5; j++) {
                stars += `<i class="fa ${j <= rating ? 'fa-star' : 'fa-star-o'}" style="color:orange"></i>`;
            }

            var mau = r.mau_sac ? r.mau_sac : (r.variant_id ? ('Variant #' + r.variant_id) : '');
            var hex = String(r.ma_mau_hex || '');
            var safeHex = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#000000';
            var swatch = mau
                ? `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;border:1px solid #ccc;background:${safeHex};margin-right:6px;"></span>`
                : '';

            var safeUsername = escapeHtml(r.username);
            var safeProductName = escapeHtml(r.ten_sp);
            var safeMasp = escapeHtml(r.masp);
            var safeMau = escapeHtml(mau);
            var safeComment = escapeHtml(r.binh_luan);
            var safeDate = escapeHtml(new Date(r.ngay_dg).toLocaleString());

            var jsId = parseInt(r.id || 0);
            var jsMasp = encodeURIComponent(String(r.masp || ''));

            s += `<tr>
                <td>${i + 1}</td>
                <td title="${safeUsername}">${safeUsername}</td>
                <td title="${safeProductName} (${safeMasp})">${safeProductName} <br><small style="color:#777">(${safeMasp})</small></td>
                <td style="text-align:left; min-width:120px;" title="${safeMau}">${swatch}${safeMau}</td>
                <td style="text-align:left; max-width: 300px;" title="${safeComment}">${safeComment}</td>
                <td style="min-width:100px">${stars}</td>
                <td>${safeDate}</td>
                <td>
                    <div class="tooltip">
                        <i class="fa fa-trash" style="color:red; cursor:pointer" onclick="xoaBinhLuan(${jsId}, decodeURIComponent('${jsMasp}'))"></i>
                        <span class="tooltiptext">Xóa</span>
                    </div>
                </td>
            </tr>`;
        });
    }
    s += `</tbody></table>`;

    tc.innerHTML = s;
}

function timKiemBinhLuan(inp) {
    renderReviewTable(currentReviewList);
}

function sortReviewTable(type) {
    sortReviewDir = -sortReviewDir;

    currentReviewList.sort((a, b) => {
        var valA = '';
        var valB = '';

        if (type === 'rating') {
            valA = parseInt(a.so_sao || 0);
            valB = parseInt(b.so_sao || 0);
        } else if (type === 'date') {
            valA = new Date(a.ngay_dg || 0).getTime();
            valB = new Date(b.ngay_dg || 0).getTime();
        }

        if (valA < valB) return -1 * sortReviewDir;
        if (valA > valB) return 1 * sortReviewDir;
        return 0;
    });

    renderReviewTable(currentReviewList);
}

function xoaBinhLuan(id, masp) {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này? Hành động này sẽ tính toán lại số sao trung bình của sản phẩm.')) return;

    fetch('php/admin/delete-review.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, masp: masp })
    })
        .then(res => res.json())
        .then(data => {
            if (data.status) {
                alert(data.message);
                addTableBinhLuan();
            } else {
                alert('Lỗi: ' + data.message);
            }
        })
        .catch(() => alert('Lỗi kết nối Server!'));
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
