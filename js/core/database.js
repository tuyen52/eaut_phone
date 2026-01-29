// js/core/database.js

// --- Cấu hình Admin mặc định ---
const DEFAULT_ADMINS = [{
    "username": "admin",
    "pass": "adadad"
}];

// --- Quản lý Admin ---
function getListAdmin() {
    try {
        const admins = JSON.parse(window.localStorage.getItem('ListAdmin'));
        return Array.isArray(admins) ? admins : DEFAULT_ADMINS;
    } catch (e) {
        return DEFAULT_ADMINS;
    }
}

// --- Quản lý Sản Phẩm (ListProducts) ---
function getListProducts() {
    try {
        const products = JSON.parse(window.localStorage.getItem('ListProducts'));
        return Array.isArray(products) ? products : [];
    } catch (e) {
        return [];
    }
}

function setListProducts(newList) {
    if (Array.isArray(newList)) {
        window.localStorage.setItem('ListProducts', JSON.stringify(newList));
    }
}

// --- Quản lý Người Dùng (ListUser) ---
function getListUser() {
    try {
        const users = JSON.parse(window.localStorage.getItem('ListUser'));
        return Array.isArray(users) ? users : [];
    } catch (e) {
        return [];
    }
}

function setListUser(l) {
    if (Array.isArray(l)) {
        window.localStorage.setItem('ListUser', JSON.stringify(l));
    }
}

// Cập nhật thông tin 1 user cụ thể trong danh sách
function updateSingleUserInList(updatedUser) {
    if (!updatedUser || !updatedUser.username) return;
    var list = getListUser();
    var found = false;
    for (var i = 0; i < list.length; i++) {
        if (list[i].username === updatedUser.username) {
            list[i] = updatedUser;
            found = true;
            break;
        }
    }
    if (found) setListUser(list);
}

// --- Quản lý User Hiện Tại (CurrentUser) ---
function getCurrentUser() {
    try {
        return JSON.parse(window.localStorage.getItem('CurrentUser'));
    } catch (e) {
        return null;
    }
}

function setCurrentUser(u) {
    window.localStorage.setItem('CurrentUser', JSON.stringify(u));
}

// --- Quản lý Đánh Giá (ListReviews) ---
function getListReviews() {
    try {
        const reviews = JSON.parse(window.localStorage.getItem('ListReviews'));
        return Array.isArray(reviews) ? reviews : [];
    } catch (e) {
        return [];
    }
}

function setListReviews(newList) {
    if (Array.isArray(newList)) {
        window.localStorage.setItem('ListReviews', JSON.stringify(newList));
    }
}