-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 25, 2026 at 11:06 AM
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
('APP16', 'iPhone 16 128GB', 'Apple', 'img/products/uploads/ip16xanhduong-1779440286.jpg', 18990000, 0, 0, 0, 'giamgia', '1000000', 'Super Retina XDR 6.1 inch', 'iOS 26', 'Camera kép 48 MP', 'TrueDepth 12 MP', 'Apple A18', '8 GB', '128 GB', 'Không hỗ trợ thẻ nhớ', 'Pin tốt, sạc nhanh USB-C', 'iPhone 16 sở hữu thiết kế tinh tế, hiệu năng mạnh mẽ và màn hình hiển thị sắc nét, phù hợp cho cả công việc lẫn giải trí.\n\nMáy mang đến trải nghiệm mượt mà với khả năng chụp ảnh chất lượng cao, pin đáp ứng tốt nhu cầu sử dụng hằng ngày và hệ sinh thái iOS ổn định.'),
('APP17', 'iPhone 17 256GB', 'Apple', 'img/products/uploads/t---i-xu---ng--2-1779441601.webp', 24990000, 0, 0, 0, 'moiramat', '', 'Super Retina XDR 6.3 inch 120Hz', 'iOS 26', 'Camera kép 48 MP, quay 4K', 'TrueDepth 24 MP', 'Apple A19', '8 GB', '256 GB', 'Không hỗ trợ thẻ nhớ', 'Pin cả ngày, sạc nhanh USB-C', NULL),
('APP17P', 'iPhone 17 Pro 256GB', 'Apple', 'img/products/uploads/shopping-1779441651.webp', 34990000, 0, 0, 0, 'giareonline', '33490000', 'OLED ProMotion 6.3 inch 120Hz', 'iOS 26', 'Camera Pro Fusion 48 MP', 'TrueDepth 24 MP', 'Apple A19 Pro', '12 GB', '256 GB', 'Không hỗ trợ thẻ nhớ', 'Pin Pro, sạc nhanh USB-C', NULL),
('HMDPULSEP', 'HMD Pulse Pro 6GB/128GB', 'Nokia', 'img/products/uploads/t---i-xu---ng-1779441784.jpg', 3990000, 0, 5, 1, 'giamgia', '200000', 'LCD 6.65 inch 90Hz', 'Android 15', 'Camera sau 50 MP', 'Camera selfie 50 MP', 'Unisoc T606', '6 GB', '128 GB', 'MicroSD hỗ trợ', '5000 mAh, pin lâu', NULL),
('HMDXR21', 'Nokia XR21 5G 6GB/128GB', 'Nokia', 'img/products/uploads/t---i-xu---ng--1-1779441853.jpg', 7490000, 0, 0, 0, 'tragop', '0', 'LCD 6.49 inch 120Hz', 'Android 14', 'Camera kép 64 MP', 'Camera 16 MP', 'Snapdragon 695 5G', '6 GB', '128 GB', 'MicroSD hỗ trợ', '4800 mAh, bền bỉ', NULL),
('HWMATEX6', 'Huawei Mate X6 12GB/512GB', 'Huawei', 'img/products/uploads/t---i-xu---ng--2-1779441895.jpg', 41990000, 0, 0, 0, 'tragop', '0', 'Màn hình gập OLED 7.93 inch 120Hz', 'EMUI / HarmonyOS tùy thị trường', 'Camera Ultra Chroma 50 MP', 'Camera 8 MP', 'Kirin flagship', '12 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', 'Pin kép, sạc nhanh SuperCharge', NULL),
('HWPR80', 'Huawei Pura 80 12GB/256GB', 'Huawei', 'img/products/uploads/t---i-xu---ng--3-1779441927.webp', 18990000, 0, 0, 0, 'moiramat', '', 'OLED 6.6 inch 120Hz', 'EMUI / HarmonyOS tùy thị trường', 'Camera XMAGE 50 MP', 'Camera 13 MP', 'Kirin series', '12 GB', '256 GB', 'Không hỗ trợ thẻ nhớ', 'Pin lớn, sạc nhanh SuperCharge', NULL),
('HWPR80U', 'Huawei Pura 80 Ultra 16GB/512GB', 'Huawei', 'img/products/uploads/shopping--1-1779441992.webp', 32990000, 0, 0, 0, 'giareonline', '31490000', 'OLED LTPO 6.8 inch 120Hz', 'EMUI / HarmonyOS tùy thị trường', 'Camera XMAGE cao cấp, tele', 'Camera 13 MP', 'Kirin flagship', '16 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', 'Pin lớn, sạc nhanh SuperCharge', NULL),
('NOKIAG42', 'Nokia G42 5G 6GB/128GB', 'Nokia', 'img/products/uploads/nokia-g42-5g-viettablet-1779442098.webp', 4490000, 0, 0, 0, 'giareonline', '4190000', 'LCD 6.56 inch 90Hz', 'Android 14', 'Camera chính 50 MP', 'Camera 8 MP', 'Snapdragon 480+ 5G', '6 GB', '128 GB', 'MicroSD hỗ trợ', '5000 mAh', NULL),
('OPPOA5P', 'OPPO A5 Pro 5G 8GB/256GB', 'Oppo', 'img/products/uploads/t---i-xu---ng--3-1779442158.jpg', 6990000, 0, 0, 0, 'giamgia', '400000', 'LCD 6.67 inch 120Hz', 'Android 15, ColorOS', 'Camera 50 MP', 'Camera 8 MP', 'Dimensity 5G', '8 GB', '256 GB', 'MicroSD hỗ trợ', '5800 mAh, sạc nhanh', NULL),
('OPPOR15P', 'OPPO Reno15 Pro 5G 12GB/512GB', 'Oppo', 'img/products/uploads/t---i-xu---ng--4-1779442239.jpg', 15990000, 0, 0, 0, 'tragop', '0', 'AMOLED 6.7 inch 120Hz', 'Android 16, ColorOS', 'Camera chân dung 50 MP OIS', 'Camera 50 MP', 'Dimensity AI 5G', '12 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', '5000 mAh, sạc nhanh 80W', NULL),
('OPPOX9U', 'OPPO Find X9 Ultra 16GB/512GB', 'Oppo', 'img/products/uploads/t---i-xu---ng--5-1779442269.jpg', 27990000, 0, 0, 0, 'moiramat', '', 'AMOLED 6.82 inch 120Hz', 'Android 16, ColorOS', 'Camera Hasselblad 50 MP', 'Camera 32 MP', 'Dimensity flagship', '16 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', '5400 mAh, sạc nhanh SuperVOOC', NULL),
('REALMEC75', 'realme C75 8GB/256GB', 'Realme', 'img/products/uploads/t---i-xu---ng--6-1779442317.jpg', 5290000, 0, 0, 0, 'giareonline', '4990000', 'LCD 6.72 inch 90Hz', 'Android 15, realme UI', 'Camera 50 MP', 'Camera 8 MP', 'Helio G series', '8 GB', '256 GB', 'MicroSD hỗ trợ', '6000 mAh', NULL),
('REALMEGT8', 'realme GT 8 Pro 16GB/512GB', 'Realme', 'img/products/uploads/t---i-xu---ng--7-1779442339.jpg', 18990000, 0, 0, 0, 'giamgia', '1000000', 'AMOLED 6.78 inch 144Hz', 'Android 16, realme UI', 'Camera 50 MP OIS, góc rộng', 'Camera 32 MP', 'Snapdragon 8 series', '16 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', '5500 mAh, sạc nhanh 120W', NULL),
('REDMI15', 'REDMI Note 15 8GB/128GB', 'Xiaomi', 'img/products/uploads/t---i-xu---ng--8-1779442369.jpg', 4990000, 0, 0, 0, 'giareonline', '4590000', 'AMOLED 6.67 inch 120Hz', 'Android 16, HyperOS', 'Camera 108 MP', 'Camera 16 MP', 'Snapdragon tầm trung', '8 GB', '128 GB', 'MicroSD tối đa 1 TB', '5000 mAh, sạc nhanh', NULL),
('REDMI15P5G', 'REDMI Note 15 Pro 5G 12GB/256GB', 'Xiaomi', 'img/products/uploads/t---i-xu---ng--9-1779442401.jpg', 8990000, 0, 0, 0, 'giamgia', '500000', 'AMOLED 6.83 inch 1.5K 120Hz', 'Android 16, HyperOS', 'Camera 200 MP chống rung OIS', 'Camera 32 MP', 'MediaTek Dimensity 7400-Ultra', '12 GB', '256 GB', 'Không hỗ trợ thẻ nhớ', '6580 mAh, sạc nhanh', NULL),
('SAMA37', 'Samsung Galaxy A37 5G 8GB/128GB', 'Samsung', 'img/products/uploads/t---i-xu---ng--10-1779442445.jpg', 8290000, 0, 0, 0, 'giareonline', '7890000', 'Super AMOLED 6.6 inch 120Hz', 'Android 16', 'Camera 50 MP', 'Camera 13 MP', 'Exynos tầm trung', '8 GB', '128 GB', 'MicroSD tối đa 1 TB', '5000 mAh', NULL),
('SAMA57', 'Samsung Galaxy A57 5G 8GB/256GB', 'Samsung', 'img/products/uploads/t---i-xu---ng--11-1779442472.jpg', 11990000, 0, 0, 0, 'giamgia', '700000', 'Super AMOLED 6.7 inch 120Hz', 'Android 16', 'Camera 50 MP chống rung OIS', 'Camera 32 MP', 'Exynos AI Edition', '8 GB', '256 GB', 'MicroSD tối đa 1 TB', '5000 mAh, sạc nhanh', NULL),
('SAMS26U', 'Samsung Galaxy S26 Ultra 12GB/512GB', 'Samsung', 'img/products/uploads/t---i-xu---ng--12-1779442503.jpg', 33990000, 0, 0, 0, 'moiramat', '', 'Dynamic AMOLED 2X 6.9 inch 120Hz', 'Android 16, One UI AI', 'Camera 200 MP, tele, góc rộng', 'Camera 12 MP', 'Snapdragon 8 Elite for Galaxy', '12 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', '5000 mAh, sạc nhanh', NULL),
('VIVOX300', 'Vivo X300 Pro 12GB/512GB', 'Vivo', 'img/products/uploads/t---i-xu---ng--13-1779442533.jpg', 23990000, 0, 0, 0, 'giareonline', '22490000', 'AMOLED 6.78 inch 120Hz', 'Android 16, Funtouch OS', 'Camera ZEISS 50 MP, tele', 'Camera 32 MP', 'Dimensity flagship', '12 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', '5200 mAh, sạc nhanh', NULL),
('VIVOY39', 'Vivo Y39 5G 8GB/256GB', 'Vivo', 'img/products/uploads/t---i-xu---ng--14-1779442556.jpg', 6490000, 0, 0, 0, 'giamgia', '300000', 'LCD 6.68 inch 120Hz', 'Android 15, Funtouch OS', 'Camera 50 MP', 'Camera 8 MP', 'Snapdragon 5G', '8 GB', '256 GB', 'MicroSD hỗ trợ', '6500 mAh, sạc nhanh', NULL),
('XIA15U', 'Xiaomi 15 Ultra 16GB/512GB', 'Xiaomi', 'img/products/uploads/t---i-xu---ng--15-1779442578.jpg', 29990000, 0, 0, 0, 'giareonline', '28490000', 'AMOLED 6.73 inch 2K 120Hz', 'Android 16, HyperOS', 'Camera Leica 50 MP, tele tiềm vọng', 'Camera 32 MP', 'Snapdragon 8 Elite', '16 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', '5300 mAh, sạc nhanh 90W', NULL);

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
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `variant_code` varchar(120) GENERATED ALWAYS AS (concat(`masp`,'_',`ten_mau`,'_',`ram`,'_',`rom`)) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variants`
--

INSERT INTO `product_variants` (`variant_id`, `masp`, `ten_mau`, `ram`, `rom`, `ma_mau_hex`, `hinh_anh`, `so_luong_ton`, `created_at`, `updated_at`) VALUES
(1, 'APP16', 'Đen', '16 GB', '128 GB', '#111827', 'img/products/uploads/t---i-xu---ng-1779441044.webp', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(2, 'APP16', 'Đen', '16 GB', '256 GB', '#111827', 'img/products/uploads/t---i-xu---ng-1779441044.webp', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(3, 'APP16', 'Đen', '16 GB', '64 GB', '#111827', 'img/products/uploads/t---i-xu---ng-1779441044.webp', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(4, 'APP16', 'Đen', '4 GB', '128 GB', '#111827', 'img/products/uploads/t---i-xu---ng-1779441044.webp', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(5, 'APP16', 'Đen', '4 GB', '256 GB', '#111827', 'img/products/uploads/t---i-xu---ng-1779441044.webp', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(6, 'APP16', 'Đen', '4 GB', '64 GB', '#111827', 'img/products/uploads/t---i-xu---ng-1779441044.webp', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(7, 'APP16', 'Đen', '8 GB', '128 GB', '#111827', 'img/products/uploads/t---i-xu---ng-1779441044.webp', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(8, 'APP16', 'Đen', '8 GB', '256 GB', '#111827', 'img/products/uploads/t---i-xu---ng-1779441044.webp', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(9, 'APP16', 'Đen', '8 GB', '64 GB', '#111827', 'img/products/uploads/t---i-xu---ng-1779441044.webp', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(10, 'APP16', 'Trắng', '16 GB', '128 GB', '#F8FAFC', 'img/products/uploads/t---i-xu---ng-1779441006.webp', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(11, 'APP16', 'Trắng', '16 GB', '256 GB', '#F8FAFC', 'img/products/uploads/t---i-xu---ng-1779441006.webp', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(12, 'APP16', 'Trắng', '16 GB', '64 GB', '#F8FAFC', 'img/products/uploads/t---i-xu---ng-1779441006.webp', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(13, 'APP16', 'Trắng', '4 GB', '128 GB', '#F8FAFC', 'img/products/uploads/t---i-xu---ng-1779441006.webp', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(14, 'APP16', 'Trắng', '4 GB', '256 GB', '#F8FAFC', 'img/products/uploads/t---i-xu---ng-1779441006.webp', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(15, 'APP16', 'Trắng', '4 GB', '64 GB', '#F8FAFC', 'img/products/uploads/t---i-xu---ng-1779441006.webp', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(16, 'APP16', 'Trắng', '8 GB', '128 GB', '#F8FAFC', 'img/products/uploads/t---i-xu---ng-1779441006.webp', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(17, 'APP16', 'Trắng', '8 GB', '256 GB', '#F8FAFC', 'img/products/uploads/t---i-xu---ng-1779441006.webp', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(18, 'APP16', 'Trắng', '8 GB', '64 GB', '#F8FAFC', 'img/products/uploads/t---i-xu---ng-1779441006.webp', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(19, 'APP16', 'Xanh dương', '16 GB', '128 GB', '#73A9D8', 'img/products/uploads/ip16xanhduong-1779440292.jpg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(20, 'APP16', 'Xanh dương', '16 GB', '256 GB', '#73A9D8', 'img/products/uploads/ip16xanhduong-1779440292.jpg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(21, 'APP16', 'Xanh dương', '16 GB', '64 GB', '#73A9D8', 'img/products/uploads/ip16xanhduong-1779440292.jpg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(22, 'APP16', 'Xanh dương', '4 GB', '128 GB', '#73A9D8', 'img/products/uploads/ip16xanhduong-1779440292.jpg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(23, 'APP16', 'Xanh dương', '4 GB', '256 GB', '#73A9D8', 'img/products/uploads/ip16xanhduong-1779440292.jpg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(24, 'APP16', 'Xanh dương', '4 GB', '64 GB', '#73A9D8', 'img/products/uploads/ip16xanhduong-1779440292.jpg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(25, 'APP16', 'Xanh dương', '8 GB', '128 GB', '#73A9D8', 'img/products/uploads/ip16xanhduong-1779440292.jpg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(26, 'APP16', 'Xanh dương', '8 GB', '256 GB', '#73A9D8', 'img/products/uploads/ip16xanhduong-1779440292.jpg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(27, 'APP16', 'Xanh dương', '8 GB', '64 GB', '#73A9D8', 'img/products/uploads/ip16xanhduong-1779440292.jpg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(28, 'APP17', 'Đen', '16 GB', '128 GB', '#202124', 'img/products/modern/APP17_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(29, 'APP17', 'Đen', '16 GB', '256 GB', '#202124', 'img/products/modern/APP17_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(30, 'APP17', 'Đen', '16 GB', '64 GB', '#202124', 'img/products/modern/APP17_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(31, 'APP17', 'Đen', '4 GB', '128 GB', '#202124', 'img/products/modern/APP17_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(32, 'APP17', 'Đen', '4 GB', '256 GB', '#202124', 'img/products/modern/APP17_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(33, 'APP17', 'Đen', '4 GB', '64 GB', '#202124', 'img/products/modern/APP17_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(34, 'APP17', 'Đen', '8 GB', '128 GB', '#202124', 'img/products/modern/APP17_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(35, 'APP17', 'Đen', '8 GB', '256 GB', '#202124', 'img/products/modern/APP17_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(36, 'APP17', 'Đen', '8 GB', '64 GB', '#202124', 'img/products/modern/APP17_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(37, 'APP17', 'Hồng đào', '16 GB', '128 GB', '#F6B8B8', 'img/products/modern/APP17_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(38, 'APP17', 'Hồng đào', '16 GB', '256 GB', '#F6B8B8', 'img/products/modern/APP17_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(39, 'APP17', 'Hồng đào', '16 GB', '64 GB', '#F6B8B8', 'img/products/modern/APP17_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(40, 'APP17', 'Hồng đào', '4 GB', '128 GB', '#F6B8B8', 'img/products/modern/APP17_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(41, 'APP17', 'Hồng đào', '4 GB', '256 GB', '#F6B8B8', 'img/products/modern/APP17_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(42, 'APP17', 'Hồng đào', '4 GB', '64 GB', '#F6B8B8', 'img/products/modern/APP17_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(43, 'APP17', 'Hồng đào', '8 GB', '128 GB', '#F6B8B8', 'img/products/modern/APP17_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(44, 'APP17', 'Hồng đào', '8 GB', '256 GB', '#F6B8B8', 'img/products/modern/APP17_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(45, 'APP17', 'Hồng đào', '8 GB', '64 GB', '#F6B8B8', 'img/products/modern/APP17_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(46, 'APP17', 'Xanh lưu ly', '16 GB', '128 GB', '#8DB9E8', 'img/products/modern/APP17_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(47, 'APP17', 'Xanh lưu ly', '16 GB', '256 GB', '#8DB9E8', 'img/products/modern/APP17_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(48, 'APP17', 'Xanh lưu ly', '16 GB', '64 GB', '#8DB9E8', 'img/products/modern/APP17_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(49, 'APP17', 'Xanh lưu ly', '4 GB', '128 GB', '#8DB9E8', 'img/products/modern/APP17_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(50, 'APP17', 'Xanh lưu ly', '4 GB', '256 GB', '#8DB9E8', 'img/products/modern/APP17_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(51, 'APP17', 'Xanh lưu ly', '4 GB', '64 GB', '#8DB9E8', 'img/products/modern/APP17_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(52, 'APP17', 'Xanh lưu ly', '8 GB', '128 GB', '#8DB9E8', 'img/products/modern/APP17_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(53, 'APP17', 'Xanh lưu ly', '8 GB', '256 GB', '#8DB9E8', 'img/products/modern/APP17_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(54, 'APP17', 'Xanh lưu ly', '8 GB', '64 GB', '#8DB9E8', 'img/products/modern/APP17_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(55, 'APP17P', 'Titan tự nhiên', '16 GB', '128 GB', '#B8B0A3', 'img/products/modern/APP17P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(56, 'APP17P', 'Titan tự nhiên', '16 GB', '256 GB', '#B8B0A3', 'img/products/modern/APP17P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(57, 'APP17P', 'Titan tự nhiên', '16 GB', '64 GB', '#B8B0A3', 'img/products/modern/APP17P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(58, 'APP17P', 'Titan tự nhiên', '4 GB', '128 GB', '#B8B0A3', 'img/products/modern/APP17P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(59, 'APP17P', 'Titan tự nhiên', '4 GB', '256 GB', '#B8B0A3', 'img/products/modern/APP17P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(60, 'APP17P', 'Titan tự nhiên', '4 GB', '64 GB', '#B8B0A3', 'img/products/modern/APP17P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(61, 'APP17P', 'Titan tự nhiên', '8 GB', '128 GB', '#B8B0A3', 'img/products/modern/APP17P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(62, 'APP17P', 'Titan tự nhiên', '8 GB', '256 GB', '#B8B0A3', 'img/products/modern/APP17P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(63, 'APP17P', 'Titan tự nhiên', '8 GB', '64 GB', '#B8B0A3', 'img/products/modern/APP17P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(64, 'APP17P', 'Xanh đậm', '16 GB', '128 GB', '#27384A', 'img/products/modern/APP17P_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(65, 'APP17P', 'Xanh đậm', '16 GB', '256 GB', '#27384A', 'img/products/modern/APP17P_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(66, 'APP17P', 'Xanh đậm', '16 GB', '64 GB', '#27384A', 'img/products/modern/APP17P_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(67, 'APP17P', 'Xanh đậm', '4 GB', '128 GB', '#27384A', 'img/products/modern/APP17P_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(68, 'APP17P', 'Xanh đậm', '4 GB', '256 GB', '#27384A', 'img/products/modern/APP17P_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(69, 'APP17P', 'Xanh đậm', '4 GB', '64 GB', '#27384A', 'img/products/modern/APP17P_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(70, 'APP17P', 'Xanh đậm', '8 GB', '128 GB', '#27384A', 'img/products/modern/APP17P_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(71, 'APP17P', 'Xanh đậm', '8 GB', '256 GB', '#27384A', 'img/products/modern/APP17P_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(72, 'APP17P', 'Xanh đậm', '8 GB', '64 GB', '#27384A', 'img/products/modern/APP17P_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(73, 'HMDPULSEP', 'Đen meteor', '16 GB', '128 GB', '#111827', 'img/products/modern/HMDPULSEP_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(74, 'HMDPULSEP', 'Đen meteor', '16 GB', '256 GB', '#111827', 'img/products/modern/HMDPULSEP_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(75, 'HMDPULSEP', 'Đen meteor', '16 GB', '64 GB', '#111827', 'img/products/modern/HMDPULSEP_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(76, 'HMDPULSEP', 'Đen meteor', '4 GB', '128 GB', '#111827', 'img/products/modern/HMDPULSEP_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(77, 'HMDPULSEP', 'Đen meteor', '4 GB', '256 GB', '#111827', 'img/products/modern/HMDPULSEP_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(78, 'HMDPULSEP', 'Đen meteor', '4 GB', '64 GB', '#111827', 'img/products/modern/HMDPULSEP_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(79, 'HMDPULSEP', 'Đen meteor', '8 GB', '128 GB', '#111827', 'img/products/modern/HMDPULSEP_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(80, 'HMDPULSEP', 'Đen meteor', '8 GB', '256 GB', '#111827', 'img/products/modern/HMDPULSEP_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(81, 'HMDPULSEP', 'Đen meteor', '8 GB', '64 GB', '#111827', 'img/products/modern/HMDPULSEP_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(82, 'HMDPULSEP', 'Tím twilight', '16 GB', '128 GB', '#8B5CF6', 'img/products/modern/HMDPULSEP_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(83, 'HMDPULSEP', 'Tím twilight', '16 GB', '256 GB', '#8B5CF6', 'img/products/modern/HMDPULSEP_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(84, 'HMDPULSEP', 'Tím twilight', '16 GB', '64 GB', '#8B5CF6', 'img/products/modern/HMDPULSEP_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(85, 'HMDPULSEP', 'Tím twilight', '4 GB', '128 GB', '#8B5CF6', 'img/products/modern/HMDPULSEP_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(86, 'HMDPULSEP', 'Tím twilight', '4 GB', '256 GB', '#8B5CF6', 'img/products/modern/HMDPULSEP_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(87, 'HMDPULSEP', 'Tím twilight', '4 GB', '64 GB', '#8B5CF6', 'img/products/modern/HMDPULSEP_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(88, 'HMDPULSEP', 'Tím twilight', '8 GB', '128 GB', '#8B5CF6', 'img/products/modern/HMDPULSEP_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(89, 'HMDPULSEP', 'Tím twilight', '8 GB', '256 GB', '#8B5CF6', 'img/products/modern/HMDPULSEP_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(90, 'HMDPULSEP', 'Tím twilight', '8 GB', '64 GB', '#8B5CF6', 'img/products/modern/HMDPULSEP_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(91, 'HMDXR21', 'Đen bền bỉ', '16 GB', '128 GB', '#111827', 'img/products/modern/HMDXR21_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(92, 'HMDXR21', 'Đen bền bỉ', '16 GB', '256 GB', '#111827', 'img/products/modern/HMDXR21_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(93, 'HMDXR21', 'Đen bền bỉ', '16 GB', '64 GB', '#111827', 'img/products/modern/HMDXR21_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(94, 'HMDXR21', 'Đen bền bỉ', '4 GB', '128 GB', '#111827', 'img/products/modern/HMDXR21_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(95, 'HMDXR21', 'Đen bền bỉ', '4 GB', '256 GB', '#111827', 'img/products/modern/HMDXR21_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(96, 'HMDXR21', 'Đen bền bỉ', '4 GB', '64 GB', '#111827', 'img/products/modern/HMDXR21_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(97, 'HMDXR21', 'Đen bền bỉ', '8 GB', '128 GB', '#111827', 'img/products/modern/HMDXR21_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(98, 'HMDXR21', 'Đen bền bỉ', '8 GB', '256 GB', '#111827', 'img/products/modern/HMDXR21_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(99, 'HMDXR21', 'Đen bền bỉ', '8 GB', '64 GB', '#111827', 'img/products/modern/HMDXR21_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(100, 'HMDXR21', 'Xanh midnight', '16 GB', '128 GB', '#1E3A8A', 'img/products/modern/HMDXR21_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(101, 'HMDXR21', 'Xanh midnight', '16 GB', '256 GB', '#1E3A8A', 'img/products/modern/HMDXR21_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(102, 'HMDXR21', 'Xanh midnight', '16 GB', '64 GB', '#1E3A8A', 'img/products/modern/HMDXR21_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(103, 'HMDXR21', 'Xanh midnight', '4 GB', '128 GB', '#1E3A8A', 'img/products/modern/HMDXR21_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(104, 'HMDXR21', 'Xanh midnight', '4 GB', '256 GB', '#1E3A8A', 'img/products/modern/HMDXR21_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(105, 'HMDXR21', 'Xanh midnight', '4 GB', '64 GB', '#1E3A8A', 'img/products/modern/HMDXR21_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(106, 'HMDXR21', 'Xanh midnight', '8 GB', '128 GB', '#1E3A8A', 'img/products/modern/HMDXR21_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(107, 'HMDXR21', 'Xanh midnight', '8 GB', '256 GB', '#1E3A8A', 'img/products/modern/HMDXR21_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(108, 'HMDXR21', 'Xanh midnight', '8 GB', '64 GB', '#1E3A8A', 'img/products/modern/HMDXR21_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(109, 'HWMATEX6', 'Đen obsidian', '16 GB', '128 GB', '#111827', 'img/products/modern/HWMATEX6_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(110, 'HWMATEX6', 'Đen obsidian', '16 GB', '256 GB', '#111827', 'img/products/modern/HWMATEX6_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(111, 'HWMATEX6', 'Đen obsidian', '16 GB', '64 GB', '#111827', 'img/products/modern/HWMATEX6_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(112, 'HWMATEX6', 'Đen obsidian', '4 GB', '128 GB', '#111827', 'img/products/modern/HWMATEX6_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(113, 'HWMATEX6', 'Đen obsidian', '4 GB', '256 GB', '#111827', 'img/products/modern/HWMATEX6_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(114, 'HWMATEX6', 'Đen obsidian', '4 GB', '64 GB', '#111827', 'img/products/modern/HWMATEX6_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(115, 'HWMATEX6', 'Đen obsidian', '8 GB', '128 GB', '#111827', 'img/products/modern/HWMATEX6_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(116, 'HWMATEX6', 'Đen obsidian', '8 GB', '256 GB', '#111827', 'img/products/modern/HWMATEX6_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(117, 'HWMATEX6', 'Đen obsidian', '8 GB', '64 GB', '#111827', 'img/products/modern/HWMATEX6_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(118, 'HWMATEX6', 'Đỏ vũ trụ', '16 GB', '128 GB', '#991B1B', 'img/products/modern/HWMATEX6_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(119, 'HWMATEX6', 'Đỏ vũ trụ', '16 GB', '256 GB', '#991B1B', 'img/products/modern/HWMATEX6_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(120, 'HWMATEX6', 'Đỏ vũ trụ', '16 GB', '64 GB', '#991B1B', 'img/products/modern/HWMATEX6_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(121, 'HWMATEX6', 'Đỏ vũ trụ', '4 GB', '128 GB', '#991B1B', 'img/products/modern/HWMATEX6_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(122, 'HWMATEX6', 'Đỏ vũ trụ', '4 GB', '256 GB', '#991B1B', 'img/products/modern/HWMATEX6_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(123, 'HWMATEX6', 'Đỏ vũ trụ', '4 GB', '64 GB', '#991B1B', 'img/products/modern/HWMATEX6_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(124, 'HWMATEX6', 'Đỏ vũ trụ', '8 GB', '128 GB', '#991B1B', 'img/products/modern/HWMATEX6_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(125, 'HWMATEX6', 'Đỏ vũ trụ', '8 GB', '256 GB', '#991B1B', 'img/products/modern/HWMATEX6_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(126, 'HWMATEX6', 'Đỏ vũ trụ', '8 GB', '64 GB', '#991B1B', 'img/products/modern/HWMATEX6_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(127, 'HWMATEX6', 'Xám tinh vân', '16 GB', '128 GB', '#6B7280', 'img/products/modern/HWMATEX6_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(128, 'HWMATEX6', 'Xám tinh vân', '16 GB', '256 GB', '#6B7280', 'img/products/modern/HWMATEX6_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(129, 'HWMATEX6', 'Xám tinh vân', '16 GB', '64 GB', '#6B7280', 'img/products/modern/HWMATEX6_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(130, 'HWMATEX6', 'Xám tinh vân', '4 GB', '128 GB', '#6B7280', 'img/products/modern/HWMATEX6_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(131, 'HWMATEX6', 'Xám tinh vân', '4 GB', '256 GB', '#6B7280', 'img/products/modern/HWMATEX6_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(132, 'HWMATEX6', 'Xám tinh vân', '4 GB', '64 GB', '#6B7280', 'img/products/modern/HWMATEX6_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(133, 'HWMATEX6', 'Xám tinh vân', '8 GB', '128 GB', '#6B7280', 'img/products/modern/HWMATEX6_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(134, 'HWMATEX6', 'Xám tinh vân', '8 GB', '256 GB', '#6B7280', 'img/products/modern/HWMATEX6_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(135, 'HWMATEX6', 'Xám tinh vân', '8 GB', '64 GB', '#6B7280', 'img/products/modern/HWMATEX6_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(136, 'HWPR80', 'Đen nhám', '16 GB', '128 GB', '#111827', 'img/products/modern/HWPR80_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(137, 'HWPR80', 'Đen nhám', '16 GB', '256 GB', '#111827', 'img/products/modern/HWPR80_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(138, 'HWPR80', 'Đen nhám', '16 GB', '64 GB', '#111827', 'img/products/modern/HWPR80_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(139, 'HWPR80', 'Đen nhám', '4 GB', '128 GB', '#111827', 'img/products/modern/HWPR80_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(140, 'HWPR80', 'Đen nhám', '4 GB', '256 GB', '#111827', 'img/products/modern/HWPR80_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(141, 'HWPR80', 'Đen nhám', '4 GB', '64 GB', '#111827', 'img/products/modern/HWPR80_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(142, 'HWPR80', 'Đen nhám', '8 GB', '128 GB', '#111827', 'img/products/modern/HWPR80_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(143, 'HWPR80', 'Đen nhám', '8 GB', '256 GB', '#111827', 'img/products/modern/HWPR80_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(144, 'HWPR80', 'Đen nhám', '8 GB', '64 GB', '#111827', 'img/products/modern/HWPR80_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(145, 'HWPR80', 'Trắng nhám', '16 GB', '128 GB', '#F8FAFC', 'img/products/modern/HWPR80_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(146, 'HWPR80', 'Trắng nhám', '16 GB', '256 GB', '#F8FAFC', 'img/products/modern/HWPR80_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(147, 'HWPR80', 'Trắng nhám', '16 GB', '64 GB', '#F8FAFC', 'img/products/modern/HWPR80_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(148, 'HWPR80', 'Trắng nhám', '4 GB', '128 GB', '#F8FAFC', 'img/products/modern/HWPR80_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(149, 'HWPR80', 'Trắng nhám', '4 GB', '256 GB', '#F8FAFC', 'img/products/modern/HWPR80_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(150, 'HWPR80', 'Trắng nhám', '4 GB', '64 GB', '#F8FAFC', 'img/products/modern/HWPR80_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(151, 'HWPR80', 'Trắng nhám', '8 GB', '128 GB', '#F8FAFC', 'img/products/modern/HWPR80_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(152, 'HWPR80', 'Trắng nhám', '8 GB', '256 GB', '#F8FAFC', 'img/products/modern/HWPR80_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(153, 'HWPR80', 'Trắng nhám', '8 GB', '64 GB', '#F8FAFC', 'img/products/modern/HWPR80_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(154, 'HWPR80U', 'Đen ceramic', '16 GB', '128 GB', '#0F172A', 'img/products/modern/HWPR80U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(155, 'HWPR80U', 'Đen ceramic', '16 GB', '256 GB', '#0F172A', 'img/products/modern/HWPR80U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(156, 'HWPR80U', 'Đen ceramic', '16 GB', '64 GB', '#0F172A', 'img/products/modern/HWPR80U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(157, 'HWPR80U', 'Đen ceramic', '4 GB', '128 GB', '#0F172A', 'img/products/modern/HWPR80U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(158, 'HWPR80U', 'Đen ceramic', '4 GB', '256 GB', '#0F172A', 'img/products/modern/HWPR80U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(159, 'HWPR80U', 'Đen ceramic', '4 GB', '64 GB', '#0F172A', 'img/products/modern/HWPR80U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(160, 'HWPR80U', 'Đen ceramic', '8 GB', '128 GB', '#0F172A', 'img/products/modern/HWPR80U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(161, 'HWPR80U', 'Đen ceramic', '8 GB', '256 GB', '#0F172A', 'img/products/modern/HWPR80U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(162, 'HWPR80U', 'Đen ceramic', '8 GB', '64 GB', '#0F172A', 'img/products/modern/HWPR80U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(163, 'HWPR80U', 'Vàng ánh kim', '16 GB', '128 GB', '#C9A227', 'img/products/modern/HWPR80U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(164, 'HWPR80U', 'Vàng ánh kim', '16 GB', '256 GB', '#C9A227', 'img/products/modern/HWPR80U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(165, 'HWPR80U', 'Vàng ánh kim', '16 GB', '64 GB', '#C9A227', 'img/products/modern/HWPR80U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(166, 'HWPR80U', 'Vàng ánh kim', '4 GB', '128 GB', '#C9A227', 'img/products/modern/HWPR80U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(167, 'HWPR80U', 'Vàng ánh kim', '4 GB', '256 GB', '#C9A227', 'img/products/modern/HWPR80U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(168, 'HWPR80U', 'Vàng ánh kim', '4 GB', '64 GB', '#C9A227', 'img/products/modern/HWPR80U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(169, 'HWPR80U', 'Vàng ánh kim', '8 GB', '128 GB', '#C9A227', 'img/products/modern/HWPR80U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(170, 'HWPR80U', 'Vàng ánh kim', '8 GB', '256 GB', '#C9A227', 'img/products/modern/HWPR80U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(171, 'HWPR80U', 'Vàng ánh kim', '8 GB', '64 GB', '#C9A227', 'img/products/modern/HWPR80U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(172, 'NOKIAG42', 'Hồng nhạt', '16 GB', '128 GB', '#F9A8D4', 'img/products/modern/NOKIAG42_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(173, 'NOKIAG42', 'Hồng nhạt', '16 GB', '256 GB', '#F9A8D4', 'img/products/modern/NOKIAG42_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(174, 'NOKIAG42', 'Hồng nhạt', '16 GB', '64 GB', '#F9A8D4', 'img/products/modern/NOKIAG42_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(175, 'NOKIAG42', 'Hồng nhạt', '4 GB', '128 GB', '#F9A8D4', 'img/products/modern/NOKIAG42_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(176, 'NOKIAG42', 'Hồng nhạt', '4 GB', '256 GB', '#F9A8D4', 'img/products/modern/NOKIAG42_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(177, 'NOKIAG42', 'Hồng nhạt', '4 GB', '64 GB', '#F9A8D4', 'img/products/modern/NOKIAG42_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(178, 'NOKIAG42', 'Hồng nhạt', '8 GB', '128 GB', '#F9A8D4', 'img/products/modern/NOKIAG42_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(179, 'NOKIAG42', 'Hồng nhạt', '8 GB', '256 GB', '#F9A8D4', 'img/products/modern/NOKIAG42_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(180, 'NOKIAG42', 'Hồng nhạt', '8 GB', '64 GB', '#F9A8D4', 'img/products/modern/NOKIAG42_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(181, 'NOKIAG42', 'Tím so purple', '16 GB', '128 GB', '#7C3AED', 'img/products/modern/NOKIAG42_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(182, 'NOKIAG42', 'Tím so purple', '16 GB', '256 GB', '#7C3AED', 'img/products/modern/NOKIAG42_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(183, 'NOKIAG42', 'Tím so purple', '16 GB', '64 GB', '#7C3AED', 'img/products/modern/NOKIAG42_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(184, 'NOKIAG42', 'Tím so purple', '4 GB', '128 GB', '#7C3AED', 'img/products/modern/NOKIAG42_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(185, 'NOKIAG42', 'Tím so purple', '4 GB', '256 GB', '#7C3AED', 'img/products/modern/NOKIAG42_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(186, 'NOKIAG42', 'Tím so purple', '4 GB', '64 GB', '#7C3AED', 'img/products/modern/NOKIAG42_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(187, 'NOKIAG42', 'Tím so purple', '8 GB', '128 GB', '#7C3AED', 'img/products/modern/NOKIAG42_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(188, 'NOKIAG42', 'Tím so purple', '8 GB', '256 GB', '#7C3AED', 'img/products/modern/NOKIAG42_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(189, 'NOKIAG42', 'Tím so purple', '8 GB', '64 GB', '#7C3AED', 'img/products/modern/NOKIAG42_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(190, 'OPPOA5P', 'Đen', '16 GB', '128 GB', '#111827', 'img/products/modern/OPPOA5P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(191, 'OPPOA5P', 'Đen', '16 GB', '256 GB', '#111827', 'img/products/modern/OPPOA5P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(192, 'OPPOA5P', 'Đen', '16 GB', '64 GB', '#111827', 'img/products/modern/OPPOA5P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(193, 'OPPOA5P', 'Đen', '4 GB', '128 GB', '#111827', 'img/products/modern/OPPOA5P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(194, 'OPPOA5P', 'Đen', '4 GB', '256 GB', '#111827', 'img/products/modern/OPPOA5P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(195, 'OPPOA5P', 'Đen', '4 GB', '64 GB', '#111827', 'img/products/modern/OPPOA5P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(196, 'OPPOA5P', 'Đen', '8 GB', '128 GB', '#111827', 'img/products/modern/OPPOA5P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(197, 'OPPOA5P', 'Đen', '8 GB', '256 GB', '#111827', 'img/products/modern/OPPOA5P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(198, 'OPPOA5P', 'Đen', '8 GB', '64 GB', '#111827', 'img/products/modern/OPPOA5P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(199, 'OPPOA5P', 'Tím nhạt', '16 GB', '128 GB', '#C4B5FD', 'img/products/modern/OPPOA5P_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(200, 'OPPOA5P', 'Tím nhạt', '16 GB', '256 GB', '#C4B5FD', 'img/products/modern/OPPOA5P_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(201, 'OPPOA5P', 'Tím nhạt', '16 GB', '64 GB', '#C4B5FD', 'img/products/modern/OPPOA5P_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(202, 'OPPOA5P', 'Tím nhạt', '4 GB', '128 GB', '#C4B5FD', 'img/products/modern/OPPOA5P_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(203, 'OPPOA5P', 'Tím nhạt', '4 GB', '256 GB', '#C4B5FD', 'img/products/modern/OPPOA5P_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(204, 'OPPOA5P', 'Tím nhạt', '4 GB', '64 GB', '#C4B5FD', 'img/products/modern/OPPOA5P_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(205, 'OPPOA5P', 'Tím nhạt', '8 GB', '128 GB', '#C4B5FD', 'img/products/modern/OPPOA5P_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(206, 'OPPOA5P', 'Tím nhạt', '8 GB', '256 GB', '#C4B5FD', 'img/products/modern/OPPOA5P_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(207, 'OPPOA5P', 'Tím nhạt', '8 GB', '64 GB', '#C4B5FD', 'img/products/modern/OPPOA5P_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(208, 'OPPOR15P', 'Hồng pastel', '16 GB', '128 GB', '#F7B6C2', 'img/products/modern/OPPOR15P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(209, 'OPPOR15P', 'Hồng pastel', '16 GB', '256 GB', '#F7B6C2', 'img/products/modern/OPPOR15P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(210, 'OPPOR15P', 'Hồng pastel', '16 GB', '64 GB', '#F7B6C2', 'img/products/modern/OPPOR15P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(211, 'OPPOR15P', 'Hồng pastel', '4 GB', '128 GB', '#F7B6C2', 'img/products/modern/OPPOR15P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(212, 'OPPOR15P', 'Hồng pastel', '4 GB', '256 GB', '#F7B6C2', 'img/products/modern/OPPOR15P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(213, 'OPPOR15P', 'Hồng pastel', '4 GB', '64 GB', '#F7B6C2', 'img/products/modern/OPPOR15P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(214, 'OPPOR15P', 'Hồng pastel', '8 GB', '128 GB', '#F7B6C2', 'img/products/modern/OPPOR15P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(215, 'OPPOR15P', 'Hồng pastel', '8 GB', '256 GB', '#F7B6C2', 'img/products/modern/OPPOR15P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(216, 'OPPOR15P', 'Hồng pastel', '8 GB', '64 GB', '#F7B6C2', 'img/products/modern/OPPOR15P_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(217, 'OPPOR15P', 'Xanh ngọc', '16 GB', '128 GB', '#99D8D0', 'img/products/modern/OPPOR15P_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(218, 'OPPOR15P', 'Xanh ngọc', '16 GB', '256 GB', '#99D8D0', 'img/products/modern/OPPOR15P_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(219, 'OPPOR15P', 'Xanh ngọc', '16 GB', '64 GB', '#99D8D0', 'img/products/modern/OPPOR15P_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(220, 'OPPOR15P', 'Xanh ngọc', '4 GB', '128 GB', '#99D8D0', 'img/products/modern/OPPOR15P_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(221, 'OPPOR15P', 'Xanh ngọc', '4 GB', '256 GB', '#99D8D0', 'img/products/modern/OPPOR15P_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(222, 'OPPOR15P', 'Xanh ngọc', '4 GB', '64 GB', '#99D8D0', 'img/products/modern/OPPOR15P_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(223, 'OPPOR15P', 'Xanh ngọc', '8 GB', '128 GB', '#99D8D0', 'img/products/modern/OPPOR15P_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(224, 'OPPOR15P', 'Xanh ngọc', '8 GB', '256 GB', '#99D8D0', 'img/products/modern/OPPOR15P_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(225, 'OPPOR15P', 'Xanh ngọc', '8 GB', '64 GB', '#99D8D0', 'img/products/modern/OPPOR15P_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(226, 'OPPOX9U', 'Đen vũ trụ', '16 GB', '128 GB', '#111827', 'img/products/modern/OPPOX9U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(227, 'OPPOX9U', 'Đen vũ trụ', '16 GB', '256 GB', '#111827', 'img/products/modern/OPPOX9U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(228, 'OPPOX9U', 'Đen vũ trụ', '16 GB', '64 GB', '#111827', 'img/products/modern/OPPOX9U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(229, 'OPPOX9U', 'Đen vũ trụ', '4 GB', '128 GB', '#111827', 'img/products/modern/OPPOX9U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(230, 'OPPOX9U', 'Đen vũ trụ', '4 GB', '256 GB', '#111827', 'img/products/modern/OPPOX9U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(231, 'OPPOX9U', 'Đen vũ trụ', '4 GB', '64 GB', '#111827', 'img/products/modern/OPPOX9U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(232, 'OPPOX9U', 'Đen vũ trụ', '8 GB', '128 GB', '#111827', 'img/products/modern/OPPOX9U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(233, 'OPPOX9U', 'Đen vũ trụ', '8 GB', '256 GB', '#111827', 'img/products/modern/OPPOX9U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(234, 'OPPOX9U', 'Đen vũ trụ', '8 GB', '64 GB', '#111827', 'img/products/modern/OPPOX9U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(235, 'OPPOX9U', 'Trắng ngọc', '16 GB', '128 GB', '#F6F7F9', 'img/products/modern/OPPOX9U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(236, 'OPPOX9U', 'Trắng ngọc', '16 GB', '256 GB', '#F6F7F9', 'img/products/modern/OPPOX9U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(237, 'OPPOX9U', 'Trắng ngọc', '16 GB', '64 GB', '#F6F7F9', 'img/products/modern/OPPOX9U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(238, 'OPPOX9U', 'Trắng ngọc', '4 GB', '128 GB', '#F6F7F9', 'img/products/modern/OPPOX9U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(239, 'OPPOX9U', 'Trắng ngọc', '4 GB', '256 GB', '#F6F7F9', 'img/products/modern/OPPOX9U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(240, 'OPPOX9U', 'Trắng ngọc', '4 GB', '64 GB', '#F6F7F9', 'img/products/modern/OPPOX9U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(241, 'OPPOX9U', 'Trắng ngọc', '8 GB', '128 GB', '#F6F7F9', 'img/products/modern/OPPOX9U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(242, 'OPPOX9U', 'Trắng ngọc', '8 GB', '256 GB', '#F6F7F9', 'img/products/modern/OPPOX9U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(243, 'OPPOX9U', 'Trắng ngọc', '8 GB', '64 GB', '#F6F7F9', 'img/products/modern/OPPOX9U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(244, 'REALMEC75', 'Đen bão tố', '16 GB', '128 GB', '#1F2937', 'img/products/modern/REALMEC75_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(245, 'REALMEC75', 'Đen bão tố', '16 GB', '256 GB', '#1F2937', 'img/products/modern/REALMEC75_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(246, 'REALMEC75', 'Đen bão tố', '16 GB', '64 GB', '#1F2937', 'img/products/modern/REALMEC75_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(247, 'REALMEC75', 'Đen bão tố', '4 GB', '128 GB', '#1F2937', 'img/products/modern/REALMEC75_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(248, 'REALMEC75', 'Đen bão tố', '4 GB', '256 GB', '#1F2937', 'img/products/modern/REALMEC75_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(249, 'REALMEC75', 'Đen bão tố', '4 GB', '64 GB', '#1F2937', 'img/products/modern/REALMEC75_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(250, 'REALMEC75', 'Đen bão tố', '8 GB', '128 GB', '#1F2937', 'img/products/modern/REALMEC75_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(251, 'REALMEC75', 'Đen bão tố', '8 GB', '256 GB', '#1F2937', 'img/products/modern/REALMEC75_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(252, 'REALMEC75', 'Đen bão tố', '8 GB', '64 GB', '#1F2937', 'img/products/modern/REALMEC75_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(253, 'REALMEC75', 'Xanh lá', '16 GB', '128 GB', '#65A30D', 'img/products/modern/REALMEC75_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(254, 'REALMEC75', 'Xanh lá', '16 GB', '256 GB', '#65A30D', 'img/products/modern/REALMEC75_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(255, 'REALMEC75', 'Xanh lá', '16 GB', '64 GB', '#65A30D', 'img/products/modern/REALMEC75_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(256, 'REALMEC75', 'Xanh lá', '4 GB', '128 GB', '#65A30D', 'img/products/modern/REALMEC75_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(257, 'REALMEC75', 'Xanh lá', '4 GB', '256 GB', '#65A30D', 'img/products/modern/REALMEC75_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(258, 'REALMEC75', 'Xanh lá', '4 GB', '64 GB', '#65A30D', 'img/products/modern/REALMEC75_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(259, 'REALMEC75', 'Xanh lá', '8 GB', '128 GB', '#65A30D', 'img/products/modern/REALMEC75_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(260, 'REALMEC75', 'Xanh lá', '8 GB', '256 GB', '#65A30D', 'img/products/modern/REALMEC75_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(261, 'REALMEC75', 'Xanh lá', '8 GB', '64 GB', '#65A30D', 'img/products/modern/REALMEC75_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(262, 'REALMEGT8', 'Bạc tốc độ', '16 GB', '128 GB', '#D1D5DB', 'img/products/modern/REALMEGT8_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(263, 'REALMEGT8', 'Bạc tốc độ', '16 GB', '256 GB', '#D1D5DB', 'img/products/modern/REALMEGT8_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(264, 'REALMEGT8', 'Bạc tốc độ', '16 GB', '64 GB', '#D1D5DB', 'img/products/modern/REALMEGT8_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(265, 'REALMEGT8', 'Bạc tốc độ', '4 GB', '128 GB', '#D1D5DB', 'img/products/modern/REALMEGT8_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(266, 'REALMEGT8', 'Bạc tốc độ', '4 GB', '256 GB', '#D1D5DB', 'img/products/modern/REALMEGT8_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(267, 'REALMEGT8', 'Bạc tốc độ', '4 GB', '64 GB', '#D1D5DB', 'img/products/modern/REALMEGT8_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(268, 'REALMEGT8', 'Bạc tốc độ', '8 GB', '128 GB', '#D1D5DB', 'img/products/modern/REALMEGT8_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(269, 'REALMEGT8', 'Bạc tốc độ', '8 GB', '256 GB', '#D1D5DB', 'img/products/modern/REALMEGT8_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(270, 'REALMEGT8', 'Bạc tốc độ', '8 GB', '64 GB', '#D1D5DB', 'img/products/modern/REALMEGT8_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(271, 'REALMEGT8', 'Cam racing', '16 GB', '128 GB', '#F97316', 'img/products/modern/REALMEGT8_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(272, 'REALMEGT8', 'Cam racing', '16 GB', '256 GB', '#F97316', 'img/products/modern/REALMEGT8_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(273, 'REALMEGT8', 'Cam racing', '16 GB', '64 GB', '#F97316', 'img/products/modern/REALMEGT8_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(274, 'REALMEGT8', 'Cam racing', '4 GB', '128 GB', '#F97316', 'img/products/modern/REALMEGT8_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(275, 'REALMEGT8', 'Cam racing', '4 GB', '256 GB', '#F97316', 'img/products/modern/REALMEGT8_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(276, 'REALMEGT8', 'Cam racing', '4 GB', '64 GB', '#F97316', 'img/products/modern/REALMEGT8_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(277, 'REALMEGT8', 'Cam racing', '8 GB', '128 GB', '#F97316', 'img/products/modern/REALMEGT8_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(278, 'REALMEGT8', 'Cam racing', '8 GB', '256 GB', '#F97316', 'img/products/modern/REALMEGT8_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(279, 'REALMEGT8', 'Cam racing', '8 GB', '64 GB', '#F97316', 'img/products/modern/REALMEGT8_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(280, 'REALMEGT8', 'Đen carbon', '16 GB', '128 GB', '#171717', 'img/products/modern/REALMEGT8_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(281, 'REALMEGT8', 'Đen carbon', '16 GB', '256 GB', '#171717', 'img/products/modern/REALMEGT8_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(282, 'REALMEGT8', 'Đen carbon', '16 GB', '64 GB', '#171717', 'img/products/modern/REALMEGT8_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(283, 'REALMEGT8', 'Đen carbon', '4 GB', '128 GB', '#171717', 'img/products/modern/REALMEGT8_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(284, 'REALMEGT8', 'Đen carbon', '4 GB', '256 GB', '#171717', 'img/products/modern/REALMEGT8_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(285, 'REALMEGT8', 'Đen carbon', '4 GB', '64 GB', '#171717', 'img/products/modern/REALMEGT8_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(286, 'REALMEGT8', 'Đen carbon', '8 GB', '128 GB', '#171717', 'img/products/modern/REALMEGT8_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(287, 'REALMEGT8', 'Đen carbon', '8 GB', '256 GB', '#171717', 'img/products/modern/REALMEGT8_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(288, 'REALMEGT8', 'Đen carbon', '8 GB', '64 GB', '#171717', 'img/products/modern/REALMEGT8_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(289, 'REDMI15', 'Đen midnight', '16 GB', '128 GB', '#0F172A', 'img/products/modern/REDMI15_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(290, 'REDMI15', 'Đen midnight', '16 GB', '256 GB', '#0F172A', 'img/products/modern/REDMI15_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(291, 'REDMI15', 'Đen midnight', '16 GB', '64 GB', '#0F172A', 'img/products/modern/REDMI15_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(292, 'REDMI15', 'Đen midnight', '4 GB', '128 GB', '#0F172A', 'img/products/modern/REDMI15_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(293, 'REDMI15', 'Đen midnight', '4 GB', '256 GB', '#0F172A', 'img/products/modern/REDMI15_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(294, 'REDMI15', 'Đen midnight', '4 GB', '64 GB', '#0F172A', 'img/products/modern/REDMI15_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(295, 'REDMI15', 'Đen midnight', '8 GB', '128 GB', '#0F172A', 'img/products/modern/REDMI15_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(296, 'REDMI15', 'Đen midnight', '8 GB', '256 GB', '#0F172A', 'img/products/modern/REDMI15_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(297, 'REDMI15', 'Đen midnight', '8 GB', '64 GB', '#0F172A', 'img/products/modern/REDMI15_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(298, 'REDMI15', 'Tím nhạt', '16 GB', '128 GB', '#C4B5FD', 'img/products/modern/REDMI15_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(299, 'REDMI15', 'Tím nhạt', '16 GB', '256 GB', '#C4B5FD', 'img/products/modern/REDMI15_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(300, 'REDMI15', 'Tím nhạt', '16 GB', '64 GB', '#C4B5FD', 'img/products/modern/REDMI15_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(301, 'REDMI15', 'Tím nhạt', '4 GB', '128 GB', '#C4B5FD', 'img/products/modern/REDMI15_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(302, 'REDMI15', 'Tím nhạt', '4 GB', '256 GB', '#C4B5FD', 'img/products/modern/REDMI15_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(303, 'REDMI15', 'Tím nhạt', '4 GB', '64 GB', '#C4B5FD', 'img/products/modern/REDMI15_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(304, 'REDMI15', 'Tím nhạt', '8 GB', '128 GB', '#C4B5FD', 'img/products/modern/REDMI15_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(305, 'REDMI15', 'Tím nhạt', '8 GB', '256 GB', '#C4B5FD', 'img/products/modern/REDMI15_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(306, 'REDMI15', 'Tím nhạt', '8 GB', '64 GB', '#C4B5FD', 'img/products/modern/REDMI15_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(307, 'REDMI15', 'Xanh lá', '16 GB', '128 GB', '#74C69D', 'img/products/modern/REDMI15_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(308, 'REDMI15', 'Xanh lá', '16 GB', '256 GB', '#74C69D', 'img/products/modern/REDMI15_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(309, 'REDMI15', 'Xanh lá', '16 GB', '64 GB', '#74C69D', 'img/products/modern/REDMI15_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(310, 'REDMI15', 'Xanh lá', '4 GB', '128 GB', '#74C69D', 'img/products/modern/REDMI15_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(311, 'REDMI15', 'Xanh lá', '4 GB', '256 GB', '#74C69D', 'img/products/modern/REDMI15_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(312, 'REDMI15', 'Xanh lá', '4 GB', '64 GB', '#74C69D', 'img/products/modern/REDMI15_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(313, 'REDMI15', 'Xanh lá', '8 GB', '128 GB', '#74C69D', 'img/products/modern/REDMI15_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(314, 'REDMI15', 'Xanh lá', '8 GB', '256 GB', '#74C69D', 'img/products/modern/REDMI15_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(315, 'REDMI15', 'Xanh lá', '8 GB', '64 GB', '#74C69D', 'img/products/modern/REDMI15_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(316, 'REDMI15P5G', 'Đen', '16 GB', '128 GB', '#101828', 'img/products/modern/REDMI15P5G_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(317, 'REDMI15P5G', 'Đen', '16 GB', '256 GB', '#101828', 'img/products/modern/REDMI15P5G_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(318, 'REDMI15P5G', 'Đen', '16 GB', '64 GB', '#101828', 'img/products/modern/REDMI15P5G_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(319, 'REDMI15P5G', 'Đen', '4 GB', '128 GB', '#101828', 'img/products/modern/REDMI15P5G_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(320, 'REDMI15P5G', 'Đen', '4 GB', '256 GB', '#101828', 'img/products/modern/REDMI15P5G_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(321, 'REDMI15P5G', 'Đen', '4 GB', '64 GB', '#101828', 'img/products/modern/REDMI15P5G_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(322, 'REDMI15P5G', 'Đen', '8 GB', '128 GB', '#101828', 'img/products/modern/REDMI15P5G_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(323, 'REDMI15P5G', 'Đen', '8 GB', '256 GB', '#101828', 'img/products/modern/REDMI15P5G_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(324, 'REDMI15P5G', 'Đen', '8 GB', '64 GB', '#101828', 'img/products/modern/REDMI15P5G_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(325, 'REDMI15P5G', 'Tím khói', '16 GB', '128 GB', '#8B7ED8', 'img/products/modern/REDMI15P5G_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(326, 'REDMI15P5G', 'Tím khói', '16 GB', '256 GB', '#8B7ED8', 'img/products/modern/REDMI15P5G_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(327, 'REDMI15P5G', 'Tím khói', '16 GB', '64 GB', '#8B7ED8', 'img/products/modern/REDMI15P5G_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(328, 'REDMI15P5G', 'Tím khói', '4 GB', '128 GB', '#8B7ED8', 'img/products/modern/REDMI15P5G_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(329, 'REDMI15P5G', 'Tím khói', '4 GB', '256 GB', '#8B7ED8', 'img/products/modern/REDMI15P5G_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(330, 'REDMI15P5G', 'Tím khói', '4 GB', '64 GB', '#8B7ED8', 'img/products/modern/REDMI15P5G_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(331, 'REDMI15P5G', 'Tím khói', '8 GB', '128 GB', '#8B7ED8', 'img/products/modern/REDMI15P5G_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(332, 'REDMI15P5G', 'Tím khói', '8 GB', '256 GB', '#8B7ED8', 'img/products/modern/REDMI15P5G_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(333, 'REDMI15P5G', 'Tím khói', '8 GB', '64 GB', '#8B7ED8', 'img/products/modern/REDMI15P5G_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(334, 'REDMI15P5G', 'Xám titan', '16 GB', '128 GB', '#8A8D91', 'img/products/modern/REDMI15P5G_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(335, 'REDMI15P5G', 'Xám titan', '16 GB', '256 GB', '#8A8D91', 'img/products/modern/REDMI15P5G_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(336, 'REDMI15P5G', 'Xám titan', '16 GB', '64 GB', '#8A8D91', 'img/products/modern/REDMI15P5G_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(337, 'REDMI15P5G', 'Xám titan', '4 GB', '128 GB', '#8A8D91', 'img/products/modern/REDMI15P5G_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(338, 'REDMI15P5G', 'Xám titan', '4 GB', '256 GB', '#8A8D91', 'img/products/modern/REDMI15P5G_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(339, 'REDMI15P5G', 'Xám titan', '4 GB', '64 GB', '#8A8D91', 'img/products/modern/REDMI15P5G_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(340, 'REDMI15P5G', 'Xám titan', '8 GB', '128 GB', '#8A8D91', 'img/products/modern/REDMI15P5G_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(341, 'REDMI15P5G', 'Xám titan', '8 GB', '256 GB', '#8A8D91', 'img/products/modern/REDMI15P5G_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07');
INSERT INTO `product_variants` (`variant_id`, `masp`, `ten_mau`, `ram`, `rom`, `ma_mau_hex`, `hinh_anh`, `so_luong_ton`, `created_at`, `updated_at`) VALUES
(342, 'REDMI15P5G', 'Xám titan', '8 GB', '64 GB', '#8A8D91', 'img/products/modern/REDMI15P5G_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(343, 'SAMA37', 'Bạc', '16 GB', '128 GB', '#D1D5DB', 'img/products/modern/SAMA37_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(344, 'SAMA37', 'Bạc', '16 GB', '256 GB', '#D1D5DB', 'img/products/modern/SAMA37_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(345, 'SAMA37', 'Bạc', '16 GB', '64 GB', '#D1D5DB', 'img/products/modern/SAMA37_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(346, 'SAMA37', 'Bạc', '4 GB', '128 GB', '#D1D5DB', 'img/products/modern/SAMA37_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(347, 'SAMA37', 'Bạc', '4 GB', '256 GB', '#D1D5DB', 'img/products/modern/SAMA37_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(348, 'SAMA37', 'Bạc', '4 GB', '64 GB', '#D1D5DB', 'img/products/modern/SAMA37_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(349, 'SAMA37', 'Bạc', '8 GB', '128 GB', '#D1D5DB', 'img/products/modern/SAMA37_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(350, 'SAMA37', 'Bạc', '8 GB', '256 GB', '#D1D5DB', 'img/products/modern/SAMA37_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(351, 'SAMA37', 'Bạc', '8 GB', '64 GB', '#D1D5DB', 'img/products/modern/SAMA37_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(352, 'SAMA37', 'Đen', '16 GB', '128 GB', '#111827', 'img/products/modern/SAMA37_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(353, 'SAMA37', 'Đen', '16 GB', '256 GB', '#111827', 'img/products/modern/SAMA37_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(354, 'SAMA37', 'Đen', '16 GB', '64 GB', '#111827', 'img/products/modern/SAMA37_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(355, 'SAMA37', 'Đen', '4 GB', '128 GB', '#111827', 'img/products/modern/SAMA37_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(356, 'SAMA37', 'Đen', '4 GB', '256 GB', '#111827', 'img/products/modern/SAMA37_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(357, 'SAMA37', 'Đen', '4 GB', '64 GB', '#111827', 'img/products/modern/SAMA37_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(358, 'SAMA37', 'Đen', '8 GB', '128 GB', '#111827', 'img/products/modern/SAMA37_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(359, 'SAMA37', 'Đen', '8 GB', '256 GB', '#111827', 'img/products/modern/SAMA37_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(360, 'SAMA37', 'Đen', '8 GB', '64 GB', '#111827', 'img/products/modern/SAMA37_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(361, 'SAMA37', 'Xanh băng', '16 GB', '128 GB', '#BFE3F8', 'img/products/modern/SAMA37_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(362, 'SAMA37', 'Xanh băng', '16 GB', '256 GB', '#BFE3F8', 'img/products/modern/SAMA37_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(363, 'SAMA37', 'Xanh băng', '16 GB', '64 GB', '#BFE3F8', 'img/products/modern/SAMA37_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(364, 'SAMA37', 'Xanh băng', '4 GB', '128 GB', '#BFE3F8', 'img/products/modern/SAMA37_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(365, 'SAMA37', 'Xanh băng', '4 GB', '256 GB', '#BFE3F8', 'img/products/modern/SAMA37_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(366, 'SAMA37', 'Xanh băng', '4 GB', '64 GB', '#BFE3F8', 'img/products/modern/SAMA37_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(367, 'SAMA37', 'Xanh băng', '8 GB', '128 GB', '#BFE3F8', 'img/products/modern/SAMA37_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(368, 'SAMA37', 'Xanh băng', '8 GB', '256 GB', '#BFE3F8', 'img/products/modern/SAMA37_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(369, 'SAMA37', 'Xanh băng', '8 GB', '64 GB', '#BFE3F8', 'img/products/modern/SAMA37_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(370, 'SAMA57', 'Đen', '16 GB', '128 GB', '#1F2937', 'img/products/modern/SAMA57_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(371, 'SAMA57', 'Đen', '16 GB', '256 GB', '#1F2937', 'img/products/modern/SAMA57_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(372, 'SAMA57', 'Đen', '16 GB', '64 GB', '#1F2937', 'img/products/modern/SAMA57_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(373, 'SAMA57', 'Đen', '4 GB', '128 GB', '#1F2937', 'img/products/modern/SAMA57_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(374, 'SAMA57', 'Đen', '4 GB', '256 GB', '#1F2937', 'img/products/modern/SAMA57_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(375, 'SAMA57', 'Đen', '4 GB', '64 GB', '#1F2937', 'img/products/modern/SAMA57_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(376, 'SAMA57', 'Đen', '8 GB', '128 GB', '#1F2937', 'img/products/modern/SAMA57_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(377, 'SAMA57', 'Đen', '8 GB', '256 GB', '#1F2937', 'img/products/modern/SAMA57_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(378, 'SAMA57', 'Đen', '8 GB', '64 GB', '#1F2937', 'img/products/modern/SAMA57_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(379, 'SAMA57', 'Tím lavender', '16 GB', '128 GB', '#B9A7E8', 'img/products/modern/SAMA57_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(380, 'SAMA57', 'Tím lavender', '16 GB', '256 GB', '#B9A7E8', 'img/products/modern/SAMA57_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(381, 'SAMA57', 'Tím lavender', '16 GB', '64 GB', '#B9A7E8', 'img/products/modern/SAMA57_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(382, 'SAMA57', 'Tím lavender', '4 GB', '128 GB', '#B9A7E8', 'img/products/modern/SAMA57_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(383, 'SAMA57', 'Tím lavender', '4 GB', '256 GB', '#B9A7E8', 'img/products/modern/SAMA57_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(384, 'SAMA57', 'Tím lavender', '4 GB', '64 GB', '#B9A7E8', 'img/products/modern/SAMA57_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(385, 'SAMA57', 'Tím lavender', '8 GB', '128 GB', '#B9A7E8', 'img/products/modern/SAMA57_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(386, 'SAMA57', 'Tím lavender', '8 GB', '256 GB', '#B9A7E8', 'img/products/modern/SAMA57_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(387, 'SAMA57', 'Tím lavender', '8 GB', '64 GB', '#B9A7E8', 'img/products/modern/SAMA57_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(388, 'SAMA57', 'Xanh mint', '16 GB', '128 GB', '#A7E8C6', 'img/products/modern/SAMA57_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(389, 'SAMA57', 'Xanh mint', '16 GB', '256 GB', '#A7E8C6', 'img/products/modern/SAMA57_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(390, 'SAMA57', 'Xanh mint', '16 GB', '64 GB', '#A7E8C6', 'img/products/modern/SAMA57_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(391, 'SAMA57', 'Xanh mint', '4 GB', '128 GB', '#A7E8C6', 'img/products/modern/SAMA57_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(392, 'SAMA57', 'Xanh mint', '4 GB', '256 GB', '#A7E8C6', 'img/products/modern/SAMA57_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(393, 'SAMA57', 'Xanh mint', '4 GB', '64 GB', '#A7E8C6', 'img/products/modern/SAMA57_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(394, 'SAMA57', 'Xanh mint', '8 GB', '128 GB', '#A7E8C6', 'img/products/modern/SAMA57_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(395, 'SAMA57', 'Xanh mint', '8 GB', '256 GB', '#A7E8C6', 'img/products/modern/SAMA57_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(396, 'SAMA57', 'Xanh mint', '8 GB', '64 GB', '#A7E8C6', 'img/products/modern/SAMA57_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(397, 'SAMS26U', 'Đen phantom', '16 GB', '128 GB', '#111827', 'img/products/modern/SAMS26U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(398, 'SAMS26U', 'Đen phantom', '16 GB', '256 GB', '#111827', 'img/products/modern/SAMS26U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(399, 'SAMS26U', 'Đen phantom', '16 GB', '64 GB', '#111827', 'img/products/modern/SAMS26U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(400, 'SAMS26U', 'Đen phantom', '4 GB', '128 GB', '#111827', 'img/products/modern/SAMS26U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(401, 'SAMS26U', 'Đen phantom', '4 GB', '256 GB', '#111827', 'img/products/modern/SAMS26U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(402, 'SAMS26U', 'Đen phantom', '4 GB', '64 GB', '#111827', 'img/products/modern/SAMS26U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(403, 'SAMS26U', 'Đen phantom', '8 GB', '128 GB', '#111827', 'img/products/modern/SAMS26U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(404, 'SAMS26U', 'Đen phantom', '8 GB', '256 GB', '#111827', 'img/products/modern/SAMS26U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(405, 'SAMS26U', 'Đen phantom', '8 GB', '64 GB', '#111827', 'img/products/modern/SAMS26U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(406, 'SAMS26U', 'Xám titan', '16 GB', '128 GB', '#8A8D91', 'img/products/modern/SAMS26U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(407, 'SAMS26U', 'Xám titan', '16 GB', '256 GB', '#8A8D91', 'img/products/modern/SAMS26U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(408, 'SAMS26U', 'Xám titan', '16 GB', '64 GB', '#8A8D91', 'img/products/modern/SAMS26U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(409, 'SAMS26U', 'Xám titan', '4 GB', '128 GB', '#8A8D91', 'img/products/modern/SAMS26U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(410, 'SAMS26U', 'Xám titan', '4 GB', '256 GB', '#8A8D91', 'img/products/modern/SAMS26U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(411, 'SAMS26U', 'Xám titan', '4 GB', '64 GB', '#8A8D91', 'img/products/modern/SAMS26U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(412, 'SAMS26U', 'Xám titan', '8 GB', '128 GB', '#8A8D91', 'img/products/modern/SAMS26U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(413, 'SAMS26U', 'Xám titan', '8 GB', '256 GB', '#8A8D91', 'img/products/modern/SAMS26U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(414, 'SAMS26U', 'Xám titan', '8 GB', '64 GB', '#8A8D91', 'img/products/modern/SAMS26U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(415, 'SAMS26U', 'Xanh navy', '16 GB', '128 GB', '#1E3A5F', 'img/products/modern/SAMS26U_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(416, 'SAMS26U', 'Xanh navy', '16 GB', '256 GB', '#1E3A5F', 'img/products/modern/SAMS26U_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(417, 'SAMS26U', 'Xanh navy', '16 GB', '64 GB', '#1E3A5F', 'img/products/modern/SAMS26U_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(418, 'SAMS26U', 'Xanh navy', '4 GB', '128 GB', '#1E3A5F', 'img/products/modern/SAMS26U_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(419, 'SAMS26U', 'Xanh navy', '4 GB', '256 GB', '#1E3A5F', 'img/products/modern/SAMS26U_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(420, 'SAMS26U', 'Xanh navy', '4 GB', '64 GB', '#1E3A5F', 'img/products/modern/SAMS26U_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(421, 'SAMS26U', 'Xanh navy', '8 GB', '128 GB', '#1E3A5F', 'img/products/modern/SAMS26U_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(422, 'SAMS26U', 'Xanh navy', '8 GB', '256 GB', '#1E3A5F', 'img/products/modern/SAMS26U_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(423, 'SAMS26U', 'Xanh navy', '8 GB', '64 GB', '#1E3A5F', 'img/products/modern/SAMS26U_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(424, 'VIVOX300', 'Đen sao đêm', '16 GB', '128 GB', '#0B1020', 'img/products/modern/VIVOX300_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(425, 'VIVOX300', 'Đen sao đêm', '16 GB', '256 GB', '#0B1020', 'img/products/modern/VIVOX300_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(426, 'VIVOX300', 'Đen sao đêm', '16 GB', '64 GB', '#0B1020', 'img/products/modern/VIVOX300_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(427, 'VIVOX300', 'Đen sao đêm', '4 GB', '128 GB', '#0B1020', 'img/products/modern/VIVOX300_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(428, 'VIVOX300', 'Đen sao đêm', '4 GB', '256 GB', '#0B1020', 'img/products/modern/VIVOX300_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(429, 'VIVOX300', 'Đen sao đêm', '4 GB', '64 GB', '#0B1020', 'img/products/modern/VIVOX300_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(430, 'VIVOX300', 'Đen sao đêm', '8 GB', '128 GB', '#0B1020', 'img/products/modern/VIVOX300_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(431, 'VIVOX300', 'Đen sao đêm', '8 GB', '256 GB', '#0B1020', 'img/products/modern/VIVOX300_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(432, 'VIVOX300', 'Đen sao đêm', '8 GB', '64 GB', '#0B1020', 'img/products/modern/VIVOX300_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(433, 'VIVOX300', 'Trắng ánh ngọc', '16 GB', '128 GB', '#F1F5F9', 'img/products/modern/VIVOX300_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(434, 'VIVOX300', 'Trắng ánh ngọc', '16 GB', '256 GB', '#F1F5F9', 'img/products/modern/VIVOX300_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(435, 'VIVOX300', 'Trắng ánh ngọc', '16 GB', '64 GB', '#F1F5F9', 'img/products/modern/VIVOX300_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(436, 'VIVOX300', 'Trắng ánh ngọc', '4 GB', '128 GB', '#F1F5F9', 'img/products/modern/VIVOX300_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(437, 'VIVOX300', 'Trắng ánh ngọc', '4 GB', '256 GB', '#F1F5F9', 'img/products/modern/VIVOX300_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(438, 'VIVOX300', 'Trắng ánh ngọc', '4 GB', '64 GB', '#F1F5F9', 'img/products/modern/VIVOX300_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(439, 'VIVOX300', 'Trắng ánh ngọc', '8 GB', '128 GB', '#F1F5F9', 'img/products/modern/VIVOX300_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(440, 'VIVOX300', 'Trắng ánh ngọc', '8 GB', '256 GB', '#F1F5F9', 'img/products/modern/VIVOX300_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(441, 'VIVOX300', 'Trắng ánh ngọc', '8 GB', '64 GB', '#F1F5F9', 'img/products/modern/VIVOX300_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(442, 'VIVOX300', 'Xanh trời', '16 GB', '128 GB', '#8EC5FC', 'img/products/modern/VIVOX300_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(443, 'VIVOX300', 'Xanh trời', '16 GB', '256 GB', '#8EC5FC', 'img/products/modern/VIVOX300_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(444, 'VIVOX300', 'Xanh trời', '16 GB', '64 GB', '#8EC5FC', 'img/products/modern/VIVOX300_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(445, 'VIVOX300', 'Xanh trời', '4 GB', '128 GB', '#8EC5FC', 'img/products/modern/VIVOX300_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(446, 'VIVOX300', 'Xanh trời', '4 GB', '256 GB', '#8EC5FC', 'img/products/modern/VIVOX300_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(447, 'VIVOX300', 'Xanh trời', '4 GB', '64 GB', '#8EC5FC', 'img/products/modern/VIVOX300_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(448, 'VIVOX300', 'Xanh trời', '8 GB', '128 GB', '#8EC5FC', 'img/products/modern/VIVOX300_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(449, 'VIVOX300', 'Xanh trời', '8 GB', '256 GB', '#8EC5FC', 'img/products/modern/VIVOX300_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(450, 'VIVOX300', 'Xanh trời', '8 GB', '64 GB', '#8EC5FC', 'img/products/modern/VIVOX300_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(451, 'VIVOY39', 'Đen', '16 GB', '128 GB', '#111827', 'img/products/modern/VIVOY39_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(452, 'VIVOY39', 'Đen', '16 GB', '256 GB', '#111827', 'img/products/modern/VIVOY39_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(453, 'VIVOY39', 'Đen', '16 GB', '64 GB', '#111827', 'img/products/modern/VIVOY39_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(454, 'VIVOY39', 'Đen', '4 GB', '128 GB', '#111827', 'img/products/modern/VIVOY39_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(455, 'VIVOY39', 'Đen', '4 GB', '256 GB', '#111827', 'img/products/modern/VIVOY39_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(456, 'VIVOY39', 'Đen', '4 GB', '64 GB', '#111827', 'img/products/modern/VIVOY39_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(457, 'VIVOY39', 'Đen', '8 GB', '128 GB', '#111827', 'img/products/modern/VIVOY39_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(458, 'VIVOY39', 'Đen', '8 GB', '256 GB', '#111827', 'img/products/modern/VIVOY39_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(459, 'VIVOY39', 'Đen', '8 GB', '64 GB', '#111827', 'img/products/modern/VIVOY39_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(460, 'VIVOY39', 'Tím ánh sao', '16 GB', '128 GB', '#A78BFA', 'img/products/modern/VIVOY39_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(461, 'VIVOY39', 'Tím ánh sao', '16 GB', '256 GB', '#A78BFA', 'img/products/modern/VIVOY39_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(462, 'VIVOY39', 'Tím ánh sao', '16 GB', '64 GB', '#A78BFA', 'img/products/modern/VIVOY39_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(463, 'VIVOY39', 'Tím ánh sao', '4 GB', '128 GB', '#A78BFA', 'img/products/modern/VIVOY39_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(464, 'VIVOY39', 'Tím ánh sao', '4 GB', '256 GB', '#A78BFA', 'img/products/modern/VIVOY39_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(465, 'VIVOY39', 'Tím ánh sao', '4 GB', '64 GB', '#A78BFA', 'img/products/modern/VIVOY39_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(466, 'VIVOY39', 'Tím ánh sao', '8 GB', '128 GB', '#A78BFA', 'img/products/modern/VIVOY39_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(467, 'VIVOY39', 'Tím ánh sao', '8 GB', '256 GB', '#A78BFA', 'img/products/modern/VIVOY39_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(468, 'VIVOY39', 'Tím ánh sao', '8 GB', '64 GB', '#A78BFA', 'img/products/modern/VIVOY39_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(469, 'VIVOY39', 'Xanh ngọc', '16 GB', '128 GB', '#5EEAD4', 'img/products/modern/VIVOY39_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(470, 'VIVOY39', 'Xanh ngọc', '16 GB', '256 GB', '#5EEAD4', 'img/products/modern/VIVOY39_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(471, 'VIVOY39', 'Xanh ngọc', '16 GB', '64 GB', '#5EEAD4', 'img/products/modern/VIVOY39_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(472, 'VIVOY39', 'Xanh ngọc', '4 GB', '128 GB', '#5EEAD4', 'img/products/modern/VIVOY39_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(473, 'VIVOY39', 'Xanh ngọc', '4 GB', '256 GB', '#5EEAD4', 'img/products/modern/VIVOY39_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(474, 'VIVOY39', 'Xanh ngọc', '4 GB', '64 GB', '#5EEAD4', 'img/products/modern/VIVOY39_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(475, 'VIVOY39', 'Xanh ngọc', '8 GB', '128 GB', '#5EEAD4', 'img/products/modern/VIVOY39_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(476, 'VIVOY39', 'Xanh ngọc', '8 GB', '256 GB', '#5EEAD4', 'img/products/modern/VIVOY39_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(477, 'VIVOY39', 'Xanh ngọc', '8 GB', '64 GB', '#5EEAD4', 'img/products/modern/VIVOY39_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(478, 'XIA15U', 'Bạc titan', '16 GB', '128 GB', '#C0C5CC', 'img/products/modern/XIA15U_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(479, 'XIA15U', 'Bạc titan', '16 GB', '256 GB', '#C0C5CC', 'img/products/modern/XIA15U_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(480, 'XIA15U', 'Bạc titan', '16 GB', '64 GB', '#C0C5CC', 'img/products/modern/XIA15U_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(481, 'XIA15U', 'Bạc titan', '4 GB', '128 GB', '#C0C5CC', 'img/products/modern/XIA15U_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(482, 'XIA15U', 'Bạc titan', '4 GB', '256 GB', '#C0C5CC', 'img/products/modern/XIA15U_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(483, 'XIA15U', 'Bạc titan', '4 GB', '64 GB', '#C0C5CC', 'img/products/modern/XIA15U_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(484, 'XIA15U', 'Bạc titan', '8 GB', '128 GB', '#C0C5CC', 'img/products/modern/XIA15U_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(485, 'XIA15U', 'Bạc titan', '8 GB', '256 GB', '#C0C5CC', 'img/products/modern/XIA15U_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(486, 'XIA15U', 'Bạc titan', '8 GB', '64 GB', '#C0C5CC', 'img/products/modern/XIA15U_3.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(487, 'XIA15U', 'Đen cổ điển', '16 GB', '128 GB', '#0F172A', 'img/products/modern/XIA15U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(488, 'XIA15U', 'Đen cổ điển', '16 GB', '256 GB', '#0F172A', 'img/products/modern/XIA15U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(489, 'XIA15U', 'Đen cổ điển', '16 GB', '64 GB', '#0F172A', 'img/products/modern/XIA15U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(490, 'XIA15U', 'Đen cổ điển', '4 GB', '128 GB', '#0F172A', 'img/products/modern/XIA15U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(491, 'XIA15U', 'Đen cổ điển', '4 GB', '256 GB', '#0F172A', 'img/products/modern/XIA15U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(492, 'XIA15U', 'Đen cổ điển', '4 GB', '64 GB', '#0F172A', 'img/products/modern/XIA15U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(493, 'XIA15U', 'Đen cổ điển', '8 GB', '128 GB', '#0F172A', 'img/products/modern/XIA15U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(494, 'XIA15U', 'Đen cổ điển', '8 GB', '256 GB', '#0F172A', 'img/products/modern/XIA15U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(495, 'XIA15U', 'Đen cổ điển', '8 GB', '64 GB', '#0F172A', 'img/products/modern/XIA15U_1.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(496, 'XIA15U', 'Trắng gốm', '16 GB', '128 GB', '#F3F4F6', 'img/products/modern/XIA15U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(497, 'XIA15U', 'Trắng gốm', '16 GB', '256 GB', '#F3F4F6', 'img/products/modern/XIA15U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(498, 'XIA15U', 'Trắng gốm', '16 GB', '64 GB', '#F3F4F6', 'img/products/modern/XIA15U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(499, 'XIA15U', 'Trắng gốm', '4 GB', '128 GB', '#F3F4F6', 'img/products/modern/XIA15U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(500, 'XIA15U', 'Trắng gốm', '4 GB', '256 GB', '#F3F4F6', 'img/products/modern/XIA15U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(501, 'XIA15U', 'Trắng gốm', '4 GB', '64 GB', '#F3F4F6', 'img/products/modern/XIA15U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(502, 'XIA15U', 'Trắng gốm', '8 GB', '128 GB', '#F3F4F6', 'img/products/modern/XIA15U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(503, 'XIA15U', 'Trắng gốm', '8 GB', '256 GB', '#F3F4F6', 'img/products/modern/XIA15U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07'),
(504, 'XIA15U', 'Trắng gốm', '8 GB', '64 GB', '#F3F4F6', 'img/products/modern/XIA15U_2.svg', 0, '2026-06-25 15:44:07', '2026-06-25 15:44:07');

--
-- Triggers `product_variants`
--
DELIMITER $$
CREATE TRIGGER `trg_variants_ad` AFTER DELETE ON `product_variants` FOR EACH ROW BEGIN
  UPDATE `products` p
  SET p.`so_luong_ton` = (
    SELECT IFNULL(SUM(v.`so_luong_ton`), 0)
    FROM `product_variants` v
    WHERE v.`masp` = OLD.`masp`
  )
  WHERE p.`masp` = OLD.`masp`;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_variants_ai` AFTER INSERT ON `product_variants` FOR EACH ROW BEGIN
  UPDATE `products` p
  SET p.`so_luong_ton` = (
    SELECT IFNULL(SUM(v.`so_luong_ton`), 0)
    FROM `product_variants` v
    WHERE v.`masp` = NEW.`masp`
  )
  WHERE p.`masp` = NEW.`masp`;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_variants_au` AFTER UPDATE ON `product_variants` FOR EACH ROW BEGIN
  /* cập nhật tồn cho masp mới */
  UPDATE `products` p
  SET p.`so_luong_ton` = (
    SELECT IFNULL(SUM(v.`so_luong_ton`), 0)
    FROM `product_variants` v
    WHERE v.`masp` = NEW.`masp`
  )
  WHERE p.`masp` = NEW.`masp`;

  /* nếu đổi masp (hiếm), cập nhật lại tồn cho masp cũ */
  IF (OLD.`masp` <> NEW.`masp`) THEN
    UPDATE `products` p
    SET p.`so_luong_ton` = (
      SELECT IFNULL(SUM(v.`so_luong_ton`), 0)
      FROM `product_variants` v
      WHERE v.`masp` = OLD.`masp`
    )
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
(3, 'thanh', 'thanh', 'thanh', '$2y$10$bDZFw7bUeqDC6RyEUShds./i5PUKzHq1gjl5ewoRMeh46u9xkujj6', 'thanh@123.com', 'user', 0),
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
  MODIFY `ma_don` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_details`
--
ALTER TABLE `order_details`
  MODIFY `detail_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_status_logs`
--
ALTER TABLE `order_status_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `variant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=512;

--
-- AUTO_INCREMENT for table `rate`
--
ALTER TABLE `rate`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
