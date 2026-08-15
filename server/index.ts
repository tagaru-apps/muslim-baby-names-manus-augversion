import express from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Resvg } from "@resvg/resvg-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type PreviewRecord = { slug: string; name: string; arabic: string; phonetic: string | null; meaning: string; origin: string };
const escapeSvg = (value: string) => String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const trim = (value: string, limit: number) => value.length > limit ? `${value.slice(0, limit - 1).trimEnd()}…` : value;
const previewSvg = (record: PreviewRecord) => {
  const phonetic = record.phonetic ? `Pronounced ${record.phonetic}` : "A meaningful Muslim baby name";
  const arabic = /[\u0600-\u06FF]/.test(record.arabic) ? record.arabic : "";
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="mosaic" width="74" height="74" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="74" height="74" fill="#043f35"/><path d="M37 1 73 37 37 73 1 37Z" fill="none" stroke="#d5b24b" stroke-opacity=".16" stroke-width="1.2"/><circle cx="37" cy="37" r="4" fill="#d5b24b" fill-opacity=".16"/></pattern><linearGradient id="shade" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#003c31"/><stop offset="1" stop-color="#082c27"/></linearGradient></defs><rect width="1200" height="630" fill="url(#shade)"/><rect width="1200" height="630" fill="url(#mosaic)"/><path d="M766 0C842 126 856 227 817 314c-40 91-116 168-227 231 149 30 316 32 501 5V0Z" fill="#d5b24b" fill-opacity=".06"/><g fill="#fff9ed"><text x="72" y="88" font-family="DejaVu Sans, sans-serif" font-size="20" font-weight="700" letter-spacing="5">MUSLIM BABY NAMES</text><rect x="72" y="120" width="128" height="4" fill="#d5b24b"/><text x="72" y="290" font-family="Amiri, serif" font-size="116" font-weight="700">${escapeSvg(trim(record.name, 22))}</text>${arabic ? `<text x="78" y="365" font-family="Noto Naskh Arabic, serif" font-size="52" fill="#e7c66d">${escapeSvg(trim(arabic, 34))}</text>` : ""}<text x="76" y="445" font-family="DejaVu Sans, sans-serif" font-size="28" fill="#f7f1e5">${escapeSvg(trim(phonetic, 60))}</text><text x="76" y="507" font-family="DejaVu Sans, sans-serif" font-size="24" fill="#c7d6ce">${escapeSvg(trim(record.meaning, 90))}</text><text x="76" y="572" font-family="DejaVu Sans, sans-serif" font-size="17" font-weight="700" letter-spacing="3" fill="#d5b24b">${escapeSvg(record.origin.toUpperCase())} NAME · MEANINGFUL NAMES, THOUGHTFULLY GATHERED</text></g><g transform="translate(1075 84)"><path d="M0 22 22 0l22 22-22 22z" fill="#d5b24b"/><path d="M22 7v30M7 22h30" stroke="#043f35" stroke-width="5" stroke-linecap="round"/></g></svg>`;
};

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  const previewDataPath = path.resolve(__dirname, "name-preview-records.json");
  const previews: PreviewRecord[] = fs.existsSync(previewDataPath) ? JSON.parse(fs.readFileSync(previewDataPath, "utf8")) : [];
  const previewBySlug = new Map(previews.map((record) => [record.slug, record]));

  app.get("/og/name/:slug.png", (req, res) => {
    const record = previewBySlug.get(req.params.slug);
    if (!record) return res.status(404).end();
    const png = new Resvg(previewSvg(record), { fitTo: { mode: "width", value: 1200 }, font: { loadSystemFonts: true } }).render().asPng();
    res.set({ "Content-Type": "image/png", "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" });
    return res.send(png);
  });

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
