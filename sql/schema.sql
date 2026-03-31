-- ============================================================
-- Project:  The Drop
-- Course:   CS 4604 — Introduction to Database Management Systems
-- Team:     Mehak Jit, Racquell Grey, Logan McKay, Theo Wallace
-- Semester: Spring 2026
-- ============================================================

USE thedrop;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE `users` (
  `user_id`       INT AUTO_INCREMENT PRIMARY KEY,
  `email`         VARCHAR(100) NOT NULL UNIQUE,
  `username`      VARCHAR(50)  NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name`    VARCHAR(50),
  `last_name`     VARCHAR(50),
  `phone`         VARCHAR(20),
  `status`        VARCHAR(50)  NOT NULL DEFAULT 'active',
  `created_at`    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- RETAILER
-- ============================================================
CREATE TABLE `retailer` (
  `retailer_id`   INT AUTO_INCREMENT PRIMARY KEY,
  `name`          VARCHAR(100) NOT NULL UNIQUE,
  `email`         VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `website`       VARCHAR(255),
  `location`      VARCHAR(255),
  `created_at`    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PRODUCT
-- ============================================================
CREATE TABLE `product` (
  `product_id`  INT AUTO_INCREMENT PRIMARY KEY,
  `retailer_id` INT            NOT NULL,
  `sku`         VARCHAR(50)    NOT NULL UNIQUE,
  `name`        VARCHAR(100)   NOT NULL,
  `brand`       VARCHAR(100)   NOT NULL,
  `colorway`    VARCHAR(100),
  `price`       DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  `description` TEXT,
  `image_url`   VARCHAR(255),
  `created_at`  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `product_ibfk_retailer` FOREIGN KEY (`retailer_id`) REFERENCES `retailer` (`retailer_id`)
);

-- ============================================================
-- DROP EVENT
-- ============================================================
CREATE TABLE `drop_event` (
  `drop_id`       INT AUTO_INCREMENT PRIMARY KEY,
  `retailer_id`   INT          NOT NULL,
  `name`          VARCHAR(100) NOT NULL,
  `description`   TEXT,
  `drop_start_at` DATETIME     NOT NULL,
  `drop_end_at`   DATETIME,
  `status`        VARCHAR(50)  NOT NULL DEFAULT 'upcoming',
  CONSTRAINT `drop_event_ibfk_1` FOREIGN KEY (`retailer_id`) REFERENCES `retailer` (`retailer_id`)
);

-- ============================================================
-- AVAILABILITY SCHEDULE
-- ============================================================
CREATE TABLE `availability_schedule` (
  `schedule_id`    INT      AUTO_INCREMENT PRIMARY KEY,
  `drop_id`        INT      NOT NULL,
  `retailer_id`    INT      NOT NULL,
  `product_id`     INT      NOT NULL,
  `available_from` DATETIME NOT NULL,
  `available_to`   DATETIME NOT NULL,
  `qty_available`  INT      NOT NULL DEFAULT 0,
  `is_available`   BOOLEAN  DEFAULT FALSE,
  CONSTRAINT `availability_schedule_ibfk_1` FOREIGN KEY (`drop_id`)     REFERENCES `drop_event` (`drop_id`),
  CONSTRAINT `availability_schedule_ibfk_2` FOREIGN KEY (`retailer_id`) REFERENCES `retailer`   (`retailer_id`),
  CONSTRAINT `availability_schedule_ibfk_3` FOREIGN KEY (`product_id`)  REFERENCES `product`    (`product_id`)
);

-- ============================================================
-- REQUESTS
-- ============================================================
CREATE TABLE `requests` (
  `request_id`     INT AUTO_INCREMENT PRIMARY KEY,
  `user_id`        INT NOT NULL,
  `schedule_id`    INT NOT NULL,
  `request_status` ENUM('pending', 'approved', 'denied') NOT NULL DEFAULT 'pending',
  `created_at`     DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`user_id`)     REFERENCES `users`                 (`user_id`),
  CONSTRAINT `requests_ibfk_2` FOREIGN KEY (`schedule_id`) REFERENCES `availability_schedule` (`schedule_id`)
);

-- ============================================================
-- NOTIFICATION
-- ============================================================
CREATE TABLE `notification` (
  `notification_id`   INT AUTO_INCREMENT PRIMARY KEY,
  `user_id`           INT        NOT NULL,
  `schedule_id`       INT        NOT NULL,
  `notification_type` VARCHAR(50),
  `channel`           VARCHAR(50),
  `sent_at`           DATETIME   DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`user_id`)     REFERENCES `users`                 (`user_id`),
  CONSTRAINT `notification_ibfk_2` FOREIGN KEY (`schedule_id`) REFERENCES `availability_schedule` (`schedule_id`)
);

-- ============================================================
-- PURCHASE
-- ============================================================
CREATE TABLE `purchase` (
  `purchase_id`     INT AUTO_INCREMENT PRIMARY KEY,
  `user_id`         INT           NOT NULL,
  `retailer_id`     INT           NOT NULL,
  `schedule_id`     INT           NOT NULL,
  `qty`             INT           NOT NULL DEFAULT 1,
  `total_amount`    DECIMAL(10,2) NOT NULL,
  `purchase_status` ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  `purchased_at`    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `purchase_ibfk_1` FOREIGN KEY (`user_id`)     REFERENCES `users`                 (`user_id`),
  CONSTRAINT `purchase_ibfk_2` FOREIGN KEY (`retailer_id`) REFERENCES `retailer`              (`retailer_id`),
  CONSTRAINT `purchase_ibfk_3` FOREIGN KEY (`schedule_id`) REFERENCES `availability_schedule` (`schedule_id`)
);

-- ============================================================
-- PAYMENT
-- ============================================================
CREATE TABLE `payment` (
  `payment_id`     INT AUTO_INCREMENT PRIMARY KEY,
  `purchase_id`    INT           NOT NULL UNIQUE,
  `amount`         DECIMAL(10,2) NOT NULL,
  `method`         ENUM('credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay') NOT NULL,
  `payment_status` ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  `transaction_id` VARCHAR(100)  UNIQUE,
  `paid_at`        DATETIME      DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchase` (`purchase_id`)
);

