// js/core/init.js

var adminInfo = [{ "username": "admin", "pass": "adadad" }];
var list_products = []; 

function khoiTao() {
    // 1. Lấy thông tin Admin & User (Giữ nguyên logic cũ)
    var localAdmin = getListAdmin();
    if (localAdmin && localAdmin.length) adminInfo = localAdmin;

    // 2. [QUAN TRỌNG] GỌI API LẤY SẢN PHẨM TỪ DATABASE
    // Sử dụng XMLHttpRequest đồng bộ (false) để đảm bảo có dữ liệu trước khi vẽ giao diện
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "php/get-products.php", false); 
    xhr.send();

    if (xhr.status === 200) {
        try {
            var data = JSON.parse(xhr.responseText);
            
            // Format dữ liệu từ DB cho khớp với Frontend cũ
            list_products = data.map(function(p) {
                // DB lưu giá số nguyên (1000000), Frontend cần chuỗi ("1.000.000")
                if(typeof p.price === 'number') {
                    p.price = numToString(p.price);
                }
                
                // Đảm bảo object 'detail' luôn tồn tại để không lỗi hiển thị
                if(!p.detail) p.detail = {};
                
                return p;
            });

            // Lưu đè vào LocalStorage để các hàm cũ (như tìm kiếm, lọc) hoạt động trơn tru
            setListProducts(list_products); 
            console.log("Đã tải " + list_products.length + " sản phẩm từ MySQL.");

        } catch (e) {
            console.error("Lỗi phân tích JSON từ API:", e);
        }
    } else {
        console.error("Lỗi kết nối API: " + xhr.status);
    }

    // 3. Khởi tạo giao diện (Giữ nguyên)
    try {
        setupEventTaiKhoan();           
        capNhat_ThongTin_CurrentUser(); 
        addEventCloseAlertButton();     

        var tags = ["Samsung", "iPhone", "Huawei", "Oppo", "Mobi"];
        for (var t of tags) addTags(t, "index.html?search=" + t);
    } catch (e) {
        console.warn("Lỗi khởi tạo UI phụ:", e);
    }
}