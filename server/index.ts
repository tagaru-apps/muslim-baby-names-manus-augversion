import "dotenv/config";
import express from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Resvg } from "@resvg/resvg-js";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./_core/oauth";
import { registerStorageProxy } from "./_core/storageProxy";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { serveStatic, setupVite } from "./_core/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type PreviewRecord = {
  slug: string;
  name: string;
  arabic: string;
  phonetic: string | null;
  meaning: string;
  origin: string;
  gender: "boy" | "girl" | "unisex";
  isQuranic: boolean;
};
type PreviewFormat = "landscape" | "instagram";
type CardTheme = { start: string; end: string; accent: string; pale: string; muted: string; pattern: string };
const brandAssets: Record<string, string> = {
  mark: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663498193896/TRWKPHudtUubyAyS.png",
  texture: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663498193896/hMGbMscFCaEQBfCD.jpg",
};
// Quiet Courtyard Pinterest launch: cacheable, public same-origin image routes prevent third-party Pin importers from blocking the approved campaign creative CDN.
const pinterestAssets: Record<string, string> = {
  meaning: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663498193896/qrajTHNjqhuYkUtW.png",
  "girl-names": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663498193896/WSOwyXiVjRsvlbAX.png",
  "boy-names": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663498193896/WokcYySbyCOgJqAL.png",
  "quranic-names": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663498193896/hUnxFqJeljHHqfPh.png",
  "unique-names": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663498193896/AFKHsuVQmzOenXLK.png",
};
const pinterestImportMeta: Record<string, { title: string; description: string }> = {
  meaning: { title: "Muslim Baby Names by Meaning", description: "Explore Muslim baby names through meaning, Arabic spellings, and gentle pronunciation guides." },
  "girl-names": { title: "Muslim Baby Girl Names With Meaning", description: "Discover Muslim girl names through meaning, heritage, Arabic spelling, and pronunciation guidance." },
  "boy-names": { title: "Muslim Baby Boy Names With Meaning", description: "Browse Muslim boy names by meaning, first letter, and heritage." },
  "quranic-names": { title: "Quranic Baby Names With Meaning", description: "Explore names with a Quranic connection alongside Arabic spellings, meanings, and pronunciation guidance." },
  "unique-names": { title: "Unique Muslim Baby Names With Meaning", description: "Explore distinctive Muslim baby-name choices with depth, heritage, and meaning." },
};

const escapeSvg = (value: string) => String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const trim = (value: string, limit: number) => value.length > limit ? `${value.slice(0, limit - 1).trimEnd()}…` : value;
const hasArabic = (value: string) => /[\u0600-\u06FF]/.test(value);

function getTheme(record: PreviewRecord): CardTheme {
  if (record.isQuranic) return {
    start: "#151a42", end: "#413468", accent: "#e7c66d", pale: "#f7f2e9", muted: "#d3cce7",
    pattern: `<circle cx="950" cy="140" r="195" fill="none" stroke="#e7c66d" stroke-opacity=".16" stroke-width="1.5"/><circle cx="950" cy="140" r="142" fill="none" stroke="#e7c66d" stroke-opacity=".13" stroke-width="1.5"/><path d="M950 20l16 38 38 16-38 16-16 38-16-38-38-16 38-16z" fill="#e7c66d" fill-opacity=".2"/>`,
  };
  if (record.gender === "girl") return {
    start: "#642541", end: "#934c5e", accent: "#f0c878", pale: "#fff5ed", muted: "#efd8d4",
    pattern: `<path d="M925 18c38 46 37 97 0 143-37-46-38-97 0-143Zm-72 72c46-38 97-37 143 0-46 37-97 38-143 0Zm72 72c-38-46-37-97 0-143 37 46 38 97 0 143Zm72-72c-46 38-97 37-143 0 46-37 97-38 143 0Z" fill="none" stroke="#f0c878" stroke-opacity=".2" stroke-width="2"/><circle cx="925" cy="90" r="23" fill="#f0c878" fill-opacity=".16"/>`,
  };
  return {
    start: "#003f3b", end: "#164b62", accent: "#d5b24b", pale: "#fff9ed", muted: "#c7d6ce",
    pattern: `<path d="M844 24l72 72-72 72-72-72zM988 24l72 72-72 72-72-72zM916 168l72 72-72 72-72-72z" fill="none" stroke="#d5b24b" stroke-opacity=".16" stroke-width="2"/><circle cx="916" cy="96" r="8" fill="#d5b24b" fill-opacity=".18"/>`,
  };
}

