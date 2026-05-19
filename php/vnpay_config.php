<?php
// php/vnpay_config.php
date_default_timezone_set('Asia/Ho_Chi_Minh');

/*
|--------------------------------------------------------------------------
| NHẬP THÔNG TIN SANDBOX CỦA BẠN TẠI ĐÂY
|--------------------------------------------------------------------------
| - vnp_TmnCode
| - vnp_HashSecret
| - vnp_ReturnUrl
| - vnp_IpnUrl
|
| Lưu ý:
| - vnp_ReturnUrl sẽ được gửi trong URL thanh toán
| - vnp_IpnUrl là URL backend để VNPay gọi về, bạn cần cấu hình trên portal sandbox
|--------------------------------------------------------------------------
*/

$vnp_TmnCode      = 'VN4QFA3Q';
$vnp_HashSecret   = 'WIXHVAX08W8OG98CEINW85D919B5WDW2';

$vnp_Url          = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
$vnp_ReturnUrl    = 'https://ileac-jasperoid-ginger.ngrok-free.dev/eaut_phone/php/vnpay_return.php';
$vnp_IpnUrl       = 'https://ileac-jasperoid-ginger.ngrok-free.dev/eaut_phone/php/vnpay_ipn.php';

$vnp_ApiVersion   = '2.1.0';
$vnp_OrderType    = 'other';
$vnp_Locale       = 'vn';
$vnp_ExpireMinutes = 15;
?>