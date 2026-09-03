/*
  Warnings:

  - You are about to alter the column `status` on the `applications` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(4))` to `Enum(EnumId(2))`.
  - Added the required column `updatedAt` to the `applications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `applications` ADD COLUMN `applicationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `approvalResult` TEXT NULL,
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `partnerSchoolId` INTEGER NULL,
    ADD COLUMN `responsibleStaffId` VARCHAR(191) NULL,
    ADD COLUMN `scholarshipDetails` TEXT NULL,
    ADD COLUMN `scholarshipRequested` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `status` ENUM('REGISTRATION', 'DOCUMENT_SUBMISSION', 'DOCUMENT_REVIEW', 'DOCUMENTS_APPROVED', 'SCHOLARSHIP_APPLICATION', 'APPLICATION_SUBMITTED', 'SCHOOL_REVIEW', 'SCHOOL_APPROVED', 'PAYMENT', 'ENROLLED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'REGISTRATION';

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_partnerSchoolId_fkey` FOREIGN KEY (`partnerSchoolId`) REFERENCES `partner_schools`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_responsibleStaffId_fkey` FOREIGN KEY (`responsibleStaffId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
