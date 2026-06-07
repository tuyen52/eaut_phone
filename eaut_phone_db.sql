-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 07, 2026 at 05:04 PM
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
  `battery` varchar(100) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`masp`, `ten_sp`, `hang_sx`, `hinh_anh`, `gia`, `so_luong_ton`, `so_sao`, `so_danh_gia`, `khuyen_mai_loai`, `khuyen_mai_gia_tri`, `screen`, `os`, `camera`, `camera_front`, `cpu`, `ram`, `rom`, `micro_usb`, `battery`) VALUES
('APP16', 'iPhone 16 128GB', 'Apple', 'img/products/uploads/ip16xanhduong-1779440286.jpg', 18990000, 21, 0, 0, 'giamgia', '1000000', 'Super Retina XDR 6.1 inch', 'iOS 26', 'Camera kép 48 MP', 'TrueDepth 12 MP', 'Apple A18', '8 GB', '128 GB', 'Không hỗ trợ thẻ nhớ', 'Pin tốt, sạc nhanh USB-C'),
('APP17', 'iPhone 17 256GB', 'Apple', 'img/products/uploads/t---i-xu---ng--2-1779441601.webp', 24990000, 20, 0, 0, 'moiramat', '', 'Super Retina XDR 6.3 inch 120Hz', 'iOS 26', 'Camera kép 48 MP, quay 4K', 'TrueDepth 24 MP', 'Apple A19', '8 GB', '256 GB', 'Không hỗ trợ thẻ nhớ', 'Pin cả ngày, sạc nhanh USB-C'),
('APP17P', 'iPhone 17 Pro 256GB', 'Apple', 'img/products/uploads/shopping-1779441651.webp', 34990000, 11, 0, 0, 'giareonline', '33490000', 'OLED ProMotion 6.3 inch 120Hz', 'iOS 26', 'Camera Pro Fusion 48 MP', 'TrueDepth 24 MP', 'Apple A19 Pro', '12 GB', '256 GB', 'Không hỗ trợ thẻ nhớ', 'Pin Pro, sạc nhanh USB-C'),
('HMDPULSEP', 'HMD Pulse Pro 6GB/128GB', 'Nokia', 'img/products/uploads/t---i-xu---ng-1779441784.jpg', 3990000, 23, 0, 0, 'giamgia', '200000', 'LCD 6.65 inch 90Hz', 'Android 15', 'Camera sau 50 MP', 'Camera selfie 50 MP', 'Unisoc T606', '6 GB', '128 GB', 'MicroSD hỗ trợ', '5000 mAh, pin lâu'),
('HMDXR21', 'Nokia XR21 5G 6GB/128GB', 'Nokia', 'img/products/uploads/t---i-xu---ng--1-1779441853.jpg', 7490000, 15, 0, 0, 'tragop', '0', 'LCD 6.49 inch 120Hz', 'Android 14', 'Camera kép 64 MP', 'Camera 16 MP', 'Snapdragon 695 5G', '6 GB', '128 GB', 'MicroSD hỗ trợ', '4800 mAh, bền bỉ'),
('HWMATEX6', 'Huawei Mate X6 12GB/512GB', 'Huawei', 'img/products/uploads/t---i-xu---ng--2-1779441895.jpg', 41990000, 12, 0, 0, 'tragop', '0', 'Màn hình gập OLED 7.93 inch 120Hz', 'EMUI / HarmonyOS tùy thị trường', 'Camera Ultra Chroma 50 MP', 'Camera 8 MP', 'Kirin flagship', '12 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', 'Pin kép, sạc nhanh SuperCharge'),
('HWPR80', 'Huawei Pura 80 12GB/256GB', 'Huawei', 'img/products/uploads/t---i-xu---ng--3-1779441927.webp', 18990000, 12, 0, 0, 'moiramat', '', 'OLED 6.6 inch 120Hz', 'EMUI / HarmonyOS tùy thị trường', 'Camera XMAGE 50 MP', 'Camera 13 MP', 'Kirin series', '12 GB', '256 GB', 'Không hỗ trợ thẻ nhớ', 'Pin lớn, sạc nhanh SuperCharge'),
('HWPR80U', 'Huawei Pura 80 Ultra 16GB/512GB', 'Huawei', 'img/products/uploads/shopping--1-1779441992.webp', 32990000, 10, 0, 0, 'giareonline', '31490000', 'OLED LTPO 6.8 inch 120Hz', 'EMUI / HarmonyOS tùy thị trường', 'Camera XMAGE cao cấp, tele', 'Camera 13 MP', 'Kirin flagship', '16 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', 'Pin lớn, sạc nhanh SuperCharge'),
('NOKIAG42', 'Nokia G42 5G 6GB/128GB', 'Nokia', 'img/products/uploads/nokia-g42-5g-viettablet-1779442098.webp', 4490000, 20, 0, 0, 'giareonline', '4190000', 'LCD 6.56 inch 90Hz', 'Android 14', 'Camera chính 50 MP', 'Camera 8 MP', 'Snapdragon 480+ 5G', '6 GB', '128 GB', 'MicroSD hỗ trợ', '5000 mAh'),
('OPPOA5P', 'OPPO A5 Pro 5G 8GB/256GB', 'Oppo', 'img/products/uploads/t---i-xu---ng--3-1779442158.jpg', 6990000, 20, 0, 0, 'giamgia', '400000', 'LCD 6.67 inch 120Hz', 'Android 15, ColorOS', 'Camera 50 MP', 'Camera 8 MP', 'Dimensity 5G', '8 GB', '256 GB', 'MicroSD hỗ trợ', '5800 mAh, sạc nhanh'),
('OPPOR15P', 'OPPO Reno15 Pro 5G 12GB/512GB', 'Oppo', 'img/products/uploads/t---i-xu---ng--4-1779442239.jpg', 15990000, 14, 0, 0, 'tragop', '0', 'AMOLED 6.7 inch 120Hz', 'Android 16, ColorOS', 'Camera chân dung 50 MP OIS', 'Camera 50 MP', 'Dimensity AI 5G', '12 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', '5000 mAh, sạc nhanh 80W'),
('OPPOX9U', 'OPPO Find X9 Ultra 16GB/512GB', 'Oppo', 'img/products/uploads/t---i-xu---ng--5-1779442269.jpg', 27990000, 12, 0, 0, 'moiramat', '', 'AMOLED 6.82 inch 120Hz', 'Android 16, ColorOS', 'Camera Hasselblad 50 MP', 'Camera 32 MP', 'Dimensity flagship', '16 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', '5400 mAh, sạc nhanh SuperVOOC'),
('REALMEC75', 'realme C75 8GB/256GB', 'Realme', 'img/products/uploads/t---i-xu---ng--6-1779442317.jpg', 5290000, 24, 0, 0, 'giareonline', '4990000', 'LCD 6.72 inch 90Hz', 'Android 15, realme UI', 'Camera 50 MP', 'Camera 8 MP', 'Helio G series', '8 GB', '256 GB', 'MicroSD hỗ trợ', '6000 mAh'),
('REALMEGT8', 'realme GT 8 Pro 16GB/512GB', 'Realme', 'img/products/uploads/t---i-xu---ng--7-1779442339.jpg', 18990000, 21, 0, 0, 'giamgia', '1000000', 'AMOLED 6.78 inch 144Hz', 'Android 16, realme UI', 'Camera 50 MP OIS, góc rộng', 'Camera 32 MP', 'Snapdragon 8 series', '16 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', '5500 mAh, sạc nhanh 120W'),
('REDMI15', 'REDMI Note 15 8GB/128GB', 'Xiaomi', 'img/products/uploads/t---i-xu---ng--8-1779442369.jpg', 4990000, 36, 0, 0, 'giareonline', '4590000', 'AMOLED 6.67 inch 120Hz', 'Android 16, HyperOS', 'Camera 108 MP', 'Camera 16 MP', 'Snapdragon tầm trung', '8 GB', '128 GB', 'MicroSD tối đa 1 TB', '5000 mAh, sạc nhanh'),
('REDMI15P5G', 'REDMI Note 15 Pro 5G 12GB/256GB', 'Xiaomi', 'img/products/uploads/t---i-xu---ng--9-1779442401.jpg', 8990000, 29, 0, 0, 'giamgia', '500000', 'AMOLED 6.83 inch 1.5K 120Hz', 'Android 16, HyperOS', 'Camera 200 MP chống rung OIS', 'Camera 32 MP', 'MediaTek Dimensity 7400-Ultra', '12 GB', '256 GB', 'Không hỗ trợ thẻ nhớ', '6580 mAh, sạc nhanh'),
('SAMA37', 'Samsung Galaxy A37 5G 8GB/128GB', 'Samsung', 'img/products/uploads/t---i-xu---ng--10-1779442445.jpg', 8290000, 30, 0, 0, 'giareonline', '7890000', 'Super AMOLED 6.6 inch 120Hz', 'Android 16', 'Camera 50 MP', 'Camera 13 MP', 'Exynos tầm trung', '8 GB', '128 GB', 'MicroSD tối đa 1 TB', '5000 mAh'),
('SAMA57', 'Samsung Galaxy A57 5G 8GB/256GB', 'Samsung', 'img/products/uploads/t---i-xu---ng--11-1779442472.jpg', 11990000, 24, 0, 0, 'giamgia', '700000', 'Super AMOLED 6.7 inch 120Hz', 'Android 16', 'Camera 50 MP chống rung OIS', 'Camera 32 MP', 'Exynos AI Edition', '8 GB', '256 GB', 'MicroSD tối đa 1 TB', '5000 mAh, sạc nhanh'),
('SAMS26U', 'Samsung Galaxy S26 Ultra 12GB/512GB', 'Samsung', 'img/products/uploads/t---i-xu---ng--12-1779442503.jpg', 33990000, 18, 0, 0, 'moiramat', '', 'Dynamic AMOLED 2X 6.9 inch 120Hz', 'Android 16, One UI AI', 'Camera 200 MP, tele, góc rộng', 'Camera 12 MP', 'Snapdragon 8 Elite for Galaxy', '12 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', '5000 mAh, sạc nhanh'),
('VIVOX300', 'Vivo X300 Pro 12GB/512GB', 'Vivo', 'img/products/uploads/t---i-xu---ng--13-1779442533.jpg', 23990000, 18, 0, 0, 'giareonline', '22490000', 'AMOLED 6.78 inch 120Hz', 'Android 16, Funtouch OS', 'Camera ZEISS 50 MP, tele', 'Camera 32 MP', 'Dimensity flagship', '12 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', '5200 mAh, sạc nhanh'),
('VIVOY39', 'Vivo Y39 5G 8GB/256GB', 'Vivo', 'img/products/uploads/t---i-xu---ng--14-1779442556.jpg', 6490000, 36, 0, 0, 'giamgia', '300000', 'LCD 6.68 inch 120Hz', 'Android 15, Funtouch OS', 'Camera 50 MP', 'Camera 8 MP', 'Snapdragon 5G', '8 GB', '256 GB', 'MicroSD hỗ trợ', '6500 mAh, sạc nhanh'),
('XIA15U', 'Xiaomi 15 Ultra 16GB/512GB', 'Xiaomi', 'img/products/uploads/t---i-xu---ng--15-1779442578.jpg', 29990000, 18, 0, 0, 'giareonline', '28490000', 'AMOLED 6.73 inch 2K 120Hz', 'Android 16, HyperOS', 'Camera Leica 50 MP, tele tiềm vọng', 'Camera 32 MP', 'Snapdragon 8 Elite', '16 GB', '512 GB', 'Không hỗ trợ thẻ nhớ', '5300 mAh, sạc nhanh 90W');

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `variant_id` int(11) NOT NULL,
  `masp` varchar(20) NOT NULL,
  `ten_mau` varchar(50) NOT NULL,
  `ma_mau_hex` char(7) NOT NULL,
  `hinh_anh` text DEFAULT NULL,
  `so_luong_ton` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variants`
--

INSERT INTO `product_variants` (`variant_id`, `masp`, `ten_mau`, `ma_mau_hex`, `hinh_anh`, `so_luong_ton`, `created_at`, `updated_at`) VALUES
(1, 'APP17', 'Xanh lưu ly', '#8DB9E8', 'img/products/modern/APP17_1.svg', 7, '2026-05-21 12:57:27', '2026-06-03 18:55:17'),
(2, 'APP17', 'Đen', '#202124', 'img/products/modern/APP17_2.svg', 7, '2026-05-21 12:57:27', '2026-05-21 12:57:27'),
(3, 'APP17', 'Hồng đào', '#F6B8B8', 'img/products/modern/APP17_3.svg', 6, '2026-05-21 12:57:27', '2026-05-21 12:57:27'),
(4, 'APP17P', 'Titan tự nhiên', '#B8B0A3', 'img/products/modern/APP17P_1.svg', 6, '2026-05-21 12:57:27', '2026-05-21 12:57:27'),
(5, 'APP17P', 'Xanh đậm', '#27384A', 'img/products/modern/APP17P_2.svg', 5, '2026-05-21 12:57:27', '2026-05-24 12:33:54'),
(7, 'APP16', 'Xanh dương', '#73A9D8', 'img/products/uploads/ip16xanhduong-1779440292.jpg', 6, '2026-05-21 12:57:27', '2026-05-24 13:00:47'),
(8, 'APP16', 'Trắng', '#F8FAFC', 'img/products/uploads/t---i-xu---ng-1779441006.webp', 7, '2026-05-21 12:57:27', '2026-05-24 11:47:15'),
(9, 'APP16', 'Đen', '#111827', 'img/products/uploads/t---i-xu---ng-1779441044.webp', 8, '2026-05-21 12:57:27', '2026-05-22 16:10:46'),
(10, 'SAMS26U', 'Đen phantom', '#111827', 'img/products/modern/SAMS26U_1.svg', 7, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(11, 'SAMS26U', 'Xám titan', '#8A8D91', 'img/products/modern/SAMS26U_2.svg', 6, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(12, 'SAMS26U', 'Xanh navy', '#1E3A5F', 'img/products/modern/SAMS26U_3.svg', 5, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(13, 'SAMA57', 'Tím lavender', '#B9A7E8', 'img/products/modern/SAMA57_1.svg', 8, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(14, 'SAMA57', 'Xanh mint', '#A7E8C6', 'img/products/modern/SAMA57_2.svg', 8, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(15, 'SAMA57', 'Đen', '#1F2937', 'img/products/modern/SAMA57_3.svg', 8, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(16, 'SAMA37', 'Đen', '#111827', 'img/products/modern/SAMA37_1.svg', 10, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(17, 'SAMA37', 'Xanh băng', '#BFE3F8', 'img/products/modern/SAMA37_2.svg', 10, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(18, 'SAMA37', 'Bạc', '#D1D5DB', 'img/products/modern/SAMA37_3.svg', 10, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(19, 'XIA15U', 'Đen cổ điển', '#0F172A', 'img/products/modern/XIA15U_1.svg', 6, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(20, 'XIA15U', 'Trắng gốm', '#F3F4F6', 'img/products/modern/XIA15U_2.svg', 6, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(21, 'XIA15U', 'Bạc titan', '#C0C5CC', 'img/products/modern/XIA15U_3.svg', 6, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(22, 'REDMI15P5G', 'Đen', '#101828', 'img/products/modern/REDMI15P5G_1.svg', 10, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(23, 'REDMI15P5G', 'Xám titan', '#8A8D91', 'img/products/modern/REDMI15P5G_2.svg', 10, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(24, 'REDMI15P5G', 'Tím khói', '#8B7ED8', 'img/products/modern/REDMI15P5G_3.svg', 9, '2026-05-21 12:57:28', '2026-05-22 00:02:44'),
(25, 'REDMI15', 'Đen midnight', '#0F172A', 'img/products/modern/REDMI15_1.svg', 12, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(26, 'REDMI15', 'Xanh lá', '#74C69D', 'img/products/modern/REDMI15_2.svg', 12, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(27, 'REDMI15', 'Tím nhạt', '#C4B5FD', 'img/products/modern/REDMI15_3.svg', 12, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(28, 'OPPOX9U', 'Đen vũ trụ', '#111827', 'img/products/modern/OPPOX9U_1.svg', 6, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(29, 'OPPOX9U', 'Trắng ngọc', '#F6F7F9', 'img/products/modern/OPPOX9U_2.svg', 6, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(31, 'OPPOR15P', 'Hồng pastel', '#F7B6C2', 'img/products/modern/OPPOR15P_1.svg', 7, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(32, 'OPPOR15P', 'Xanh ngọc', '#99D8D0', 'img/products/modern/OPPOR15P_2.svg', 7, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(34, 'OPPOA5P', 'Đen', '#111827', 'img/products/modern/OPPOA5P_1.svg', 10, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(36, 'OPPOA5P', 'Tím nhạt', '#C4B5FD', 'img/products/modern/OPPOA5P_3.svg', 10, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(37, 'VIVOX300', 'Xanh trời', '#8EC5FC', 'img/products/modern/VIVOX300_1.svg', 6, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(38, 'VIVOX300', 'Đen sao đêm', '#0B1020', 'img/products/modern/VIVOX300_2.svg', 6, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(39, 'VIVOX300', 'Trắng ánh ngọc', '#F1F5F9', 'img/products/modern/VIVOX300_3.svg', 6, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(40, 'VIVOY39', 'Đen', '#111827', 'img/products/modern/VIVOY39_1.svg', 12, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(41, 'VIVOY39', 'Xanh ngọc', '#5EEAD4', 'img/products/modern/VIVOY39_2.svg', 12, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(42, 'VIVOY39', 'Tím ánh sao', '#A78BFA', 'img/products/modern/VIVOY39_3.svg', 12, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(43, 'REALMEGT8', 'Cam racing', '#F97316', 'img/products/modern/REALMEGT8_1.svg', 7, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(44, 'REALMEGT8', 'Đen carbon', '#171717', 'img/products/modern/REALMEGT8_2.svg', 7, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(45, 'REALMEGT8', 'Bạc tốc độ', '#D1D5DB', 'img/products/modern/REALMEGT8_3.svg', 7, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(46, 'REALMEC75', 'Đen bão tố', '#1F2937', 'img/products/modern/REALMEC75_1.svg', 12, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(48, 'REALMEC75', 'Xanh lá', '#65A30D', 'img/products/modern/REALMEC75_3.svg', 12, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(49, 'HMDPULSEP', 'Tím twilight', '#8B5CF6', 'img/products/modern/HMDPULSEP_1.svg', 11, '2026-05-21 12:57:28', '2026-05-21 23:39:15'),
(50, 'HMDPULSEP', 'Đen meteor', '#111827', 'img/products/modern/HMDPULSEP_2.svg', 12, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(52, 'HMDXR21', 'Đen bền bỉ', '#111827', 'img/products/modern/HMDXR21_1.svg', 8, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(53, 'HMDXR21', 'Xanh midnight', '#1E3A8A', 'img/products/modern/HMDXR21_2.svg', 7, '2026-05-21 12:57:28', '2026-05-24 14:59:08'),
(55, 'NOKIAG42', 'Tím so purple', '#7C3AED', 'img/products/modern/NOKIAG42_1.svg', 10, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(57, 'NOKIAG42', 'Hồng nhạt', '#F9A8D4', 'img/products/modern/NOKIAG42_3.svg', 10, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(58, 'HWPR80', 'Đen nhám', '#111827', 'img/products/modern/HWPR80_1.svg', 6, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(59, 'HWPR80', 'Trắng nhám', '#F8FAFC', 'img/products/modern/HWPR80_2.svg', 6, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(61, 'HWPR80U', 'Đen ceramic', '#0F172A', 'img/products/modern/HWPR80U_1.svg', 5, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(62, 'HWPR80U', 'Vàng ánh kim', '#C9A227', 'img/products/modern/HWPR80U_2.svg', 5, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(64, 'HWMATEX6', 'Đen obsidian', '#111827', 'img/products/modern/HWMATEX6_1.svg', 4, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(65, 'HWMATEX6', 'Đỏ vũ trụ', '#991B1B', 'img/products/modern/HWMATEX6_2.svg', 4, '2026-05-21 12:57:28', '2026-05-21 12:57:28'),
(66, 'HWMATEX6', 'Xám tinh vân', '#6B7280', 'img/products/modern/HWMATEX6_3.svg', 4, '2026-05-21 12:57:28', '2026-05-21 12:57:28');

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
  ADD KEY `idx_orders_payment_timeout` (`payment_status`,`phuong_thuc_tt`,`payment_expired_at`);

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
  ADD UNIQUE KEY `uq_masp_ten_mau` (`masp`,`ten_mau`),
  ADD KEY `idx_masp` (`masp`);

--
-- Indexes for table `rate`
--
ALTER TABLE `rate`
  ADD PRIMARY KEY (`id`),
  ADD KEY `masp` (`masp`),
  ADD KEY `username` (`username`),
  ADD KEY `idx_rate_variant` (`variant_id`);

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
  ADD KEY `idx_vnpay_session_expires` (`expires_at`);

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
  MODIFY `ma_don` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
  MODIFY `variant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

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
  ADD CONSTRAINT `rate_ibfk_1` FOREIGN KEY (`masp`) REFERENCES `products` (`masp`) ON DELETE CASCADE,
  ADD CONSTRAINT `rate_ibfk_2` FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON DELETE CASCADE;

--
-- Constraints for table `vnpay_payment_sessions`
--
ALTER TABLE `vnpay_payment_sessions`
  ADD CONSTRAINT `fk_vnpay_session_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`ma_don`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_vnpay_session_user` FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
