// js/admin/orders.js

var currentOrderList = [];
var sortOrderDirection = 1;

// ======================= QUẢN LÝ ĐƠN HÀNG =======================

function addTableDonHang() {
    var tc = document.querySelector('.donhang .table-content');
    if (!tc) return;

    tc.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fa fa-spinner fa-spin"></i> Đang tải đơn hàng...</div>';
    
    // Cập nhật UI lọc (thanh tìm kiếm ở footer bảng)
    updateOrderFooterUI();

    // Gọi API lấy đơn hàng
    fetch('php/admin/get-orders.php')
        .then(res => res.json())
        .then(data => {
            currentOrderList = data;
            renderOrderTable(currentOrderList);
        })
        .catch(err => {
            console.error(err);
            tc.innerHTML = '<h3 style="text-align:center; color:red">Lỗi kết nối Server!</h3>';
        });
}

function renderOrderTable(list) {
    var tc = document.querySelector('.donhang .table-content');
    
    // Tạo Header bảng (Thêm các cột mới SĐT, Địa chỉ, Thanh toán)
    var s = `<table class="table-outline hideImg">
    <thead>
        <tr>
            <th>Mã</th>
            <th>Khách hàng</th>
            <th>Liên hệ</th> <th>Sản phẩm</th>
            <th>Tổng tiền</th>
            <th>Ngày giờ</th>
            <th>Thanh toán</th> <th>Trạng thái</th>
            <th>Hành động</th>
        </tr>
    </thead>
    <tbody>`;

    if (list.length === 0) {
        s += `<tr><td colspan="9" style="text-align:center; padding: 20px;">Không tìm thấy đơn hàng nào.</td></tr>`;
    } else {
        list.forEach((d, i) => {
            // 1. Xử lý danh sách sản phẩm
            var spString = d.sp.map(s => {
                // Tìm tên sản phẩm trong list_products (được tải ở init.js)
                var productInfo = list_products.find(p => p.masp == s.ma_sp);
                var tenSP = productInfo ? productInfo.name : s.ma_sp;
                return `<p style="margin:0; font-size:12px;">- ${tenSP} <b>x${s.so_luong}</b></p>`;
            }).join('');
            
            // 2. Xử lý hiển thị Phương thức thanh toán
            var ptttDisplay = d.pttt || 'COD';
            if(ptttDisplay.includes('Chuyển khoản')) {
                // Nếu là chuyển khoản -> Tô đậm và màu xanh để Admin chú ý Mã GD
                ptttDisplay = `<span style="color:#0056b3; font-weight:bold; font-size:12px;">${ptttDisplay}</span>`;
            } else {
                ptttDisplay = `<span style="font-size:12px;">${ptttDisplay}</span>`;
            }

            // 3. Xử lý Thông tin liên hệ (SĐT + Địa chỉ)
            var contactInfo = `
                <div style="font-size:13px;"><b>${d.sdt}</b></div>
                <div style="font-size:11px; color:#555; max-width: 150px;">${d.diaChi}</div>
            `;

            // 4. Logic hiển thị nút bấm Hành động
            var btnAction = '';
            
            if (d.tinhTrang === 'Chờ xử lý') {
                btnAction += `<div class="tooltip"><i class="fa fa-check" style="color:green; cursor:pointer; font-size:1.2em;" onclick="capNhatTrangThai(${d.maDon}, 'Đang giao hàng')"></i><span class="tooltiptext">Duyệt</span></div>`;
                btnAction += `<div class="tooltip"><i class="fa fa-remove" style="color:red; cursor:pointer; margin-left:15px; font-size:1.2em;" onclick="capNhatTrangThai(${d.maDon}, 'Đã hủy')"></i><span class="tooltiptext">Hủy đơn</span></div>`;
            }
            else if (d.tinhTrang === 'Đang giao hàng') {
                btnAction += `<span style="font-size:11px; color:#888;">Đang giao...</span>`;
                btnAction += `<div class="tooltip"><i class="fa fa-remove" style="color:red; cursor:pointer; margin-left:10px" onclick="capNhatTrangThai(${d.maDon}, 'Đã hủy')"></i><span class="tooltiptext">Hủy đơn</span></div>`;
            }
            else if (d.tinhTrang === 'Đã nhận hàng') {
                btnAction += `<div class="tooltip"><i class="fa fa-check-circle" style="color:#28a745; cursor:pointer; font-size: 1.5em;" onclick="capNhatTrangThai(${d.maDon}, 'Hoàn thành')"></i><span class="tooltiptext">duyệt</span></div>`;
            }
            else {
                 btnAction += `<div class="tooltip"><i class="fa fa-trash" style="color:#aaa; cursor:pointer" onclick="xoaDonHangVinhVien(${d.maDon})"></i><span class="tooltiptext">Xóa</span></div>`;
            }

            // 5. Render dòng HTML
            s += `<tr>
                <td style="text-align:center"><b>#${d.maDon}</b></td>
                <td>${d.khachHang}</td>
                <td>${contactInfo}</td>
                <td>${spString}</td>
                <td style="color:#d0021b; font-weight:bold;">${numToString(parseInt(d.tongTien))}₫</td>
                <td style="font-size:12px;">${new Date(d.ngayMua).toLocaleString()}</td>
                <td>${ptttDisplay}</td>
                <td><span style="color:${getColorByStatus(d.tinhTrang)}; font-weight:bold; font-size:12px;">${d.tinhTrang}</span></td>
                <td style="text-align:center">${btnAction}</td>
            </tr>`;
        });
    }
    s += `</tbody></table>`;
    tc.innerHTML = s;
}

