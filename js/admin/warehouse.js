// js/admin/warehouse.js

var currentStockList = [];

// Hàm được gọi từ main.js khi bấm tab "Kho Hàng"
function addTableKhoHang() {
    var tc = document.querySelector('.khohang .table-content');
    if (!tc) return;

    tc.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fa fa-spinner fa-spin"></i> Đang tải dữ liệu kho...</div>';

    // Tận dụng API lấy sản phẩm có sẵn (vì nó đã chứa so_luong_ton)
    fetch('php/get-products.php')
    .then(res => res.json())
    .then(data => {
        currentStockList = data;
        renderWarehouseTable(currentStockList);
    })
    .catch(err => {
        console.error(err);
        tc.innerHTML = '<h3 style="color:red; text-align:center">Lỗi kết nối Server!</h3>';
    });
}

function renderWarehouseTable(list) {
    var tc = document.querySelector('.khohang .table-content');
    
    var s = `<table class="table-outline">
        <thead>
            <tr>
                <th>STT</th>
                <th>Mã SP</th>
                <th>Tên sản phẩm</th>
                <th>Tồn kho hiện tại</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
            </tr>
        </thead>
        <tbody>`;

    if (list.length === 0) {
        s += `<tr><td colspan="6" style="text-align:center">Kho hàng trống.</td></tr>`;
    } else {
        list.forEach((p, i) => {
            var stock = parseInt(p.inventory); // 'inventory' lấy từ get-products.php
            var statusColor = stock > 10 ? 'green' : (stock > 0 ? 'orange' : 'red');
            var statusText = stock > 10 ? 'Còn hàng' : (stock > 0 ? 'Sắp hết' : 'Hết hàng');

            s += `<tr>
                <td>${i+1}</td>
                <td>${p.masp}</td>
                <td style="text-align:left"><img src="${p.img}" style="width:30px; margin-right:5px; vertical-align:middle;"> ${p.name}</td>
                <td style="font-weight:bold">${stock}</td>
                <td style="color:${statusColor}; font-weight:bold">${statusText}</td>
                <td>
                    <button onclick="nhapHang('${p.masp}', '${p.name}')" style="background:#28a745; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:3px;">
                        <i class="fa fa-plus"></i> Nhập thêm
                    </button>
                </td>
            </tr>`;
        });
    }
    s += `</tbody></table>`;
    
    // Thêm ô tìm kiếm ở dưới bảng nếu chưa có
    var footer = document.querySelector('.khohang .table-footer');
    if(footer && footer.innerHTML.trim() === "") {
        footer.innerHTML = `<input type="text" placeholder="Tìm kiếm trong kho..." onkeyup="timKiemKhoHang(this)">`;
    }

    tc.innerHTML = s;
}

// Logic Nhập hàng
function nhapHang(masp, tensp) {
    var sl = prompt("Nhập số lượng muốn thêm vào kho cho sản phẩm:\n" + tensp);
    
    // Kiểm tra đầu vào
    if (sl == null) return; // Bấm hủy
    sl = parseInt(sl);
    if (isNaN(sl) || sl <= 0) {
        alert("Vui lòng nhập số lượng hợp lệ (lớn hơn 0)!");
        return;
    }

    // Gọi API
    fetch('php/admin/import-stock.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masp: masp, so_luong: sl })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status) {
            alert(data.message);
            addTableKhoHang(); // Tải lại bảng để thấy số lượng mới
        } else {
            alert("Lỗi: " + data.message);
        }
    })
    .catch(err => alert("Lỗi kết nối Server!"));
}

// Logic Tìm kiếm nhanh (Client-side)
function timKiemKhoHang(inp) {
    var txt = inp.value.toUpperCase();
    var filtered = currentStockList.filter(p => p.name.toUpperCase().includes(txt) || p.masp.toUpperCase().includes(txt));
    renderWarehouseTable(filtered);
}