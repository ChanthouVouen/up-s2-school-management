-- AlterTable
ALTER TABLE `activity_logs` MODIFY `type` ENUM('STUDENT', 'TEACHER', 'DOCUMENT', 'APPLICATION', 'PAYMENT', 'USER', 'ROLE', 'SYSTEM', 'PARTNER_SCHOOL', 'ID_CARD') NULL;

-- CreateTable
CREATE TABLE `id_cards` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cardNumber` VARCHAR(191) NOT NULL,
    `studentId` INTEGER NOT NULL,
    `issueDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiryDate` DATETIME(3) NOT NULL,
    `verificationToken` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `id_cards_cardNumber_key`(`cardNumber`),
    UNIQUE INDEX `id_cards_studentId_key`(`studentId`),
    UNIQUE INDEX `id_cards_verificationToken_key`(`verificationToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `id_cards` ADD CONSTRAINT `id_cards_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
