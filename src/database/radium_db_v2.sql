-- DEFAULTS

SET @@GLOBAL .time_zone = "+00:00";
SET time_zone = "+00:00";

-- SCHEMA 

CREATE TABLE `users` (
    `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(30) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(300) NOT NULL,
    `img_url` VARCHAR(100),
    `first_name` VARCHAR(100),
    `last_name` VARCHAR(100),
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL,
    `last_ip` VARCHAR(100),
    `last_online` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `dob` DATE,
    `country` VARCHAR(30) NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE `posts` (
    `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(50),
    `file_path` VARCHAR(100) NOT NULL,
    `adult` BOOLEAN DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL,
    `user_id` INT(10) UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
);

CREATE TABLE `comments` (
    `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `message` VARCHAR(1000) NOT NULL,
    `tag_to` VARCHAR(30),
    `img_url` VARCHAR(100),
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL,
    `post_id` INT(10) UNSIGNED NOT NULL,
    `user_id` INT(10) UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`post_id`)
        REFERENCES `posts` (`id`),
    FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`),
	FOREIGN KEY (`tag_to`)
        REFERENCES `users` (`username`)
);

CREATE TABLE `likes` (
    `post_id` INT(10) UNSIGNED NOT NULL,
    `user_id` INT(10) UNSIGNED NOT NULL,
    FOREIGN KEY (`post_id`)
        REFERENCES `posts` (`id`),
    FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`),
	CONSTRAINT post_user PRIMARY KEY (`post_id`,`user_id`),
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL
);

CREATE TABLE `tags` (
    `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (`id`),
    `tag_name` VARCHAR(15) NOT NULL
);

CREATE TABLE `post_tag` (
    `post_id` INT(10) UNSIGNED NOT NULL,
    `tag_id` INT(10) UNSIGNED NOT NULL,
    FOREIGN KEY (`post_id`)
        REFERENCES `posts` (`id`),
    FOREIGN KEY (`tag_id`)
        REFERENCES `tags` (`id`)
);