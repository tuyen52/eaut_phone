-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 29, 2026 at 05:36 AM
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
  `dia_chi` text DEFAULT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `tong_tien` decimal(15,0) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`ma_don`, `username`, `ngay_mua`, `tinh_trang`, `phuong_thuc_tt`, `dia_chi`, `so_dien_thoai`, `tong_tien`) VALUES
(7, 'thanh', '2025-12-11 02:55:49', 'Hoàn thành', 'COD', NULL, NULL, 11990000),
(11, 'tuyen', '2025-12-16 21:55:53', 'Hoàn thành', 'Chuyển khoản (Mã GD: DH1612216)', 'Ngõ 132 Đường Cầu Diễn, Tay Tuu Ward, Hà Nội, 12500, Vietnam', '0375615945', 18000000),
(12, 'tuyen', '2025-12-16 22:33:31', 'Hoàn thành', 'Thanh toán khi nhận hàng (COD)', 'Ngõ 132 Đường Cầu Diễn, Tay Tuu Ward, Hà Nội, 12500, Vietnam', '0375615945', 4490000),
(13, 'tuyen', '2025-12-20 16:14:39', 'Chờ xử lý', 'Chuyển khoản (Mã GD: DH2012236)', 'Đường CN1, Cụm công nghiệp vừa và nhỏ Từ Liêm, Xuan Phuong Ward, Hà Nội, 10085, Vietnam', '0375615945', 5000),
(14, 'tuyen', '2025-12-20 18:33:25', 'Hoàn thành', 'Chuyển khoản (Mã GD: DH2012198)', 'Đường CN1, Cụm công nghiệp vừa và nhỏ Từ Liêm, Xuan Phuong Ward, Hà Nội, 10085, Vietnam', '0375615945', 22990000);

-- --------------------------------------------------------

--
-- Table structure for table `order_details`
--

CREATE TABLE `order_details` (
  `detail_id` int(11) NOT NULL,
  `ma_don` int(11) NOT NULL,
  `masp` varchar(20) NOT NULL,
  `so_luong` int(11) DEFAULT 1,
  `don_gia` decimal(15,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_details`
--

INSERT INTO `order_details` (`detail_id`, `ma_don`, `masp`, `so_luong`, `don_gia`) VALUES
(7, 7, 'App0', 1, 11990000),
(11, 11, 'APP2', 1, 18000000),
(12, 12, 'Rea1', 1, 4490000),
(13, 13, 'APP7', 1, 5000),
(14, 14, 'App3', 1, 22990000);

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
('App0', 'iPhone X 256GB Silver', 'Apple', 'img/products/iphone-x-256gb-silver-400x400.jpg', 13990000, 11, 5, 1, 'giareonline', '11.990.000', 'OLED, 5.8\', Super Retina', 'iOS 11', '2 camera 12 MP', '7 MP', 'Apple A11 Bionic 6 nhân', '3 GB', '256 GB', 'Không', '2716 mAh, có sạc nhanh'),
('App1', 'iPad 2024 Wifi 32GB', 'Apple', 'img/products/ipad-wifi-32gb-2018-thumb-600x600.jpg', 8990000, 10, 0, 0, 'tragop', '0', 'LED-backlit LCD, 9.7p\'\'', 'iOS 11.3', '8 MP', '1.2 MP', 'Apple A10 Fusion, 2.34 GHz', '2 GB', '32 GB', 'Không', 'Chưa có thông số cụ thể'),
('APP2', 'iphone 12 128GB', 'Apple', 'img/products/Screenshot 2025-12-05 085408.png', 20000000, 4, 5, 1, 'giareonline', '18.000.000', '6.1-inch Liquid Retina HD (LCD)', 'iOS (ra mắt với iOS 13, hỗ trợ nâng cấp iOS mới)', 'Camera kép 12 MP', '12 MP, f/2.2', 'Apple A13 Bionic (6 nhân)', '4 GB', '128 GB', '', 'Không hỗ trợ'),
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
('Rea1', 'Realme 2 4GB/64GB', 'Realme', 'https://cdn.tgdd.vn/Products/Images/42/193462/realme-2-4gb-64gb-docquyen-600x600.jpg', 4490000, 9, 3, 1, 'moiramat', '', 'IPS LCD, 6.2\', HD+', 'Android 8.1 (Oreo)', '13 MP và 2 MP (2 camera)', '8 MP', 'Qualcomm Snapdragon 450 8 nhân 64-bit', '4 GB', '64 GB', 'MicroSD, hỗ trợ tối đa 256 GB', '4230 mAh'),
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
-- Table structure for table `rate`
--

CREATE TABLE `rate` (
  `id` int(11) NOT NULL,
  `masp` varchar(20) NOT NULL,
  `username` varchar(50) NOT NULL,
  `so_sao` int(11) NOT NULL,
  `binh_luan` text NOT NULL,
  `ngay_dg` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rate`
--

INSERT INTO `rate` (`id`, `masp`, `username`, `so_sao`, `binh_luan`, `ngay_dg`) VALUES
(1, 'App0', 'thanh', 5, 'sản phẩm tốt mua lần 2', '2025-12-10 20:56:30'),
(2, 'APP2', 'tuyen', 5, 'sản phẩm chất lượng tốt', '2025-12-16 16:31:26'),
(3, 'Rea1', 'tuyen', 3, 'sản phầm màn hình hơi nhiễu', '2025-12-16 16:35:38');

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
(4, 'nguyen', 'tuyen1', 'tuyen', 'tuyen123', 'tuyen171809@gmail.com', 'user', 1),
(9, 'nguyen', 'tuyen1', 'tuyen1', '8N5YvhWs', 'zic200409@gmail.com', 'user', 1);

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
  ADD KEY `username` (`username`);

--
-- Indexes for table `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`detail_id`),
  ADD KEY `ma_don` (`ma_don`),
  ADD KEY `masp` (`masp`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`masp`);

--
-- Indexes for table `rate`
--
ALTER TABLE `rate`
  ADD PRIMARY KEY (`id`),
  ADD KEY `masp` (`masp`),
  ADD KEY `username` (`username`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

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
  MODIFY `ma_don` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `order_details`
--
ALTER TABLE `order_details`
  MODIFY `detail_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `rate`
--
ALTER TABLE `rate`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
  ADD CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`ma_don`) REFERENCES `orders` (`ma_don`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_details_ibfk_2` FOREIGN KEY (`masp`) REFERENCES `products` (`masp`) ON DELETE CASCADE;

--
-- Constraints for table `rate`
--
ALTER TABLE `rate`
  ADD CONSTRAINT `rate_ibfk_1` FOREIGN KEY (`masp`) REFERENCES `products` (`masp`) ON DELETE CASCADE,
  ADD CONSTRAINT `rate_ibfk_2` FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
