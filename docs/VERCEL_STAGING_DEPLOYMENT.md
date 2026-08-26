# Vercel Staging Deployment

This project is prepared for a **separate staging deployment** on Vercel. These steps do not change the current live domain or its DNS records.

## What the configuration does

The Vercel configuration builds the existing catalogue and Vite frontend into `dist/public`. It serves those static files directly, sends dynamic social-image and brand-asset routes to `api/index.ts`, and then falls back to the React entry point for browser routes such as `/search` and `/privacy`.

| Route type | Staging handling |
|---|---|
| Generated name pages and sitemaps | Served from `dist/public` |
| Frontend pages such as `/search`, `/favorites`, and policies | React fallback to `index.html` |
| `GET /og/name/:slug.png` and Instagram OG images | Public Express function through `/api` |
| `GET /brand-assets/:asset` | Public Express function through `/api` |
| Public Pinterest profile link and standard sharing | Remain ordinary external links; no automation is deployed |

## Staging steps

1. In Vercel, import the existing GitHub repository as a **new project**. Do not attach `muslim-babynames.com` yet.
2. Select the existing project root. Vercel will use `vercel.json` and run `pnpm build`.
3. Do not add any Pinterest, database, OAuth, scheduling, or automation secrets. The restored public site does not use them.
4. Deploy to obtain a Vercel preview URL.
5. Test the following before considering any domain move:

| Check | Preview path |
|---|---|
| Homepage and hero images | `/` |
| Browse and search | `/search` and `/origin/arabic` |
| Individual static name page | `/name/aaban` |
| Social preview response | `/og/name/aaban.png` |
| Favorites and sharing | `/favorites` and any name profile |
| Policy pages | `/privacy`, `/terms`, `/contact`, `/child-safety` |
| Robots and sitemap | `/robots.txt`, `/sitemap.xml` |

6. Keep the current managed deployment as the production system while the Vercel preview is tested. Do not change DNS, canonical URLs, Google Analytics settings, Pinterest website claim, or social-profile links during staging.

## Only after staging passes

If you later choose to move the custom domain, add the domain in Vercel, complete its DNS verification, test the same route list on the production domain, and retain the current host as a rollback option until the new deployment has been observed without errors.
