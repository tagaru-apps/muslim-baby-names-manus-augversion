CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorUserId` int,
	`action` varchar(100) NOT NULL,
	`resourceType` varchar(100) NOT NULL,
	`resourceId` varchar(128),
	`beforeValue` json,
	`afterValue` json,
	`createdAtMs` bigint NOT NULL,
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pin_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`publicUrl` varchar(2048) NOT NULL,
	`altText` varchar(500) NOT NULL,
	`width` int NOT NULL,
	`height` int NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`aiModified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pin_assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `pin_assets_storageKey_unique` UNIQUE(`storageKey`)
);
--> statement-breakpoint
CREATE TABLE `pin_drafts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`boardId` int,
	`assetId` int,
	`title` varchar(100) NOT NULL,
	`description` varchar(800) NOT NULL,
	`destinationUrl` varchar(2048) NOT NULL,
	`status` enum('draft','ready_for_review','owner_approved','queued','published','failed','cancelled') NOT NULL DEFAULT 'draft',
	`aiModified` boolean NOT NULL DEFAULT false,
	`approvedAt` bigint,
	`approvedByUserId` int,
	`scheduledFor` bigint,
	`scheduleCronTaskUid` varchar(65),
	`idempotencyKey` varchar(128) NOT NULL,
	`lastError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pin_drafts_id` PRIMARY KEY(`id`),
	CONSTRAINT `pin_drafts_idempotencyKey_unique` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `pin_publications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`draftId` int NOT NULL,
	`pinterestPinId` varchar(128),
	`liveUrl` varchar(2048),
	`requestKey` varchar(128) NOT NULL,
	`attemptCount` int NOT NULL DEFAULT 0,
	`providerResponse` json,
	`publishedAt` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pin_publications_id` PRIMARY KEY(`id`),
	CONSTRAINT `pin_publications_draftId_unique` UNIQUE(`draftId`),
	CONSTRAINT `pin_publications_requestKey_unique` UNIQUE(`requestKey`)
);
--> statement-breakpoint
CREATE TABLE `pinterest_boards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionId` int NOT NULL,
	`pinterestBoardId` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSyncedAt` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pinterest_boards_id` PRIMARY KEY(`id`),
	CONSTRAINT `pinterest_boards_connection_external_unique` UNIQUE(`connectionId`,`pinterestBoardId`)
);
--> statement-breakpoint
CREATE TABLE `pinterest_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`pinterestUserId` varchar(128),
	`accountName` varchar(255),
	`accessTokenCiphertext` text,
	`refreshTokenCiphertext` text,
	`tokenExpiresAt` bigint,
	`scopes` varchar(1000),
	`status` enum('disconnected','connected','expired','error') NOT NULL DEFAULT 'disconnected',
	`lastCheckedAt` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pinterest_connections_id` PRIMARY KEY(`id`),
	CONSTRAINT `pinterest_connections_ownerUserId_unique` UNIQUE(`ownerUserId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actorUserId_users_id_fk` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pin_assets` ADD CONSTRAINT `pin_assets_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pin_drafts` ADD CONSTRAINT `pin_drafts_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pin_drafts` ADD CONSTRAINT `pin_drafts_boardId_pinterest_boards_id_fk` FOREIGN KEY (`boardId`) REFERENCES `pinterest_boards`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pin_drafts` ADD CONSTRAINT `pin_drafts_assetId_pin_assets_id_fk` FOREIGN KEY (`assetId`) REFERENCES `pin_assets`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pin_drafts` ADD CONSTRAINT `pin_drafts_approvedByUserId_users_id_fk` FOREIGN KEY (`approvedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pin_publications` ADD CONSTRAINT `pin_publications_draftId_pin_drafts_id_fk` FOREIGN KEY (`draftId`) REFERENCES `pin_drafts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pinterest_boards` ADD CONSTRAINT `pinterest_boards_connectionId_pinterest_connections_id_fk` FOREIGN KEY (`connectionId`) REFERENCES `pinterest_connections`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pinterest_connections` ADD CONSTRAINT `pinterest_connections_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_logs_resource_idx` ON `audit_logs` (`resourceType`,`resourceId`);--> statement-breakpoint
CREATE INDEX `audit_logs_actor_created_idx` ON `audit_logs` (`actorUserId`,`createdAtMs`);--> statement-breakpoint
CREATE INDEX `pin_drafts_status_scheduled_idx` ON `pin_drafts` (`status`,`scheduledFor`);--> statement-breakpoint
CREATE INDEX `pin_drafts_cron_task_idx` ON `pin_drafts` (`scheduleCronTaskUid`);