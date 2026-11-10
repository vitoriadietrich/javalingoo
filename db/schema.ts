import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const squadRooms = sqliteTable("squad_rooms", {
  code: text("code").primaryKey(),
  arena: integer("arena").notNull(),
  hostId: text("host_id").notNull(),
  phase: text("phase").notNull().default("lobby"),
  wave: integer("wave").notNull().default(1),
  bossHp: integer("boss_hp").notNull().default(700),
  teacherAt: integer("teacher_at").notNull().default(0),
  buffUntil: integer("buff_until").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const squadPlayers = sqliteTable("squad_players", {
  roomCode: text("room_code").notNull().references(() => squadRooms.code),
  id: text("id").notNull(),
  tokenHash: text("token_hash").notNull(),
  name: text("name").notNull(),
  hero: integer("hero").notNull(),
  role: integer("role").notNull(),
  x: integer("x").notNull().default(400),
  y: integer("y").notNull().default(420),
  hp: integer("hp").notNull().default(100),
  shield: integer("shield").notNull().default(30),
  ammo: integer("ammo").notNull().default(28),
  power: integer("power").notNull().default(0),
  lastShot: integer("last_shot").notNull().default(0),
  lastHit: integer("last_hit").notNull().default(0),
  lastSeen: integer("last_seen").notNull(),
  answerWave: integer("answer_wave").notNull().default(0),
  score: integer("score").notNull().default(0),
}, table => [primaryKey({ columns: [table.roomCode, table.id] }), index("squad_players_room_seen_idx").on(table.roomCode, table.lastSeen)]);
