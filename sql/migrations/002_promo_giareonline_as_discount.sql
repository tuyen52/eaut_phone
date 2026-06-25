-- ============================================================
-- Migration 002: giareonline = SO TIEN GIAM (khong phai gia cuoi)
-- Dong bo voi code: utils.js, price_helpers.php, admin
-- Database: eaut_phone_db (dump eaut_phone_db (1).sql Jun 25 2026)
-- CHI CHAY 1 LAN — dieu kien > 50% gia giup tranh chay lai sai
-- ============================================================

USE `eaut_phone_db`;

-- --- Buoc 1: Kiem tra TRUOC (8 dong, dang luu GIA CUOI) ---
SELECT
  masp,
  ten_sp,
  gia,
  khuyen_mai_gia_tri AS gia_tri_hien_tai,
  CASE
    WHEN CAST(khuyen_mai_gia_tri AS SIGNED) > CAST(gia AS SIGNED) * 0.5
      THEN 'CAN DOI (dang la gia cuoi)'
    ELSE 'DA DONG BO (dang la so tien giam)'
  END AS trang_thai
FROM products
WHERE khuyen_mai_loai = 'giareonline'
ORDER BY masp;

-- --- Buoc 2: Doi gia cuoi -> so tien giam ---
UPDATE products
SET khuyen_mai_gia_tri = CAST(gia AS SIGNED) - CAST(khuyen_mai_gia_tri AS SIGNED)
WHERE khuyen_mai_loai = 'giareonline'
  AND khuyen_mai_gia_tri IS NOT NULL
  AND khuyen_mai_gia_tri <> ''
  AND CAST(khuyen_mai_gia_tri AS SIGNED) > 0
  AND CAST(khuyen_mai_gia_tri AS SIGNED) < CAST(gia AS SIGNED)
  AND CAST(khuyen_mai_gia_tri AS SIGNED) > CAST(gia AS SIGNED) * 0.5;

-- --- Buoc 3: Kiem tra SAU (ket qua mong doi) ---
SELECT
  masp,
  ten_sp,
  gia AS gia_niem_yet,
  khuyen_mai_gia_tri AS so_tien_giam_online,
  CAST(gia AS SIGNED) - CAST(khuyen_mai_gia_tri AS SIGNED) AS gia_ban_web
FROM products
WHERE khuyen_mai_loai = 'giareonline'
ORDER BY masp;