function getFooter(record: PreviewRecord) {
  if (record.isQuranic) return "QURANIC NAME · MEANINGFUL NAMES";
  const category = record.gender === "girl" ? "GIRL" : "BOY";
  return `${category} · ${record.origin.toUpperCase()} · MEANINGFUL NAMES`;
}

function previewSvg(record: PreviewRecord, format: PreviewFormat = "landscape") {
  const theme = getTheme(record);
  const footer = getFooter(record);
  const phonetic = record.phonetic ? `Pronounced ${record.phonetic}` : "A meaningful Muslim baby name";
  const arabic = hasArabic(record.arabic) ? record.arabic : "";
  if (format === "instagram") {
    return `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="shade" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${theme.start}"/><stop offset="1" stop-color="${theme.end}"/></linearGradient><pattern id="mosaic" width="72" height="72" patternUnits="userSpaceOnUse"><path d="M36 0 72 36 36 72 0 36Z" fill="none" stroke="${theme.accent}" stroke-opacity=".13" stroke-width="1.2"/><circle cx="36" cy="36" r="3" fill="${theme.accent}" fill-opacity=".15"/></pattern></defs><rect width="1080" height="1080" fill="url(#shade)"/><rect width="1080" height="1080" fill="url(#mosaic)"/><path d="M620 0c152 150 175 337 71 560-62 134-162 258-299 372h688V0Z" fill="${theme.accent}" fill-opacity=".08"/>${theme.pattern}<g fill="${theme.pale}"><text x="72" y="94" font-family="DejaVu Sans, sans-serif" font-size="21" font-weight="700" letter-spacing="5">MUSLIM BABY NAMES</text><rect x="72" y="126" width="132" height="4" fill="${theme.accent}"/><text x="72" y="432" font-family="Amiri, serif" font-size="134" font-weight="700">${escapeSvg(trim(record.name, 16))}</text>${arabic ? `<text x="76" y="516" font-family="Noto Naskh Arabic, serif" font-size="64" fill="${theme.accent}">${escapeSvg(trim(arabic, 26))}</text>` : ""}<text x="76" y="655" font-family="DejaVu Sans, sans-serif" font-size="31" fill="${theme.pale}">${escapeSvg(trim(phonetic, 45))}</text><text x="76" y="732" font-family="DejaVu Sans, sans-serif" font-size="27" fill="${theme.muted}">${escapeSvg(trim(record.meaning, 72))}</text><rect x="72" y="850" width="936" height="1" fill="${theme.accent}" fill-opacity=".6"/><text x="76" y="912" font-family="DejaVu Sans, sans-serif" font-size="18" font-weight="700" letter-spacing="3" fill="${theme.accent}">${escapeSvg(footer)}</text><text x="76" y="977" font-family="DejaVu Sans, sans-serif" font-size="18" fill="${theme.muted}">A name to carry with care.</text></g><g transform="translate(936 78)"><path d="M0 28 28 0l28 28-28 28z" fill="${theme.accent}"/><path d="M28 9v38M9 28h38" stroke="${theme.start}" stroke-width="6" stroke-linecap="round"/></g></svg>`;
  }
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="shade" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${theme.start}"/><stop offset="1" stop-color="${theme.end}"/></linearGradient><pattern id="mosaic" width="68" height="68" patternUnits="userSpaceOnUse"><path d="M34 0 68 34 34 68 0 34Z" fill="none" stroke="${theme.accent}" stroke-opacity=".1" stroke-width="1"/><circle cx="34" cy="34" r="3" fill="${theme.accent}" fill-opacity=".12"/></pattern></defs><rect width="1200" height="630" fill="url(#shade)"/><rect width="1200" height="630" fill="url(#mosaic)"/><path d="M740 0C842 119 850 228 812 319c-40 95-116 173-229 237 148 31 353 23 617-23V0Z" fill="${theme.accent}" fill-opacity=".06"/>${theme.pattern}<g fill="${theme.pale}"><text x="72" y="88" font-family="DejaVu Sans, sans-serif" font-size="20" font-weight="700" letter-spacing="5">MUSLIM BABY NAMES</text><rect x="72" y="120" width="128" height="4" fill="${theme.accent}"/><text x="72" y="290" font-family="Amiri, serif" font-size="116" font-weight="700">${escapeSvg(trim(record.name, 22))}</text>${arabic ? `<text x="78" y="365" font-family="Noto Naskh Arabic, serif" font-size="52" fill="${theme.accent}">${escapeSvg(trim(arabic, 34))}</text>` : ""}<text x="76" y="445" font-family="DejaVu Sans, sans-serif" font-size="28" fill="${theme.pale}">${escapeSvg(trim(phonetic, 60))}</text><text x="76" y="507" font-family="DejaVu Sans, sans-serif" font-size="24" fill="${theme.muted}">${escapeSvg(trim(record.meaning, 90))}</text><text x="76" y="572" font-family="DejaVu Sans, sans-serif" font-size="17" font-weight="700" letter-spacing="3" fill="${theme.accent}">${escapeSvg(footer)}</text></g><g transform="translate(1075 84)"><path d="M0 22 22 0l22 22-22 22z" fill="${theme.accent}"/><path d="M22 7v30M7 22h30" stroke="${theme.start}" stroke-width="5" stroke-linecap="round"/></g></svg>`;
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  const previewDataPath = path.resolve(__dirname, "name-preview-records.json");
  const previews: PreviewRecord[] = fs.existsSync(previewDataPath) ? JSON.parse(fs.readFileSync(previewDataPath, "utf8")) : [];
  const previewBySlug = new Map(previews.map((record) => [record.slug, record]));

  app.get("/brand-assets/:asset", async (req, res) => {
    const source = brandAssets[req.params.asset.replace(/\.(png|jpg)$/, "")];
    if (!source) return res.status(404).end();
    try {
      const upstream = await fetch(source);
      if (!upstream.ok) return res.status(502).end();
      const body = Buffer.from(await upstream.arrayBuffer());
      res.set({ "Content-Type": upstream.headers.get("content-type") || "application/octet-stream", "Cache-Control": "public, max-age=604800" });
      return res.send(body);
    } catch { return res.status(502).end(); }
  });

  app.get("/pinterest-assets/:asset", async (req, res) => {
    const source = pinterestAssets[req.params.asset.replace(/\.png$/, "")];
    if (!source) return res.status(404).end();
    try {
      const upstream = await fetch(source);
      if (!upstream.ok) return res.status(502).end();
      const body = Buffer.from(await upstream.arrayBuffer());
      res.set({ "Content-Type": "image/png", "Cache-Control": "public, max-age=604800" });
      return res.send(body);
    } catch { return res.status(502).end(); }
  });

  app.get("/pinterest/pin/:asset", (req, res) => {
    const asset = req.params.asset.replace(/\.html$/, "");
    const meta = pinterestImportMeta[asset];
    if (!meta || !pinterestAssets[asset]) return res.status(404).end();
    const image = `https://muslim-babynames.com/pinterest-assets/${asset}.png`;
    const canonical = `https://muslim-babynames.com/pinterest/pin/${asset}`;
    return res.type("html").send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeSvg(meta.title)} | Muslim Baby Names</title><meta name="description" content="${escapeSvg(meta.description)}"><meta name="robots" content="index,follow"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:title" content="${escapeSvg(meta.title)}"><meta property="og:description" content="${escapeSvg(meta.description)}"><meta property="og:image" content="${image}"><meta property="og:image:width" content="1000"><meta property="og:image:height" content="1500"><meta property="og:url" content="${canonical}"></head><body><main><h1>${escapeSvg(meta.title)}</h1><p>${escapeSvg(meta.description)}</p><img src="${image}" width="1000" height="1500" alt="${escapeSvg(meta.title)} Pinterest creative"></main></body></html>`);
  });

  const servePreview = (format: PreviewFormat) => (req: express.Request, res: express.Response) => {
    const record = previewBySlug.get(req.params.slug);
    if (!record) return res.status(404).end();
    const width = format === "instagram" ? 1080 : 1200;
    const png = new Resvg(previewSvg(record, format), { fitTo: { mode: "width", value: width }, font: { loadSystemFonts: true } }).render().asPng();
    res.set({ "Content-Type": "image/png", "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" });
    return res.send(png);
  };

  app.get("/og/name/:slug/instagram.png", servePreview("instagram"));
  app.get("/og/name/:slug.png", servePreview("landscape"));
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
}

startServer().catch(console.error);
