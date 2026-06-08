<?php
// php/vnpay_ipn.php
// Luồng mới dùng vnpay_payment_sessions:
// - VNPay success: tạo orders + order_details + trừ kho.
// - VNPay fail/hủy/bỏ ngang: không tạo orders thật, không trừ kho.
// - Không có callback/return: không tạo orders.

header('Content-Type: application/json; charset=utf-8');

require_once('../connect.php');
require_once(__DIR__ . '/vnpay_config.php');
require_once(__DIR__ . '/order_helpers.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

function ipn_response($code, $message)
{
    echo json_encode([
        'RspCode' => $code,
        'Message' => $message
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    if (trim((string)$vnp_HashSecret) === '') {
        ipn_response('99', 'Config Error');
    }

    $verify = vnpay_verify_response($_GET, $vnp_HashSecret);
    if (!$verify['valid']) {
        ipn_response('97', 'Invalid Signature');
    }

    $input = $verify['input'];

    $vnpTxnRef            = trim((string)($input['vnp_TxnRef'] ?? ''));
    $vnpAmount            = (int)($input['vnp_Amount'] ?? 0);
    $vnpResponseCode      = trim((string)($input['vnp_ResponseCode'] ?? ''));
    $vnpTransactionStatus = trim((string)($input['vnp_TransactionStatus'] ?? ''));
    $vnpTransactionNo     = trim((string)($input['vnp_TransactionNo'] ?? ''));
    $vnpPayDate           = trim((string)($input['vnp_PayDate'] ?? ''));

    if ($vnpTxnRef === '') {
        ipn_response('01', 'Order Not Found');
    }

    try {
        $result = process_vnpay_session_result(
            $conn,
            $vnpTxnRef,
            $vnpAmount,
            $vnpResponseCode,
            $vnpTransactionStatus,
            $vnpTransactionNo,
            $vnpPayDate
        );

        if (!empty($result['already_processed'])) {
            ipn_response('02', 'Order Already Confirmed');
        }

        ipn_response('00', 'Confirm Success');

    } catch (Exception $e) {
        $msg = $e->getMessage();

        if ($msg === 'SESSION_NOT_FOUND' || $msg === 'MISSING_TXN_REF') {
            ipn_response('01', 'Order Not Found');
        }

        if ($msg === 'INVALID_AMOUNT') {
            ipn_response('04', 'Invalid Amount');
        }

        ipn_response('99', 'Unknown Error');
    }

} catch (Throwable $e) {
    ipn_response('99', 'Unknown Error');
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>