// Hàm bổ trợ màu sắc trạng thái
function getColorByStatus(status) {
    if(status == 'Chờ xử lý') return '#ff9800'; // Cam
    if(status == 'Đang giao hàng') return '#17a2b8'; // Xanh ngọc
    if(status == 'Đã nhận hàng') return '#007bff'; // Xanh dương
    if(status == 'Hoàn thành') return '#28a745'; // Xanh lá
    if(status.includes('Hủy')) return '#dc3545'; // Đỏ
    return '#333';
}

// ======================= TƯƠNG TÁC SERVER =======================

function capNhatTrangThai(maDon, trangThaiMoi) {
    var msg = 'Xác nhận chuyển đơn hàng #' + maDon + ' sang trạng thái: "' + trangThaiMoi + '"?';
    if(trangThaiMoi === 'Đã hủy') msg += '\nLưu ý: Không thể hoàn tác!';
    
    if(!confirm(msg)) return;

    fetch('php/admin/update-order-status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maDon: maDon, trangThai: trangThaiMoi })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status) {
            alert(data.message);
            addTableDonHang(); // Tải lại bảng
        } else {
            alert("Lỗi: " + data.message);
        }
    })
    .catch(err => alert("Lỗi kết nối Server!"));
}

function xoaDonHangVinhVien(maDon) {
    if(!confirm('Xóa vĩnh viễn lịch sử đơn hàng #' + maDon + '?')) return;
    
    fetch('php/admin/delete-order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maDon: maDon })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status) {
            alert(data.message);
            currentOrderList = currentOrderList.filter(d => d.maDon != maDon);
            renderOrderTable(currentOrderList);
        } else {
            alert("Lỗi: " + data.message);
        }
    })
    .catch(err => alert("Lỗi kết nối Server!"));
}

// ======================= CÁC HÀM PHỤ TRỢ (LỌC/SORT) =======================

function updateOrderFooterUI() {
    var footer = document.querySelector('.donhang .table-footer');
    if (!footer) return;
    if (footer.innerHTML.trim() !== "") return; 

    footer.innerHTML = `
        <div class="timTheoNgay">
            Từ: <input type="date" id="fromDate">
            Đến: <input type="date" id="toDate">
            <button onclick="locDonHangTheoKhoangNgay()"><i class="fa fa-search"></i> Lọc</button>
        </div>
        <div class="timKiemDonHang">
            <select id="kieuTimDonHang">
                <option value="ma">Mã đơn</option>
                <option value="khach">Tên khách</option>
                <option value="sdt">Số điện thoại</option>
                <option value="pttt">Thanh toán</option>
            </select>
            <input type="text" placeholder="Tìm kiếm..." onkeyup="timKiemDonHang(this)">
        </div>`;
}

function locDonHangTheoKhoangNgay() {
    var from = document.getElementById('fromDate').valueAsDate;
    var to = document.getElementById('toDate').valueAsDate;
    
    if(from) from.setHours(0,0,0,0);
    if(to) to.setHours(23,59,59,999);

    var filtered = currentOrderList.filter(d => {
        var time = new Date(d.ngayMua).getTime(); 
        return (!from || time >= from) && (!to || time <= to);
    });
    renderOrderTable(filtered);
}

function timKiemDonHang(inp) {
    var type = document.getElementById('kieuTimDonHang').value;
    var txt = inp.value.toUpperCase();
    
    var filtered = currentOrderList.filter(d => {
        var val = '';
        if(type=='ma') val = d.maDon.toString();
        else if(type=='khach') val = d.khachHang;
        else if(type=='sdt') val = d.sdt;
        else if(type=='pttt') val = d.pttt;
        
        return val && val.toUpperCase().includes(txt);
    });
    renderOrderTable(filtered);
}