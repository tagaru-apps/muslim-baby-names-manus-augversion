# Hosting Assessment: Managed Hosting vs. Vercel

**Project:** Muslim Baby Names  
**Assessment date:** 25 August 2026  
**Decision status:** Recommendation only. No hosting, DNS, OAuth, database, or publishing configuration has been changed.

## Executive conclusion

**Vercel is not categorically better for this project today.** It would be a strong option if the website were only a Vite/React editorial catalogue. The project has now grown beyond that: it includes an Express and tRPC backend, a MySQL/Drizzle database, owner-only OAuth, server-side secrets, static page generation, and an approval-gated Pinterest publishing workflow with durable scheduled jobs. The current managed hosting remains the lower-risk and better-integrated choice while the Pinterest developer app is still under review.

Vercel can host Express and Node.js workloads, but the migration would require deliberate changes to authentication, static-asset handling, background scheduling, environment configuration, and the Pinterest OAuth callback. Vercel’s own documentation states that an Express application runs as a single Vercel Function and that `express.static()` is not used for static assets; those details materially affect this application’s current server design.[^1]

> **Recommendation:** Keep the current managed deployment as production until Pinterest API access is approved and the owner-only dashboard is exercised end to end. If Vercel remains desirable after that, build a separate staging deployment first and migrate only after the checklist below passes.

## Current production requirements

| Capability | Current implementation | Why it matters to hosting |
|---|---|---|
| Public catalogue | React/Vite editorial site with 14,585 generated name pages, sitemaps, and social-preview routes | Needs a reliable Node build and static-output delivery. |
| Server runtime | Express server with public rendering routes, asset proxies, OAuth endpoints, and tRPC APIs | Needs a compatible Node HTTP runtime rather than a frontend-only host. |
| Data | Drizzle schema backed by MySQL/TiDB-style database records for connections, boards, drafts, publication records, and audits | Needs secure server-to-database connectivity, migrations, and connection management. |
| Authentication | Manus OAuth and owner-only server procedures | This authentication layer is platform-integrated and would need replacement or redesign on Vercel. |
| Secrets | Google Analytics configuration and pending Pinterest developer credentials are kept server-side | Requires production environment variables and strict separation from browser bundles. |
| Pinterest OAuth | Exact callback route: `https://muslim-babynames.com/api/pinterest/oauth/callback` | A domain or route change must be updated in the Pinterest developer app before OAuth can work. |
| Scheduled publishing | One-time, approval-gated scheduled job that resolves a trusted draft identifier, applies idempotency, records a result, and self-cleans | Needs durable execution and an atomic database claim; it must not rely on in-memory timers. |
| Generated media | Pinterest creative assets and social images use public same-origin routes and storage/CDN sources | Requires public, crawler-accessible image URLs and a clear asset-storage strategy. |

## Fit comparison

| Criterion | Current managed hosting | Vercel | Better fit now |
|---|---|---|---|
| Existing public site | Already deployed with custom-domain support, checkpoints, and rollback | Excellent CDN and preview workflow after a migration | **Current**—no migration needed. |
| Express + tRPC | Already merged into the platform runtime | Supported, but the app becomes a Vercel Function with platform function limits | **Current**—lower operational change. |
| Static name pages | Existing build handles catalogue normalization and static route generation | Viable, but build output and asset serving need Vercel-specific validation | **Current** until a staging build passes. |
| Database | Integrated project database and migrations | Viable with an external MySQL service or a database migration | **Current**—no data migration or new network path. |
| Owner login | Current Manus OAuth is integrated | Requires replacing Manus OAuth with a Vercel-compatible identity provider or a custom auth design | **Current**—significant migration blocker. |
| Pinterest OAuth | Existing callback and server-side encryption boundary | Viable after changing runtime, secret setup, and any callback/domain configuration | **Current** until credentials are approved and tested. |
| One-time scheduled Pins | Managed durable job model maps directly to per-draft scheduling | Vercel Cron is configured by static schedules and invokes an HTTP endpoint in UTC; a dynamic per-draft queue would need an hourly scanner or external scheduler | **Current**—closer to the desired workflow. |
| Preview deployments | Checkpoint-based project iteration | Stronger Git-based preview workflow | **Vercel** if preview environments become a central team need. |
| Operational responsibility | Managed backend, database, OAuth, secrets, cron, and rollbacks | More provider wiring, monitoring, auth, cron security, and database responsibility | **Current**. |

