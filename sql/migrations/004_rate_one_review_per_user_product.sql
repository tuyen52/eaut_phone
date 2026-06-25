-- 1 user = 1 danh gia / san pham (cho phep sua, khong tao trung)
-- Chay tren eaut_phone_db

USE `eaut_phone_db`;

-- Xoa ban ghi trung (giu ban moi nhat theo id lon nhat)
DELETE r1
FROM rate r1
INNER JOIN rate r2
  ON r1.masp = r2.masp
 AND r1.user_id IS NOT NULL
 AND r1.user_id = r2.user_id
 AND r1.id < r2.id;

DELETE r1
FROM rate r1
INNER JOIN rate r2
  ON r1.masp = r2.masp
 AND r1.username = r2.username
 AND r1.id < r2.id;

-- Chi tao index neu chua co
SET @has_user_uq := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'rate'
    AND index_name = 'uq_rate_user_product'
);

SET @sql_user_uq := IF(
  @has_user_uq = 0,
  'ALTER TABLE `rate` ADD UNIQUE KEY `uq_rate_user_product` (`user_id`, `masp`)',
  'SELECT ''uq_rate_user_product da ton tai'' AS note'
);
PREPARE stmt_user_uq FROM @sql_user_uq;
EXECUTE stmt_user_uq;
DEALLOCATE PREPARE stmt_user_uq;

SET @has_name_uq := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'rate'
    AND index_name = 'uq_rate_username_product'
);

SET @sql_name_uq := IF(
  @has_name_uq = 0,
  'ALTER TABLE `rate` ADD UNIQUE KEY `uq_rate_username_product` (`username`, `masp`)',
  'SELECT ''uq_rate_username_product da ton tai'' AS note'
);
PREPARE stmt_name_uq FROM @sql_name_uq;
EXECUTE stmt_name_uq;
DEALLOCATE PREPARE stmt_name_uq;
