-- Chạy file này nếu bạn đã ADD cột gia_ban nhưng bị lỗi #1442 ở bước UPDATE
-- (Trigger cũ vẫn còn khi UPDATE product_variants JOIN products)

USE `eaut_phone_db`;

DROP TRIGGER IF EXISTS `trg_variants_ad`;
DROP TRIGGER IF EXISTS `trg_variants_ai`;
DROP TRIGGER IF EXISTS `trg_variants_au`;

UPDATE `product_variants` pv
INNER JOIN `products` p ON p.`masp` = pv.`masp`
SET pv.`gia_ban` = p.`gia`
WHERE pv.`gia_ban` = 0;

UPDATE `products` p
SET p.`gia` = COALESCE(
  (
    SELECT MIN(v.`gia_ban`)
    FROM `product_variants` v
    WHERE v.`masp` = p.`masp`
      AND v.`gia_ban` > 0
  ),
  p.`gia`
);

-- Sau đó chạy phần CREATE TRIGGER từ 001_add_variant_gia_ban.sql (BƯỚC 4)
