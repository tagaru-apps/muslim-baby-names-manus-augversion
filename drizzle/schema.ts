import { bigint, boolean, index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/** Primary identity record created through Manus OAuth. The configured project owner is promoted to admin on first sign-in. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const pinterestConnections = mysqlTable("pinterest_connections", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  pinterestUserId: varchar("pinterestUserId", { length: 128 }),
  accountName: varchar("accountName", { length: 255 }),
  accessTokenCiphertext: text("accessTokenCiphertext"),
  refreshTokenCiphertext: text("refreshTokenCiphertext"),
  tokenExpiresAt: bigint("tokenExpiresAt", { mode: "number" }),
  scopes: varchar("scopes", { length: 1000 }),
  status: mysqlEnum("status", ["disconnected", "connected", "expired", "error"]).default("disconnected").notNull(),
  lastCheckedAt: bigint("lastCheckedAt", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const pinterestBoards = mysqlTable("pinterest_boards", {
  id: int("id").autoincrement().primaryKey(),
  connectionId: int("connectionId").notNull().references(() => pinterestConnections.id, { onDelete: "cascade" }),
  pinterestBoardId: varchar("pinterestBoardId", { length: 128 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  lastSyncedAt: bigint("lastSyncedAt", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("pinterest_boards_connection_external_unique").on(table.connectionId, table.pinterestBoardId)]);

export const pinAssets = mysqlTable("pin_assets", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
  storageKey: varchar("storageKey", { length: 512 }).notNull().unique(),
  publicUrl: varchar("publicUrl", { length: 2048 }).notNull(),
  altText: varchar("altText", { length: 500 }).notNull(),
  width: int("width").notNull(),
  height: int("height").notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  aiModified: boolean("aiModified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const pinDrafts = mysqlTable("pin_drafts", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
  boardId: int("boardId").references(() => pinterestBoards.id, { onDelete: "set null" }),
  assetId: int("assetId").references(() => pinAssets.id, { onDelete: "set null" }),
  title: varchar("title", { length: 100 }).notNull(),
  description: varchar("description", { length: 800 }).notNull(),
  destinationUrl: varchar("destinationUrl", { length: 2048 }).notNull(),
  status: mysqlEnum("status", ["draft", "ready_for_review", "owner_approved", "queued", "published", "failed", "cancelled"]).default("draft").notNull(),
  aiModified: boolean("aiModified").default(false).notNull(),
  approvedAt: bigint("approvedAt", { mode: "number" }),
  approvedByUserId: int("approvedByUserId").references(() => users.id, { onDelete: "set null" }),
  scheduledFor: bigint("scheduledFor", { mode: "number" }),
  scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
  idempotencyKey: varchar("idempotencyKey", { length: 128 }).notNull().unique(),
  lastError: text("lastError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("pin_drafts_status_scheduled_idx").on(table.status, table.scheduledFor), index("pin_drafts_cron_task_idx").on(table.scheduleCronTaskUid)]);

export const pinPublications = mysqlTable("pin_publications", {
  id: int("id").autoincrement().primaryKey(),
  draftId: int("draftId").notNull().unique().references(() => pinDrafts.id, { onDelete: "cascade" }),
  pinterestPinId: varchar("pinterestPinId", { length: 128 }),
  liveUrl: varchar("liveUrl", { length: 2048 }),
  requestKey: varchar("requestKey", { length: 128 }).notNull().unique(),
  attemptCount: int("attemptCount").default(0).notNull(),
  providerResponse: json("providerResponse"),
  publishedAt: bigint("publishedAt", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  actorUserId: int("actorUserId").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resourceType", { length: 100 }).notNull(),
  resourceId: varchar("resourceId", { length: 128 }),
  beforeValue: json("beforeValue"),
  afterValue: json("afterValue"),
  createdAtMs: bigint("createdAtMs", { mode: "number" }).notNull(),
}, table => [index("audit_logs_resource_idx").on(table.resourceType, table.resourceId), index("audit_logs_actor_created_idx").on(table.actorUserId, table.createdAtMs)]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
