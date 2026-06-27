-- ============================================================
-- Giai đoạn 1: Giá theo biến thể (RAM/ROM/màu)
-- Database: eaut_phone_db
-- LỖI #1442: Phải DROP trigger TRƯỚC khi UPDATE product_variants
-- ============================================================

USE `eaut_phone_db`;

-- ------------------------------------------------------------
-- BƯỚC 0: Tắt trigger cũ (bắt buộc chạy trước mọi UPDATE variant)
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_variants_ad`;
DROP TRIGGER IF EXISTS `trg_variants_ai`;
DROP TRIGGER IF EXISTS `trg_variants_au`;

-- ------------------------------------------------------------
-- BƯỚC 1: Thêm cột (bỏ qua nếu đã chạy — báo Duplicate column)
-- ------------------------------------------------------------
ALTER TABLE `product_variants`
  ADD COLUMN `gia_ban` DECIMAL(15,0) NOT NULL DEFAULT 0
  COMMENT 'Giá bán của biến thể (màu + RAM + ROM)'
  AFTER `so_luong_ton`;

-- ------------------------------------------------------------
-- BƯỚC 2: Gán giá ban đầu từ products.gia
-- ------------------------------------------------------------
UPDATE `product_variants` pv
INNER JOIN `products` p ON p.`masp` = pv.`masp`
SET pv.`gia_ban` = p.`gia`
WHERE pv.`gia_ban` = 0;

-- ------------------------------------------------------------
-- BƯỚC 3: products.gia = giá thấp nhất các variant
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
-- BƯỚC 4: Tạo lại trigger (tồn kho + giá min)
-- ------------------------------------------------------------
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
