// js/admin/reviews.js

function addTableBinhLuan() {
    var tc = document.querySelector('.binhluan .table-content');
    if (!tc) return;

    tc.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fa fa-spinner fa-spin"></i> Đang tải dữ liệu...</div>';

    fetch('php/admin/get-all-reviews.php')
    .then(res => res.json())
    .then(data => renderReviewTable(data))
    .catch(err => {
        console.error(err);
        tc.innerHTML = '<h3 style="color:red; text-align:center">Lỗi kết nối Server!</h3>';
    });
}

function renderReviewTable(list) {
    var tc = document.querySelector('.binhluan .table-content');
    
    var s = `<table class="table-outline">
        <thead>
            <tr>
                <th>STT</th>
                <th>Người dùng</th>
                <th>Sản phẩm</th>
                <th>Màu</th>
                <th>Nội dung</th>
                <th>Đánh giá</th>
                <th>Ngày giờ</th>
                <th>Hành động</th>
            </tr>
        </thead>
        <tbody>`;

    if (!list || list.length === 0) {
        s += `<tr><td colspan="8" style="text-align:center">Chưa có bình luận nào.</td></tr>`;
    } else {
        list.forEach((r, i) => {
            var stars = '';
            for(let j=1; j<=5; j++) stars += `<i class="fa ${j<=parseInt(r.so_sao)?'fa-star':'fa-star-o'}" style="color:orange"></i>`;

            var mau = r.mau_sac ? r.mau_sac : (r.variant_id ? ('Variant #' + r.variant_id) : '');
            var swatch = r.ma_mau_hex ? `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;border:1px solid #ccc;background:${r.ma_mau_hex};margin-right:6px;"></span>` : '';

            s += `<tr>
                <td>${i+1}</td>
                <td>${r.username}</td>
                <td>${r.ten_sp} <br><small style="color:#777">(${r.masp})</small></td>
                <td style="text-align:left; min-width:120px;">${swatch}${mau}</td>
                <td style="text-align:left; max-width: 300px;">${r.binh_luan}</td>
                <td style="min-width:100px">${stars}</td>
                <td>${new Date(r.ngay_dg).toLocaleString()}</td>
                <td>
                    <div class="tooltip">
                        <i class="fa fa-trash" style="color:red; cursor:pointer" onclick="xoaBinhLuan(${r.id}, '${r.masp}')"></i>
                        <span class="tooltiptext">Xóa</span>
                    </div>
                </td>
            </tr>`;
        });
    }
    s += `</tbody></table>`;
    tc.innerHTML = s;
}

function xoaBinhLuan(id, masp) {
    if(!confirm('Bạn có chắc chắn muốn xóa bình luận này? Hành động này sẽ tính toán lại số sao trung bình của sản phẩm.')) return;

    fetch('php/admin/delete-review.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, masp: masp })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status) {
            alert(data.message);
            addTableBinhLuan();
        } else {
            alert("Lỗi: " + data.message);
        }
    })
    .catch(() => alert("Lỗi kết nối Server!"));
}