-- ============================================================
-- FEEDBACK
-- ============================================================
CREATE TABLE `feedback` (
  `feedback_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id`     INT  NOT NULL,
  `product_id`  INT  NOT NULL,
  `purchase_id` INT  NOT NULL,
  `text`        TEXT,
  `created_at`  DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`user_id`)     REFERENCES `users`    (`user_id`),
  CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`product_id`)  REFERENCES `product`  (`product_id`),
  CONSTRAINT `feedback_ibfk_3` FOREIGN KEY (`purchase_id`) REFERENCES `purchase` (`purchase_id`)
);

-- ============================================================
-- RATING
-- ============================================================
CREATE TABLE `rating` (
  `rating_id`   INT AUTO_INCREMENT PRIMARY KEY,
  `user_id`     INT  NOT NULL,
  `product_id`  INT  NOT NULL,
  `purchase_id` INT  NOT NULL,
  `stars`       INT  NOT NULL CHECK (`stars` BETWEEN 0 AND 5),
  `created_at`  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_rating` (`user_id`, `product_id`, `purchase_id`),
  CONSTRAINT `rating_ibfk_1` FOREIGN KEY (`user_id`)     REFERENCES `users`    (`user_id`),
  CONSTRAINT `rating_ibfk_2` FOREIGN KEY (`product_id`)  REFERENCES `product`  (`product_id`),
  CONSTRAINT `rating_ibfk_3` FOREIGN KEY (`purchase_id`) REFERENCES `purchase` (`purchase_id`)
);