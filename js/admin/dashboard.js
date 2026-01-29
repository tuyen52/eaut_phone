// js/admin/dashboard.js

function addThongKe() {
    // Canvas vẽ biểu đồ
    var canvas1 = document.getElementById('myChart1');
    var canvas2 = document.getElementById('myChart2');

    if (!canvas1 || !canvas2) return;

    // Hiển thị loading trong lúc đợi tính toán
    var chartContainer = canvas1.parentElement;
    // (Mẹo: Có thể thêm loading spinner ở đây nếu muốn)

    // GỌI API THỐNG KÊ TỪ SERVER
    fetch('php/admin/get-statistics.php')
    .then(res => res.json())
    .then(data => {
        if(data.length === 0) {
            // Chưa có đơn hàng nào hoàn thành
            chartContainer.innerHTML = '<h3 style="text-align:center; margin-top:50px;">Chưa có dữ liệu thống kê (Cần có đơn hàng "Hoàn thành")</h3>';
            return;
        }

        // Tách dữ liệu từ API thành các mảng riêng lẻ để vẽ
        var labels = data.map(item => item.hang);           // ["Apple", "Samsung"...]
        var dataSoluong = data.map(item => item.so_luong);  // [10, 5...]
        var dataTien = data.map(item => item.doanh_thu);    // [200000000, 50000000...]
        
        // Tạo màu ngẫu nhiên cho đẹp
        var colors = labels.map(() => getRandomColor());

        // Reset canvas cũ (để tránh lỗi vẽ đè lên nhau khi click lại tab)
        resetCanvas('myChart1');
        resetCanvas('myChart2');

        // Vẽ biểu đồ 1: Số lượng bán ra (Cột)
        drawChart('myChart1', 'Số lượng bán ra', 'bar', labels, dataSoluong, colors);

        // Vẽ biểu đồ 2: Doanh thu (Tròn)
        drawChart('myChart2', 'Doanh thu (VNĐ)', 'doughnut', labels, dataTien, colors);
    })
    .catch(err => {
        console.error(err);
        chartContainer.innerHTML = '<h3 style="color:red; text-align:center;">Lỗi kết nối Server thống kê!</h3>';
    });
}

// --- CÁC HÀM HỖ TRỢ VẼ (GIỮ NGUYÊN LOGIC CŨ) ---

function resetCanvas(id) {
    var canvas = document.getElementById(id);
    var parent = canvas.parentNode;
    parent.innerHTML = ''; // Xóa canvas cũ
    var newCanvas = document.createElement('canvas');
    newCanvas.id = id;
    newCanvas.style.width = '100%'; // Responsive
    newCanvas.style.height = '400px';
    parent.appendChild(newCanvas);
}

function drawChart(id, title, type, labels, data, colors) {
    var ctx = document.getElementById(id);
    if(!ctx) return;
    
    // Kiểm tra xem thư viện Chart.js đã được load chưa
    if (typeof Chart === 'undefined') {
        console.error("Thư viện Chart.js chưa được load trong admin.html");
        return;
    }

    new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: title,
                fontSize: 25,
                fontColor: '#333' // Màu chữ tiêu đề (đổi sang màu tối cho dễ đọc trên nền trắng)
            },
            legend: {
                labels: { fontColor: '#333' },
                position: 'bottom'
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        var label = data.labels[tooltipItem.index] || '';
                        var value = data.datasets[0].data[tooltipItem.index];
                        
                        if (label) { label += ': '; }
                        // Format tiền tệ nếu là biểu đồ doanh thu
                        if(id === 'myChart2') {
                             label += numToString(value) + ' ₫';
                        } else {
                             label += value + ' cái';
                        }
                        return label;
                    }
                }
            },
            scales: type === 'bar' ? {
                yAxes: [{ 
                    ticks: { beginAtZero: true, fontColor: '#333' } 
                }],
                xAxes: [{ 
                    ticks: { fontColor: '#333' } 
                }]
            } : {}
        }
    });
}