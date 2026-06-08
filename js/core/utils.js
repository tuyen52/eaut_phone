// js/core/utils.js

// Chuyển số thành chuỗi có dấu phân cách (VD: 10000 -> 10.000)
function numToString(num, char) {
    if (isNaN(num)) return '0';
    return num.toLocaleString('vi-VN').split(',').join(char || '.');
}

// Chuyển chuỗi có dấu phân cách thành số (VD: "10.000" -> 10000)
function stringToNum(str, char) {
    if (typeof str !== 'string') return 0;
    const numStr = str.replace(/[^\d]/g, '');
    return Number(numStr) || 0;
}

// Escape HTML để chống XSS cơ bản khi hiển thị dữ liệu từ DB/người dùng
function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Dùng cho src/href/title/alt nếu cần
function escapeAttr(value) {
    return escapeHtml(value);
}

// Copy 1 object (tránh tham chiếu vùng nhớ)
function copyObject(o) {
    try {
        return JSON.parse(JSON.stringify(o));
    } catch (e) {
        console.error("Error copying object:", e);
        return null;
    }
}

// Lấy màu ngẫu nhiên
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Trộn mảng ngẫu nhiên
function shuffleArray(array) {
    if (!Array.isArray(array)) return array;
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
    return array;
}

// --- Các hàm Tìm kiếm & Lọc ---

function timKiemTheoMa(list, ma) {
    if (!Array.isArray(list)) return null;
    for (var l of list) {
        if (l && l.masp == ma) return l;
    }
    return null;
}

function timKiemTheoTen(list, ten) {
    var tempList = copyObject(list);
    var result = [];
    ten = ten.split(' ');

    for (var sp of tempList) {
        var correct = true;
        var nameUpperCase = sp.name.toUpperCase();
        for (var t of ten) {
            if (nameUpperCase.indexOf(t.toUpperCase()) < 0) {
                correct = false;
                break;
            }
        }
        if (correct) {
            result.push(sp);
        }
    }
    return result;
}

// --- Các hàm UI Tiện ích ---

// [QUAN TRỌNG] Hàm thêm từ khóa vào khung tags
function addTags(nameTag, link) {
    var khung_tags = document.querySelector('.tags');
    if (!khung_tags) return;

    var safeName = String(nameTag || '').trim();
    var safeLink = String(link || '').trim();
    if (!safeName || !safeLink) return;

    // Tránh thêm trùng từ khóa khi nhiều trang cùng gọi khởi tạo UI
    var existed = Array.from(khung_tags.querySelectorAll('a')).some(function (a) {
        return a.getAttribute('href') === safeLink && a.textContent.trim() === safeName;
    });
    if (existed) return;

    var new_tag = `<a href="${safeLink}">${safeName}</a>`;
    khung_tags.innerHTML += new_tag;
}

// Hàm tính toán sao đánh giá
function getRatingInfo(masp) {
    var reviews = getListReviews(); 
    var productReviews = reviews.filter(r => r.masp === masp);

    if (productReviews.length === 0) {
        return { star: 0, rateCount: 0 };
    }

    var totalStars = productReviews.reduce((sum, r) => sum + parseInt(r.rating), 0);
    var average = totalStars / productReviews.length;

    return {
        star: Math.round(average),
        rateCount: productReviews.length
    };
}

// Autocomplete cho ô tìm kiếm
function autocomplete(inp, arr) {
    if (!inp || !Array.isArray(arr)) return;
    var currentFocus;

    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        closeAllLists();
        if (!val) return false;
        currentFocus = -1;
        
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);
        
        let count = 0;
        for (i = 0; i < arr.length && count < 10; i++) {
            if (arr[i].name.toUpperCase().includes(val.toUpperCase())) {
                b = document.createElement("DIV");
                let index = arr[i].name.toUpperCase().indexOf(val.toUpperCase());
                b.innerHTML = arr[i].name.substring(0, index);
                b.innerHTML += "<strong>" + arr[i].name.substring(index, index + val.length) + "</strong>";
                b.innerHTML += arr[i].name.substring(index + val.length);
                b.innerHTML += "<input type='hidden' value=\"" + arr[i].name.replace(/"/g, '&quot;') + "\">";
                
                b.addEventListener("click", function (e) {
                    inp.value = this.getElementsByTagName("input")[0].value;
                    inp.form.submit();
                    closeAllLists();
                });
                a.appendChild(b);
                count++;
            }
        }
    });

    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) { // Down
            currentFocus++;
            addActive(x);
        } else if (e.keyCode == 38) { // Up
            currentFocus--;
            addActive(x);
        } else if (e.keyCode == 13) { // Enter
            e.preventDefault();
            if (currentFocus > -1 && x) x[currentFocus].click();
            else inp.form.submit();
        }
    });

    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        for (var i = 0; i < x.length; i++) x[i].classList.remove("autocomplete-active");
    }

    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) x[i].parentNode.removeChild(x[i]);
        }
    }
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}   