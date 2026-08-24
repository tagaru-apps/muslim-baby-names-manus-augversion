import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { auditLogs, InsertUser, pinAssets, pinDrafts, pinterestBoards, pinterestConnections, pinPublications, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };
  (["name", "email", "loginMethod"] as const).forEach(field => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = values[field];
    }
  });
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(users).where(eq(users.openId, openId)).limit(1))[0];
}

export async function getPinterestOverview(ownerUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [connection] = await db.select().from(pinterestConnections).where(eq(pinterestConnections.ownerUserId, ownerUserId)).limit(1);
  const drafts = await db.select({ draft: pinDrafts, asset: pinAssets, board: pinterestBoards, publication: pinPublications })
    .from(pinDrafts)
    .leftJoin(pinAssets, eq(pinDrafts.assetId, pinAssets.id))
    .leftJoin(pinterestBoards, eq(pinDrafts.boardId, pinterestBoards.id))
    .leftJoin(pinPublications, eq(pinPublications.draftId, pinDrafts.id))
    .where(eq(pinDrafts.ownerUserId, ownerUserId))
    .orderBy(desc(pinDrafts.updatedAt));
  const boards = connection ? await db.select().from(pinterestBoards).where(eq(pinterestBoards.connectionId, connection.id)).orderBy(pinterestBoards.name) : [];
  return { connection: connection ?? null, boards, drafts };
}

export async function createPinterestDraft(input: {
  ownerUserId: number; title: string; description: string; destinationUrl: string; aiModified: boolean; idempotencyKey: string; boardId?: number; assetId?: number; scheduledFor?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(pinDrafts).values({ ...input, status: "draft" });
  const [draft] = await db.select().from(pinDrafts).where(and(eq(pinDrafts.ownerUserId, input.ownerUserId), eq(pinDrafts.idempotencyKey, input.idempotencyKey))).limit(1);
  if (!draft) throw new Error("Draft creation could not be verified");
  await writeAudit(input.ownerUserId, "pinterest.draft.created", "pin_draft", String(draft.id), null, { title: draft.title, status: draft.status });
  return draft;
}

export async function transitionPinterestDraft(input: { ownerUserId: number; draftId: number; from: (typeof pinDrafts.$inferSelect)["status"]; to: (typeof pinDrafts.$inferSelect)["status"]; action: string; schedule?: number | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [draft] = await db.select().from(pinDrafts).where(and(eq(pinDrafts.id, input.draftId), eq(pinDrafts.ownerUserId, input.ownerUserId))).limit(1);
  if (!draft) throw new Error("Draft not found");
  if (draft.status !== input.from) throw new Error(`Draft must be ${input.from.replaceAll("_", " ")} before this action`);
  const set: Partial<typeof pinDrafts.$inferInsert> = { status: input.to, scheduledFor: input.schedule ?? draft.scheduledFor };
  if (input.to === "owner_approved") { set.approvedAt = Date.now(); set.approvedByUserId = input.ownerUserId; }
  await db.update(pinDrafts).set(set).where(eq(pinDrafts.id, draft.id));
  await writeAudit(input.ownerUserId, input.action, "pin_draft", String(draft.id), { status: draft.status }, { status: input.to, scheduledFor: set.scheduledFor ?? null });
  return { ...draft, ...set };
}

export async function writeAudit(actorUserId: number | null, action: string, resourceType: string, resourceId: string | null, beforeValue: unknown, afterValue: unknown) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values({ actorUserId, action, resourceType, resourceId, beforeValue: beforeValue as object | null, afterValue: afterValue as object | null, createdAtMs: Date.now() });
}