## What would change on Vercel

Vercel supports Node.js servers and Express apps, but its deployment model is serverless/Fluid compute rather than a long-running single process. It can host the HTTP surface, yet the application should be restructured to make each concern explicit.[^1] The current `express.static()` approach must be replaced with Vercel’s `public/**` asset delivery or a separate CDN/object store, because Vercel says `express.static()` is ignored.[^1]

The largest design change concerns scheduled publication. Vercel Cron invokes an HTTP **GET** request to a production function based on cron configuration, uses UTC, and is suited to fixed schedules.[^2] Rather than creating a unique cron job for each approved Pin, a Vercel version should run one protected hourly scanner that atomically claims due database rows, publishes only owner-approved drafts, and records an idempotent result. This is feasible, but it is a rewrite of the current per-draft durable-job model—not a configuration-only move.

## Non-destructive Vercel migration checklist

| Stage | Required work | Exit criterion |
|---|---|---|
| 1. Create staging | Create a separate Vercel project from the GitHub repository. Do **not** move DNS or disable the current production deployment. | A preview URL serves the public homepage. |
| 2. Rework entrypoint | Provide a Vercel-detectable Express/Node entrypoint or split the app into Vercel Functions. Replace platform-specific static serving with `public/**` or object storage. | Public routes, generated name pages, OG images, and asset routes work on the preview domain. |
| 3. Configure environment | Add all non-secret build values and server-only secrets in Vercel’s environment settings. Never expose Pinterest secrets through `VITE_` variables. | Server starts with no secret in the browser bundle. |
| 4. Preserve database safely | Initially keep the existing MySQL-compatible database only if Vercel can reach it over a secured connection; later consider a deliberate data migration if needed. Run Drizzle migrations only after a backup and staging validation. | Dashboard reads/writes a staging database without schema drift. |
| 5. Replace authentication | Replace Manus OAuth with a Vercel-compatible provider or custom session architecture before exposing the owner dashboard. | Owner access works; non-owner API calls are denied. |
| 6. Redesign scheduling | Replace per-Pin jobs with a protected fixed Vercel Cron endpoint that atomically processes due owner-approved drafts. Use a cron secret, database locking/claiming, and idempotency keys. | A test draft publishes exactly once in staging. |
| 7. Reconfigure Pinterest OAuth | Add the exact Vercel production callback URI in the Pinterest developer app, then authorize the account in staging first. | Board sync succeeds and access/refresh tokens are encrypted server-side. |
| 8. Validate social sharing | Confirm Pinterest can crawl each public Pin image and that Google Analytics, Open Graph images, and canonical URLs resolve correctly. | Platform debugger and browser checks pass. |
| 9. Cut over safely | Add the custom domain to Vercel, complete DNS verification, then update Pinterest OAuth to the final URI. Keep the existing deployment available until production smoke tests pass. | Live traffic, auth callback, database, and a single approved Pin workflow work after cutover. |
| 10. Retire only after observation | Keep the existing host as a rollback target for an agreed observation period. | No unresolved production errors or missed scheduled work. |

## Recommended decision path

For the next few weeks, **stay on the current managed hosting**. The website is already deployed, the required Pinterest policy pages are live, and the Pinterest API app is not yet approved. Moving infrastructure now would add risk while preventing a clean validation of the existing publishing dashboard.

If the later goal is primarily **frontend performance, Git preview deployments, and a Vercel-centered workflow**, run the staging migration checklist once Pinterest API access is working. If the goal is simply to make the existing site more reliable, Vercel is unlikely to be a meaningful improvement over the current managed platform without also accepting the authentication and scheduling redesign.

## References

[^1]: [Vercel — Express on Vercel](https://vercel.com/docs/frameworks/backend/express)
[^2]: [Vercel — Cron Jobs](https://vercel.com/docs/cron-jobs)
[^3]: [Vercel — Using the Node.js Runtime with Vercel Functions](https://vercel.com/docs/functions/runtimes/node-js)
