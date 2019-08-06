CREATE TABLE `comment` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `message` varchar(1000) NOT NULL,
  `imgUrl` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `ownerId` int(10) unsigned DEFAULT NULL,
  `onPostId` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_b8804d1590ac402b52f3e945162` (`ownerId`),
  KEY `FK_84acfb7a4aedcc783fa1b3ddca6` (`onPostId`),
  CONSTRAINT `FK_84acfb7a4aedcc783fa1b3ddca6` FOREIGN KEY (`onPostId`) REFERENCES `post` (`id`),
  CONSTRAINT `FK_b8804d1590ac402b52f3e945162` FOREIGN KEY (`ownerId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `like` (
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `ownerId` int(10) unsigned NOT NULL,
  `onPostId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`ownerId`,`onPostId`),
  KEY `FK_8beb6d5495a9b707b17d31b40ea` (`onPostId`),
  CONSTRAINT `FK_5cc8feaa1472fabae24b0bcd58a` FOREIGN KEY (`ownerId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_8beb6d5495a9b707b17d31b40ea` FOREIGN KEY (`onPostId`) REFERENCES `post` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `post` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `sensitive` tinyint(4) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `ownerId` int(10) unsigned DEFAULT NULL,
  `imgUrl` varchar(300) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_4490d00e1925ca046a1f52ddf04` (`ownerId`),
  CONSTRAINT `FK_4490d00e1925ca046a1f52ddf04` FOREIGN KEY (`ownerId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `tag` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tagText` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `post_tags_tag` (
  `postId` int(10) unsigned NOT NULL,
  `tagId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`postId`,`tagId`),
  KEY `IDX_b651178cc41334544a7a9601c4` (`postId`),
  KEY `IDX_41e7626b9cc03c5c65812ae55e` (`tagId`),
  CONSTRAINT `FK_41e7626b9cc03c5c65812ae55e8` FOREIGN KEY (`tagId`) REFERENCES `tag` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_b651178cc41334544a7a9601c45` FOREIGN KEY (`postId`) REFERENCES `post` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(30) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `imgUrl` varchar(255) DEFAULT NULL,
  `firstName` varchar(50) DEFAULT NULL,
  `lastName` varchar(50) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `lastIP` varchar(30) DEFAULT NULL,
  `lastOnline` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dob` date NOT NULL,
  `country` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
