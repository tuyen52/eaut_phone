<?php
// php/admin/admin_auth.php
// Chặn gọi trực tiếp API admin nếu chưa đăng nhập admin.

require_once(__DIR__ . '/../auth_session.php');

require_admin();
?>