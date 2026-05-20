-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 20, 2026 at 02:17 PM
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

--
-- Dumping data for table `nhap_kho`
--

INSERT INTO `nhap_kho` (`id`, `masp`, `so_luong_nhap`, `ngay_nhap`) VALUES
(1, 'App0', 1, '2025-12-11 02:42:11'),
(2, 'App0', 1, '2025-12-20 18:36:42');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `ma_don` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `ngay_mua` datetime DEFAULT current_timestamp(),
  `tinh_trang` varchar(50) DEFAULT 'Chờ xử lý',
  `phuong_thuc_tt` varchar(255) DEFAULT NULL,
  `payment_status` varchar(20) NOT NULL DEFAULT 'Pending',
  `vnp_txn_ref` varchar(100) DEFAULT NULL,
  `vnp_transaction_no` varchar(50) DEFAULT NULL,
  `vnp_response_code` varchar(10) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `dia_chi` text DEFAULT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `tong_tien` decimal(15,0) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`ma_don`, `username`, `ngay_mua`, `tinh_trang`, `phuong_thuc_tt`, `payment_status`, `vnp_txn_ref`, `vnp_transaction_no`, `vnp_response_code`, `paid_at`, `dia_chi`, `so_dien_thoai`, `tong_tien`) VALUES
