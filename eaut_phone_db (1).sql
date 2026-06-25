-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 25, 2026 at 08:02 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `eaut_phone_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `nhap_kho`
--

CREATE TABLE `nhap_kho` (
  `id` int(11) NOT NULL,
  `masp` varchar(20) NOT NULL,
  `so_luong_nhap` int(11) NOT NULL,
  `ngay_nhap` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `ma_don` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `ngay_mua` datetime DEFAULT current_timestamp(),
  `tinh_trang` enum('pending','confirmed','processing','shipping','completed','cancelled','delivery_failed') NOT NULL DEFAULT 'pending',
  `phuong_thuc_tt` varchar(255) DEFAULT NULL,
  `payment_status` enum('unpaid','paid','failed','refunded') NOT NULL DEFAULT 'unpaid',
  `vnp_txn_ref` varchar(100) DEFAULT NULL,
  `vnp_transaction_no` varchar(50) DEFAULT NULL,
  `vnp_response_code` varchar(10) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `payment_expired_at` datetime DEFAULT NULL,
  `dia_chi` text DEFAULT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `tong_tien` decimal(15,0) DEFAULT 0,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`ma_don`, `user_id`, `username`, `ngay_mua`, `tinh_trang`, `phuong_thuc_tt`, `payment_status`, `vnp_txn_ref`, `vnp_transaction_no`, `vnp_response_code`, `paid_at`, `payment_expired_at`, `dia_chi`, `so_dien_thoai`, `tong_tien`, `updated_at`) VALUES
(1, 4, 'tuyen', '2026-06-25 20:45:14', 'completed', 'COD', 'paid', NULL, NULL, NULL, NULL, NULL, 'Nguyên Xá, Tay Tuu Ward, Di Trạch, Hà Nội, 10085, Vietnam', '0375615945', 18990000, '2026-06-25 20:45:50'),
(2, 4, 'tuyen', '2026-06-25 21:49:59', 'pending', 'COD', 'unpaid', NULL, NULL, NULL, NULL, NULL, 'Nguyên Xá, Tay Tuu Ward, Di Trạch, Hà Nội, 10085, Vietnam', '0375615945', 24990000, '2026-06-25 21:49:59');

-- --------------------------------------------------------

--
-- Table structure for table `order_details`
--

CREATE TABLE `order_details` (
  `detail_id` int(11) NOT NULL,
  `ma_don` int(11) NOT NULL,
  `masp` varchar(20) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `mau_sac` varchar(50) DEFAULT NULL,
  `so_luong` int(11) DEFAULT 1,
  `don_gia` decimal(15,0) NOT NULL,
  `product_name_snapshot` varchar(255) DEFAULT NULL,
  `product_price_snapshot` decimal(15,0) DEFAULT NULL,
  `product_image_snapshot` text DEFAULT NULL,
  `variant_name_snapshot` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_details`
--

INSERT INTO `order_details` (`detail_id`, `ma_don`, `masp`, `variant_id`, `mau_sac`, `so_luong`, `don_gia`, `product_name_snapshot`, `product_price_snapshot`, `product_image_snapshot`, `variant_name_snapshot`) VALUES
(1, 1, 'APP16', 1, 'Đen', 1, 18990000, 'iPhone 16 128GB', 18990000, 'img/products/uploads/ip16xanhduong-1779440286.jpg', 'Đen | 16 | 1282 GB'),
(2, 2, 'APP17', 28, 'Đen', 1, 24990000, 'iPhone 17 256GB', 24990000, 'img/products/uploads/t---i-xu---ng--2-1779441601.webp', 'Đen | 16 GB | 128 GB');

-- --------------------------------------------------------

--
-- Table structure for table `order_status_logs`
--

