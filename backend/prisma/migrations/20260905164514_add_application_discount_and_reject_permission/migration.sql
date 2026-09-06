-- AlterTable
ALTER TABLE `applications` ADD COLUMN `discountType` ENUM('PERCENTAGE', 'FIXED_AMOUNT') NULL,
    ADD COLUMN `discountValue` DOUBLE NULL;
