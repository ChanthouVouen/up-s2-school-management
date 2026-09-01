-- CreateTable
CREATE TABLE `organization_settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `orgName` VARCHAR(191) NOT NULL DEFAULT '',
    `slogan` VARCHAR(191) NULL,
    `logoUrl` LONGTEXT NULL,
    `primaryEmail` VARCHAR(191) NULL,
    `supportPhone` VARCHAR(191) NULL,
    `websiteUrl` VARCHAR(191) NULL,
    `supportPortal` VARCHAR(191) NULL,
    `streetAddress` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `postalCode` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
