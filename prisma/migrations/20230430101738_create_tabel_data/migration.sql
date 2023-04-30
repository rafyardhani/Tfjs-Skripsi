-- CreateTable
CREATE TABLE `data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `warna` VARCHAR(191) NOT NULL,
    `bentuk` VARCHAR(191) NOT NULL,
    `kristal` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
