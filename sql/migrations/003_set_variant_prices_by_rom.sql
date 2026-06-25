-- ============================================================
-- Migration 003: Gia ban theo dung luong ROM (test / demo)
-- Database: eaut_phone_db
-- Trigger trg_variants_au tu dong cap nhat products.gia = MIN(gia_ban)
-- ============================================================

USE `eaut_phone_db`;

-- --- Buoc 1: Xem SP nao dang trung gia (truoc khi chay) ---
SELECT
  p.masp,
  p.ten_sp,
  p.gia AS gia_sp,
  COUNT(v.variant_id) AS so_variant,
  MIN(v.gia_ban) AS gia_min,
  MAX(v.gia_ban) AS gia_max,
  CASE
    WHEN MIN(v.gia_ban) = MAX(v.gia_ban) THEN 'TRUNG NHAU'
    ELSE 'DA KHAC NHAU'
  END AS trang_thai
FROM products p
JOIN product_variants v ON v.masp = p.masp
GROUP BY p.masp, p.ten_sp, p.gia
ORDER BY p.masp;

-- --- Buoc 2: Dat gia theo ROM (tu gia thap nhat hien tai cua tung SP) ---
-- 64 GB  = 100%  |  128 GB = +11%  |  256 GB = +28%  |  512 GB = +45%
UPDATE product_variants pv
INNER JOIN (
  SELECT masp, MIN(gia_ban) AS base_price
  FROM product_variants
  WHERE gia_ban > 0
  GROUP BY masp
) bp ON bp.masp = pv.masp
SET pv.gia_ban = CASE
  WHEN pv.rom LIKE '%512%' THEN ROUND(bp.base_price * 1.45 / 10000) * 10000
  WHEN pv.rom LIKE '%256%' THEN ROUND(bp.base_price * 1.28 / 10000) * 10000
  WHEN pv.rom LIKE '%128%' THEN ROUND(bp.base_price * 1.11 / 10000) * 10000
  WHEN pv.rom LIKE '%64%'  THEN bp.base_price
  ELSE bp.base_price
END
WHERE bp.base_price > 0;

-- --- Buoc 3: Dong bo products.gia (neu trigger chua cap nhat) ---
UPDATE products p
SET p.gia = COALESCE(
  (
    SELECT MIN(v.gia_ban)
    FROM product_variants v
    WHERE v.masp = p.masp
      AND v.gia_ban > 0
  ),
  p.gia
);

-- --- Buoc 4: Kiem tra sau (moi SP nen co gia_min <> gia_max) ---
SELECT
  p.masp,
  p.ten_sp,
  p.gia AS gia_sp_moi,
  v.rom,
  MIN(v.gia_ban) AS gia_rom_min,
  MAX(v.gia_ban) AS gia_rom_max
FROM products p
JOIN product_variants v ON v.masp = p.masp
GROUP BY p.masp, p.ten_sp, p.gia, v.rom
ORDER BY p.masp,
  CASE
    WHEN v.rom LIKE '%64%'  AND v.rom NOT LIKE '%128%' AND v.rom NOT LIKE '%256%' THEN 1
    WHEN v.rom LIKE '%128%' THEN 2
    WHEN v.rom LIKE '%256%' THEN 3
    WHEN v.rom LIKE '%512%' THEN 4
    ELSE 5
  END;
