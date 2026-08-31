-- CreateTable
CREATE TABLE IF NOT EXISTS `partner_schools` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('HIGH_SCHOOL', 'UNIVERSITY', 'COMPANY', 'ORGANIZATION') NOT NULL DEFAULT 'HIGH_SCHOOL',
    `city` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `logoUrl` VARCHAR(191) NULL,
    `contactPerson` VARCHAR(191) NULL,
    `contactEmail` VARCHAR(191) NULL,
    `contactPhone` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'PENDING_RENEWAL', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `mous` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partnerSchoolId` INTEGER NOT NULL,
    `mouTitle` VARCHAR(191) NOT NULL,
    `mouNumber` VARCHAR(191) NULL,
    `signDate` DATETIME(3) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `status` ENUM('ACTIVE', 'EXPIRED', 'PENDING_RENEWAL', 'TERMINATED') NOT NULL DEFAULT 'ACTIVE',
    `discountType` ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL DEFAULT 'PERCENTAGE',
    `discountValue` DOUBLE NOT NULL DEFAULT 0,
    `maxEligibleStudents` INTEGER NULL,
    `mouDocumentUrl` VARCHAR(191) NULL,
    `scope` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mous` ADD CONSTRAINT `mous_partnerSchoolId_fkey` FOREIGN KEY (`partnerSchoolId`) REFERENCES `partner_schools`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `students` ADD COLUMN IF NOT EXISTS `partnerSchoolId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_partnerSchoolId_fkey` FOREIGN KEY (`partnerSchoolId`) REFERENCES `partner_schools`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
