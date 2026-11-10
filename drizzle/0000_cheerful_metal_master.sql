CREATE TABLE `squad_players` (
	`room_code` text NOT NULL,
	`id` text NOT NULL,
	`token_hash` text NOT NULL,
	`name` text NOT NULL,
	`hero` integer NOT NULL,
	`role` integer NOT NULL,
	`x` integer DEFAULT 400 NOT NULL,
	`y` integer DEFAULT 420 NOT NULL,
	`hp` integer DEFAULT 100 NOT NULL,
	`shield` integer DEFAULT 30 NOT NULL,
	`ammo` integer DEFAULT 28 NOT NULL,
	`power` integer DEFAULT 0 NOT NULL,
	`last_shot` integer DEFAULT 0 NOT NULL,
	`last_hit` integer DEFAULT 0 NOT NULL,
	`last_seen` integer NOT NULL,
	`answer_wave` integer DEFAULT 0 NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`room_code`, `id`),
	FOREIGN KEY (`room_code`) REFERENCES `squad_rooms`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `squad_players_room_seen_idx` ON `squad_players` (`room_code`,`last_seen`);--> statement-breakpoint
CREATE TABLE `squad_rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`arena` integer NOT NULL,
	`host_id` text NOT NULL,
	`phase` text DEFAULT 'lobby' NOT NULL,
	`wave` integer DEFAULT 1 NOT NULL,
	`boss_hp` integer DEFAULT 700 NOT NULL,
	`teacher_at` integer DEFAULT 0 NOT NULL,
	`buff_until` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
