-- Align document timestamps with prisma/schema.prisma.
ALTER TABLE `documents`
  ADD COLUMN `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

ALTER TABLE `document_reviews`
  CHANGE COLUMN `createdAt` `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
