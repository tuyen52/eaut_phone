-- ============================================================
-- Giai đoạn 1: Giá theo biến thể (RAM/ROM/màu)
-- Database: eaut_phone (MariaDB/MySQL)
-- Chạy trong phpMyAdmin hoặc mysql CLI trên DB đang chạy thật
-- ============================================================
-- TRƯỚC KHI CHẠY: backup database (Export trong phpMyAdmin)
-- ============================================================

USE `eaut_phone_db`;

-- ------------------------------------------------------------
-- 1) Thêm cột giá bán cho từng biến thể
--    (Bỏ qua nếu đã chạy rồi — sẽ báo Duplicate column)
-- ------------------------------------------------------------
ALTER TABLE `product_variants`
  ADD COLUMN `gia_ban` DECIMAL(15,0) NOT NULL DEFAULT 0
  COMMENT 'Giá bán của biến thể (màu + RAM + ROM)'
  AFTER `so_luong_ton`;

-- ------------------------------------------------------------
-- 2) Migration dữ liệu cũ:
--    Copy products.gia -> product_variants.gia_ban
--    (Tạm thời mọi cấu hình cùng giá; admin chỉnh sau ở giai đoạn 2)
-- ------------------------------------------------------------
UPDATE `product_variants` pv
INNER JOIN `products` p ON p.`masp` = pv.`masp`
SET pv.`gia_ban` = p.`gia`
WHERE pv.`gia_ban` = 0;

-- ------------------------------------------------------------
-- 3) Đồng bộ products.gia = giá thấp nhất các variant (giá "Từ X đ")
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- 4) Cập nhật trigger: tự sync tồn kho + giá min khi variant đổi
--    (Giữ tên trigger cũ: trg_variants_ad / ai / au)
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_variants_ad`;
DROP TRIGGER IF EXISTS `trg_variants_ai`;
DROP TRIGGER IF EXISTS `trg_variants_au`;

DELIMITER $$

CREATE TRIGGER `trg_variants_ad` AFTER DELETE ON `product_variants`
FOR EACH ROW
BEGIN
  UPDATE `products` p
  SET
    p.`so_luong_ton` = (
      SELECT IFNULL(SUM(v.`so_luong_ton`), 0)
      FROM `product_variants` v
      WHERE v.`masp` = OLD.`masp`
    ),
    p.`gia` = COALESCE(
      (
        SELECT MIN(v.`gia_ban`)
        FROM `product_variants` v
        WHERE v.`masp` = OLD.`masp`
          AND v.`gia_ban` > 0
      ),
      0
    )
  WHERE p.`masp` = OLD.`masp`;
END$$

CREATE TRIGGER `trg_variants_ai` AFTER INSERT ON `product_variants`
FOR EACH ROW
BEGIN
  UPDATE `products` p
  SET
    p.`so_luong_ton` = (
      SELECT IFNULL(SUM(v.`so_luong_ton`), 0)
      FROM `product_variants` v
      WHERE v.`masp` = NEW.`masp`
    ),
    p.`gia` = COALESCE(
      (
        SELECT MIN(v.`gia_ban`)
        FROM `product_variants` v
        WHERE v.`masp` = NEW.`masp`
          AND v.`gia_ban` > 0
      ),
      0
    )
  WHERE p.`masp` = NEW.`masp`;
END$$

CREATE TRIGGER `trg_variants_au` AFTER UPDATE ON `product_variants`
FOR EACH ROW
BEGIN
  UPDATE `products` p
  SET
    p.`so_luong_ton` = (
      SELECT IFNULL(SUM(v.`so_luong_ton`), 0)
      FROM `product_variants` v
      WHERE v.`masp` = NEW.`masp`
    ),
    p.`gia` = COALESCE(
      (
        SELECT MIN(v.`gia_ban`)
        FROM `product_variants` v
        WHERE v.`masp` = NEW.`masp`
          AND v.`gia_ban` > 0
      ),
      0
    )
  WHERE p.`masp` = NEW.`masp`;

  IF (OLD.`masp` <> NEW.`masp`) THEN
    UPDATE `products` p
    SET
      p.`so_luong_ton` = (
        SELECT IFNULL(SUM(v.`so_luong_ton`), 0)
        FROM `product_variants` v
        WHERE v.`masp` = OLD.`masp`
      ),
      p.`gia` = COALESCE(
        (
          SELECT MIN(v.`gia_ban`)
          FROM `product_variants` v
          WHERE v.`masp` = OLD.`masp`
            AND v.`gia_ban` > 0
        ),
        0
      )
    WHERE p.`masp` = OLD.`masp`;
  END IF;
END$$

DELIMITER ;

-- ------------------------------------------------------------
-- 5) Kiểm tra sau khi chạy (chạy riêng, xem kết quả)
-- ------------------------------------------------------------
-- SELECT masp, COUNT(*) AS so_variant,
--        MIN(gia_ban) AS gia_thap_nhat,
--        MAX(gia_ban) AS gia_cao_nhat
-- FROM product_variants
-- GROUP BY masp
-- ORDER BY masp
-- LIMIT 20;

-- SELECT p.masp, p.ten_sp, p.gia AS gia_tren_products,
--        MIN(v.gia_ban) AS min_variant_gia
-- FROM products p
-- LEFT JOIN product_variants v ON v.masp = p.masp
-- GROUP BY p.masp, p.ten_sp, p.gia
-- HAVING min_variant_gia IS NULL OR p.gia <> min_variant_gia
-- LIMIT 20;
