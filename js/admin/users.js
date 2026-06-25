// js/admin/users.js



var currentListUser = [];

var __userKeyword = '';

var __userSearchType = 'all';

var __userStatusFilter = 'all';

var __userSortCol = 'hoten';

var __userSortDir = 1;



function escapeHtml(str) {

    return String(str || '')

        .replace(/&/g, '&amp;')

        .replace(/</g, '&lt;')

        .replace(/>/g, '&gt;')

        .replace(/"/g, '&quot;')

        .replace(/'/g, '&#39;');

}



function normalizeText(str) {

    return String(str || '')

        .toLowerCase()

        .normalize('NFD')

        .replace(/[\u0300-\u036f]/g, '');

}



function getUserFullName(u) {

    return ((u.ho || '') + ' ' + (u.ten || '')).trim() || '—';

}



function getUserInitials(u) {

    var name = getUserFullName(u);

    if (name === '—') {

        var un = String(u.username || '?');

        return un.charAt(0).toUpperCase();

    }

    var parts = name.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {

        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();

    }

    return parts[0].charAt(0).toUpperCase();

}



function isUserLocked(u) {

    return !!u.off || parseInt(u.trang_thai, 10) === 0;

}



function initUserModal() {

    var overlay = document.getElementById('userModalOverlay');

    if (!overlay) return;



    var closeBtn = document.getElementById('userModalClose');

    if (closeBtn && !closeBtn.__usrBound) {

        closeBtn.__usrBound = true;

        closeBtn.addEventListener('click', closeUserModal);

    }



    if (!overlay.__usrBound) {

        overlay.__usrBound = true;

        overlay.addEventListener('click', function (e) {

            if (e.target === overlay) closeUserModal();

        });

    }



    if (!document.__usrEscBound) {

        document.__usrEscBound = true;

        document.addEventListener('keydown', function (e) {

            if (e.key === 'Escape') closeUserModal();

        });

    }

}



function openUserModal() {

    initUserModal();

    var overlay = document.getElementById('userModalOverlay');

    if (overlay) overlay.style.transform = 'scale(1)';

}



function closeUserModal() {

    var overlay = document.getElementById('userModalOverlay');

    if (overlay) overlay.style.transform = 'scale(0)';

}



function getUserStats(list) {

    list = Array.isArray(list) ? list : [];

    var active = list.filter(function (u) { return !isUserLocked(u); }).length;

    var locked = list.length - active;

    return { total: list.length, active: active, locked: locked };

}



function addTableKhachHang() {

    var tc = document.querySelector('.khachhang .table-content');

    if (!tc) return;



    initUserModal();

    tc.innerHTML = '<div class="usr-loading"><i class="fa fa-spinner fa-spin"></i> Đang tải khách hàng...</div>';



    fetch('php/admin/get-users.php')

        .then(function (response) {

            if (!response.ok) throw new Error('Lỗi kết nối Server');

            return response.json();

        })

        .then(function (data) {

            currentListUser = Array.isArray(data) ? data : [];

            renderUserPanel();

        })

        .catch(function (err) {

            console.error(err);

            tc.innerHTML = '<div class="usr-empty-state"><i class="fa fa-exclamation-triangle"></i>Không thể lấy dữ liệu từ Server!</div>';

        });

}



function applyUserFilters(list) {

    list = Array.isArray(list) ? list.slice() : [];

    var keyword = normalizeText(__userKeyword);



    if (__userStatusFilter === 'active') {

        list = list.filter(function (u) { return !isUserLocked(u); });

    } else if (__userStatusFilter === 'locked') {

        list = list.filter(function (u) { return isUserLocked(u); });

    }



    if (keyword) {

        list = list.filter(function (u) {

            var fullName = normalizeText(getUserFullName(u));

            var email = normalizeText(u.email);

            var username = normalizeText(u.username);



            if (__userSearchType === 'ten') return fullName.includes(keyword);

            if (__userSearchType === 'email') return email.includes(keyword);

            if (__userSearchType === 'taikhoan') return username.includes(keyword);



            return fullName.includes(keyword) || email.includes(keyword) || username.includes(keyword);

        });

    }



    return list;

}



function applyUserSort(list) {

    list = list.slice();

    var col = __userSortCol;

    var dir = __userSortDir;



    list.sort(function (a, b) {

        var valA, valB;



        if (col === 'hoten') {

            valA = normalizeText(getUserFullName(a));

            valB = normalizeText(getUserFullName(b));

        } else if (col === 'email') {

            valA = normalizeText(a.email);

            valB = normalizeText(b.email);

        } else if (col === 'user') {

            valA = normalizeText(a.username);

            valB = normalizeText(b.username);

        } else if (col === 'status') {

            valA = isUserLocked(a) ? 0 : 1;

            valB = isUserLocked(b) ? 0 : 1;

        } else {

            return 0;

        }



        if (valA < valB) return -1 * dir;

        if (valA > valB) return 1 * dir;

        return 0;

    });



    return list;

}



function getUserSortIcon(col) {

    if (__userSortCol !== col) return '<i class="fa fa-sort usr-sort-icon"></i>';

    return __userSortDir > 0

        ? '<i class="fa fa-sort-asc usr-sort-icon active"></i>'

        : '<i class="fa fa-sort-desc usr-sort-icon active"></i>';

}



function userSortHeader(label, col) {

    return '<span class="usr-th-label">' + label + ' ' + getUserSortIcon(col) + '</span>';

}



function renderUserPanel() {

    var tc = document.querySelector('.khachhang .table-content');

    if (!tc) return;



    var stats = getUserStats(currentListUser);

    var filtered = applyUserSort(applyUserFilters(currentListUser));



    var html = `

        <div class="wh-toolbar usr-toolbar">

            <div class="wh-toolbar-filters">

                <div class="wh-field">

                    <label for="userSearchType">Tìm theo</label>

                    <select id="userSearchType">

                        <option value="all">Tất cả trường</option>

                        <option value="ten">Họ tên</option>

                        <option value="email">Email</option>

                        <option value="taikhoan">Tài khoản</option>

                    </select>

                </div>

                <div class="wh-field">

                    <label for="userSearchInput">Từ khóa</label>

                    <input id="userSearchInput" type="text" placeholder="Nhập tên, email hoặc tài khoản..." value="${escapeHtml(__userKeyword)}">

                </div>

                <div class="wh-field">

                    <label for="userStatusFilter">Trạng thái</label>

                    <select id="userStatusFilter">

                        <option value="all">Tất cả</option>

                        <option value="active">Đang hoạt động</option>

                        <option value="locked">Đã khóa</option>

                    </select>

                </div>

                <button type="button" class="wh-btn-clear" id="userClearBtn">

                    <i class="fa fa-eraser"></i> Xóa lọc

                </button>

            </div>

            <div class="wh-stats">

                <span class="wh-stat wh-stat-total">Tổng: ${stats.total}</span>

                <span class="wh-stat usr-stat-active">Hoạt động: ${stats.active}</span>

                <span class="wh-stat usr-stat-locked">Đã khóa: ${stats.locked}</span>

                <span class="wh-stat usr-stat-showing">Hiển thị: ${filtered.length}</span>

            </div>

        </div>

    `;



    html += renderUserTableHTML(filtered);

    tc.innerHTML = html;



    var typeSel = document.getElementById('userSearchType');

    if (typeSel) {

        typeSel.value = __userSearchType;

        typeSel.addEventListener('change', function () {

            __userSearchType = this.value;

            renderUserPanel();

        });

    }



    var inp = document.getElementById('userSearchInput');

    if (inp) {

        inp.addEventListener('input', function () {

            __userKeyword = this.value;

            renderUserPanel();

        });

    }



    var statusSel = document.getElementById('userStatusFilter');

    if (statusSel) {

        statusSel.value = __userStatusFilter;

        statusSel.addEventListener('change', function () {

            __userStatusFilter = this.value;

            renderUserPanel();

        });

    }



    var clearBtn = document.getElementById('userClearBtn');

    if (clearBtn) {

        clearBtn.addEventListener('click', function () {

            __userKeyword = '';

            __userSearchType = 'all';

            __userStatusFilter = 'all';

            renderUserPanel();

        });

    }



    tc.querySelectorAll('th[data-sort]').forEach(function (th) {

        th.addEventListener('click', function () {

            var col = th.getAttribute('data-sort');

            if (__userSortCol === col) {

                __userSortDir = -__userSortDir;

            } else {

                __userSortCol = col;

                __userSortDir = col === 'status' ? -1 : 1;

            }

            renderUserPanel();

        });

    });



    tc.querySelectorAll('.usr-lock-toggle').forEach(function (cb) {

        cb.addEventListener('change', function () {

            var userId = parseInt(cb.getAttribute('data-user-id'), 10);

            var username = cb.getAttribute('data-username') || '';

            voHieuHoaUser(userId, username, cb);

        });

    });



    tc.querySelectorAll('.btn-usr-delete').forEach(function (btn) {

        btn.addEventListener('click', function () {

            var userId = parseInt(btn.getAttribute('data-user-id'), 10);

            var username = btn.getAttribute('data-username') || '';

            var user = currentListUser.find(function (u) {

                return parseInt(u.user_id) === userId;

            });

            if (user) showUserDeleteModal(user);

            else xoaUser(userId, username);

        });

    });

}



function renderUserTableHTML(list) {

    var html = `<table class="table-outline usr-table">

        <thead>

            <tr>

                <th>STT</th>

                <th class="usr-th-sort" data-sort="hoten">${userSortHeader('Khách hàng', 'hoten')}</th>

                <th class="usr-th-sort" data-sort="email">${userSortHeader('Email', 'email')}</th>

                <th class="usr-th-sort" data-sort="user">${userSortHeader('Tài khoản', 'user')}</th>

                <th class="usr-th-sort" data-sort="status">${userSortHeader('Trạng thái', 'status')}</th>

                <th>Hành động</th>

            </tr>

        </thead>

        <tbody>`;



    if (!list.length) {

        html += '<tr><td colspan="6"><div class="usr-empty-state"><i class="fa fa-inbox"></i>Không tìm thấy khách hàng phù hợp.</div></td></tr>';

    } else {

        list.forEach(function (u, i) {

            var locked = isUserLocked(u);

            var fullName = getUserFullName(u);

            var initials = getUserInitials(u);

            var safeName = escapeHtml(fullName);

            var safeEmail = escapeHtml(u.email || '—');

            var safeUsername = escapeHtml(u.username);

            var userId = parseInt(u.user_id, 10);



            html += `<tr class="${locked ? 'usr-row-locked' : ''}">

                <td>${i + 1}</td>

                <td>

                    <div class="usr-customer-cell">

                        <span class="usr-avatar">${escapeHtml(initials)}</span>

                        <span class="usr-name" title="${safeName}">${safeName}</span>

                    </div>

                </td>

                <td><span class="usr-email" title="${safeEmail}">${safeEmail}</span></td>

                <td>

                    <div class="usr-username-cell">

                        <span class="usr-username" title="${safeUsername}">${safeUsername}</span>

                    </div>

                </td>

                <td>

                    <span class="usr-status-badge ${locked ? 'locked' : 'active'}">

                        ${locked ? '<i class="fa fa-lock"></i> Đã khóa' : '<i class="fa fa-check-circle"></i> Hoạt động'}

                    </span>

                </td>

                <td>

                    <div class="usr-actions">

                        <label class="usr-lock-wrap" title="${locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}">

                            <input type="checkbox" class="usr-lock-toggle switch-input" data-user-id="${userId}" data-username="${safeUsername}" ${locked ? '' : 'checked'}>

                            <span class="usr-switch"></span>

                            <span class="usr-lock-label">${locked ? 'Mở' : 'Khóa'}</span>

                        </label>

                        <button type="button" class="btn-usr-delete" data-user-id="${userId}" data-username="${safeUsername}" title="Xóa tài khoản">

                            <i class="fa fa-trash"></i>

                        </button>

                    </div>

                </td>

            </tr>`;

        });

    }



    html += '</tbody></table>';

    return html;

}



function showUserDeleteModal(u) {

    var fullName = getUserFullName(u);



    document.getElementById('userModalTitle').innerHTML =

        '<i class="fa fa-exclamation-triangle"></i> Xác nhận xóa';



    document.getElementById('userModalBody').innerHTML = `

        <div class="usr-delete-warning">

            <p>Hành động này sẽ <strong>xóa vĩnh viễn</strong> tài khoản và toàn bộ đơn hàng liên quan. Không thể hoàn tác.</p>

        </div>

        <div class="usr-delete-preview">

            <div class="usr-delete-user">

                <span class="usr-avatar usr-avatar-lg">${escapeHtml(getUserInitials(u))}</span>

                <div>

                    <strong>${escapeHtml(fullName)}</strong>

                    <div class="usr-delete-meta">${escapeHtml(u.username)} · ${escapeHtml(u.email || '—')}</div>

                </div>

            </div>

        </div>

    `;



    document.getElementById('userModalFooter').innerHTML = `

        <button type="button" class="btn-usr-secondary" id="usrModalBtnCancel">Hủy</button>

        <button type="button" class="btn-usr-danger" id="usrModalBtnConfirm">

            <i class="fa fa-trash"></i> Xác nhận xóa

        </button>

    `;



    document.getElementById('usrModalBtnCancel').addEventListener('click', closeUserModal);

    document.getElementById('usrModalBtnConfirm').addEventListener('click', function () {

        submitDeleteUser(u);

    });



    openUserModal();

}



function submitDeleteUser(u) {

    var btn = document.getElementById('usrModalBtnConfirm');

    var userId = parseInt(u.user_id, 10);

    var username = String(u.username || '');



    if (btn) {

        btn.disabled = true;

        btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang xóa...';

    }



    fetch('php/admin/delete-user.php', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ user_id: userId, username: username })

    })

        .then(function (res) { return res.json(); })

        .then(function (data) {

            if (data.status) {

                closeUserModal();

                currentListUser = currentListUser.filter(function (x) {

                    return String(x.username) !== username;

                });

                renderUserPanel();

            } else {

                alert('Lỗi: ' + (data.message || 'Không thể xóa tài khoản'));

                if (btn) {

                    btn.disabled = false;

                    btn.innerHTML = '<i class="fa fa-trash"></i> Xác nhận xóa';

                }

            }

        })

        .catch(function () {

            alert('Lỗi kết nối Server khi xóa tài khoản.');

            if (btn) {

                btn.disabled = false;

                btn.innerHTML = '<i class="fa fa-trash"></i> Xác nhận xóa';

            }

        });

}



