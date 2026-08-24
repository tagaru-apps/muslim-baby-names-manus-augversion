import { z } from "zod";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { createPinterestDraft, getPinterestOverview, transitionPinterestDraft, writeAudit } from "./db";

const destinationSchema = z.string().url().refine(value => {
  const parsed = new URL(value);
  return parsed.protocol === "https:" && (parsed.hostname === "muslim-babynames.com" || parsed.hostname.endsWith(".muslim-babynames.com"));
}, "Destination must be an HTTPS muslim-babynames.com URL");

const draftInput = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(800),
  destinationUrl: destinationSchema,
  aiModified: z.boolean(),
  boardId: z.number().int().positive().optional(),
  assetId: z.number().int().positive().optional(),
  scheduledFor: z.number().int().positive().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts: any) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }: any) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  pinterest: router({
    overview: adminProcedure.query(async ({ ctx }: any) => getPinterestOverview(ctx.user.id)),
    createDraft: adminProcedure.input(draftInput).mutation(async ({ ctx, input }: any) => createPinterestDraft({ ownerUserId: ctx.user.id, ...input, idempotencyKey: nanoid(24) })),
    sendForReview: adminProcedure.input(z.object({ draftId: z.number().int().positive() })).mutation(async ({ ctx, input }: any) => transitionPinterestDraft({ ownerUserId: ctx.user.id, draftId: input.draftId, from: "draft", to: "ready_for_review", action: "pinterest.draft.sent_for_review" })),
    approve: adminProcedure.input(z.object({ draftId: z.number().int().positive() })).mutation(async ({ ctx, input }: any) => transitionPinterestDraft({ ownerUserId: ctx.user.id, draftId: input.draftId, from: "ready_for_review", to: "owner_approved", action: "pinterest.draft.owner_approved" })),
    queue: adminProcedure.input(z.object({ draftId: z.number().int().positive(), scheduledFor: z.number().int().positive() })).mutation(async ({ ctx, input }: any) => transitionPinterestDraft({ ownerUserId: ctx.user.id, draftId: input.draftId, from: "owner_approved", to: "queued", action: "pinterest.draft.queued", schedule: input.scheduledFor })),
    cancel: adminProcedure.input(z.object({ draftId: z.number().int().positive() })).mutation(async ({ ctx, input }: any) => {
      const result = await transitionPinterestDraft({ ownerUserId: ctx.user.id, draftId: input.draftId, from: "draft", to: "cancelled", action: "pinterest.draft.cancelled" });
      return result;
    }),
    connectionSetup: adminProcedure.query(async ({ ctx }: any) => {
      await writeAudit(ctx.user.id, "pinterest.connection.setup_viewed", "pinterest_connection", null, null, null);
      return {
        configured: Boolean(process.env.PINTEREST_APP_ID && process.env.PINTEREST_APP_SECRET),
        redirectUri: `${ctx.req.protocol}://${ctx.req.get("host")}/api/pinterest/oauth/callback`,
        requiredScopes: ["boards:read", "pins:read", "pins:write", "user_accounts:read"],
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