CREATE TABLE `order_status_logs` (
  `log_id` int(11) NOT NULL,
  `ma_don` int(11) NOT NULL,
  `status` varchar(50) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_status_logs`
--

INSERT INTO `order_status_logs` (`log_id`, `ma_don`, `status`, `note`, `created_at`) VALUES
(1, 1, 'confirmed', 'updated_by_admin', '2026-06-25 20:45:41'),
(2, 1, 'processing', 'updated_by_admin', '2026-06-25 20:45:43'),
(3, 1, 'shipping', 'updated_by_admin', '2026-06-25 20:45:46'),
(4, 1, 'completed', 'updated_by_admin', '2026-06-25 20:45:50');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `masp` varchar(20) NOT NULL,
  `ten_sp` varchar(255) NOT NULL,
  `hang_sx` varchar(50) NOT NULL,
  `hinh_anh` varchar(255) DEFAULT NULL,
  `gia` decimal(15,0) DEFAULT 0,
  `so_luong_ton` int(11) DEFAULT 0,
  `so_sao` int(11) DEFAULT 0,
  `so_danh_gia` int(11) DEFAULT 0,
  `khuyen_mai_loai` varchar(50) DEFAULT NULL,
  `khuyen_mai_gia_tri` varchar(50) DEFAULT NULL,
  `screen` varchar(100) DEFAULT '',
  `os` varchar(100) DEFAULT '',
  `camera` varchar(100) DEFAULT '',
  `camera_front` varchar(100) DEFAULT '',
  `cpu` varchar(100) DEFAULT '',
  `ram` varchar(50) DEFAULT '',
  `rom` varchar(50) DEFAULT '',
  `micro_usb` varchar(100) DEFAULT '',
  `battery` varchar(100) DEFAULT '',
  `gioi_thieu_san_pham` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`masp`, `ten_sp`, `hang_sx`, `hinh_anh`, `gia`, `so_luong_ton`, `so_sao`, `so_danh_gia`, `khuyen_mai_loai`, `khuyen_mai_gia_tri`, `screen`, `os`, `camera`, `camera_front`, `cpu`, `ram`, `rom`, `micro_usb`, `battery`, `gioi_thieu_san_pham`) VALUES
('APP16', 'iPhone 16 128GB', 'Apple', 'img/products/uploads/ip16xanhduong-1779440286.jpg', 17990000, 269, 5, 1, 'giamgia', '1000000', 'Super Retina XDR 6.1 inch', 'iOS 26', 'Camera kép 48 MP', 'TrueDepth 12 MP', 'Apple A18', '8 GB', '128 GB', 'Không hỗ trợ thẻ nhớ', 'Pin tốt, sạc nhanh USB-C', 'iPhone 16 là thế hệ iPhone mới với thiết kế tinh tế, hoàn thiện cao cấp và trọng lượng cân bằng, mang đến cảm giác cầm nắm thoải mái cho cả công việc lẫn giải trí hằng ngày.\r\n\r\nMáy được trang bị màn hình Super Retina XDR 6.1 inch sắc nét, hiển thị màu sắc chân thực, độ sáng cao và tần số quét mượt mà. Chip Apple A18 cùng RAM 8 GB mang lại hiệu năng mạnh mẽ, xử lý mượt các tác vụ đa nhiệm, chơi game và quay phim 4K ổn định.\r\n\r\nHệ thống camera kép 48 MP phía sau và camera TrueDepth 12 MP phía trước giúp chụp ảnh chi tiết, quay video sắc nét trong mọi điều kiện ánh sáng. iPhone 16 chạy iOS 26 với hệ sinh thái Apple đồng bộ, bảo mật cao và cập nhật phần mềm lâu dài.\r\n\r\nPin tốt kèm sạc nhanh USB-C đáp ứng nhu cầu sử dụng cả ngày. Đây là lựa chọn lý tưởng cho người dùng yêu thích sự ổn định, thiết kế gọn gàng và trải nghiệm iOS trọn vẹn.'),
('APP17', 'iPhone 17 256GB', 'Apple', 'img/products/uploads/t---i-xu---ng--2-1779441601.webp', 24990000, 269, 0, 0, 'moiramat', '', 'Super Retina XDR 6.3 inch 120Hz', 'iOS 26', 'Camera kép 48 MP, quay 4K', 'TrueDepth 24 MP', 'Apple A19', '8 GB', '256 GB', 'Không hỗ trợ thẻ nhớ', 'Pin cả ngày, sạc nhanh USB-C', 'iPhone 17 nâng cấp toàn diện so với thế hệ trước với màn hình Super Retina XDR 6.3 inch 120Hz, mang lại trải nghiệm vuốt chạm mượt mà và hiển thị sống động hơn khi xem phim, chơi game hay lướt mạng xã hội.\r\n\r\nSức mạnh đến từ chip Apple A19 cùng RAM 8 GB và bộ nhớ 256 GB, giúp xử lý nhanh các ứng dụng nặng, chỉnh sửa video và đa nhiệm liên tục mà vẫn giữ độ ổn định cao. Hệ điều hành iOS 26 tối ưu trải nghiệm, bảo mật dữ liệu và đồng bộ liền mạch với Mac, iPad, AirPods.\r\n\r\nCamera kép 48 MP hỗ trợ quay 4K chất lượng cao, chụp ảnh chi tiết trong điều kiện thiếu sáng. Camera TrueDepth 24 MP phía trước cho ảnh selfie và video call rõ nét, tự nhiên.\r\n\r\nVới pin dùng cả ngày và sạc nhanh USB-C, iPhone 17 phù hợp người dùng cần hiệu năng cao, màn hình mượt và trải nghiệm Apple cao cấp trong phân khúc flagship tiêu chuẩn.'),
('APP17P', 'iPhone 17 Pro 256GB', 'Apple', 'img/products/uploads/shopping-1779441651.webp', 34990000, 180, 0, 0, 'giareonline', '1500000', 'OLED ProMotion 6.3 inch 120Hz', 'iOS 26', 'Camera Pro Fusion 48 MP', 'TrueDepth 24 MP', 'Apple A19 Pro', '12 GB', '256 GB', 'Không hỗ trợ thẻ nhớ', 'Pin Pro, sạc nhanh USB-C', 'iPhone 17 Pro là phiên bản cao cấp dành cho người dùng đòi hỏi hiệu năng và trải nghiệm chuyên nghiệp nhất trong dòng iPhone. Thiết kế sang trọng, khung viền cao cấp và hoàn thiện tinh xảo tạo cảm giác đẳng cấp ngay từ lần cầm đầu tiên.\r\n\r\nMàn hình OLED ProMotion 6.3 inch 120Hz cho độ phản hồi cực nhanh, màu sắc chính xác và độ sáng cao — lý tưởng cho chỉnh sửa ảnh, xem HDR và chơi game đồ họa nặng. Chip Apple A19 Pro cùng RAM 12 GB mang lại sức mạnh xử lý vượt trội, đáp ứng tốt cả công việc sáng tạo lẫn giải trí đỉnh cao.\r\n\r\nHệ camera Pro Fusion 48 MP được tối ưu cho nhiếp ảnh chuyên sâu: chụp đêm tốt hơn, quay video chuyên nghiệp và xử lý ảnh nhanh. Camera TrueDepth 24 MP hỗ trợ selfie và gọi video chất lượng cao.\r\n\r\nPin Pro bền bỉ, sạc nhanh USB-C và hệ sinh thái iOS 26 giúp iPhone 17 Pro trở thành công cụ toàn diện cho creator, doanh nhân và người dùng yêu công nghệ cao cấp.'),
('HMDPULSEP', 'HMD Pulse Pro 6GB/128GB', 'Nokia', 'img/products/uploads/t---i-xu---ng-1779441784.jpg', 3990000, 180, 5, 1, 'giamgia', '200000', 'LCD 6.65 inch 90Hz', 'Android 15', 'Camera sau 50 MP', 'Camera selfie 50 MP', 'Unisoc T606', '6 GB', '128 GB', 'MicroSD hỗ trợ', '5000 mAh, pin lâu', 'HMD Pulse Pro là smartphone giá tốt với cấu hình cân bằng, phù hợp người dùng cần máy ổn định cho học tập, làm việc và giải trí cơ bản mà không tốn quá nhiều chi phí.\r\n\r\nMàn hình LCD 6.65 inch tần số quét 90Hz cho trải nghiệm vuốt mượt hơn so với màn 60Hz truyền thống. RAM 6 GB và bộ nhớ 128 GB đáp ứng tốt các tác vụ hằng ngày như lướt web, xem video, chat và sử dụng mạng xã hội.\r\n\r\nĐiểm nhấn là camera sau 50 MP và camera selfie 50 MP — hiếm có ở phân khúc giá này — giúp chụp ảnh sắc nét, selfie đẹp và quay video ổn định. Máy chạy Android 15 với giao diện thân thiện, dễ làm quen.\r\n\r\nPin 5000 mAh cho thời lượng sử dụng dài, hỗ trợ thẻ nhớ MicroSD để mở rộng dung lượng lưu trữ. HMD Pulse Pro là lựa chọn hợp lý cho học sinh, sinh viên và người dùng lần đầu chuyển sang smartphone.'),
('HMDXR21', 'Nokia XR21 5G 6GB/128GB', 'Nokia', 'img/products/uploads/t---i-xu---ng--1-1779441853.jpg', 7490000, 180, 0, 0, 'tragop', '0', 'LCD 6.49 inch 120Hz', 'Android 14', 'Camera kép 64 MP', 'Camera 16 MP', 'Snapdragon 695 5G', '6 GB', '128 GB', 'MicroSD hỗ trợ', '4800 mAh, bền bỉ', 'Nokia XR21 5G được thiết kế dành riêng cho người dùng cần độ bền cao, chống va đập, nước bụi — phù hợp làm việc ngoài trời, công trường hoặc những ai thường xuyên di chuyển.\r\n\r\nMàn hình LCD 6.49 inch 120Hz cho trải nghiệm hiển thị mượt mà, chip Snapdragon 695 5G hỗ trợ kết nối mạng thế hệ mới nhanh và ổn định. RAM 6 GB cùng ROM 128 GB đáp ứng tốt đa nhiệm và lưu trữ ứng dụng, ảnh, video.\r\n\r\nCamera kép 64 MP phía sau và camera 16 MP selfie giúp chụp ảnh chi tiết trong nhiều điều kiện. Android 14 mang đến giao diện sạch, dễ sử dụng và cập nhật bảo mật định kỳ.\r\n\r\nPin 4800 mAh bền bỉ, hỗ trợ thẻ nhớ MicroSD. Nokia XR21 5G kết hợp độ bền quân đội với kết nối 5G hiện đại — lựa chọn đáng tin cậy cho người dùng thực dụng.'),
('HWMATEX6', 'Huawei Mate X6 12GB/512GB', 'Huawei', 'img/products/uploads/t---i-xu---ng--2-1779441895.jpg', 41990000, 270, 0, 0, 'tragop', '0', 'Màn hình gập OLED 7.93 inch 120Hz', 'EMUI / HarmonyOS tùy thị trường', 'Camera Ultra Chroma 50 MP', 'Camera 8 MP', 'Kirin flagship', '12 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', 'Pin kép, sạc nhanh SuperCharge', 'Huawei Mate X6 là smartphone màn hình gập cao cấp, mở ra không gian hiển thị OLED 7.93 inch 120Hz rộng rãi — lý tưởng cho đa nhiệm, xem phim, đọc tài liệu và làm việc trên một thiết bị duy nhất.\r\n\r\nThiết kế gập tinh tế, chất lượng hoàn thiện cao cấp cùng cơ chế bản lề bền bỉ giúp máy vừa sang trọng vừa bền theo thời gian. Chip Kirin flagship, RAM 12 GB và ROM 512 GB mang lại hiệu năng mạnh mẽ cho mọi tác vụ nặng.\r\n\r\nHệ camera Ultra Chroma 50 MP ghi lại ảnh chụp chi tiết, màu sắc sống động. Pin kép kết hợp sạc nhanh SuperCharge giúp sử dụng liên tục suốt ngày dài.\r\n\r\nHuawei Mate X6 dành cho người yêu công nghệ gập, doanh nhân và người dùng cần màn hình lớn linh hoạt mà vẫn gọn gàng khi gập lại.'),
('HWPR80', 'Huawei Pura 80 12GB/256GB', 'Huawei', 'img/products/uploads/t---i-xu---ng--3-1779441927.webp', 18990000, 180, 0, 0, 'moiramat', '', 'OLED 6.6 inch 120Hz', 'EMUI / HarmonyOS tùy thị trường', 'Camera XMAGE 50 MP', 'Camera 13 MP', 'Kirin series', '12 GB', '256 GB', 'Không hỗ trợ thẻ nhớ', 'Pin lớn, sạc nhanh SuperCharge', 'Huawei Pura 80 sở hữu thiết kế hiện đại, sang trọng với đường nét tinh tế và mặt lưng cao cấp. Màn hình OLED 6.6 inch 120Hz cho màu sắc rực rỡ, độ tương phản cao và trải nghiệm vuốt chạm mượt mà.\r\n\r\nChip Kirin series cùng RAM 12 GB và bộ nhớ 256 GB đảm bảo hiệu năng ổn định cho công việc, giải trí và chụp ảnh. Hệ camera XMAGE 50 MP được Huawei tối ưu thuật toán, mang lại ảnh chụp chi tiết, màu sắc tự nhiên kể cả trong điều kiện thiếu sáng.\r\n\r\nCamera selfie 13 MP hỗ trợ video call và selfie rõ nét. EMUI / HarmonyOS tùy thị trường mang đến giao diện mượt, nhiều tính năng thông minh và bảo mật tốt.\r\n\r\nPin lớn kèm sạc nhanh SuperCharge giúp sạc đầy nhanh chóng. Huawei Pura 80 phù hợp người dùng yêu nhiếp ảnh di động và thiết kế cao cấp.'),
('HWPR80U', 'Huawei Pura 80 Ultra 16GB/512GB', 'Huawei', 'img/products/uploads/shopping--1-1779441992.webp', 32990000, 180, 0, 0, 'giareonline', '1500000', 'OLED LTPO 6.8 inch 120Hz', 'EMUI / HarmonyOS tùy thị trường', 'Camera XMAGE cao cấp, tele', 'Camera 13 MP', 'Kirin flagship', '16 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', 'Pin lớn, sạc nhanh SuperCharge', 'Huawei Pura 80 Ultra là phiên bản flagship cao nhất trong dòng Pura, dành cho người dùng đòi hỏi trải nghiệm đỉnh cao về nhiếp ảnh, hiệu năng và thiết kế.\r\n\r\nMàn hình OLED LTPO 6.8 inch 120Hz tiết kiệm pin thông minh, hiển thị sắc nét với độ sáng cao và màu sắc chính xác. RAM 16 GB cùng ROM 512 GB cho khả năng đa nhiệm và lưu trữ thoải mái ảnh, video 4K.\r\n\r\nHệ camera XMAGE cao cấp gồm cảm biến lớn, ống kính tele và thuật toán xử lý ảnh tiên tiến — chụp chân dung xóa phông đẹp, zoom quang học sắc nét và quay video chuyên nghiệp. Chip Kirin flagship xử lý mọi tác vụ nặng mượt mà.\r\n\r\nPin lớn, sạc SuperCharge siêu nhanh. Huawei Pura 80 Ultra là lựa chọn hàng đầu cho photographer di động và người dùng cao cấp.'),
('NOKIAG42', 'Nokia G42 5G 6GB/128GB', 'Nokia', 'img/products/uploads/nokia-g42-5g-viettablet-1779442098.webp', 4490000, 180, 0, 0, 'giareonline', '300000', 'LCD 6.56 inch 90Hz', 'Android 14', 'Camera chính 50 MP', 'Camera 8 MP', 'Snapdragon 480+ 5G', '6 GB', '128 GB', 'MicroSD hỗ trợ', '5000 mAh', 'Nokia G42 5G là smartphone tầm trung đáng chú ý với kết nối 5G, thiết kế gọn nhẹ và cấu hình cân bằng cho nhu cầu sử dụng hằng ngày.\r\n\r\nMàn hình LCD 6.56 inch 90Hz cho trải nghiệm vuốt mượt hơn màn 60Hz truyền thống. Chip Snapdragon 480+ 5G hỗ trợ mạng nhanh, RAM 6 GB và ROM 128 GB đáp ứng tốt lướt web, xem video và sử dụng ứng dụng.\r\n\r\nCamera chính 50 MP chụp ảnh sắc nét, camera 8 MP selfie cho cuộc gọi video và chụp ảnh cá nhân. Android 14 mang giao diện sạch, dễ sử dụng và cập nhật bảo mật định kỳ.\r\n\r\nPin 5000 mAh trâu, hỗ trợ thẻ nhớ MicroSD mở rộng dung lượng. Nokia G42 5G phù hợp người dùng cần máy ổn định, pin tốt và kết nối 5G với mức giá hợp lý.'),
('OPPOA5P', 'OPPO A5 Pro 5G 8GB/256GB', 'Oppo', 'img/products/uploads/t---i-xu---ng--3-1779442158.jpg', 6990000, 180, 0, 0, 'giamgia', '400000', 'LCD 6.67 inch 120Hz', 'Android 15, ColorOS', 'Camera 50 MP', 'Camera 8 MP', 'Dimensity 5G', '8 GB', '256 GB', 'MicroSD hỗ trợ', '5800 mAh, sạc nhanh', 'OPPO A5 Pro 5G nổi bật trong phân khúc tầm trung với pin 5800 mAh cực trâu — lý tưởng cho người dùng ưu tiên thời lượng sử dụng dài, không lo hết pin giữa ngày.\r\n\r\nMàn hình LCD 6.67 inch 120Hz cho trải nghiệm mượt mà khi lướt web, xem video và chơi game nhẹ. RAM 8 GB cùng ROM 256 GB đáp ứng đa nhiệm và lưu trữ thoải mái ảnh, ứng dụng.\r\n\r\nCamera 50 MP chụp ảnh chi tiết, camera 8 MP selfie cho cuộc gọi và chụp ảnh cá nhân. Chip Dimensity 5G hỗ trợ kết nối mạng nhanh, Android 15 kèm ColorOS giao diện đẹp, nhiều tính năng tiện ích.\r\n\r\nSạc nhanh giúp nạp pin nhanh chóng. OPPO A5 Pro 5G phù hợp học sinh, sinh viên và người dùng trẻ cần smartphone pin trâu, giá tốt.'),
('OPPOR15P', 'OPPO Reno15 Pro 5G 12GB/512GB', 'Oppo', 'img/products/uploads/t---i-xu---ng--4-1779442239.jpg', 15990000, 180, 0, 0, 'tragop', '0', 'AMOLED 6.7 inch 120Hz', 'Android 16, ColorOS', 'Camera chân dung 50 MP OIS', 'Camera 50 MP', 'Dimensity AI 5G', '12 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', '5000 mAh, sạc nhanh 80W', 'OPPO Reno15 Pro 5G hướng đến người yêu nhiếp ảnh và thiết kế mỏng nhẹ, với camera chân dung 50 MP OIS chuyên biệt cho ảnh chân dung xóa phông đẹp, tự nhiên.\r\n\r\nMàn hình AMOLED 6.7 inch 120Hz hiển thị sắc nét, màu sống động và tiết kiệm pin thông minh. Chip Dimensity AI 5G tích hợp AI xử lý ảnh, tối ưu hiệu năng và kết nối 5G nhanh ổn định.\r\n\r\nRAM 12 GB, ROM 512 GB cho đa nhiệm mượt và lưu trữ thoải mái. Camera selfie 50 MP chụp selfie và video call cực nét. Android 16 kèm ColorOS mang giao diện hiện đại, nhiều tính năng AI thông minh.\r\n\r\nPin 5000 mAh kèm sạc nhanh 80W — sạc đầy trong thời gian ngắn. OPPO Reno15 Pro 5G cân bằng hoàn hảo giữa nhiếp ảnh, hiệu năng và thiết kế cao cấp.'),
('OPPOX9U', 'OPPO Find X9 Ultra 16GB/512GB', 'Oppo', 'img/products/uploads/t---i-xu---ng--5-1779442269.jpg', 27990000, 180, 0, 0, 'moiramat', '', 'AMOLED 6.82 inch 120Hz', 'Android 16, ColorOS', 'Camera Hasselblad 50 MP', 'Camera 32 MP', 'Dimensity flagship', '16 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', '5400 mAh, sạc nhanh SuperVOOC', 'OPPO Find X9 Ultra là flagship cao cấp nhất của OPPO, trang bị hệ camera Hasselblad 50 MP được hiệu chỉnh màu chuyên nghiệp — mang lại ảnh chụp và video chất lượng studio.\r\n\r\nMàn hình AMOLED 6.82 inch 120Hz cho trải nghiệm hiển thị đỉnh cao với màu sắc chính xác, độ sáng cao và tần số quét mượt. Chip Dimensity flagship cùng RAM 16 GB xử lý mọi tác vụ nặng, từ chơi game đồ họa cao đến chỉnh sửa video 4K.\r\n\r\nROM 512 GB lưu trữ thoải mái. Camera selfie 32 MP cho selfie và video call chất lượng cao. Android 16 kèm ColorOS tối ưu trải nghiệm người dùng.\r\n\r\nPin 5400 mAh kèm sạc SuperVOOC siêu nhanh — sạc đầy chỉ trong vài chục phút. OPPO Find X9 Ultra dành cho người dùng cao cấp, đam mê nhiếp ảnh và hiệu năng đỉnh.'),
('REALMEC75', 'realme C75 8GB/256GB', 'Realme', 'img/products/uploads/t---i-xu---ng--6-1779442317.jpg', 5290000, 180, 0, 0, 'giareonline', '300000', 'LCD 6.72 inch 90Hz', 'Android 15, realme UI', 'Camera 50 MP', 'Camera 8 MP', 'Helio G series', '8 GB', '256 GB', 'MicroSD hỗ trợ', '6000 mAh', 'realme C75 mang đến trải nghiệm smartphone giá tốt với pin 6000 mAh — một trong những dung lượng pin lớn nhất phân khúc, lý tưởng cho người dùng cần máy trâu pin, dùng nhiều ngày.\r\n\r\nMàn hình LCD 6.72 inch 90Hz cho trải nghiệm vuốt mượt. RAM 8 GB và ROM 256 GB đáp ứng tốt đa nhiệm, lưu trữ ảnh, video và ứng dụng. Camera 50 MP chụp ảnh sắc nét trong điều kiện ánh sáng tốt.\r\n\r\nChip Helio G series xử lý ổn định các tác vụ hằng ngày. Android 15 kèm realme UI giao diện trẻ trung, dễ sử dụng. Hỗ trợ thẻ nhớ MicroSD mở rộng dung lượng.\r\n\r\nrealme C75 phù hợp học sinh, sinh viên, người dùng cần smartphone pin trâu, giá hợp lý cho học tập, mạng xã hội và giải trí cơ bản.'),
('REALMEGT8', 'realme GT 8 Pro 16GB/512GB', 'Realme', 'img/products/uploads/t---i-xu---ng--7-1779442339.jpg', 18990000, 270, 0, 0, 'giamgia', '1000000', 'AMOLED 6.78 inch 144Hz', 'Android 16, realme UI', 'Camera 50 MP OIS, góc rộng', 'Camera 32 MP', 'Snapdragon 8 series', '16 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', '5500 mAh, sạc nhanh 120W', 'realme GT 8 Pro là smartphone hiệu năng cao dành cho game thủ và người dùng đòi hỏi tốc độ tối đa, với màn AMOLED 144Hz — tần số quét cao nhất phân khúc — cho trải nghiệm chơi game siêu mượt.\r\n\r\nChip Snapdragon 8 series cùng RAM 16 GB mang lại hiệu năng đỉnh cao, xử lý game đồ họa nặng, stream và đa nhiệm không giật lag. ROM 512 GB lưu trữ thoải mái game, ảnh và video.\r\n\r\nCamera 50 MP OIS chụp ảnh ổn định, góc rộng cho ảnh phong cảnh. Camera selfie 32 MP cho selfie và livestream chất lượng. Android 16 kèm realme UI tối ưu cho game.\r\n\r\nPin 5500 mAh kèm sạc nhanh 120W — sạc đầy cực nhanh, quay lại game ngay. realme GT 8 Pro là lựa chọn hàng đầu cho game thủ và người yêu hiệu năng.'),
('REDMI15', 'REDMI Note 15 8GB/128GB', 'Xiaomi', 'img/products/uploads/t---i-xu---ng--8-1779442369.jpg', 4990000, 270, 0, 0, 'giareonline', '400000', 'AMOLED 6.67 inch 120Hz', 'Android 16, HyperOS', 'Camera 108 MP', 'Camera 16 MP', 'Snapdragon tầm trung', '8 GB', '128 GB', 'MicroSD tối đa 1 TB', '5000 mAh, sạc nhanh', 'REDMI Note 15 mang đến trải nghiệm tốt trong phân khúc giá rẻ với màn AMOLED 6.67 inch 120Hz — hiếm có ở tầm giá này — cho màu sắc sống động và vuốt chạm mượt mà.\r\n\r\nCamera 108 MP chụp ảnh chi tiết, zoom kỹ thuật số sắc nét. RAM 8 GB và ROM 128 GB đáp ứng tốt nhu cầu hằng ngày. Chip Snapdragon tầm trung xử lý ổn định lướt web, xem video và chơi game nhẹ.\r\n\r\nPin 5000 mAh dùng cả ngày, hỗ trợ thẻ nhớ MicroSD tối đa 1 TB mở rộng dung lượng. Android 16 kèm HyperOS giao diện mượt, nhiều tính năng tiện ích.\r\n\r\nREDMI Note 15 phù hợp học sinh, sinh viên cần smartphone màn AMOLED đẹp, camera tốt và pin ổn với mức giá phải chăng.'),
('REDMI15P5G', 'REDMI Note 15 Pro 5G 12GB/256GB', 'Xiaomi', 'img/products/uploads/t---i-xu---ng--9-1779442401.jpg', 8990000, 270, 0, 0, 'giamgia', '500000', 'AMOLED 6.83 inch 1.5K 120Hz', 'Android 16, HyperOS', 'Camera 200 MP chống rung OIS', 'Camera 32 MP', 'MediaTek Dimensity 7400-Ultra', '12 GB', '256 GB', 'Không hỗ trợ thẻ nhớ', '6580 mAh, sạc nhanh', 'REDMI Note 15 Pro 5G nâng cấp mạnh so với bản tiêu chuẩn với camera 200 MP OIS — một trong những camera độ phân giải cao nhất phân khúc — chụp ảnh cực kỳ chi tiết.\r\n\r\nMàn AMOLED 6.83 inch độ phân giải 1.5K 120Hz cho hiển thị sắc nét, màu sống động. Chip MediaTek Dimensity 7400-Ultra xử lý mượt mà, kết nối 5G nhanh ổn định. RAM 12 GB cho đa nhiệm thoải mái.\r\n\r\nPin 6580 mAh — dung lượng pin lớn nhất dòng Note — dùng liên tục suốt ngày dài mà không lo hết pin. Sạc nhanh giúp nạp pin nhanh chóng. Android 16 kèm HyperOS tối ưu trải nghiệm.\r\n\r\nREDMI Note 15 Pro 5G cân bằng hoàn hảo giữa camera, pin trâu và hiệu năng — lựa chọn tốt cho người dùng cần máy toàn diện.'),
('SAMA37', 'Samsung Galaxy A37 5G 8GB/128GB', 'Samsung', 'img/products/uploads/t---i-xu---ng--10-1779442445.jpg', 8290000, 270, 0, 0, 'giareonline', '400000', 'Super AMOLED 6.6 inch 120Hz', 'Android 16', 'Camera 50 MP', 'Camera 13 MP', 'Exynos tầm trung', '8 GB', '128 GB', 'MicroSD tối đa 1 TB', '5000 mAh', 'Samsung Galaxy A37 5G mang đến trải nghiệm tầm trung ổn định với màn Super AMOLED 6.6 inch 120Hz — công nghệ màn hình đặc trưng Samsung cho màu sắc rực rỡ và độ tương phản cao.\r\n\r\nChip Exynos tầm trung cùng RAM 8 GB xử lý mượt các tác vụ hằng ngày. Kết nối 5G nhanh, camera 50 MP chụp ảnh sắc nét, camera 13 MP selfie cho cuộc gọi video.\r\n\r\nPin 5000 mAh dùng cả ngày, hỗ trợ thẻ nhớ MicroSD tối đa 1 TB. Android 16 với giao diện Samsung quen thuộc, nhiều tính năng Galaxy AI thông minh.\r\n\r\nGalaxy A37 5G phù hợp người dùng yêu thích thương hiệu Samsung, màn AMOLED đẹp và trải nghiệm ổn định với mức giá hợp lý.'),
('SAMA57', 'Samsung Galaxy A57 5G 8GB/256GB', 'Samsung', 'img/products/uploads/t---i-xu---ng--11-1779442472.jpg', 11990000, 270, 0, 0, 'giamgia', '700000', 'Super AMOLED 6.7 inch 120Hz', 'Android 16', 'Camera 50 MP chống rung OIS', 'Camera 32 MP', 'Exynos AI Edition', '8 GB', '256 GB', 'MicroSD tối đa 1 TB', '5000 mAh, sạc nhanh', 'Samsung Galaxy A57 5G là lựa chọn tầm trung cao với nhiều nâng cấp đáng giá so với dòng A37, bao gồm camera 50 MP OIS chống rung quang học cho ảnh và video ổn định hơn.\r\n\r\nMàn Super AMOLED 6.7 inch 120Hz lớn hơn, hiển thị sắc nét và mượt mà. Chip Exynos AI Edition tích hợp AI xử lý ảnh, tối ưu hiệu năng và tiết kiệm pin thông minh.\r\n\r\nRAM 8 GB, ROM 256 GB cho đa nhiệm và lưu trữ thoải mái. Camera selfie 32 MP chụp selfie và video call rõ nét. Pin 5000 mAh kèm sạc nhanh. Android 16 với One UI AI.\r\n\r\nGalaxy A57 5G cân bằng giữa thiết kế sang, hiệu năng AI và trải nghiệm Samsung toàn diện — lựa chọn tốt cho người dùng muốn nâng cấp từ A series.'),
('SAMS26U', 'Samsung Galaxy S26 Ultra 12GB/512GB', 'Samsung', 'img/products/uploads/t---i-xu---ng--12-1779442503.jpg', 33990000, 270, 0, 0, 'moiramat', '', 'Dynamic AMOLED 2X 6.9 inch 120Hz', 'Android 16, One UI AI', 'Camera 200 MP, tele, góc rộng', 'Camera 12 MP', 'Snapdragon 8 Elite for Galaxy', '12 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', '5000 mAh, sạc nhanh', 'Samsung Galaxy S26 Ultra là flagship đỉnh cao của Samsung với màn Dynamic AMOLED 2X 6.9 inch 120Hz — màn hình lớn nhất và đẹp nhất dòng Galaxy — cho trải nghiệm hiển thị tuyệt vời.\r\n\r\nChip Snapdragon 8 Elite for Galaxy được tối ưu riêng cho Samsung, cùng RAM 12 GB mang lại hiệu năng xử lý vượt trội. Camera 200 MP kết hợp ống kính tele và góc rộng — hệ camera đa năng nhất phân khúc.\r\n\r\nBút S Pen tích hợp hỗ trợ ghi chú, vẽ và điều khiển từ xa. ROM 512 GB lưu trữ thoải mái. Android 16 kèm One UI AI với nhiều tính năng AI thông minh: dịch thuật, tóm tắt, chỉnh sửa ảnh.\r\n\r\nPin 5000 mAh kèm sạc nhanh. Galaxy S26 Ultra dành cho người dùng cao cấp cần hiệu năng tối đa, camera chuyên nghiệp và trải nghiệm Galaxy toàn diện nhất.'),
('VIVOX300', 'Vivo X300 Pro 12GB/512GB', 'Vivo', 'img/products/uploads/t---i-xu---ng--13-1779442533.jpg', 23990000, 270, 0, 0, 'giareonline', '1500000', 'AMOLED 6.78 inch 120Hz', 'Android 16, Funtouch OS', 'Camera ZEISS 50 MP, tele', 'Camera 32 MP', 'Dimensity flagship', '12 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', '5200 mAh, sạc nhanh', 'Vivo X300 Pro sở hữu hệ camera ZEISS 50 MP được hiệu chỉnh bởi ZEISS — thương hiệu quang học hàng đầu thế giới — mang lại ảnh chụp với màu sắc chân thực, độ chi tiết cao và bokeh đẹp.\r\n\r\nMàn AMOLED 6.78 inch 120Hz hiển thị sắc nét, màu sống động. Chip Dimensity flagship cùng RAM 12 GB xử lý mượt mọi tác vụ. ROM 512 GB lưu trữ thoải mái ảnh RAW, video 4K.\r\n\r\nCamera tele ZEISS hỗ trợ zoom quang học sắc nét, chụp chân dung và phong cảnh chuyên nghiệp. Camera selfie 32 MP cho selfie và video call chất lượng. Android 16 kèm Funtouch OS.\r\n\r\nPin 5200 mAh kèm sạc nhanh. Vivo X300 Pro lý tưởng cho người yêu nhiếp ảnh di động, cần chất lượng ảnh ZEISS và hiệu năng cao cấp.'),
('VIVOY39', 'Vivo Y39 5G 8GB/256GB', 'Vivo', 'img/products/uploads/t---i-xu---ng--14-1779442556.jpg', 6490000, 270, 0, 0, 'giamgia', '300000', 'LCD 6.68 inch 120Hz', 'Android 15, Funtouch OS', 'Camera 50 MP', 'Camera 8 MP', 'Snapdragon 5G', '8 GB', '256 GB', 'MicroSD hỗ trợ', '6500 mAh, sạc nhanh', 'Vivo Y39 5G nổi bật với pin 6500 mAh — một trong những pin lớn nhất phân khúc — cho thời lượng sử dụng cực dài, lý tưởng cho người dùng ưu tiên pin trâu trên hết.\r\n\r\nMàn LCD 6.68 inch 120Hz cho trải nghiệm vuốt mượt. Chip Snapdragon 5G hỗ trợ kết nối mạng nhanh. RAM 8 GB, ROM 256 GB đáp ứng đa nhiệm và lưu trữ. Camera 50 MP chụp ảnh sắc nét, camera 8 MP selfie.\r\n\r\nAndroid 15 kèm Funtouch OS giao diện thân thiện, nhiều tính năng tiện ích. Hỗ trợ thẻ nhớ MicroSD. Sạc nhanh giúp nạp pin nhanh chóng dù pin lớn.\r\n\r\nVivo Y39 5G phù hợp người dùng cần smartphone pin trâu nhất, giá hợp lý cho học tập, làm việc và giải trí hằng ngày.'),
('XIA15U', 'Xiaomi 15 Ultra 16GB/512GB', 'Xiaomi', 'img/products/uploads/t---i-xu---ng--15-1779442578.jpg', 29990000, 270, 0, 0, 'giareonline', '1500000', 'AMOLED 6.73 inch 2K 120Hz', 'Android 16, HyperOS', 'Camera Leica 50 MP, tele tiềm vọng', 'Camera 32 MP', 'Snapdragon 8 Elite', '16 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', '5300 mAh, sạc nhanh 90W', 'Xiaomi 15 Ultra là flagship cao cấp nhất của Xiaomi với hệ camera Leica 50 MP — hợp tác với thương hiệu máy ảnh huyền thoại Leica — cho ảnh chụp với màu sắc đặc trưng Leica, độ chi tiết và bokeh chuyên nghiệp.\r\n\r\nMàn AMOLED 6.73 inch độ phân giải 2K 120Hz cho hiển thị cực sắc nét. Chip Snapdragon 8 Elite cùng RAM 16 GB mang lại hiệu năng đỉnh cao. ROM 512 GB lưu trữ thoải mái.\r\n\r\nỐng kính tele tiềm vọng hỗ trợ zoom xa sắc nét, chụp phong cảnh và sự kiện chuyên nghiệp. Camera selfie 32 MP. Android 16 kèm HyperOS tối ưu trải nghiệm.\r\n\r\nPin 5300 mAh kèm sạc nhanh 90W — sạc đầy cực nhanh. Xiaomi 15 Ultra dành cho người đam mê nhiếp ảnh Leica, cần hiệu năng flagship và trải nghiệm cao cấp nhất.');

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `variant_id` int(11) NOT NULL,
  `masp` varchar(20) NOT NULL,
  `ten_mau` varchar(50) NOT NULL,
  `ram` varchar(50) NOT NULL DEFAULT '',
  `rom` varchar(50) NOT NULL DEFAULT '',
  `ma_mau_hex` char(7) NOT NULL,
  `hinh_anh` text DEFAULT NULL,
  `so_luong_ton` int(11) NOT NULL DEFAULT 0,
  `gia_ban` decimal(15,0) NOT NULL DEFAULT 0 COMMENT 'Giá bán của biến thể (màu + RAM + ROM)',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `variant_code` varchar(120) GENERATED ALWAYS AS (concat(`masp`,'_',`ten_mau`,'_',`ram`,'_',`rom`)) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variants`
--

INSERT INTO `product_variants` (`variant_id`, `masp`, `ten_mau`, `ram`, `rom`, `ma_mau_hex`, `hinh_anh`, `so_luong_ton`, `gia_ban`, `created_at`, `updated_at`) VALUES
(1, 'APP16', 'Đen', '16', '1282 GB', '#111827', 'img/products/uploads/t---i-xu---ng-1779441044.webp', 9, 19990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(2, 'APP16', 'Đen', '16', '256 GB', '#111827', 'img/products/uploads/t---i-xu---ng-1779441044.webp', 10, 22990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(3, 'APP16', 'Đen', '16', '64 GB', '#111827', 'img/products/uploads/t---i-xu---ng-1779441044.webp', 10, 17990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(4, 'APP16', 'Đen', '4', '128 GB', '#111827', 'img/products/uploads/t---i-xu---ng-1779441044.webp', 10, 19990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(5, 'APP16', 'Đen', '4', '256 GB', '#111827', 'img/products/uploads/t---i-xu---ng-1779441044.webp', 10, 22990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(6, 'APP16', 'Đen', '4', '64 GB', '#111827', 'img/products/uploads/t---i-xu---ng-1779441044.webp', 10, 17990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(7, 'APP16', 'Đen', '8', '128 GB', '#111827', 'img/products/uploads/t---i-xu---ng-1779441044.webp', 10, 19990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(8, 'APP16', 'Đen', '8', '256 GB', '#111827', 'img/products/uploads/t---i-xu---ng-1779441044.webp', 10, 22990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(9, 'APP16', 'Đen', '8', '64 GB', '#111827', 'img/products/uploads/t---i-xu---ng-1779441044.webp', 10, 17990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(10, 'APP16', 'Trắng', '16', '128 GB', '#F8FAFC', 'img/products/uploads/t---i-xu---ng-1779441006.webp', 10, 19990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(11, 'APP16', 'Trắng', '16', '256 GB', '#F8FAFC', 'img/products/uploads/t---i-xu---ng-1779441006.webp', 10, 22990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(12, 'APP16', 'Trắng', '16', '64 GB', '#F8FAFC', 'img/products/uploads/t---i-xu---ng-1779441006.webp', 10, 17990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(13, 'APP16', 'Trắng', '4', '128 GB', '#F8FAFC', 'img/products/uploads/t---i-xu---ng-1779441006.webp', 10, 19990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(14, 'APP16', 'Trắng', '4', '256 GB', '#F8FAFC', 'img/products/uploads/t---i-xu---ng-1779441006.webp', 10, 22990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(15, 'APP16', 'Trắng', '4', '64 GB', '#F8FAFC', 'img/products/uploads/t---i-xu---ng-1779441006.webp', 10, 17990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(16, 'APP16', 'Trắng', '8', '128 GB', '#F8FAFC', 'img/products/uploads/t---i-xu---ng-1779441006.webp', 10, 19990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(17, 'APP16', 'Trắng', '8', '256 GB', '#F8FAFC', 'img/products/uploads/t---i-xu---ng-1779441006.webp', 10, 22990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(18, 'APP16', 'Trắng', '8', '64 GB', '#F8FAFC', 'img/products/uploads/t---i-xu---ng-1779441006.webp', 10, 17990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(19, 'APP16', 'Xanh dương', '16', '128 GB', '#73A9D8', 'img/products/uploads/ip16xanhduong-1779440292.jpg', 10, 19990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(20, 'APP16', 'Xanh dương', '16', '256 GB', '#73A9D8', 'img/products/uploads/ip16xanhduong-1779440292.jpg', 10, 22990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(21, 'APP16', 'Xanh dương', '16', '64 GB', '#73A9D8', 'img/products/uploads/ip16xanhduong-1779440292.jpg', 10, 17990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(22, 'APP16', 'Xanh dương', '4', '128 GB', '#73A9D8', 'img/products/uploads/ip16xanhduong-1779440292.jpg', 10, 19990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(23, 'APP16', 'Xanh dương', '4', '256 GB', '#73A9D8', 'img/products/uploads/ip16xanhduong-1779440292.jpg', 10, 22990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(24, 'APP16', 'Xanh dương', '4', '64 GB', '#73A9D8', 'img/products/uploads/ip16xanhduong-1779440292.jpg', 10, 17990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(25, 'APP16', 'Xanh dương', '8', '128 GB', '#73A9D8', 'img/products/uploads/ip16xanhduong-1779440292.jpg', 10, 19990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(26, 'APP16', 'Xanh dương', '8', '256 GB', '#73A9D8', 'img/products/uploads/ip16xanhduong-1779440292.jpg', 10, 22990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(27, 'APP16', 'Xanh dương', '8', '64 GB', '#73A9D8', 'img/products/uploads/ip16xanhduong-1779440292.jpg', 10, 17990000, '2026-06-25 15:44:07', '2026-06-26 00:16:43'),
(28, 'APP17', 'Đen', '16 GB', '128 GB', '#202124', 'img/products/modern/APP17_2.svg', 9, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(29, 'APP17', 'Đen', '16 GB', '256 GB', '#202124', 'img/products/modern/APP17_2.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(30, 'APP17', 'Đen', '16 GB', '64 GB', '#202124', 'img/products/modern/APP17_2.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(31, 'APP17', 'Đen', '4 GB', '128 GB', '#202124', 'img/products/modern/APP17_2.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(32, 'APP17', 'Đen', '4 GB', '256 GB', '#202124', 'img/products/modern/APP17_2.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(33, 'APP17', 'Đen', '4 GB', '64 GB', '#202124', 'img/products/modern/APP17_2.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(34, 'APP17', 'Đen', '8 GB', '128 GB', '#202124', 'img/products/modern/APP17_2.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(35, 'APP17', 'Đen', '8 GB', '256 GB', '#202124', 'img/products/modern/APP17_2.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(36, 'APP17', 'Đen', '8 GB', '64 GB', '#202124', 'img/products/modern/APP17_2.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(37, 'APP17', 'Hồng đào', '16 GB', '128 GB', '#F6B8B8', 'img/products/modern/APP17_3.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(38, 'APP17', 'Hồng đào', '16 GB', '256 GB', '#F6B8B8', 'img/products/modern/APP17_3.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(39, 'APP17', 'Hồng đào', '16 GB', '64 GB', '#F6B8B8', 'img/products/modern/APP17_3.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(40, 'APP17', 'Hồng đào', '4 GB', '128 GB', '#F6B8B8', 'img/products/modern/APP17_3.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(41, 'APP17', 'Hồng đào', '4 GB', '256 GB', '#F6B8B8', 'img/products/modern/APP17_3.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(42, 'APP17', 'Hồng đào', '4 GB', '64 GB', '#F6B8B8', 'img/products/modern/APP17_3.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(43, 'APP17', 'Hồng đào', '8 GB', '128 GB', '#F6B8B8', 'img/products/modern/APP17_3.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(44, 'APP17', 'Hồng đào', '8 GB', '256 GB', '#F6B8B8', 'img/products/modern/APP17_3.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(45, 'APP17', 'Hồng đào', '8 GB', '64 GB', '#F6B8B8', 'img/products/modern/APP17_3.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(46, 'APP17', 'Xanh lưu ly', '16 GB', '128 GB', '#8DB9E8', 'img/products/modern/APP17_1.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(47, 'APP17', 'Xanh lưu ly', '16 GB', '256 GB', '#8DB9E8', 'img/products/modern/APP17_1.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(48, 'APP17', 'Xanh lưu ly', '16 GB', '64 GB', '#8DB9E8', 'img/products/modern/APP17_1.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(49, 'APP17', 'Xanh lưu ly', '4 GB', '128 GB', '#8DB9E8', 'img/products/modern/APP17_1.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(50, 'APP17', 'Xanh lưu ly', '4 GB', '256 GB', '#8DB9E8', 'img/products/modern/APP17_1.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(51, 'APP17', 'Xanh lưu ly', '4 GB', '64 GB', '#8DB9E8', 'img/products/modern/APP17_1.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(52, 'APP17', 'Xanh lưu ly', '8 GB', '128 GB', '#8DB9E8', 'img/products/modern/APP17_1.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(53, 'APP17', 'Xanh lưu ly', '8 GB', '256 GB', '#8DB9E8', 'img/products/modern/APP17_1.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(54, 'APP17', 'Xanh lưu ly', '8 GB', '64 GB', '#8DB9E8', 'img/products/modern/APP17_1.svg', 10, 24990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(55, 'APP17P', 'Titan tự nhiên', '16 GB', '128 GB', '#B8B0A3', 'img/products/modern/APP17P_1.svg', 10, 34990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(56, 'APP17P', 'Titan tự nhiên', '16 GB', '256 GB', '#B8B0A3', 'img/products/modern/APP17P_1.svg', 10, 34990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(57, 'APP17P', 'Titan tự nhiên', '16 GB', '64 GB', '#B8B0A3', 'img/products/modern/APP17P_1.svg', 10, 34990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(58, 'APP17P', 'Titan tự nhiên', '4 GB', '128 GB', '#B8B0A3', 'img/products/modern/APP17P_1.svg', 10, 34990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(59, 'APP17P', 'Titan tự nhiên', '4 GB', '256 GB', '#B8B0A3', 'img/products/modern/APP17P_1.svg', 10, 34990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(60, 'APP17P', 'Titan tự nhiên', '4 GB', '64 GB', '#B8B0A3', 'img/products/modern/APP17P_1.svg', 10, 34990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(61, 'APP17P', 'Titan tự nhiên', '8 GB', '128 GB', '#B8B0A3', 'img/products/modern/APP17P_1.svg', 10, 34990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(62, 'APP17P', 'Titan tự nhiên', '8 GB', '256 GB', '#B8B0A3', 'img/products/modern/APP17P_1.svg', 10, 34990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(63, 'APP17P', 'Titan tự nhiên', '8 GB', '64 GB', '#B8B0A3', 'img/products/modern/APP17P_1.svg', 10, 34990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(64, 'APP17P', 'Xanh đậm', '16 GB', '128 GB', '#27384A', 'img/products/modern/APP17P_2.svg', 10, 34990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(65, 'APP17P', 'Xanh đậm', '16 GB', '256 GB', '#27384A', 'img/products/modern/APP17P_2.svg', 10, 34990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(66, 'APP17P', 'Xanh đậm', '16 GB', '64 GB', '#27384A', 'img/products/modern/APP17P_2.svg', 10, 34990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(67, 'APP17P', 'Xanh đậm', '4 GB', '128 GB', '#27384A', 'img/products/modern/APP17P_2.svg', 10, 34990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(68, 'APP17P', 'Xanh đậm', '4 GB', '256 GB', '#27384A', 'img/products/modern/APP17P_2.svg', 10, 34990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(69, 'APP17P', 'Xanh đậm', '4 GB', '64 GB', '#27384A', 'img/products/modern/APP17P_2.svg', 10, 34990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(70, 'APP17P', 'Xanh đậm', '8 GB', '128 GB', '#27384A', 'img/products/modern/APP17P_2.svg', 10, 34990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(71, 'APP17P', 'Xanh đậm', '8 GB', '256 GB', '#27384A', 'img/products/modern/APP17P_2.svg', 10, 34990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(72, 'APP17P', 'Xanh đậm', '8 GB', '64 GB', '#27384A', 'img/products/modern/APP17P_2.svg', 10, 34990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(73, 'HMDPULSEP', 'Đen meteor', '16 GB', '128 GB', '#111827', 'img/products/modern/HMDPULSEP_2.svg', 10, 3990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(74, 'HMDPULSEP', 'Đen meteor', '16 GB', '256 GB', '#111827', 'img/products/modern/HMDPULSEP_2.svg', 10, 3990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(75, 'HMDPULSEP', 'Đen meteor', '16 GB', '64 GB', '#111827', 'img/products/modern/HMDPULSEP_2.svg', 10, 3990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(76, 'HMDPULSEP', 'Đen meteor', '4 GB', '128 GB', '#111827', 'img/products/modern/HMDPULSEP_2.svg', 10, 3990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(77, 'HMDPULSEP', 'Đen meteor', '4 GB', '256 GB', '#111827', 'img/products/modern/HMDPULSEP_2.svg', 10, 3990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(78, 'HMDPULSEP', 'Đen meteor', '4 GB', '64 GB', '#111827', 'img/products/modern/HMDPULSEP_2.svg', 10, 3990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(79, 'HMDPULSEP', 'Đen meteor', '8 GB', '128 GB', '#111827', 'img/products/modern/HMDPULSEP_2.svg', 10, 3990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(80, 'HMDPULSEP', 'Đen meteor', '8 GB', '256 GB', '#111827', 'img/products/modern/HMDPULSEP_2.svg', 10, 3990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(81, 'HMDPULSEP', 'Đen meteor', '8 GB', '64 GB', '#111827', 'img/products/modern/HMDPULSEP_2.svg', 10, 3990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(82, 'HMDPULSEP', 'Tím twilight', '16 GB', '128 GB', '#8B5CF6', 'img/products/modern/HMDPULSEP_1.svg', 10, 3990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(83, 'HMDPULSEP', 'Tím twilight', '16 GB', '256 GB', '#8B5CF6', 'img/products/modern/HMDPULSEP_1.svg', 10, 3990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(84, 'HMDPULSEP', 'Tím twilight', '16 GB', '64 GB', '#8B5CF6', 'img/products/modern/HMDPULSEP_1.svg', 10, 3990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(85, 'HMDPULSEP', 'Tím twilight', '4 GB', '128 GB', '#8B5CF6', 'img/products/modern/HMDPULSEP_1.svg', 10, 3990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(86, 'HMDPULSEP', 'Tím twilight', '4 GB', '256 GB', '#8B5CF6', 'img/products/modern/HMDPULSEP_1.svg', 10, 3990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(87, 'HMDPULSEP', 'Tím twilight', '4 GB', '64 GB', '#8B5CF6', 'img/products/modern/HMDPULSEP_1.svg', 10, 3990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(88, 'HMDPULSEP', 'Tím twilight', '8 GB', '128 GB', '#8B5CF6', 'img/products/modern/HMDPULSEP_1.svg', 10, 3990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(89, 'HMDPULSEP', 'Tím twilight', '8 GB', '256 GB', '#8B5CF6', 'img/products/modern/HMDPULSEP_1.svg', 10, 3990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(90, 'HMDPULSEP', 'Tím twilight', '8 GB', '64 GB', '#8B5CF6', 'img/products/modern/HMDPULSEP_1.svg', 10, 3990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(91, 'HMDXR21', 'Đen bền bỉ', '16 GB', '128 GB', '#111827', 'img/products/modern/HMDXR21_1.svg', 10, 7490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(92, 'HMDXR21', 'Đen bền bỉ', '16 GB', '256 GB', '#111827', 'img/products/modern/HMDXR21_1.svg', 10, 7490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(93, 'HMDXR21', 'Đen bền bỉ', '16 GB', '64 GB', '#111827', 'img/products/modern/HMDXR21_1.svg', 10, 7490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(94, 'HMDXR21', 'Đen bền bỉ', '4 GB', '128 GB', '#111827', 'img/products/modern/HMDXR21_1.svg', 10, 7490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(95, 'HMDXR21', 'Đen bền bỉ', '4 GB', '256 GB', '#111827', 'img/products/modern/HMDXR21_1.svg', 10, 7490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(96, 'HMDXR21', 'Đen bền bỉ', '4 GB', '64 GB', '#111827', 'img/products/modern/HMDXR21_1.svg', 10, 7490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(97, 'HMDXR21', 'Đen bền bỉ', '8 GB', '128 GB', '#111827', 'img/products/modern/HMDXR21_1.svg', 10, 7490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(98, 'HMDXR21', 'Đen bền bỉ', '8 GB', '256 GB', '#111827', 'img/products/modern/HMDXR21_1.svg', 10, 7490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(99, 'HMDXR21', 'Đen bền bỉ', '8 GB', '64 GB', '#111827', 'img/products/modern/HMDXR21_1.svg', 10, 7490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(100, 'HMDXR21', 'Xanh midnight', '16 GB', '128 GB', '#1E3A8A', 'img/products/modern/HMDXR21_2.svg', 10, 7490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(101, 'HMDXR21', 'Xanh midnight', '16 GB', '256 GB', '#1E3A8A', 'img/products/modern/HMDXR21_2.svg', 10, 7490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(102, 'HMDXR21', 'Xanh midnight', '16 GB', '64 GB', '#1E3A8A', 'img/products/modern/HMDXR21_2.svg', 10, 7490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(103, 'HMDXR21', 'Xanh midnight', '4 GB', '128 GB', '#1E3A8A', 'img/products/modern/HMDXR21_2.svg', 10, 7490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(104, 'HMDXR21', 'Xanh midnight', '4 GB', '256 GB', '#1E3A8A', 'img/products/modern/HMDXR21_2.svg', 10, 7490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(105, 'HMDXR21', 'Xanh midnight', '4 GB', '64 GB', '#1E3A8A', 'img/products/modern/HMDXR21_2.svg', 10, 7490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(106, 'HMDXR21', 'Xanh midnight', '8 GB', '128 GB', '#1E3A8A', 'img/products/modern/HMDXR21_2.svg', 10, 7490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(107, 'HMDXR21', 'Xanh midnight', '8 GB', '256 GB', '#1E3A8A', 'img/products/modern/HMDXR21_2.svg', 10, 7490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(108, 'HMDXR21', 'Xanh midnight', '8 GB', '64 GB', '#1E3A8A', 'img/products/modern/HMDXR21_2.svg', 10, 7490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(109, 'HWMATEX6', 'Đen obsidian', '16 GB', '128 GB', '#111827', 'img/products/modern/HWMATEX6_1.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(110, 'HWMATEX6', 'Đen obsidian', '16 GB', '256 GB', '#111827', 'img/products/modern/HWMATEX6_1.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(111, 'HWMATEX6', 'Đen obsidian', '16 GB', '64 GB', '#111827', 'img/products/modern/HWMATEX6_1.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(112, 'HWMATEX6', 'Đen obsidian', '4 GB', '128 GB', '#111827', 'img/products/modern/HWMATEX6_1.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(113, 'HWMATEX6', 'Đen obsidian', '4 GB', '256 GB', '#111827', 'img/products/modern/HWMATEX6_1.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(114, 'HWMATEX6', 'Đen obsidian', '4 GB', '64 GB', '#111827', 'img/products/modern/HWMATEX6_1.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(115, 'HWMATEX6', 'Đen obsidian', '8 GB', '128 GB', '#111827', 'img/products/modern/HWMATEX6_1.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(116, 'HWMATEX6', 'Đen obsidian', '8 GB', '256 GB', '#111827', 'img/products/modern/HWMATEX6_1.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(117, 'HWMATEX6', 'Đen obsidian', '8 GB', '64 GB', '#111827', 'img/products/modern/HWMATEX6_1.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(118, 'HWMATEX6', 'Đỏ vũ trụ', '16 GB', '128 GB', '#991B1B', 'img/products/modern/HWMATEX6_2.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(119, 'HWMATEX6', 'Đỏ vũ trụ', '16 GB', '256 GB', '#991B1B', 'img/products/modern/HWMATEX6_2.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(120, 'HWMATEX6', 'Đỏ vũ trụ', '16 GB', '64 GB', '#991B1B', 'img/products/modern/HWMATEX6_2.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(121, 'HWMATEX6', 'Đỏ vũ trụ', '4 GB', '128 GB', '#991B1B', 'img/products/modern/HWMATEX6_2.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(122, 'HWMATEX6', 'Đỏ vũ trụ', '4 GB', '256 GB', '#991B1B', 'img/products/modern/HWMATEX6_2.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(123, 'HWMATEX6', 'Đỏ vũ trụ', '4 GB', '64 GB', '#991B1B', 'img/products/modern/HWMATEX6_2.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(124, 'HWMATEX6', 'Đỏ vũ trụ', '8 GB', '128 GB', '#991B1B', 'img/products/modern/HWMATEX6_2.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(125, 'HWMATEX6', 'Đỏ vũ trụ', '8 GB', '256 GB', '#991B1B', 'img/products/modern/HWMATEX6_2.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(126, 'HWMATEX6', 'Đỏ vũ trụ', '8 GB', '64 GB', '#991B1B', 'img/products/modern/HWMATEX6_2.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(127, 'HWMATEX6', 'Xám tinh vân', '16 GB', '128 GB', '#6B7280', 'img/products/modern/HWMATEX6_3.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(128, 'HWMATEX6', 'Xám tinh vân', '16 GB', '256 GB', '#6B7280', 'img/products/modern/HWMATEX6_3.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(129, 'HWMATEX6', 'Xám tinh vân', '16 GB', '64 GB', '#6B7280', 'img/products/modern/HWMATEX6_3.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(130, 'HWMATEX6', 'Xám tinh vân', '4 GB', '128 GB', '#6B7280', 'img/products/modern/HWMATEX6_3.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(131, 'HWMATEX6', 'Xám tinh vân', '4 GB', '256 GB', '#6B7280', 'img/products/modern/HWMATEX6_3.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(132, 'HWMATEX6', 'Xám tinh vân', '4 GB', '64 GB', '#6B7280', 'img/products/modern/HWMATEX6_3.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(133, 'HWMATEX6', 'Xám tinh vân', '8 GB', '128 GB', '#6B7280', 'img/products/modern/HWMATEX6_3.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(134, 'HWMATEX6', 'Xám tinh vân', '8 GB', '256 GB', '#6B7280', 'img/products/modern/HWMATEX6_3.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(135, 'HWMATEX6', 'Xám tinh vân', '8 GB', '64 GB', '#6B7280', 'img/products/modern/HWMATEX6_3.svg', 10, 41990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(136, 'HWPR80', 'Đen nhám', '16 GB', '128 GB', '#111827', 'img/products/modern/HWPR80_1.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(137, 'HWPR80', 'Đen nhám', '16 GB', '256 GB', '#111827', 'img/products/modern/HWPR80_1.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(138, 'HWPR80', 'Đen nhám', '16 GB', '64 GB', '#111827', 'img/products/modern/HWPR80_1.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(139, 'HWPR80', 'Đen nhám', '4 GB', '128 GB', '#111827', 'img/products/modern/HWPR80_1.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(140, 'HWPR80', 'Đen nhám', '4 GB', '256 GB', '#111827', 'img/products/modern/HWPR80_1.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(141, 'HWPR80', 'Đen nhám', '4 GB', '64 GB', '#111827', 'img/products/modern/HWPR80_1.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(142, 'HWPR80', 'Đen nhám', '8 GB', '128 GB', '#111827', 'img/products/modern/HWPR80_1.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(143, 'HWPR80', 'Đen nhám', '8 GB', '256 GB', '#111827', 'img/products/modern/HWPR80_1.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(144, 'HWPR80', 'Đen nhám', '8 GB', '64 GB', '#111827', 'img/products/modern/HWPR80_1.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(145, 'HWPR80', 'Trắng nhám', '16 GB', '128 GB', '#F8FAFC', 'img/products/modern/HWPR80_2.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(146, 'HWPR80', 'Trắng nhám', '16 GB', '256 GB', '#F8FAFC', 'img/products/modern/HWPR80_2.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(147, 'HWPR80', 'Trắng nhám', '16 GB', '64 GB', '#F8FAFC', 'img/products/modern/HWPR80_2.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(148, 'HWPR80', 'Trắng nhám', '4 GB', '128 GB', '#F8FAFC', 'img/products/modern/HWPR80_2.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(149, 'HWPR80', 'Trắng nhám', '4 GB', '256 GB', '#F8FAFC', 'img/products/modern/HWPR80_2.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(150, 'HWPR80', 'Trắng nhám', '4 GB', '64 GB', '#F8FAFC', 'img/products/modern/HWPR80_2.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(151, 'HWPR80', 'Trắng nhám', '8 GB', '128 GB', '#F8FAFC', 'img/products/modern/HWPR80_2.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(152, 'HWPR80', 'Trắng nhám', '8 GB', '256 GB', '#F8FAFC', 'img/products/modern/HWPR80_2.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(153, 'HWPR80', 'Trắng nhám', '8 GB', '64 GB', '#F8FAFC', 'img/products/modern/HWPR80_2.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(154, 'HWPR80U', 'Đen ceramic', '16 GB', '128 GB', '#0F172A', 'img/products/modern/HWPR80U_1.svg', 10, 32990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(155, 'HWPR80U', 'Đen ceramic', '16 GB', '256 GB', '#0F172A', 'img/products/modern/HWPR80U_1.svg', 10, 32990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(156, 'HWPR80U', 'Đen ceramic', '16 GB', '64 GB', '#0F172A', 'img/products/modern/HWPR80U_1.svg', 10, 32990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(157, 'HWPR80U', 'Đen ceramic', '4 GB', '128 GB', '#0F172A', 'img/products/modern/HWPR80U_1.svg', 10, 32990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(158, 'HWPR80U', 'Đen ceramic', '4 GB', '256 GB', '#0F172A', 'img/products/modern/HWPR80U_1.svg', 10, 32990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(159, 'HWPR80U', 'Đen ceramic', '4 GB', '64 GB', '#0F172A', 'img/products/modern/HWPR80U_1.svg', 10, 32990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(160, 'HWPR80U', 'Đen ceramic', '8 GB', '128 GB', '#0F172A', 'img/products/modern/HWPR80U_1.svg', 10, 32990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(161, 'HWPR80U', 'Đen ceramic', '8 GB', '256 GB', '#0F172A', 'img/products/modern/HWPR80U_1.svg', 10, 32990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(162, 'HWPR80U', 'Đen ceramic', '8 GB', '64 GB', '#0F172A', 'img/products/modern/HWPR80U_1.svg', 10, 32990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(163, 'HWPR80U', 'Vàng ánh kim', '16 GB', '128 GB', '#C9A227', 'img/products/modern/HWPR80U_2.svg', 10, 32990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(164, 'HWPR80U', 'Vàng ánh kim', '16 GB', '256 GB', '#C9A227', 'img/products/modern/HWPR80U_2.svg', 10, 32990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(165, 'HWPR80U', 'Vàng ánh kim', '16 GB', '64 GB', '#C9A227', 'img/products/modern/HWPR80U_2.svg', 10, 32990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(166, 'HWPR80U', 'Vàng ánh kim', '4 GB', '128 GB', '#C9A227', 'img/products/modern/HWPR80U_2.svg', 10, 32990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(167, 'HWPR80U', 'Vàng ánh kim', '4 GB', '256 GB', '#C9A227', 'img/products/modern/HWPR80U_2.svg', 10, 32990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(168, 'HWPR80U', 'Vàng ánh kim', '4 GB', '64 GB', '#C9A227', 'img/products/modern/HWPR80U_2.svg', 10, 32990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(169, 'HWPR80U', 'Vàng ánh kim', '8 GB', '128 GB', '#C9A227', 'img/products/modern/HWPR80U_2.svg', 10, 32990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(170, 'HWPR80U', 'Vàng ánh kim', '8 GB', '256 GB', '#C9A227', 'img/products/modern/HWPR80U_2.svg', 10, 32990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(171, 'HWPR80U', 'Vàng ánh kim', '8 GB', '64 GB', '#C9A227', 'img/products/modern/HWPR80U_2.svg', 10, 32990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(172, 'NOKIAG42', 'Hồng nhạt', '16 GB', '128 GB', '#F9A8D4', 'img/products/modern/NOKIAG42_3.svg', 10, 4490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(173, 'NOKIAG42', 'Hồng nhạt', '16 GB', '256 GB', '#F9A8D4', 'img/products/modern/NOKIAG42_3.svg', 10, 4490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(174, 'NOKIAG42', 'Hồng nhạt', '16 GB', '64 GB', '#F9A8D4', 'img/products/modern/NOKIAG42_3.svg', 10, 4490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(175, 'NOKIAG42', 'Hồng nhạt', '4 GB', '128 GB', '#F9A8D4', 'img/products/modern/NOKIAG42_3.svg', 10, 4490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(176, 'NOKIAG42', 'Hồng nhạt', '4 GB', '256 GB', '#F9A8D4', 'img/products/modern/NOKIAG42_3.svg', 10, 4490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(177, 'NOKIAG42', 'Hồng nhạt', '4 GB', '64 GB', '#F9A8D4', 'img/products/modern/NOKIAG42_3.svg', 10, 4490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(178, 'NOKIAG42', 'Hồng nhạt', '8 GB', '128 GB', '#F9A8D4', 'img/products/modern/NOKIAG42_3.svg', 10, 4490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(179, 'NOKIAG42', 'Hồng nhạt', '8 GB', '256 GB', '#F9A8D4', 'img/products/modern/NOKIAG42_3.svg', 10, 4490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(180, 'NOKIAG42', 'Hồng nhạt', '8 GB', '64 GB', '#F9A8D4', 'img/products/modern/NOKIAG42_3.svg', 10, 4490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(181, 'NOKIAG42', 'Tím so purple', '16 GB', '128 GB', '#7C3AED', 'img/products/modern/NOKIAG42_1.svg', 10, 4490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(182, 'NOKIAG42', 'Tím so purple', '16 GB', '256 GB', '#7C3AED', 'img/products/modern/NOKIAG42_1.svg', 10, 4490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(183, 'NOKIAG42', 'Tím so purple', '16 GB', '64 GB', '#7C3AED', 'img/products/modern/NOKIAG42_1.svg', 10, 4490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(184, 'NOKIAG42', 'Tím so purple', '4 GB', '128 GB', '#7C3AED', 'img/products/modern/NOKIAG42_1.svg', 10, 4490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(185, 'NOKIAG42', 'Tím so purple', '4 GB', '256 GB', '#7C3AED', 'img/products/modern/NOKIAG42_1.svg', 10, 4490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(186, 'NOKIAG42', 'Tím so purple', '4 GB', '64 GB', '#7C3AED', 'img/products/modern/NOKIAG42_1.svg', 10, 4490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(187, 'NOKIAG42', 'Tím so purple', '8 GB', '128 GB', '#7C3AED', 'img/products/modern/NOKIAG42_1.svg', 10, 4490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(188, 'NOKIAG42', 'Tím so purple', '8 GB', '256 GB', '#7C3AED', 'img/products/modern/NOKIAG42_1.svg', 10, 4490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(189, 'NOKIAG42', 'Tím so purple', '8 GB', '64 GB', '#7C3AED', 'img/products/modern/NOKIAG42_1.svg', 10, 4490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(190, 'OPPOA5P', 'Đen', '16 GB', '128 GB', '#111827', 'img/products/modern/OPPOA5P_1.svg', 10, 6990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(191, 'OPPOA5P', 'Đen', '16 GB', '256 GB', '#111827', 'img/products/modern/OPPOA5P_1.svg', 10, 6990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(192, 'OPPOA5P', 'Đen', '16 GB', '64 GB', '#111827', 'img/products/modern/OPPOA5P_1.svg', 10, 6990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(193, 'OPPOA5P', 'Đen', '4 GB', '128 GB', '#111827', 'img/products/modern/OPPOA5P_1.svg', 10, 6990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(194, 'OPPOA5P', 'Đen', '4 GB', '256 GB', '#111827', 'img/products/modern/OPPOA5P_1.svg', 10, 6990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(195, 'OPPOA5P', 'Đen', '4 GB', '64 GB', '#111827', 'img/products/modern/OPPOA5P_1.svg', 10, 6990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(196, 'OPPOA5P', 'Đen', '8 GB', '128 GB', '#111827', 'img/products/modern/OPPOA5P_1.svg', 10, 6990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(197, 'OPPOA5P', 'Đen', '8 GB', '256 GB', '#111827', 'img/products/modern/OPPOA5P_1.svg', 10, 6990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(198, 'OPPOA5P', 'Đen', '8 GB', '64 GB', '#111827', 'img/products/modern/OPPOA5P_1.svg', 10, 6990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(199, 'OPPOA5P', 'Tím nhạt', '16 GB', '128 GB', '#C4B5FD', 'img/products/modern/OPPOA5P_3.svg', 10, 6990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(200, 'OPPOA5P', 'Tím nhạt', '16 GB', '256 GB', '#C4B5FD', 'img/products/modern/OPPOA5P_3.svg', 10, 6990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(201, 'OPPOA5P', 'Tím nhạt', '16 GB', '64 GB', '#C4B5FD', 'img/products/modern/OPPOA5P_3.svg', 10, 6990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(202, 'OPPOA5P', 'Tím nhạt', '4 GB', '128 GB', '#C4B5FD', 'img/products/modern/OPPOA5P_3.svg', 10, 6990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(203, 'OPPOA5P', 'Tím nhạt', '4 GB', '256 GB', '#C4B5FD', 'img/products/modern/OPPOA5P_3.svg', 10, 6990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(204, 'OPPOA5P', 'Tím nhạt', '4 GB', '64 GB', '#C4B5FD', 'img/products/modern/OPPOA5P_3.svg', 10, 6990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(205, 'OPPOA5P', 'Tím nhạt', '8 GB', '128 GB', '#C4B5FD', 'img/products/modern/OPPOA5P_3.svg', 10, 6990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(206, 'OPPOA5P', 'Tím nhạt', '8 GB', '256 GB', '#C4B5FD', 'img/products/modern/OPPOA5P_3.svg', 10, 6990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(207, 'OPPOA5P', 'Tím nhạt', '8 GB', '64 GB', '#C4B5FD', 'img/products/modern/OPPOA5P_3.svg', 10, 6990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(208, 'OPPOR15P', 'Hồng pastel', '16 GB', '128 GB', '#F7B6C2', 'img/products/modern/OPPOR15P_1.svg', 10, 15990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(209, 'OPPOR15P', 'Hồng pastel', '16 GB', '256 GB', '#F7B6C2', 'img/products/modern/OPPOR15P_1.svg', 10, 15990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(210, 'OPPOR15P', 'Hồng pastel', '16 GB', '64 GB', '#F7B6C2', 'img/products/modern/OPPOR15P_1.svg', 10, 15990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(211, 'OPPOR15P', 'Hồng pastel', '4 GB', '128 GB', '#F7B6C2', 'img/products/modern/OPPOR15P_1.svg', 10, 15990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(212, 'OPPOR15P', 'Hồng pastel', '4 GB', '256 GB', '#F7B6C2', 'img/products/modern/OPPOR15P_1.svg', 10, 15990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(213, 'OPPOR15P', 'Hồng pastel', '4 GB', '64 GB', '#F7B6C2', 'img/products/modern/OPPOR15P_1.svg', 10, 15990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(214, 'OPPOR15P', 'Hồng pastel', '8 GB', '128 GB', '#F7B6C2', 'img/products/modern/OPPOR15P_1.svg', 10, 15990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(215, 'OPPOR15P', 'Hồng pastel', '8 GB', '256 GB', '#F7B6C2', 'img/products/modern/OPPOR15P_1.svg', 10, 15990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(216, 'OPPOR15P', 'Hồng pastel', '8 GB', '64 GB', '#F7B6C2', 'img/products/modern/OPPOR15P_1.svg', 10, 15990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(217, 'OPPOR15P', 'Xanh ngọc', '16 GB', '128 GB', '#99D8D0', 'img/products/modern/OPPOR15P_2.svg', 10, 15990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(218, 'OPPOR15P', 'Xanh ngọc', '16 GB', '256 GB', '#99D8D0', 'img/products/modern/OPPOR15P_2.svg', 10, 15990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(219, 'OPPOR15P', 'Xanh ngọc', '16 GB', '64 GB', '#99D8D0', 'img/products/modern/OPPOR15P_2.svg', 10, 15990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(220, 'OPPOR15P', 'Xanh ngọc', '4 GB', '128 GB', '#99D8D0', 'img/products/modern/OPPOR15P_2.svg', 10, 15990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(221, 'OPPOR15P', 'Xanh ngọc', '4 GB', '256 GB', '#99D8D0', 'img/products/modern/OPPOR15P_2.svg', 10, 15990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(222, 'OPPOR15P', 'Xanh ngọc', '4 GB', '64 GB', '#99D8D0', 'img/products/modern/OPPOR15P_2.svg', 10, 15990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(223, 'OPPOR15P', 'Xanh ngọc', '8 GB', '128 GB', '#99D8D0', 'img/products/modern/OPPOR15P_2.svg', 10, 15990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(224, 'OPPOR15P', 'Xanh ngọc', '8 GB', '256 GB', '#99D8D0', 'img/products/modern/OPPOR15P_2.svg', 10, 15990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(225, 'OPPOR15P', 'Xanh ngọc', '8 GB', '64 GB', '#99D8D0', 'img/products/modern/OPPOR15P_2.svg', 10, 15990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(226, 'OPPOX9U', 'Đen vũ trụ', '16 GB', '128 GB', '#111827', 'img/products/modern/OPPOX9U_1.svg', 10, 27990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(227, 'OPPOX9U', 'Đen vũ trụ', '16 GB', '256 GB', '#111827', 'img/products/modern/OPPOX9U_1.svg', 10, 27990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(228, 'OPPOX9U', 'Đen vũ trụ', '16 GB', '64 GB', '#111827', 'img/products/modern/OPPOX9U_1.svg', 10, 27990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(229, 'OPPOX9U', 'Đen vũ trụ', '4 GB', '128 GB', '#111827', 'img/products/modern/OPPOX9U_1.svg', 10, 27990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(230, 'OPPOX9U', 'Đen vũ trụ', '4 GB', '256 GB', '#111827', 'img/products/modern/OPPOX9U_1.svg', 10, 27990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(231, 'OPPOX9U', 'Đen vũ trụ', '4 GB', '64 GB', '#111827', 'img/products/modern/OPPOX9U_1.svg', 10, 27990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(232, 'OPPOX9U', 'Đen vũ trụ', '8 GB', '128 GB', '#111827', 'img/products/modern/OPPOX9U_1.svg', 10, 27990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(233, 'OPPOX9U', 'Đen vũ trụ', '8 GB', '256 GB', '#111827', 'img/products/modern/OPPOX9U_1.svg', 10, 27990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(234, 'OPPOX9U', 'Đen vũ trụ', '8 GB', '64 GB', '#111827', 'img/products/modern/OPPOX9U_1.svg', 10, 27990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(235, 'OPPOX9U', 'Trắng ngọc', '16 GB', '128 GB', '#F6F7F9', 'img/products/modern/OPPOX9U_2.svg', 10, 27990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(236, 'OPPOX9U', 'Trắng ngọc', '16 GB', '256 GB', '#F6F7F9', 'img/products/modern/OPPOX9U_2.svg', 10, 27990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(237, 'OPPOX9U', 'Trắng ngọc', '16 GB', '64 GB', '#F6F7F9', 'img/products/modern/OPPOX9U_2.svg', 10, 27990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(238, 'OPPOX9U', 'Trắng ngọc', '4 GB', '128 GB', '#F6F7F9', 'img/products/modern/OPPOX9U_2.svg', 10, 27990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(239, 'OPPOX9U', 'Trắng ngọc', '4 GB', '256 GB', '#F6F7F9', 'img/products/modern/OPPOX9U_2.svg', 10, 27990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(240, 'OPPOX9U', 'Trắng ngọc', '4 GB', '64 GB', '#F6F7F9', 'img/products/modern/OPPOX9U_2.svg', 10, 27990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(241, 'OPPOX9U', 'Trắng ngọc', '8 GB', '128 GB', '#F6F7F9', 'img/products/modern/OPPOX9U_2.svg', 10, 27990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(242, 'OPPOX9U', 'Trắng ngọc', '8 GB', '256 GB', '#F6F7F9', 'img/products/modern/OPPOX9U_2.svg', 10, 27990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(243, 'OPPOX9U', 'Trắng ngọc', '8 GB', '64 GB', '#F6F7F9', 'img/products/modern/OPPOX9U_2.svg', 10, 27990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(244, 'REALMEC75', 'Đen bão tố', '16 GB', '128 GB', '#1F2937', 'img/products/modern/REALMEC75_1.svg', 10, 5290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(245, 'REALMEC75', 'Đen bão tố', '16 GB', '256 GB', '#1F2937', 'img/products/modern/REALMEC75_1.svg', 10, 5290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(246, 'REALMEC75', 'Đen bão tố', '16 GB', '64 GB', '#1F2937', 'img/products/modern/REALMEC75_1.svg', 10, 5290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(247, 'REALMEC75', 'Đen bão tố', '4 GB', '128 GB', '#1F2937', 'img/products/modern/REALMEC75_1.svg', 10, 5290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(248, 'REALMEC75', 'Đen bão tố', '4 GB', '256 GB', '#1F2937', 'img/products/modern/REALMEC75_1.svg', 10, 5290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(249, 'REALMEC75', 'Đen bão tố', '4 GB', '64 GB', '#1F2937', 'img/products/modern/REALMEC75_1.svg', 10, 5290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(250, 'REALMEC75', 'Đen bão tố', '8 GB', '128 GB', '#1F2937', 'img/products/modern/REALMEC75_1.svg', 10, 5290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(251, 'REALMEC75', 'Đen bão tố', '8 GB', '256 GB', '#1F2937', 'img/products/modern/REALMEC75_1.svg', 10, 5290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(252, 'REALMEC75', 'Đen bão tố', '8 GB', '64 GB', '#1F2937', 'img/products/modern/REALMEC75_1.svg', 10, 5290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(253, 'REALMEC75', 'Xanh lá', '16 GB', '128 GB', '#65A30D', 'img/products/modern/REALMEC75_3.svg', 10, 5290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(254, 'REALMEC75', 'Xanh lá', '16 GB', '256 GB', '#65A30D', 'img/products/modern/REALMEC75_3.svg', 10, 5290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(255, 'REALMEC75', 'Xanh lá', '16 GB', '64 GB', '#65A30D', 'img/products/modern/REALMEC75_3.svg', 10, 5290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(256, 'REALMEC75', 'Xanh lá', '4 GB', '128 GB', '#65A30D', 'img/products/modern/REALMEC75_3.svg', 10, 5290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(257, 'REALMEC75', 'Xanh lá', '4 GB', '256 GB', '#65A30D', 'img/products/modern/REALMEC75_3.svg', 10, 5290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(258, 'REALMEC75', 'Xanh lá', '4 GB', '64 GB', '#65A30D', 'img/products/modern/REALMEC75_3.svg', 10, 5290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(259, 'REALMEC75', 'Xanh lá', '8 GB', '128 GB', '#65A30D', 'img/products/modern/REALMEC75_3.svg', 10, 5290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(260, 'REALMEC75', 'Xanh lá', '8 GB', '256 GB', '#65A30D', 'img/products/modern/REALMEC75_3.svg', 10, 5290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(261, 'REALMEC75', 'Xanh lá', '8 GB', '64 GB', '#65A30D', 'img/products/modern/REALMEC75_3.svg', 10, 5290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(262, 'REALMEGT8', 'Bạc tốc độ', '16 GB', '128 GB', '#D1D5DB', 'img/products/modern/REALMEGT8_3.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(263, 'REALMEGT8', 'Bạc tốc độ', '16 GB', '256 GB', '#D1D5DB', 'img/products/modern/REALMEGT8_3.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(264, 'REALMEGT8', 'Bạc tốc độ', '16 GB', '64 GB', '#D1D5DB', 'img/products/modern/REALMEGT8_3.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(265, 'REALMEGT8', 'Bạc tốc độ', '4 GB', '128 GB', '#D1D5DB', 'img/products/modern/REALMEGT8_3.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(266, 'REALMEGT8', 'Bạc tốc độ', '4 GB', '256 GB', '#D1D5DB', 'img/products/modern/REALMEGT8_3.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(267, 'REALMEGT8', 'Bạc tốc độ', '4 GB', '64 GB', '#D1D5DB', 'img/products/modern/REALMEGT8_3.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(268, 'REALMEGT8', 'Bạc tốc độ', '8 GB', '128 GB', '#D1D5DB', 'img/products/modern/REALMEGT8_3.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(269, 'REALMEGT8', 'Bạc tốc độ', '8 GB', '256 GB', '#D1D5DB', 'img/products/modern/REALMEGT8_3.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(270, 'REALMEGT8', 'Bạc tốc độ', '8 GB', '64 GB', '#D1D5DB', 'img/products/modern/REALMEGT8_3.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(271, 'REALMEGT8', 'Cam racing', '16 GB', '128 GB', '#F97316', 'img/products/modern/REALMEGT8_1.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(272, 'REALMEGT8', 'Cam racing', '16 GB', '256 GB', '#F97316', 'img/products/modern/REALMEGT8_1.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(273, 'REALMEGT8', 'Cam racing', '16 GB', '64 GB', '#F97316', 'img/products/modern/REALMEGT8_1.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(274, 'REALMEGT8', 'Cam racing', '4 GB', '128 GB', '#F97316', 'img/products/modern/REALMEGT8_1.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(275, 'REALMEGT8', 'Cam racing', '4 GB', '256 GB', '#F97316', 'img/products/modern/REALMEGT8_1.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(276, 'REALMEGT8', 'Cam racing', '4 GB', '64 GB', '#F97316', 'img/products/modern/REALMEGT8_1.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(277, 'REALMEGT8', 'Cam racing', '8 GB', '128 GB', '#F97316', 'img/products/modern/REALMEGT8_1.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(278, 'REALMEGT8', 'Cam racing', '8 GB', '256 GB', '#F97316', 'img/products/modern/REALMEGT8_1.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(279, 'REALMEGT8', 'Cam racing', '8 GB', '64 GB', '#F97316', 'img/products/modern/REALMEGT8_1.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(280, 'REALMEGT8', 'Đen carbon', '16 GB', '128 GB', '#171717', 'img/products/modern/REALMEGT8_2.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(281, 'REALMEGT8', 'Đen carbon', '16 GB', '256 GB', '#171717', 'img/products/modern/REALMEGT8_2.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(282, 'REALMEGT8', 'Đen carbon', '16 GB', '64 GB', '#171717', 'img/products/modern/REALMEGT8_2.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(283, 'REALMEGT8', 'Đen carbon', '4 GB', '128 GB', '#171717', 'img/products/modern/REALMEGT8_2.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(284, 'REALMEGT8', 'Đen carbon', '4 GB', '256 GB', '#171717', 'img/products/modern/REALMEGT8_2.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(285, 'REALMEGT8', 'Đen carbon', '4 GB', '64 GB', '#171717', 'img/products/modern/REALMEGT8_2.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(286, 'REALMEGT8', 'Đen carbon', '8 GB', '128 GB', '#171717', 'img/products/modern/REALMEGT8_2.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(287, 'REALMEGT8', 'Đen carbon', '8 GB', '256 GB', '#171717', 'img/products/modern/REALMEGT8_2.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(288, 'REALMEGT8', 'Đen carbon', '8 GB', '64 GB', '#171717', 'img/products/modern/REALMEGT8_2.svg', 10, 18990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(289, 'REDMI15', 'Đen midnight', '16 GB', '128 GB', '#0F172A', 'img/products/modern/REDMI15_1.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(290, 'REDMI15', 'Đen midnight', '16 GB', '256 GB', '#0F172A', 'img/products/modern/REDMI15_1.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(291, 'REDMI15', 'Đen midnight', '16 GB', '64 GB', '#0F172A', 'img/products/modern/REDMI15_1.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(292, 'REDMI15', 'Đen midnight', '4 GB', '128 GB', '#0F172A', 'img/products/modern/REDMI15_1.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(293, 'REDMI15', 'Đen midnight', '4 GB', '256 GB', '#0F172A', 'img/products/modern/REDMI15_1.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(294, 'REDMI15', 'Đen midnight', '4 GB', '64 GB', '#0F172A', 'img/products/modern/REDMI15_1.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(295, 'REDMI15', 'Đen midnight', '8 GB', '128 GB', '#0F172A', 'img/products/modern/REDMI15_1.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(296, 'REDMI15', 'Đen midnight', '8 GB', '256 GB', '#0F172A', 'img/products/modern/REDMI15_1.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(297, 'REDMI15', 'Đen midnight', '8 GB', '64 GB', '#0F172A', 'img/products/modern/REDMI15_1.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(298, 'REDMI15', 'Tím nhạt', '16 GB', '128 GB', '#C4B5FD', 'img/products/modern/REDMI15_3.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(299, 'REDMI15', 'Tím nhạt', '16 GB', '256 GB', '#C4B5FD', 'img/products/modern/REDMI15_3.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(300, 'REDMI15', 'Tím nhạt', '16 GB', '64 GB', '#C4B5FD', 'img/products/modern/REDMI15_3.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(301, 'REDMI15', 'Tím nhạt', '4 GB', '128 GB', '#C4B5FD', 'img/products/modern/REDMI15_3.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(302, 'REDMI15', 'Tím nhạt', '4 GB', '256 GB', '#C4B5FD', 'img/products/modern/REDMI15_3.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(303, 'REDMI15', 'Tím nhạt', '4 GB', '64 GB', '#C4B5FD', 'img/products/modern/REDMI15_3.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(304, 'REDMI15', 'Tím nhạt', '8 GB', '128 GB', '#C4B5FD', 'img/products/modern/REDMI15_3.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(305, 'REDMI15', 'Tím nhạt', '8 GB', '256 GB', '#C4B5FD', 'img/products/modern/REDMI15_3.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(306, 'REDMI15', 'Tím nhạt', '8 GB', '64 GB', '#C4B5FD', 'img/products/modern/REDMI15_3.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(307, 'REDMI15', 'Xanh lá', '16 GB', '128 GB', '#74C69D', 'img/products/modern/REDMI15_2.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(308, 'REDMI15', 'Xanh lá', '16 GB', '256 GB', '#74C69D', 'img/products/modern/REDMI15_2.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(309, 'REDMI15', 'Xanh lá', '16 GB', '64 GB', '#74C69D', 'img/products/modern/REDMI15_2.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(310, 'REDMI15', 'Xanh lá', '4 GB', '128 GB', '#74C69D', 'img/products/modern/REDMI15_2.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(311, 'REDMI15', 'Xanh lá', '4 GB', '256 GB', '#74C69D', 'img/products/modern/REDMI15_2.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(312, 'REDMI15', 'Xanh lá', '4 GB', '64 GB', '#74C69D', 'img/products/modern/REDMI15_2.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(313, 'REDMI15', 'Xanh lá', '8 GB', '128 GB', '#74C69D', 'img/products/modern/REDMI15_2.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(314, 'REDMI15', 'Xanh lá', '8 GB', '256 GB', '#74C69D', 'img/products/modern/REDMI15_2.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(315, 'REDMI15', 'Xanh lá', '8 GB', '64 GB', '#74C69D', 'img/products/modern/REDMI15_2.svg', 10, 4990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(316, 'REDMI15P5G', 'Đen', '16 GB', '128 GB', '#101828', 'img/products/modern/REDMI15P5G_1.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(317, 'REDMI15P5G', 'Đen', '16 GB', '256 GB', '#101828', 'img/products/modern/REDMI15P5G_1.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(318, 'REDMI15P5G', 'Đen', '16 GB', '64 GB', '#101828', 'img/products/modern/REDMI15P5G_1.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32');
INSERT INTO `product_variants` (`variant_id`, `masp`, `ten_mau`, `ram`, `rom`, `ma_mau_hex`, `hinh_anh`, `so_luong_ton`, `gia_ban`, `created_at`, `updated_at`) VALUES
(319, 'REDMI15P5G', 'Đen', '4 GB', '128 GB', '#101828', 'img/products/modern/REDMI15P5G_1.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(320, 'REDMI15P5G', 'Đen', '4 GB', '256 GB', '#101828', 'img/products/modern/REDMI15P5G_1.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(321, 'REDMI15P5G', 'Đen', '4 GB', '64 GB', '#101828', 'img/products/modern/REDMI15P5G_1.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(322, 'REDMI15P5G', 'Đen', '8 GB', '128 GB', '#101828', 'img/products/modern/REDMI15P5G_1.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(323, 'REDMI15P5G', 'Đen', '8 GB', '256 GB', '#101828', 'img/products/modern/REDMI15P5G_1.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(324, 'REDMI15P5G', 'Đen', '8 GB', '64 GB', '#101828', 'img/products/modern/REDMI15P5G_1.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(325, 'REDMI15P5G', 'Tím khói', '16 GB', '128 GB', '#8B7ED8', 'img/products/modern/REDMI15P5G_3.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(326, 'REDMI15P5G', 'Tím khói', '16 GB', '256 GB', '#8B7ED8', 'img/products/modern/REDMI15P5G_3.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(327, 'REDMI15P5G', 'Tím khói', '16 GB', '64 GB', '#8B7ED8', 'img/products/modern/REDMI15P5G_3.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(328, 'REDMI15P5G', 'Tím khói', '4 GB', '128 GB', '#8B7ED8', 'img/products/modern/REDMI15P5G_3.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(329, 'REDMI15P5G', 'Tím khói', '4 GB', '256 GB', '#8B7ED8', 'img/products/modern/REDMI15P5G_3.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(330, 'REDMI15P5G', 'Tím khói', '4 GB', '64 GB', '#8B7ED8', 'img/products/modern/REDMI15P5G_3.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(331, 'REDMI15P5G', 'Tím khói', '8 GB', '128 GB', '#8B7ED8', 'img/products/modern/REDMI15P5G_3.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(332, 'REDMI15P5G', 'Tím khói', '8 GB', '256 GB', '#8B7ED8', 'img/products/modern/REDMI15P5G_3.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(333, 'REDMI15P5G', 'Tím khói', '8 GB', '64 GB', '#8B7ED8', 'img/products/modern/REDMI15P5G_3.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(334, 'REDMI15P5G', 'Xám titan', '16 GB', '128 GB', '#8A8D91', 'img/products/modern/REDMI15P5G_2.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(335, 'REDMI15P5G', 'Xám titan', '16 GB', '256 GB', '#8A8D91', 'img/products/modern/REDMI15P5G_2.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(336, 'REDMI15P5G', 'Xám titan', '16 GB', '64 GB', '#8A8D91', 'img/products/modern/REDMI15P5G_2.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(337, 'REDMI15P5G', 'Xám titan', '4 GB', '128 GB', '#8A8D91', 'img/products/modern/REDMI15P5G_2.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(338, 'REDMI15P5G', 'Xám titan', '4 GB', '256 GB', '#8A8D91', 'img/products/modern/REDMI15P5G_2.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(339, 'REDMI15P5G', 'Xám titan', '4 GB', '64 GB', '#8A8D91', 'img/products/modern/REDMI15P5G_2.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(340, 'REDMI15P5G', 'Xám titan', '8 GB', '128 GB', '#8A8D91', 'img/products/modern/REDMI15P5G_2.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(341, 'REDMI15P5G', 'Xám titan', '8 GB', '256 GB', '#8A8D91', 'img/products/modern/REDMI15P5G_2.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(342, 'REDMI15P5G', 'Xám titan', '8 GB', '64 GB', '#8A8D91', 'img/products/modern/REDMI15P5G_2.svg', 10, 8990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(343, 'SAMA37', 'Bạc', '16 GB', '128 GB', '#D1D5DB', 'img/products/modern/SAMA37_3.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(344, 'SAMA37', 'Bạc', '16 GB', '256 GB', '#D1D5DB', 'img/products/modern/SAMA37_3.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(345, 'SAMA37', 'Bạc', '16 GB', '64 GB', '#D1D5DB', 'img/products/modern/SAMA37_3.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(346, 'SAMA37', 'Bạc', '4 GB', '128 GB', '#D1D5DB', 'img/products/modern/SAMA37_3.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(347, 'SAMA37', 'Bạc', '4 GB', '256 GB', '#D1D5DB', 'img/products/modern/SAMA37_3.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(348, 'SAMA37', 'Bạc', '4 GB', '64 GB', '#D1D5DB', 'img/products/modern/SAMA37_3.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(349, 'SAMA37', 'Bạc', '8 GB', '128 GB', '#D1D5DB', 'img/products/modern/SAMA37_3.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(350, 'SAMA37', 'Bạc', '8 GB', '256 GB', '#D1D5DB', 'img/products/modern/SAMA37_3.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(351, 'SAMA37', 'Bạc', '8 GB', '64 GB', '#D1D5DB', 'img/products/modern/SAMA37_3.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(352, 'SAMA37', 'Đen', '16 GB', '128 GB', '#111827', 'img/products/modern/SAMA37_1.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(353, 'SAMA37', 'Đen', '16 GB', '256 GB', '#111827', 'img/products/modern/SAMA37_1.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(354, 'SAMA37', 'Đen', '16 GB', '64 GB', '#111827', 'img/products/modern/SAMA37_1.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(355, 'SAMA37', 'Đen', '4 GB', '128 GB', '#111827', 'img/products/modern/SAMA37_1.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(356, 'SAMA37', 'Đen', '4 GB', '256 GB', '#111827', 'img/products/modern/SAMA37_1.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(357, 'SAMA37', 'Đen', '4 GB', '64 GB', '#111827', 'img/products/modern/SAMA37_1.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(358, 'SAMA37', 'Đen', '8 GB', '128 GB', '#111827', 'img/products/modern/SAMA37_1.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(359, 'SAMA37', 'Đen', '8 GB', '256 GB', '#111827', 'img/products/modern/SAMA37_1.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(360, 'SAMA37', 'Đen', '8 GB', '64 GB', '#111827', 'img/products/modern/SAMA37_1.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(361, 'SAMA37', 'Xanh băng', '16 GB', '128 GB', '#BFE3F8', 'img/products/modern/SAMA37_2.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(362, 'SAMA37', 'Xanh băng', '16 GB', '256 GB', '#BFE3F8', 'img/products/modern/SAMA37_2.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(363, 'SAMA37', 'Xanh băng', '16 GB', '64 GB', '#BFE3F8', 'img/products/modern/SAMA37_2.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(364, 'SAMA37', 'Xanh băng', '4 GB', '128 GB', '#BFE3F8', 'img/products/modern/SAMA37_2.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(365, 'SAMA37', 'Xanh băng', '4 GB', '256 GB', '#BFE3F8', 'img/products/modern/SAMA37_2.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(366, 'SAMA37', 'Xanh băng', '4 GB', '64 GB', '#BFE3F8', 'img/products/modern/SAMA37_2.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(367, 'SAMA37', 'Xanh băng', '8 GB', '128 GB', '#BFE3F8', 'img/products/modern/SAMA37_2.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(368, 'SAMA37', 'Xanh băng', '8 GB', '256 GB', '#BFE3F8', 'img/products/modern/SAMA37_2.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(369, 'SAMA37', 'Xanh băng', '8 GB', '64 GB', '#BFE3F8', 'img/products/modern/SAMA37_2.svg', 10, 8290000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(370, 'SAMA57', 'Đen', '16 GB', '128 GB', '#1F2937', 'img/products/modern/SAMA57_3.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(371, 'SAMA57', 'Đen', '16 GB', '256 GB', '#1F2937', 'img/products/modern/SAMA57_3.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(372, 'SAMA57', 'Đen', '16 GB', '64 GB', '#1F2937', 'img/products/modern/SAMA57_3.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(373, 'SAMA57', 'Đen', '4 GB', '128 GB', '#1F2937', 'img/products/modern/SAMA57_3.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(374, 'SAMA57', 'Đen', '4 GB', '256 GB', '#1F2937', 'img/products/modern/SAMA57_3.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(375, 'SAMA57', 'Đen', '4 GB', '64 GB', '#1F2937', 'img/products/modern/SAMA57_3.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(376, 'SAMA57', 'Đen', '8 GB', '128 GB', '#1F2937', 'img/products/modern/SAMA57_3.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(377, 'SAMA57', 'Đen', '8 GB', '256 GB', '#1F2937', 'img/products/modern/SAMA57_3.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(378, 'SAMA57', 'Đen', '8 GB', '64 GB', '#1F2937', 'img/products/modern/SAMA57_3.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(379, 'SAMA57', 'Tím lavender', '16 GB', '128 GB', '#B9A7E8', 'img/products/modern/SAMA57_1.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(380, 'SAMA57', 'Tím lavender', '16 GB', '256 GB', '#B9A7E8', 'img/products/modern/SAMA57_1.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(381, 'SAMA57', 'Tím lavender', '16 GB', '64 GB', '#B9A7E8', 'img/products/modern/SAMA57_1.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(382, 'SAMA57', 'Tím lavender', '4 GB', '128 GB', '#B9A7E8', 'img/products/modern/SAMA57_1.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(383, 'SAMA57', 'Tím lavender', '4 GB', '256 GB', '#B9A7E8', 'img/products/modern/SAMA57_1.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(384, 'SAMA57', 'Tím lavender', '4 GB', '64 GB', '#B9A7E8', 'img/products/modern/SAMA57_1.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(385, 'SAMA57', 'Tím lavender', '8 GB', '128 GB', '#B9A7E8', 'img/products/modern/SAMA57_1.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(386, 'SAMA57', 'Tím lavender', '8 GB', '256 GB', '#B9A7E8', 'img/products/modern/SAMA57_1.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(387, 'SAMA57', 'Tím lavender', '8 GB', '64 GB', '#B9A7E8', 'img/products/modern/SAMA57_1.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(388, 'SAMA57', 'Xanh mint', '16 GB', '128 GB', '#A7E8C6', 'img/products/modern/SAMA57_2.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(389, 'SAMA57', 'Xanh mint', '16 GB', '256 GB', '#A7E8C6', 'img/products/modern/SAMA57_2.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(390, 'SAMA57', 'Xanh mint', '16 GB', '64 GB', '#A7E8C6', 'img/products/modern/SAMA57_2.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(391, 'SAMA57', 'Xanh mint', '4 GB', '128 GB', '#A7E8C6', 'img/products/modern/SAMA57_2.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(392, 'SAMA57', 'Xanh mint', '4 GB', '256 GB', '#A7E8C6', 'img/products/modern/SAMA57_2.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(393, 'SAMA57', 'Xanh mint', '4 GB', '64 GB', '#A7E8C6', 'img/products/modern/SAMA57_2.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(394, 'SAMA57', 'Xanh mint', '8 GB', '128 GB', '#A7E8C6', 'img/products/modern/SAMA57_2.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(395, 'SAMA57', 'Xanh mint', '8 GB', '256 GB', '#A7E8C6', 'img/products/modern/SAMA57_2.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(396, 'SAMA57', 'Xanh mint', '8 GB', '64 GB', '#A7E8C6', 'img/products/modern/SAMA57_2.svg', 10, 11990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(397, 'SAMS26U', 'Đen phantom', '16 GB', '128 GB', '#111827', 'img/products/modern/SAMS26U_1.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(398, 'SAMS26U', 'Đen phantom', '16 GB', '256 GB', '#111827', 'img/products/modern/SAMS26U_1.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(399, 'SAMS26U', 'Đen phantom', '16 GB', '64 GB', '#111827', 'img/products/modern/SAMS26U_1.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(400, 'SAMS26U', 'Đen phantom', '4 GB', '128 GB', '#111827', 'img/products/modern/SAMS26U_1.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(401, 'SAMS26U', 'Đen phantom', '4 GB', '256 GB', '#111827', 'img/products/modern/SAMS26U_1.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(402, 'SAMS26U', 'Đen phantom', '4 GB', '64 GB', '#111827', 'img/products/modern/SAMS26U_1.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(403, 'SAMS26U', 'Đen phantom', '8 GB', '128 GB', '#111827', 'img/products/modern/SAMS26U_1.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(404, 'SAMS26U', 'Đen phantom', '8 GB', '256 GB', '#111827', 'img/products/modern/SAMS26U_1.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(405, 'SAMS26U', 'Đen phantom', '8 GB', '64 GB', '#111827', 'img/products/modern/SAMS26U_1.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(406, 'SAMS26U', 'Xám titan', '16 GB', '128 GB', '#8A8D91', 'img/products/modern/SAMS26U_2.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(407, 'SAMS26U', 'Xám titan', '16 GB', '256 GB', '#8A8D91', 'img/products/modern/SAMS26U_2.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(408, 'SAMS26U', 'Xám titan', '16 GB', '64 GB', '#8A8D91', 'img/products/modern/SAMS26U_2.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(409, 'SAMS26U', 'Xám titan', '4 GB', '128 GB', '#8A8D91', 'img/products/modern/SAMS26U_2.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(410, 'SAMS26U', 'Xám titan', '4 GB', '256 GB', '#8A8D91', 'img/products/modern/SAMS26U_2.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(411, 'SAMS26U', 'Xám titan', '4 GB', '64 GB', '#8A8D91', 'img/products/modern/SAMS26U_2.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(412, 'SAMS26U', 'Xám titan', '8 GB', '128 GB', '#8A8D91', 'img/products/modern/SAMS26U_2.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(413, 'SAMS26U', 'Xám titan', '8 GB', '256 GB', '#8A8D91', 'img/products/modern/SAMS26U_2.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(414, 'SAMS26U', 'Xám titan', '8 GB', '64 GB', '#8A8D91', 'img/products/modern/SAMS26U_2.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(415, 'SAMS26U', 'Xanh navy', '16 GB', '128 GB', '#1E3A5F', 'img/products/modern/SAMS26U_3.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(416, 'SAMS26U', 'Xanh navy', '16 GB', '256 GB', '#1E3A5F', 'img/products/modern/SAMS26U_3.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(417, 'SAMS26U', 'Xanh navy', '16 GB', '64 GB', '#1E3A5F', 'img/products/modern/SAMS26U_3.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(418, 'SAMS26U', 'Xanh navy', '4 GB', '128 GB', '#1E3A5F', 'img/products/modern/SAMS26U_3.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(419, 'SAMS26U', 'Xanh navy', '4 GB', '256 GB', '#1E3A5F', 'img/products/modern/SAMS26U_3.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(420, 'SAMS26U', 'Xanh navy', '4 GB', '64 GB', '#1E3A5F', 'img/products/modern/SAMS26U_3.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(421, 'SAMS26U', 'Xanh navy', '8 GB', '128 GB', '#1E3A5F', 'img/products/modern/SAMS26U_3.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(422, 'SAMS26U', 'Xanh navy', '8 GB', '256 GB', '#1E3A5F', 'img/products/modern/SAMS26U_3.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(423, 'SAMS26U', 'Xanh navy', '8 GB', '64 GB', '#1E3A5F', 'img/products/modern/SAMS26U_3.svg', 10, 33990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(424, 'VIVOX300', 'Đen sao đêm', '16 GB', '128 GB', '#0B1020', 'img/products/modern/VIVOX300_2.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(425, 'VIVOX300', 'Đen sao đêm', '16 GB', '256 GB', '#0B1020', 'img/products/modern/VIVOX300_2.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(426, 'VIVOX300', 'Đen sao đêm', '16 GB', '64 GB', '#0B1020', 'img/products/modern/VIVOX300_2.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(427, 'VIVOX300', 'Đen sao đêm', '4 GB', '128 GB', '#0B1020', 'img/products/modern/VIVOX300_2.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(428, 'VIVOX300', 'Đen sao đêm', '4 GB', '256 GB', '#0B1020', 'img/products/modern/VIVOX300_2.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(429, 'VIVOX300', 'Đen sao đêm', '4 GB', '64 GB', '#0B1020', 'img/products/modern/VIVOX300_2.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(430, 'VIVOX300', 'Đen sao đêm', '8 GB', '128 GB', '#0B1020', 'img/products/modern/VIVOX300_2.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(431, 'VIVOX300', 'Đen sao đêm', '8 GB', '256 GB', '#0B1020', 'img/products/modern/VIVOX300_2.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(432, 'VIVOX300', 'Đen sao đêm', '8 GB', '64 GB', '#0B1020', 'img/products/modern/VIVOX300_2.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(433, 'VIVOX300', 'Trắng ánh ngọc', '16 GB', '128 GB', '#F1F5F9', 'img/products/modern/VIVOX300_3.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(434, 'VIVOX300', 'Trắng ánh ngọc', '16 GB', '256 GB', '#F1F5F9', 'img/products/modern/VIVOX300_3.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(435, 'VIVOX300', 'Trắng ánh ngọc', '16 GB', '64 GB', '#F1F5F9', 'img/products/modern/VIVOX300_3.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(436, 'VIVOX300', 'Trắng ánh ngọc', '4 GB', '128 GB', '#F1F5F9', 'img/products/modern/VIVOX300_3.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(437, 'VIVOX300', 'Trắng ánh ngọc', '4 GB', '256 GB', '#F1F5F9', 'img/products/modern/VIVOX300_3.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(438, 'VIVOX300', 'Trắng ánh ngọc', '4 GB', '64 GB', '#F1F5F9', 'img/products/modern/VIVOX300_3.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(439, 'VIVOX300', 'Trắng ánh ngọc', '8 GB', '128 GB', '#F1F5F9', 'img/products/modern/VIVOX300_3.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(440, 'VIVOX300', 'Trắng ánh ngọc', '8 GB', '256 GB', '#F1F5F9', 'img/products/modern/VIVOX300_3.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(441, 'VIVOX300', 'Trắng ánh ngọc', '8 GB', '64 GB', '#F1F5F9', 'img/products/modern/VIVOX300_3.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(442, 'VIVOX300', 'Xanh trời', '16 GB', '128 GB', '#8EC5FC', 'img/products/modern/VIVOX300_1.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(443, 'VIVOX300', 'Xanh trời', '16 GB', '256 GB', '#8EC5FC', 'img/products/modern/VIVOX300_1.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(444, 'VIVOX300', 'Xanh trời', '16 GB', '64 GB', '#8EC5FC', 'img/products/modern/VIVOX300_1.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(445, 'VIVOX300', 'Xanh trời', '4 GB', '128 GB', '#8EC5FC', 'img/products/modern/VIVOX300_1.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(446, 'VIVOX300', 'Xanh trời', '4 GB', '256 GB', '#8EC5FC', 'img/products/modern/VIVOX300_1.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(447, 'VIVOX300', 'Xanh trời', '4 GB', '64 GB', '#8EC5FC', 'img/products/modern/VIVOX300_1.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(448, 'VIVOX300', 'Xanh trời', '8 GB', '128 GB', '#8EC5FC', 'img/products/modern/VIVOX300_1.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(449, 'VIVOX300', 'Xanh trời', '8 GB', '256 GB', '#8EC5FC', 'img/products/modern/VIVOX300_1.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(450, 'VIVOX300', 'Xanh trời', '8 GB', '64 GB', '#8EC5FC', 'img/products/modern/VIVOX300_1.svg', 10, 23990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(451, 'VIVOY39', 'Đen', '16 GB', '128 GB', '#111827', 'img/products/modern/VIVOY39_1.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(452, 'VIVOY39', 'Đen', '16 GB', '256 GB', '#111827', 'img/products/modern/VIVOY39_1.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(453, 'VIVOY39', 'Đen', '16 GB', '64 GB', '#111827', 'img/products/modern/VIVOY39_1.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(454, 'VIVOY39', 'Đen', '4 GB', '128 GB', '#111827', 'img/products/modern/VIVOY39_1.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(455, 'VIVOY39', 'Đen', '4 GB', '256 GB', '#111827', 'img/products/modern/VIVOY39_1.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(456, 'VIVOY39', 'Đen', '4 GB', '64 GB', '#111827', 'img/products/modern/VIVOY39_1.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(457, 'VIVOY39', 'Đen', '8 GB', '128 GB', '#111827', 'img/products/modern/VIVOY39_1.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(458, 'VIVOY39', 'Đen', '8 GB', '256 GB', '#111827', 'img/products/modern/VIVOY39_1.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(459, 'VIVOY39', 'Đen', '8 GB', '64 GB', '#111827', 'img/products/modern/VIVOY39_1.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(460, 'VIVOY39', 'Tím ánh sao', '16 GB', '128 GB', '#A78BFA', 'img/products/modern/VIVOY39_3.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(461, 'VIVOY39', 'Tím ánh sao', '16 GB', '256 GB', '#A78BFA', 'img/products/modern/VIVOY39_3.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(462, 'VIVOY39', 'Tím ánh sao', '16 GB', '64 GB', '#A78BFA', 'img/products/modern/VIVOY39_3.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(463, 'VIVOY39', 'Tím ánh sao', '4 GB', '128 GB', '#A78BFA', 'img/products/modern/VIVOY39_3.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(464, 'VIVOY39', 'Tím ánh sao', '4 GB', '256 GB', '#A78BFA', 'img/products/modern/VIVOY39_3.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(465, 'VIVOY39', 'Tím ánh sao', '4 GB', '64 GB', '#A78BFA', 'img/products/modern/VIVOY39_3.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(466, 'VIVOY39', 'Tím ánh sao', '8 GB', '128 GB', '#A78BFA', 'img/products/modern/VIVOY39_3.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(467, 'VIVOY39', 'Tím ánh sao', '8 GB', '256 GB', '#A78BFA', 'img/products/modern/VIVOY39_3.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(468, 'VIVOY39', 'Tím ánh sao', '8 GB', '64 GB', '#A78BFA', 'img/products/modern/VIVOY39_3.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(469, 'VIVOY39', 'Xanh ngọc', '16 GB', '128 GB', '#5EEAD4', 'img/products/modern/VIVOY39_2.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(470, 'VIVOY39', 'Xanh ngọc', '16 GB', '256 GB', '#5EEAD4', 'img/products/modern/VIVOY39_2.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(471, 'VIVOY39', 'Xanh ngọc', '16 GB', '64 GB', '#5EEAD4', 'img/products/modern/VIVOY39_2.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(472, 'VIVOY39', 'Xanh ngọc', '4 GB', '128 GB', '#5EEAD4', 'img/products/modern/VIVOY39_2.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(473, 'VIVOY39', 'Xanh ngọc', '4 GB', '256 GB', '#5EEAD4', 'img/products/modern/VIVOY39_2.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(474, 'VIVOY39', 'Xanh ngọc', '4 GB', '64 GB', '#5EEAD4', 'img/products/modern/VIVOY39_2.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(475, 'VIVOY39', 'Xanh ngọc', '8 GB', '128 GB', '#5EEAD4', 'img/products/modern/VIVOY39_2.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(476, 'VIVOY39', 'Xanh ngọc', '8 GB', '256 GB', '#5EEAD4', 'img/products/modern/VIVOY39_2.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(477, 'VIVOY39', 'Xanh ngọc', '8 GB', '64 GB', '#5EEAD4', 'img/products/modern/VIVOY39_2.svg', 10, 6490000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(478, 'XIA15U', 'Bạc titan', '16 GB', '128 GB', '#C0C5CC', 'img/products/modern/XIA15U_3.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(479, 'XIA15U', 'Bạc titan', '16 GB', '256 GB', '#C0C5CC', 'img/products/modern/XIA15U_3.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(480, 'XIA15U', 'Bạc titan', '16 GB', '64 GB', '#C0C5CC', 'img/products/modern/XIA15U_3.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(481, 'XIA15U', 'Bạc titan', '4 GB', '128 GB', '#C0C5CC', 'img/products/modern/XIA15U_3.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(482, 'XIA15U', 'Bạc titan', '4 GB', '256 GB', '#C0C5CC', 'img/products/modern/XIA15U_3.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(483, 'XIA15U', 'Bạc titan', '4 GB', '64 GB', '#C0C5CC', 'img/products/modern/XIA15U_3.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(484, 'XIA15U', 'Bạc titan', '8 GB', '128 GB', '#C0C5CC', 'img/products/modern/XIA15U_3.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(485, 'XIA15U', 'Bạc titan', '8 GB', '256 GB', '#C0C5CC', 'img/products/modern/XIA15U_3.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(486, 'XIA15U', 'Bạc titan', '8 GB', '64 GB', '#C0C5CC', 'img/products/modern/XIA15U_3.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(487, 'XIA15U', 'Đen cổ điển', '16 GB', '128 GB', '#0F172A', 'img/products/modern/XIA15U_1.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(488, 'XIA15U', 'Đen cổ điển', '16 GB', '256 GB', '#0F172A', 'img/products/modern/XIA15U_1.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(489, 'XIA15U', 'Đen cổ điển', '16 GB', '64 GB', '#0F172A', 'img/products/modern/XIA15U_1.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(490, 'XIA15U', 'Đen cổ điển', '4 GB', '128 GB', '#0F172A', 'img/products/modern/XIA15U_1.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(491, 'XIA15U', 'Đen cổ điển', '4 GB', '256 GB', '#0F172A', 'img/products/modern/XIA15U_1.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(492, 'XIA15U', 'Đen cổ điển', '4 GB', '64 GB', '#0F172A', 'img/products/modern/XIA15U_1.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(493, 'XIA15U', 'Đen cổ điển', '8 GB', '128 GB', '#0F172A', 'img/products/modern/XIA15U_1.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(494, 'XIA15U', 'Đen cổ điển', '8 GB', '256 GB', '#0F172A', 'img/products/modern/XIA15U_1.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(495, 'XIA15U', 'Đen cổ điển', '8 GB', '64 GB', '#0F172A', 'img/products/modern/XIA15U_1.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(496, 'XIA15U', 'Trắng gốm', '16 GB', '128 GB', '#F3F4F6', 'img/products/modern/XIA15U_2.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(497, 'XIA15U', 'Trắng gốm', '16 GB', '256 GB', '#F3F4F6', 'img/products/modern/XIA15U_2.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(498, 'XIA15U', 'Trắng gốm', '16 GB', '64 GB', '#F3F4F6', 'img/products/modern/XIA15U_2.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(499, 'XIA15U', 'Trắng gốm', '4 GB', '128 GB', '#F3F4F6', 'img/products/modern/XIA15U_2.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(500, 'XIA15U', 'Trắng gốm', '4 GB', '256 GB', '#F3F4F6', 'img/products/modern/XIA15U_2.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(501, 'XIA15U', 'Trắng gốm', '4 GB', '64 GB', '#F3F4F6', 'img/products/modern/XIA15U_2.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(502, 'XIA15U', 'Trắng gốm', '8 GB', '128 GB', '#F3F4F6', 'img/products/modern/XIA15U_2.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(503, 'XIA15U', 'Trắng gốm', '8 GB', '256 GB', '#F3F4F6', 'img/products/modern/XIA15U_2.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32'),
(504, 'XIA15U', 'Trắng gốm', '8 GB', '64 GB', '#F3F4F6', 'img/products/modern/XIA15U_2.svg', 10, 29990000, '2026-06-25 15:44:07', '2026-06-25 23:49:32');

--
-- Triggers `product_variants`
--
DELIMITER $$
CREATE TRIGGER `trg_variants_ad` AFTER DELETE ON `product_variants` FOR EACH ROW UPDATE `products` p SET p.`so_luong_ton` = (SELECT IFNULL(SUM(v.`so_luong_ton`), 0) FROM `product_variants` v WHERE v.`masp` = OLD.`masp`), p.`gia` = COALESCE((SELECT MIN(v.`gia_ban`) FROM `product_variants` v WHERE v.`masp` = OLD.`masp` AND v.`gia_ban` > 0), 0) WHERE p.`masp` = OLD.`masp`
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_variants_ai` AFTER INSERT ON `product_variants` FOR EACH ROW UPDATE `products` p SET p.`so_luong_ton` = (SELECT IFNULL(SUM(v.`so_luong_ton`), 0) FROM `product_variants` v WHERE v.`masp` = NEW.`masp`), p.`gia` = COALESCE((SELECT MIN(v.`gia_ban`) FROM `product_variants` v WHERE v.`masp` = NEW.`masp` AND v.`gia_ban` > 0), 0) WHERE p.`masp` = NEW.`masp`
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_variants_au` AFTER UPDATE ON `product_variants` FOR EACH ROW BEGIN
  UPDATE `products` p
  SET
    p.`so_luong_ton` = (SELECT IFNULL(SUM(v.`so_luong_ton`), 0) FROM `product_variants` v WHERE v.`masp` = NEW.`masp`),
    p.`gia` = COALESCE((SELECT MIN(v.`gia_ban`) FROM `product_variants` v WHERE v.`masp` = NEW.`masp` AND v.`gia_ban` > 0), 0)
  WHERE p.`masp` = NEW.`masp`;

  IF OLD.`masp` <> NEW.`masp` THEN
    UPDATE `products` p
    SET
      p.`so_luong_ton` = (SELECT IFNULL(SUM(v.`so_luong_ton`), 0) FROM `product_variants` v WHERE v.`masp` = OLD.`masp`),
      p.`gia` = COALESCE((SELECT MIN(v.`gia_ban`) FROM `product_variants` v WHERE v.`masp` = OLD.`masp` AND v.`gia_ban` > 0), 0)
    WHERE p.`masp` = OLD.`masp`;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `rate`
--

CREATE TABLE `rate` (
  `id` int(11) NOT NULL,
  `masp` varchar(20) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `mau_sac` varchar(50) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `so_sao` int(11) NOT NULL,
  `binh_luan` text NOT NULL,
  `ngay_dg` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rate`
--

INSERT INTO `rate` (`id`, `masp`, `variant_id`, `mau_sac`, `username`, `user_id`, `so_sao`, `binh_luan`, `ngay_dg`) VALUES
(1, 'APP16', 1, 'Đen', 'tuyen', 4, 5, 'sản phẩm chất lượng tốt', '2026-06-25 21:09:09');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `ho` varchar(50) DEFAULT NULL,
  `ten` varchar(50) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` varchar(10) DEFAULT 'user',
  `trang_thai` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `ho`, `ten`, `username`, `password`, `email`, `role`, `trang_thai`) VALUES
(1, 'Quản trị', 'Viên', 'admin', '$2y$10$DfyxK92xIZF2BCNULeQdF.lEKZ66oCSqqKcHpvVQ3DpwQt/GRhA4i', 'admin@gmail.com', 'admin', 1),
(3, 'thanh', 'thanh', 'thanh', '$2y$10$bDZFw7bUeqDC6RyEUShds./i5PUKzHq1gjl5ewoRMeh46u9xkujj6', 'thanh@123.com', 'user', 1),
(4, 'tuyen12', '', 'tuyen', '$2y$10$jf6rLr17FmNqeAm2K5F/M.MQuP0QN0VB2HFxb8BdhiVRYTBBnFVMW', 'tuyen171809@gmail.com', 'user', 1),
(10, 'nguyen', 'A', 'tuyen1', '$2y$10$UjWqUAFGCgxntzkhQARKJeoGYYEGDGuLVcPoFtDZcEJt9rZs.0uya', 'zic200409@gmail.com', 'user', 1);

-- --------------------------------------------------------

--
-- Table structure for table `vnpay_payment_sessions`
--

CREATE TABLE `vnpay_payment_sessions` (
  `session_id` int(11) NOT NULL,
  `txn_ref` varchar(100) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `tong_tien` decimal(15,0) NOT NULL DEFAULT 0,
  `ho_ten` varchar(255) DEFAULT NULL,
  `dia_chi` text NOT NULL,
  `so_dien_thoai` varchar(20) NOT NULL,
  `cart_json` longtext NOT NULL,
  `cart_signature` char(64) NOT NULL,
  `session_status` enum('Pending','Paid','Failed') NOT NULL DEFAULT 'Pending',
  `order_id` int(11) DEFAULT NULL,
  `vnp_transaction_no` varchar(50) DEFAULT NULL,
  `vnp_response_code` varchar(10) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `nhap_kho`
--
ALTER TABLE `nhap_kho`
  ADD PRIMARY KEY (`id`),
  ADD KEY `masp` (`masp`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`ma_don`),
  ADD UNIQUE KEY `uq_orders_vnp_txn_ref` (`vnp_txn_ref`),
  ADD KEY `username` (`username`),
  ADD KEY `idx_orders_payment_timeout` (`payment_status`,`phuong_thuc_tt`,`payment_expired_at`),
  ADD KEY `idx_orders_user_id` (`user_id`);

--
-- Indexes for table `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`detail_id`),
  ADD KEY `ma_don` (`ma_don`),
  ADD KEY `masp` (`masp`),
  ADD KEY `idx_variant_id` (`variant_id`);

--
-- Indexes for table `order_status_logs`
--
ALTER TABLE `order_status_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_order_status_logs_ma_don` (`ma_don`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`masp`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`variant_id`),
  ADD UNIQUE KEY `uq_variant_combo` (`masp`,`ten_mau`,`ram`,`rom`),
  ADD KEY `idx_masp` (`masp`);

--
-- Indexes for table `rate`
--
ALTER TABLE `rate`
  ADD PRIMARY KEY (`id`),
  ADD KEY `masp` (`masp`),
  ADD KEY `username` (`username`),
  ADD KEY `idx_rate_variant` (`variant_id`),
  ADD KEY `fk_rate_user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `vnpay_payment_sessions`
--
ALTER TABLE `vnpay_payment_sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD UNIQUE KEY `txn_ref` (`txn_ref`),
  ADD UNIQUE KEY `uq_vnpay_session_order` (`order_id`),
  ADD KEY `idx_vnpay_session_user_status` (`username`,`session_status`),
  ADD KEY `idx_vnpay_session_expires` (`expires_at`),
  ADD KEY `idx_vnpay_payment_sessions_user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `nhap_kho`
--
ALTER TABLE `nhap_kho`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `ma_don` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `order_details`
--
ALTER TABLE `order_details`
  MODIFY `detail_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `order_status_logs`
--
ALTER TABLE `order_status_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `variant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=512;

--
-- AUTO_INCREMENT for table `rate`
--
ALTER TABLE `rate`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `vnpay_payment_sessions`
--
ALTER TABLE `vnpay_payment_sessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `nhap_kho`
--
ALTER TABLE `nhap_kho`
  ADD CONSTRAINT `nhap_kho_ibfk_1` FOREIGN KEY (`masp`) REFERENCES `products` (`masp`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON DELETE CASCADE;

--
-- Constraints for table `order_details`
--
ALTER TABLE `order_details`
  ADD CONSTRAINT `fk_order_details_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`ma_don`) REFERENCES `orders` (`ma_don`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_details_ibfk_2` FOREIGN KEY (`masp`) REFERENCES `products` (`masp`) ON DELETE CASCADE;

--
-- Constraints for table `order_status_logs`
--
ALTER TABLE `order_status_logs`
  ADD CONSTRAINT `fk_order_status_logs_order` FOREIGN KEY (`ma_don`) REFERENCES `orders` (`ma_don`) ON DELETE CASCADE;

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `fk_variants_product` FOREIGN KEY (`masp`) REFERENCES `products` (`masp`) ON DELETE CASCADE;

--
-- Constraints for table `rate`
--
ALTER TABLE `rate`
  ADD CONSTRAINT `fk_rate_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `rate_ibfk_1` FOREIGN KEY (`masp`) REFERENCES `products` (`masp`) ON DELETE CASCADE,
  ADD CONSTRAINT `rate_ibfk_2` FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON DELETE CASCADE;

--
-- Constraints for table `vnpay_payment_sessions`
--
ALTER TABLE `vnpay_payment_sessions`
  ADD CONSTRAINT `fk_vnpay_payment_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_vnpay_session_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`ma_don`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_vnpay_session_user` FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
