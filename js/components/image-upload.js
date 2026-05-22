// js/components/image-upload.js
// Helper upload ảnh cho trang tạo dữ liệu sản phẩm

function uploadImageFile(file) {
    if (!file) return Promise.reject(new Error('No file'));

    var formData = new FormData();
    formData.append('image', file);

    return fetch('php/upload-image.php', {
        method: 'POST',
        body: formData
    }).then(function (res) {
        return res.json();
    });
}
