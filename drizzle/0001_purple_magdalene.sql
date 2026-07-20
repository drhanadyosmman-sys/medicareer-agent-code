CREATE TABLE `adminNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`authorUserId` int,
	`type` enum('general','cv-review','supporting-info','interview-prep','career-assessment','application-package','career-plan') NOT NULL DEFAULT 'general',
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adminNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('submitted','under-review','cv-optimization','job-matching','applications-prepared','interview-preparation') NOT NULL DEFAULT 'submitted',
	`readinessScore` int NOT NULL DEFAULT 0,
	`fullName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`whatsapp` varchar(40),
	`countryOfResidence` varchar(120),
	`nationality` varchar(120),
	`preferredPathway` varchar(120),
	`medicalSchool` varchar(255),
	`graduationYear` varchar(10),
	`internshipCompleted` boolean NOT NULL DEFAULT false,
	`yearsExperience` varchar(20),
	`currentRole` varchar(255),
	`specialtyInterest` varchar(255),
	`currentCountryOfPractice` varchar(120),
	`gmcStatus` varchar(120),
	`plabStatus` varchar(120),
	`ieltsOetStatus` varchar(120),
	`alsBlsStatus` varchar(120),
	`nhsExperience` boolean NOT NULL DEFAULT false,
	`previousUkApplications` boolean NOT NULL DEFAULT false,
	`previousInterviews` boolean NOT NULL DEFAULT false,
	`careerStory` text,
	`missingDocuments` json,
	`recommendedSteps` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`category` enum('cv','passport','medical-degree','internship-certificate','experience-certificates','english-test','gmc-certificate','research-publications','quality-improvement','leadership-evidence','teaching-experience','clinical-audit','voice-note','other') NOT NULL,
	`name` varchar(255) NOT NULL,
	`mimeType` varchar(127),
	`sizeBytes` int NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`sender` enum('admin','user') NOT NULL,
	`content` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
CREATE INDEX `adminNotes_applicationId_idx` ON `adminNotes` (`applicationId`);--> statement-breakpoint
CREATE INDEX `applications_userId_idx` ON `applications` (`userId`);--> statement-breakpoint
CREATE INDEX `documents_applicationId_idx` ON `documents` (`applicationId`);--> statement-breakpoint
CREATE INDEX `messages_applicationId_idx` ON `messages` (`applicationId`);