(17, 'tuyen', '2026-03-01 01:47:02', 'Hoàn thành', 'Thanh toán khi nhận hàng (COD)', 'Pending', NULL, NULL, NULL, NULL, 'Tay Tuu Ward, Hà Nội, 12500, Vietnam', '0375615945', 11990000),
(18, 'tuyen', '2026-03-01 16:51:42', 'Hoàn thành', 'Thanh toán khi nhận hàng (COD)', 'Pending', NULL, NULL, NULL, NULL, 'Tay Tuu Ward, Hà Nội, 12500, Vietnam', '0375615945', 18000000),
(31, 'tuyen', '2026-03-08 20:25:46', 'Đã hủy bởi Khách', 'VNPAY', 'Paid', 'DH20260308000031', '15442478', '00', '2026-03-08 20:27:47', 'Tay Tuu Ward, Hà Nội, 12500, Vietnam', '0375615945', 11990000),
(32, 'tuyen', '2026-03-10 11:23:43', 'Đã hủy bởi Khách', 'COD', 'Pending', NULL, NULL, NULL, NULL, 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', 11990000),
(35, 'tuyen', '2026-05-18 00:14:15', 'Đã hủy thanh toán', 'VNPAY', 'Failed', 'DH20260518000035', NULL, '11', NULL, 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', 18000000),
(36, 'tuyen', '2026-05-19 08:57:22', 'Đã hủy thanh toán', 'VNPAY', 'Failed', 'DH20260519000036', NULL, '11', NULL, 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', 18000000),
(37, 'tuyen', '2026-05-19 09:21:10', 'Đã hủy thanh toán', 'VNPAY', 'Failed', 'DH20260519000037', NULL, '11', NULL, 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', 18000000),
(38, 'tuyen', '2026-05-19 20:53:15', 'Chờ xử lý', 'VNPAY', 'Paid', 'DH20260519000038', '15546868', '00', '2026-05-19 20:54:57', 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', 11990000),
(39, 'tuyen', '2026-05-19 21:08:52', 'Đã hủy thanh toán', 'VNPAY', 'Failed', 'DH20260519000039', '0', '24', NULL, 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', 11990000),
(40, 'tuyen', '2026-05-19 21:14:33', 'Đã hủy thanh toán', 'VNPAY', 'Failed', 'DH20260519000040', NULL, '11', NULL, 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', 11990000),
(42, 'tuyen', '2026-05-19 22:56:41', 'Đã hủy thanh toán', 'VNPAY', 'Failed', 'GD202605192256342877', '0', '24', NULL, 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', 11990000),
(43, 'tuyen', '2026-05-19 22:57:13', 'Đã hủy thanh toán', 'VNPAY', 'Failed', 'GD202605192257094342', '0', '24', NULL, 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', 11990000),
(44, 'tuyen', '2026-05-19 22:57:38', 'Chờ xử lý', 'COD', 'Pending', NULL, NULL, NULL, NULL, 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', 11990000),
(45, 'tuyen', '2026-05-19 23:32:42', 'Đã hủy thanh toán', 'VNPAY', 'Failed', 'GD202605192332378622', '0', '24', NULL, 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', 11990000),
(46, 'tuyen', '2026-05-19 23:34:53', 'Chờ xử lý', 'VNPAY', 'Paid', 'GD202605192333332693', '15547106', '00', '2026-05-19 23:34:47', 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', 11990000);

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
  `don_gia` decimal(15,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_details`
--

INSERT INTO `order_details` (`detail_id`, `ma_don`, `masp`, `variant_id`, `mau_sac`, `so_luong`, `don_gia`) VALUES
(17, 17, 'App0', 33, 'trắng', 1, 11990000),
(18, 18, 'APP2', 3, 'Mặc định', 1, 18000000),
(31, 31, 'App0', 1, 'Mặc định', 1, 11990000),
(32, 32, 'App0', 1, 'Mặc định', 1, 11990000),
(35, 35, 'APP2', 32, 'Đen', 1, 18000000),
(36, 36, 'APP2', 3, 'Mặc định', 1, 18000000),
(37, 37, 'APP2', 32, 'Đen', 1, 18000000),
(38, 38, 'App0', 1, 'Mặc định', 1, 11990000),
(39, 39, 'App0', 1, 'Mặc định', 1, 11990000),
(40, 40, 'App0', 1, 'Mặc định', 1, 11990000),
(42, 42, 'App0', 1, 'Mặc định', 1, 11990000),
(43, 43, 'App0', 1, 'Mặc định', 1, 11990000),
(44, 44, 'App0', 1, 'Mặc định', 1, 11990000),
(45, 45, 'App0', 1, 'Mặc định', 1, 11990000),
(46, 46, 'App0', 1, 'Mặc định', 1, 11990000);

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
('App0', 'iPhone X 256GB Silver', 'Apple', 'img/products/iphone-x-256gb-silver-400x400.jpg', 13990000, 9, 0, 0, 'giareonline', '11.990.000', 'OLED, 5.8\', Super Retina', 'iOS 11', '2 camera 12 MP', '7 MP', 'Apple A11 Bionic 6 nhân', '3 GB', '256 GB', 'Không', '2716 mAh, có sạc nhanh'),
('App1', 'iPad 2024 Wifi 32GB', 'Apple', 'img/products/ipad-wifi-32gb-2018-thumb-600x600.jpg', 8990000, 10, 0, 0, 'tragop', '0', 'LED-backlit LCD, 9.7p\'\'', 'iOS 11.3', '8 MP', '1.2 MP', 'Apple A10 Fusion, 2.34 GHz', '2 GB', '32 GB', 'Không', 'Chưa có thông số cụ thể'),
('APP2', 'iphone 12 128GB', 'Apple', 'img/products/Screenshot 2025-12-05 085408.png', 20000000, 5, 5, 1, 'giareonline', '18.000.000', '6.1-inch Liquid Retina HD (LCD)', 'iOS (ra mắt với iOS 13, hỗ trợ nâng cấp iOS mới)', 'Camera kép 12 MP', '12 MP, f/2.2', 'Apple A13 Bionic (6 nhân)', '4 GB', '128 GB', '', 'Không hỗ trợ'),
('App3', 'iPhone Xr 128GB', 'Apple', 'https://cdn.tgdd.vn/Products/Images/42/191483/iphone-xr-128gb-red-600x600.jpg', 24990000, 9, 0, 0, 'giareonline', '22.990.000', 'IPS LCD, 6.1\', IPS LCD, 16 triệu màu', 'iOS 12', '12 MP', '7 MP', 'Apple A12 Bionic 6 nhân', '3 GB', '128 GB', 'Không', '2942 mAh, có sạc nhanh'),
('App4', 'iPhone 11 Plus 64GB', 'Apple', 'https://cdn.tgdd.vn/Products/Images/42/114110/iphone-8-plus-hh-600x600.jpg', 20990000, 10, 0, 0, 'giareonline', '17.990.000', 'LED-backlit IPS LCD, 5.5\', Retina HD', 'iOS 11', '2 camera 12 MP', '7 MP', 'Apple A11 Bionic 6 nhân', '3 GB', '64 GB', 'Không', '2691 mAh, có sạc nhanh'),
('App5', 'iPhone 8 Plus 256GB', 'Apple', 'https://cdn.tgdd.vn/Products/Images/42/114114/iphone-8-plus-256gb-red-600x600.jpg', 25790000, 10, 0, 0, 'giamgia', '500.000', 'LED-backlit IPS LCD, 4.7\', Retina HD', 'iOS 11', '12 MP', '7 MP', 'Apple A11 Bionic 6 nhân', '2 GB', '256 GB', 'Không', '1821 mAh, có sạc nhanh'),
('App6', 'iPhone Xr 64GB', 'Apple', 'https://cdn.tgdd.vn/Products/Images/42/190325/iphone-xr-black-400x460.png', 22990000, 10, 0, 0, 'giareonline', '19.990.000', 'IPS LCD, 6.1\', IPS LCD, 16 triệu màu', 'iOS 12', '12 MP', '7 MP', 'Apple A12 Bionic 6 nhân', '3 GB', '64 GB', 'Không', '2942 mAh, có sạc nhanh'),
('APP7', 'test1', 'Apple', 'http://localhost:8080/eaut_phone/admin.html', 5000, 8, 0, 0, '', '', '1', '1', '1', '1', '1', '1', '1', '', '1'),
('Hua0', 'Huawei Mate 20 Pro', 'Huawei', 'img/products/huawei-mate-20-pro-green-600x600.jpg', 21990000, 10, 0, 0, 'tragop', '0', 'OLED, 6.39\', Quad HD+ (2K+)', 'Android 9.0 (Pie)', '40 MP, 20 MP và 8 MP (3 camera)', '24 MP', 'Hisilicon Kirin 980 8 nhân 64-bit', '6 GB', '128 GB', 'NM card, hỗ trợ tối đa 512 GB', '4200 mAh, có sạc nhanh'),
('Hua1', 'Huawei Nova 3', 'Huawei', 'img/products/huawei-nova-3-2-600x600.jpg', 9990000, 10, 0, 0, 'tragop', '0', 'LTPS LCD, 6.3\', Full HD+', 'Android 8.1 (Oreo)', '24 MP và 16 MP (2 camera)', '24 MP và 2 MP (2 camera)', 'Hisilicon Kirin 970 8 nhân', '6 GB', '128 GB', 'MicroSD, hỗ trợ tối đa 256 GB', '3750 mAh, có sạc nhanh'),
('Hua2', 'Huawei Y5 2017', 'Huawei', 'img/products/huawei-y5-2017-300x300.jpg', 1990000, 10, 0, 0, '', '', 'IPS LCD, 5\', HD', 'Android 6.0 (Marshmallow)', '8 MP', '5 MP', 'MT6737T, 4 nhân', '2 GB', '16 GB', 'MicroSD, hỗ trợ tối đa 128 GB', '3000 mAh'),
('Hua3', 'Huawei Nova 2i', 'Huawei', 'https://cdn.tgdd.vn/Products/Images/42/157031/samsung-galaxy-a6-2018-2-600x600.jpg', 4490000, 10, 0, 0, 'giareonline', '3.990.000', 'IPS LCD, 5.9\', Full HD+', 'Android 7.0 (Nougat)', '16 MP và 2 MP (2 camera)', '13 MP và 2 MP (2 camera)', 'HiSilicon Kirin 659 8 nhân', '4 GB', '64 GB', 'MicroSD, hỗ trợ tối đa 128 GB', '3340 mAh'),
('Nok0', 'Nokia 5.1 Plus', 'Nokia', 'img/products/nokia-51-plus-black-18thangbh-400x400.jpg', 4790000, 10, 0, 0, 'giamgia', '250.000', 'IPS LCD, 5.8\', HD+', 'Android One', '13 MP và 5 MP (2 camera)', '8 MP', 'MediaTek Helio P60 8 nhân 64-bit', '3 GB', '32 GB', 'MicroSD, hỗ trợ tối đa 256 GB', '3060 mAh, có sạc nhanh'),
('Opp0', 'Oppo F9', 'Oppo', 'img/products/oppo-f9-red-600x600.jpg', 7690000, 10, 0, 0, 'giamgia', '500.000', 'LTPS LCD, 6.3\', Full HD+', 'ColorOS 5.2 (Android 8.1)', '16 MP và 2 MP (2 camera)', '25 MP', 'MediaTek Helio P60 8 nhân 64-bit', '4 GB', '64 GB', 'MicroSD, hỗ trợ tối đa 256 GB', '3500 mAh, có sạc nhanh'),
('Opp1', 'Oppo A3s 32GB', 'Oppo', 'img/products/oppo-a3s-32gb-600x600.jpg', 4690000, 10, 0, 0, 'tragop', '0', 'IPS LCD, 6.2\', HD+', 'Android 8.1 (Oreo)', '13 MP và 2 MP (2 camera)', '8 MP', 'Qualcomm Snapdragon 450 8 nhân 64-bit', '3 GB', '32 GB', 'MicroSD, hỗ trợ tối đa 256 GB', '4230 mAh'),
('Rea0', 'Realme 2 Pro 8GB/128GB', 'Realme', 'https://cdn.tgdd.vn/Products/Images/42/192002/oppo-realme-2-pro-black-600x600.jpg', 6990000, 10, 0, 0, 'moiramat', '', 'IPS LCD, 6.3\', Full HD+', 'ColorOS 5.2 (Android 8.1)', '16 MP và 2 MP (2 camera)', '16 MP', 'Qualcomm Snapdragon 660 8 nhân', '8 GB', '128 GB', 'MicroSD, hỗ trợ tối đa 256 GB', '3500 mAh'),
('Rea1', 'Realme 2 4GB/64GB', 'Realme', 'https://cdn.tgdd.vn/Products/Images/42/193462/realme-2-4gb-64gb-docquyen-600x600.jpg', 4490000, 9, 0, 0, 'moiramat', '', 'IPS LCD, 6.2\', HD+', 'Android 8.1 (Oreo)', '13 MP và 2 MP (2 camera)', '8 MP', 'Qualcomm Snapdragon 450 8 nhân 64-bit', '4 GB', '64 GB', 'MicroSD, hỗ trợ tối đa 256 GB', '4230 mAh'),
('Rea2', 'Realme C1', 'Realme', 'https://cdn.tgdd.vn/Products/Images/42/193286/realme-c1-black-600x600.jpg', 2490000, 10, 0, 0, 'moiramat', '', 'IPS LCD, 6.2\', HD+', 'Android 8.1 (Oreo)', '13 MP và 2 MP (2 camera)', '5 MP', 'Qualcomm Snapdragon 450 8 nhân 64-bit', '2 GB', '16 GB', 'MicroSD, hỗ trợ tối đa 256 GB', '4230 mAh'),
('Rea3', 'Realme 2 Pro 4GB/64GB', 'Realme', 'https://cdn.tgdd.vn/Products/Images/42/193464/realme-2-pro-4gb-64gb-blue-600x600.jpg', 5590000, 10, 0, 0, 'moiramat', '', 'IPS LCD, 6.3\', Full HD+', 'ColorOS 5.2 (Android 8.1)', '16 MP và 2 MP (2 camera)', '16 MP', 'Qualcomm Snapdragon 660 8 nhân', '4 GB', '64 GB', 'MicroSD, hỗ trợ tối đa 256 GB', '3500 mAh'),
('Sam0', 'SamSung Galaxy J4+', 'Samsung', 'img/products/samsung-galaxy-j4-plus-pink-400x400.jpg', 3490000, 10, 0, 0, 'tragop', '0', 'IPS LCD, 6.0\', HD+', 'Android 8.1 (Oreo)', '13 MP', '5 MP', 'Qualcomm Snapdragon 425 4 nhân 64-bit', '2 GB', '16 GB', 'MicroSD, hỗ trợ tối đa 256 GB', '3300 mAh'),
('Sam1', 'Samsung Galaxy A8+ (2018)', 'Samsung', 'img/products/samsung-galaxy-a8-plus-2018-gold-600x600.jpg', 11990000, 10, 0, 0, 'giamgia', '1.500.000', 'Super AMOLED, 6\', Full HD+', 'Android 7.1 (Nougat)', '16 MP', '16 MP và 8 MP (2 camera)', 'Exynos 7885 8 nhân 64-bit', '6 GB', '64 GB', 'MicroSD, hỗ trợ tối đa 256 GB', '3500 mAh, có sạc nhanh'),
('Sam2', 'Samsung Galaxy J8', 'Samsung', 'img/products/samsung-galaxy-j8-600x600-600x600.jpg', 6290000, 10, 0, 0, 'giamgia', '500.000', 'Super AMOLED, 6.0\', HD+', 'Android 8.0 (Oreo)', '16 MP và 5 MP (2 camera)', '16 MP', 'Qualcomm Snapdragon 450 8 nhân 64-bit', '3 GB', '32 GB', 'MicroSD, hỗ trợ tối đa 256 GB', '3500 mAh'),
('Sam3', 'Samsung Galaxy A7 (2018)', 'Samsung', 'https://cdn.tgdd.vn/Products/Images/42/194327/samsung-galaxy-a7-2018-128gb-black-400x400.jpg', 8990000, 10, 0, 0, 'tragop', '0', 'Super AMOLED, 6.0\', Full HD+', 'Android 8.0 (Oreo)', '24 MP, 8 MP và 5 MP (3 camera)', '24 MP', 'Exynos 7885 8 nhân 64-bit', '4 GB', '64 GB', 'MicroSD, hỗ trợ tối đa 512 GB', '3300 mAh'),
('Viv0', 'Vivo V11', 'Vivo', 'https://cdn.tgdd.vn/Products/Images/42/188828/vivo-v11-600x600.jpg', 10990000, 10, 0, 0, 'tragop', '0', 'Super AMOLED, 6.41\', Full HD+', 'Android 8.1 (Oreo)', '12 MP và 5 MP (2 camera)', '25 MP', 'Qualcomm Snapdragon 660 8 nhân', '6 GB', '128 GB', 'MicroSD, hỗ trợ tối đa 256 GB', '3400 mAh, có sạc nhanh'),
('Viv1', 'Vivo V9', 'Vivo', 'https://cdn.tgdd.vn/Products/Images/42/155047/vivo-v9-2-1-600x600-600x600.jpg', 7490000, 10, 0, 0, 'giamgia', '800.000', 'IPS LCD, 6.3\', Full HD+', 'Android 8.1 (Oreo)', '16 MP và 5 MP (2 camera)', '24 MP', 'Snapdragon 626 8 nhân 64-bit', '4 GB', '64 GB', 'MicroSD, hỗ trợ tối đa 256 GB', '3260 mAh'),
('Viv2', 'Vivo Y85', 'Vivo', 'https://cdn.tgdd.vn/Products/Images/42/156205/vivo-y85-red-docquyen-600x600.jpg', 4990000, 10, 0, 0, 'giamgia', '500.000', 'IPS LCD, 6.22\', HD+', 'Android 8.1 (Oreo)', '13 MP và 2 MP (2 camera)', '8 MP', 'MediaTek MT6762 8 nhân 64-bit (Helio P22)', '4 GB', '32 GB', 'MicroSD, hỗ trợ tối đa 256 GB', '3260 mAh'),
('Viv3', 'Vivo Y71', 'Vivo', 'https://cdn.tgdd.vn/Products/Images/42/158585/vivo-y71-docquyen-600x600.jpg', 3290000, 10, 0, 0, 'tragop', '0', 'IPS LCD, 6.0\', HD+', 'Android 8.1 (Oreo)', '13 MP', '5 MP', 'Qualcomm Snapdragon 425 4 nhân 64-bit', '3 GB', '16 GB', 'MicroSD, hỗ trợ tối đa 256 GB', '3360 mAh'),
('Xia0', 'Xiaomi Mi 8 Lite', 'Xiaomi', 'img/products/xiaomi-mi-8-lite-black-1-600x600.jpg', 6690000, 10, 0, 0, 'tragop', '0', 'IPS LCD, 6.26\', Full HD+', 'Android 8.1 (Oreo)', '12 MP và 5 MP (2 camera)', '24 MP', 'Qualcomm Snapdragon 660 8 nhân', '4 GB', '64 GB', 'MicroSD, hỗ trợ tối đa 512 GB', '3300 mAh, có sạc nhanh'),
('Xia1', 'Xiaomi Mi 8', 'Xiaomi', 'img/products/xiaomi-mi-8-1-600x600.jpg', 12990000, 10, 0, 0, '', '0', 'IPS LCD, 6.26\', Full HD+', 'Android 8.1 (Oreo)', '12 MP và 5 MP (2 camera)', '24 MP', 'Qualcomm Snapdragon 660 8 nhân', '4 GB', '64 GB', 'MicroSD, hỗ trợ tối đa 512 GB', '3300 mAh, có sạc nhanh'),
('Xia2', 'Xiaomi Redmi Note 5', 'Xiaomi', 'img/products/xiaomi-redmi-note-5-pro-600x600.jpg', 5690000, 10, 0, 0, 'moiramat', '', 'IPS LCD, 5.99\', Full HD+', 'Android 8.1 (Oreo)', '12 MP và 5 MP (2 camera)', '13 MP', 'Qualcomm Snapdragon 636 8 nhân', '4 GB', '64 GB', 'MicroSD, hỗ trợ tối đa 128 GB', '4000 mAh, có sạc nhanh'),
('Xia3', 'Xiaomi Redmi 5 Plus 4GB', 'Xiaomi', 'img/products/xiaomi-redmi-5-plus-600x600.jpg', 4790000, 10, 0, 0, '', '', 'IPS LCD, 5.99\', Full HD+', 'Android 7.1 (Nougat)', '12 MP', '5 MP', 'Snapdragon 625 8 nhân 64-bit', '4 GB', '64 GB', 'MicroSD, hỗ trợ tối đa 256 GB', '4000 mAh');

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
(1, 'App0', 'Mặc định', '#000000', 'img/products/iphone-x-256gb-silver-400x400.jpg', 8, '2026-02-28 10:39:02', '2026-05-19 23:34:53'),
(2, 'App1', 'Mặc định', '#000000', 'img/products/ipad-wifi-32gb-2018-thumb-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(3, 'APP2', 'Mặc định', '#000000', 'img/products/Screenshot 2025-12-05 085408.png', 3, '2026-02-28 10:39:02', '2026-03-01 16:51:42'),
(4, 'App3', 'Mặc định', '#000000', 'https://cdn.tgdd.vn/Products/Images/42/191483/iphone-xr-128gb-red-600x600.jpg', 9, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(5, 'App4', 'Mặc định', '#000000', 'https://cdn.tgdd.vn/Products/Images/42/114110/iphone-8-plus-hh-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(6, 'App5', 'Mặc định', '#000000', 'https://cdn.tgdd.vn/Products/Images/42/114114/iphone-8-plus-256gb-red-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(7, 'App6', 'Mặc định', '#000000', 'https://cdn.tgdd.vn/Products/Images/42/190325/iphone-xr-black-400x460.png', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(8, 'APP7', 'Mặc định', '#000000', 'http://localhost:8080/eaut_phone/admin.html', 8, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(9, 'Hua0', 'Mặc định', '#000000', 'img/products/huawei-mate-20-pro-green-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(10, 'Hua1', 'Mặc định', '#000000', 'img/products/huawei-nova-3-2-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(11, 'Hua2', 'Mặc định', '#000000', 'img/products/huawei-y5-2017-300x300.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(12, 'Hua3', 'Mặc định', '#000000', 'https://cdn.tgdd.vn/Products/Images/42/157031/samsung-galaxy-a6-2018-2-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(13, 'Nok0', 'Mặc định', '#000000', 'img/products/nokia-51-plus-black-18thangbh-400x400.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(14, 'Opp0', 'Mặc định', '#000000', 'img/products/oppo-f9-red-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(15, 'Opp1', 'Mặc định', '#000000', 'img/products/oppo-a3s-32gb-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(16, 'Rea0', 'Mặc định', '#000000', 'https://cdn.tgdd.vn/Products/Images/42/192002/oppo-realme-2-pro-black-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(17, 'Rea1', 'Mặc định', '#000000', 'https://cdn.tgdd.vn/Products/Images/42/193462/realme-2-4gb-64gb-docquyen-600x600.jpg', 9, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(18, 'Rea2', 'Mặc định', '#000000', 'https://cdn.tgdd.vn/Products/Images/42/193286/realme-c1-black-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(19, 'Rea3', 'Mặc định', '#000000', 'https://cdn.tgdd.vn/Products/Images/42/193464/realme-2-pro-4gb-64gb-blue-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(20, 'Sam0', 'Mặc định', '#000000', 'img/products/samsung-galaxy-j4-plus-pink-400x400.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(21, 'Sam1', 'Mặc định', '#000000', 'img/products/samsung-galaxy-a8-plus-2018-gold-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(22, 'Sam2', 'Mặc định', '#000000', 'img/products/samsung-galaxy-j8-600x600-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(23, 'Sam3', 'Mặc định', '#000000', 'https://cdn.tgdd.vn/Products/Images/42/194327/samsung-galaxy-a7-2018-128gb-black-400x400.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(24, 'Viv0', 'Mặc định', '#000000', 'https://cdn.tgdd.vn/Products/Images/42/188828/vivo-v11-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(25, 'Viv1', 'Mặc định', '#000000', 'https://cdn.tgdd.vn/Products/Images/42/155047/vivo-v9-2-1-600x600-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(26, 'Viv2', 'Mặc định', '#000000', 'https://cdn.tgdd.vn/Products/Images/42/156205/vivo-y85-red-docquyen-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(27, 'Viv3', 'Mặc định', '#000000', 'https://cdn.tgdd.vn/Products/Images/42/158585/vivo-y71-docquyen-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(28, 'Xia0', 'Mặc định', '#000000', 'img/products/xiaomi-mi-8-lite-black-1-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(29, 'Xia1', 'Mặc định', '#000000', 'img/products/xiaomi-mi-8-1-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(30, 'Xia2', 'Mặc định', '#000000', 'img/products/xiaomi-redmi-note-5-pro-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(31, 'Xia3', 'Mặc định', '#000000', 'img/products/xiaomi-redmi-5-plus-600x600.jpg', 10, '2026-02-28 10:39:02', '2026-03-01 00:36:30'),
(32, 'APP2', 'Đen', '#000000', 'img/products/Screenshot 2025-12-05 085408.png', 2, '2026-02-28 11:42:27', '2026-03-01 00:36:30');
INSERT INTO `product_variants` (`variant_id`, `masp`, `ten_mau`, `ma_mau_hex`, `hinh_anh`, `so_luong_ton`, `created_at`, `updated_at`) VALUES
(33, 'App0', 'trắng', '#FFFFFF', 'data:image/jpeg;base64,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', 1, '2026-02-28 12:16:50', '2026-03-01 01:47:02');

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

--
-- Dumping data for table `rate`
--

INSERT INTO `rate` (`id`, `masp`, `variant_id`, `mau_sac`, `username`, `so_sao`, `binh_luan`, `ngay_dg`) VALUES
(6, 'APP2', 3, 'Mặc định', 'tuyen', 5, 'sản phẩm tốt', '2026-05-17 11:45:32');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `ho` varchar(50) DEFAULT NULL,
  `ten` varchar(50) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` varchar(10) DEFAULT 'user',
  `trang_thai` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `ho`, `ten`, `username`, `password`, `email`, `role`, `trang_thai`) VALUES
(1, 'Quản trị', 'Viên', 'admin', 'adadad', 'admin@gmail.com', 'admin', 1),
(3, 'thanh', 'thanh', 'thanh', 'thanh123', 'thanh@123.com', 'user', 1),
(4, '', 'tuyen', 'tuyen', 'tuyen123', 'tuyen171809@gmail.com', 'user', 1),
(10, 'nguyen', 'A', 'tuyen1', '$2y$10$ounI8HDich6IRf5kPfLSauf0XkNYpMWxtZjJMVKg.wt', 'zic200409@gmail.com', 'user', 1);

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
-- Dumping data for table `vnpay_payment_sessions`
--

INSERT INTO `vnpay_payment_sessions` (`session_id`, `txn_ref`, `username`, `tong_tien`, `ho_ten`, `dia_chi`, `so_dien_thoai`, `cart_json`, `cart_signature`, `session_status`, `order_id`, `vnp_transaction_no`, `vnp_response_code`, `paid_at`, `created_at`, `expires_at`) VALUES
(1, 'GD202605192256154737', 'tuyen', 11990000, 'tuyen', 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', '[{\"masp\":\"App0\",\"variant_id\":1,\"mau_sac\":\"Mặc định\",\"so_luong\":1,\"gia\":11990000}]', '2f195a7d4095d30e280f8613b95b9389aa5a5c5c3a706a1c72f66f066840ff29', 'Pending', NULL, NULL, NULL, NULL, '2026-05-19 22:56:15', '2026-05-19 23:11:15'),
(2, 'GD202605192256342877', 'tuyen', 11990000, 'tuyen', 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', '[{\"masp\":\"App0\",\"variant_id\":1,\"mau_sac\":\"Mặc định\",\"so_luong\":1,\"gia\":11990000}]', '2f195a7d4095d30e280f8613b95b9389aa5a5c5c3a706a1c72f66f066840ff29', 'Failed', 42, '0', '24', NULL, '2026-05-19 22:56:34', '2026-05-19 23:11:34'),
(3, 'GD202605192257094342', 'tuyen', 11990000, 'tuyen', 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', '[{\"masp\":\"App0\",\"variant_id\":1,\"mau_sac\":\"Mặc định\",\"so_luong\":1,\"gia\":11990000}]', '2f195a7d4095d30e280f8613b95b9389aa5a5c5c3a706a1c72f66f066840ff29', 'Failed', 43, '0', '24', NULL, '2026-05-19 22:57:09', '2026-05-19 23:12:09'),
(4, 'GD202605192257565147', 'tuyen', 11990000, 'tuyen', 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', '[{\"masp\":\"App0\",\"variant_id\":1,\"mau_sac\":\"Mặc định\",\"so_luong\":1,\"gia\":11990000}]', '2f195a7d4095d30e280f8613b95b9389aa5a5c5c3a706a1c72f66f066840ff29', 'Pending', NULL, NULL, NULL, NULL, '2026-05-19 22:57:56', '2026-05-19 23:12:56'),
(5, 'GD202605192258232062', 'tuyen', 11990000, 'tuyen', 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', '[{\"masp\":\"App0\",\"variant_id\":1,\"mau_sac\":\"Mặc định\",\"so_luong\":1,\"gia\":11990000}]', '2f195a7d4095d30e280f8613b95b9389aa5a5c5c3a706a1c72f66f066840ff29', 'Pending', NULL, NULL, NULL, NULL, '2026-05-19 22:58:23', '2026-05-19 23:13:23'),
(6, 'GD202605192332212455', 'tuyen', 11990000, 'tuyen', 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', '[{\"masp\":\"App0\",\"variant_id\":1,\"mau_sac\":\"Mặc định\",\"so_luong\":1,\"gia\":11990000}]', '656330d407f2c66bb4f0a181650d3dc41a96e4181708380c6250e8d96b61d0ad', 'Pending', NULL, NULL, NULL, NULL, '2026-05-19 23:32:21', '2026-05-19 23:47:21'),
(7, 'GD202605192332378622', 'tuyen', 11990000, 'tuyen', 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', '[{\"masp\":\"App0\",\"variant_id\":1,\"mau_sac\":\"Mặc định\",\"so_luong\":1,\"gia\":11990000}]', '656330d407f2c66bb4f0a181650d3dc41a96e4181708380c6250e8d96b61d0ad', 'Failed', 45, '0', '24', NULL, '2026-05-19 23:32:37', '2026-05-19 23:47:37'),
(8, 'GD202605192333332693', 'tuyen', 11990000, 'tuyen', 'Thổ Tang, Thổ Tang Commune, Phú Thọ Province, Vietnam', '0375615945', '[{\"masp\":\"App0\",\"variant_id\":1,\"mau_sac\":\"Mặc định\",\"so_luong\":1,\"gia\":11990000}]', '656330d407f2c66bb4f0a181650d3dc41a96e4181708380c6250e8d96b61d0ad', 'Paid', 46, '15547106', '00', '2026-05-19 23:34:47', '2026-05-19 23:33:33', '2026-05-19 23:48:33');

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
  ADD KEY `username` (`username`);

--
-- Indexes for table `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`detail_id`),
  ADD KEY `ma_don` (`ma_don`),
  ADD KEY `masp` (`masp`),
  ADD KEY `idx_variant_id` (`variant_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `ma_don` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `order_details`
--
ALTER TABLE `order_details`
  MODIFY `detail_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `variant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `rate`
--
ALTER TABLE `rate`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `vnpay_payment_sessions`
--
ALTER TABLE `vnpay_payment_sessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