function voHieuHoaUser(userId, username, checkbox) {

    var wantToLock = !checkbox.checked;



    fetch('php/admin/lock-user.php', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ user_id: userId, username: username, lock: wantToLock })

    })

        .then(function (res) { return res.json(); })

        .then(function (data) {

            if (data.status) {

                var user = currentListUser.find(function (u) {

                    return String(u.username) === String(username);

                });

                if (user) {

                    user.off = wantToLock;

                    user.trang_thai = wantToLock ? 0 : 1;

                }

                renderUserPanel();

            } else {

                alert('Lỗi: ' + data.message);

                checkbox.checked = !checkbox.checked;

            }

        })

        .catch(function () {

            alert('Lỗi kết nối Server khi khóa tài khoản.');

            checkbox.checked = !checkbox.checked;

        });

}



function xoaUser(userId, username) {

    var user = currentListUser.find(function (u) {

        return parseInt(u.user_id) === parseInt(userId) || String(u.username) === String(username);

    });

    if (user) showUserDeleteModal(user);

}



function timKiemNguoiDung(inp) {

    __userKeyword = (inp && inp.value) ? inp.value : '';

    renderUserPanel();

}



function sortUserTable(type) {

    if (__userSortCol === type) {

        __userSortDir = -__userSortDir;

    } else {

        __userSortCol = type;

        __userSortDir = type === 'status' ? -1 : 1;

    }

    renderUserPanel();

}



function renderUserTable(list) {

    renderUserPanel();

}



function updateUserFooterUI() {}



document.addEventListener('DOMContentLoaded', initUserModal);

