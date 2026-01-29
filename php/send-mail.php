<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'lib/PHPMailer/Exception.php';
require 'lib/PHPMailer/PHPMailer.php';
require 'lib/PHPMailer/SMTP.php';

function sendEmail($to, $subject, $content) {
    $mail = new PHPMailer(true);

    try {
        // 1. Cấu hình Server
        $mail->isSMTP();                                            
        $mail->Host       = 'smtp.gmail.com';                     
        $mail->SMTPAuth   = true;
        
        // --- THAY EMAIL CỦA BẠN VÀO ĐÂY ---
        $mail->Username   = 'huy84028@gmail.com'; 
        $mail->Password   = 'djlm ssjq bflr bquk'; 
        // ----------------------------------

        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            
        $mail->Port       = 465;                                    
        $mail->CharSet    = 'UTF-8';

        // === CẤU HÌNH CHỐNG TREO ===
        $mail->Timeout    = 3;  // Chỉ thử trong 3 giây
        $mail->SMTPKeepAlive = false; 
        // ===========================

        // 2. Người gửi - Người nhận
        $mail->setFrom('huy84028@gmail.com', 'EAUT Phone Store'); 
        $mail->addAddress($to);     

        // 3. Nội dung
        $mail->isHTML(true);                                  
        $mail->Subject = $subject;
        $mail->Body    = $content;
        $mail->AltBody = strip_tags($content);

        $mail->send();
        return true; // Gửi thành công
    } catch (Exception $e) {
        // Nếu lỗi (do mail ảo, mạng chặn...), ta chỉ ghi log nội bộ
        // Tuyệt đối không dừng chương trình hay báo lỗi ra màn hình
        error_log("Mail Error: " . $mail->ErrorInfo); 
        return false; // Báo về là thất bại nhưng code chính vẫn chạy tiếp
    }
}
?>