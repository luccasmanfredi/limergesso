CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`kind` enum('service','photo','project') NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`published` boolean NOT NULL DEFAULT true,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `company_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyName` varchar(120) NOT NULL,
	`responsible` varchar(120) NOT NULL,
	`logoUrl` text,
	`phonePrimary` varchar(40) NOT NULL,
	`phoneSecondary` varchar(40) NOT NULL,
	`email` varchar(320) NOT NULL,
	`instagram` varchar(240),
	`address` text,
	`mapUrl` text,
	`heroImageUrl` text,
	`historyImageUrl` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text,
	`altText` varchar(240) NOT NULL,
	`storageKey` varchar(500),
	`imageUrl` text NOT NULL,
	`category` varchar(120) NOT NULL,
	`projectId` int,
	`published` boolean NOT NULL DEFAULT true,
	`featured` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`deletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`category` varchar(120) NOT NULL,
	`description` text NOT NULL,
	`coverImageUrl` text,
	`clientName` varchar(160),
	`city` varchar(160),
	`clientAuthorized` boolean NOT NULL DEFAULT false,
	`published` boolean NOT NULL DEFAULT true,
	`featured` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quote_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteId` int NOT NULL,
	`storageKey` varchar(500) NOT NULL,
	`imageUrl` text NOT NULL,
	`fileName` varchar(240) NOT NULL,
	`contentType` varchar(80) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quote_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quote_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteId` int NOT NULL,
	`authorId` int NOT NULL,
	`note` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quote_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quote_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicId` varchar(32) NOT NULL,
	`fullName` varchar(180) NOT NULL,
	`whatsapp` varchar(40) NOT NULL,
	`city` varchar(120) NOT NULL,
	`service` varchar(160) NOT NULL,
	`message` text NOT NULL,
	`status` enum('Novo','Em análise','Orçamento enviado','Aprovado','Recusado','Concluído') NOT NULL DEFAULT 'Novo',
	`dedupeHash` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deletedAt` timestamp,
	CONSTRAINT `quote_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `quote_requests_publicId_unique` UNIQUE(`publicId`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(120) NOT NULL,
	`imageUrl` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`published` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `site_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`heroTitle` text NOT NULL,
	`heroBody` text NOT NULL,
	`aboutTitle` text NOT NULL,
	`aboutBody` text NOT NULL,
	`historyTitle` text NOT NULL,
	`historyBody` text NOT NULL,
	`classicTitle` text NOT NULL,
	`classicBody` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_content_id` PRIMARY KEY(`id`)
);
