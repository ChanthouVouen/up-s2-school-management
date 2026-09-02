/*
  Warnings:

  - Added the required column `fileName` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileType` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileUrl` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `documents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `documents` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `fileName` VARCHAR(191) NOT NULL,
    ADD COLUMN `fileSize` INTEGER NULL,
    ADD COLUMN `fileType` VARCHAR(191) NOT NULL,
    ADD COLUMN `fileUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `reviewComment` TEXT NULL,
    ADD COLUMN `reviewedAt` DATETIME(3) NULL,
    ADD COLUMN `reviewedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `document_reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `documentId` INTEGER NOT NULL,
    `reviewerId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `document_reviews_documentId_idx`(`documentId`),
    INDEX `document_reviews_reviewerId_idx`(`reviewerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `documents_status_idx` ON `documents`(`status`);

-- CreateIndex
CREATE INDEX `documents_type_idx` ON `documents`(`type`);

-- AddForeignKey
ALTER TABLE `document_reviews` ADD CONSTRAINT `document_reviews_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `documents_studentId_idx` ON `documents`(`studentId`);
