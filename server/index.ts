import express from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Resvg } from "@resvg/resvg-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type PreviewRecord = { slug: string; name: string; arabic: string; phonetic: string | null; meaning: string; origin: string; gender: "boy" | "girl" | "unisex"; isQuranic: boolean };
const escapeSvg = (value: string) => String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const trim = (value: string, limit: number) => value.length > limit ? `${value.slice(0, limit - 1).trimEnd()}…` : value;
const previewSvg = (record: PreviewRecord) => {
  const phonetic = record.phonetic ? `Pronounced ${record.phonetic}` : "A meaningful Muslim baby name";
  const arabic = /[\u0600-\u06FF]/.test(record.arabic) ? record.arabic : "";
  const category = record.isQuranic ? "QURANIC" : record.gender === "girl" ? "GIRL" : "BOY";
  const footer = record.isQuranic ? "QURANIC NAME · MEANINGFUL NAMES" : `${category} · ${record.origin.toUpperCase()} · MEANINGFUL NAMES`;
  const theme = record.isQuranic
    ? { start: "#151a42", end: "#413468", accent: "#e7c66d", pale: "#f7f2e9", muted: "#d3cce7", pattern: `<circle cx="950" cy="140" r="195" fill="none" stroke="#e7c66d" stroke-opacity=".16" stroke-width="1.5"/><circle cx="950" cy="140" r="142" fill="none" stroke="#e7c66d" stroke-opacity=".13" stroke-width="1.5"/><path d="M950 20l16 38 38 16-38 16-16 38-16-38-38-16 38-16z" fill="#e7c66d" fill-opacity=".2"/>` }
    : record.gender === "girl"
      ? { start: "#642541", end: "#934c5e", accent: "#f0c878", pale: "#fff5ed", muted: "#efd8d4", pattern: `<path d="M925 18c38 46 37 97 0 143-37-46-38-97 0-143Zm-72 72c46-38 97-37 143 0-46 37-97 38-143 0Zm72 72c-38-46-37-97 0-143 37 46 38 97 0 143Zm72-72c-46 38-97 37-143 0 46-37 97-38 143 0Z" fill="none" stroke="#f0c878" stroke-opacity=".2" stroke-width="2"/><circle cx="925" cy="90" r="23" fill="#f0c878" fill-opacity=".16"/>` }
      : { start: "#003f3b", end: "#164b62", accent: "#d5b24b", pale: "#fff9ed", muted: "#c7d6ce", pattern: `<path d="M844 24l72 72-72 72-72-72zM988 24l72 72-72 72-72-72zM916 168l72 72-72 72-72-72z" fill="none" stroke="#d5b24b" stroke-opacity=".16" stroke-width="2"/><circle cx="916" cy="96" r="8" fill="#d5b24b" fill-opacity=".18"/>` };
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="shade" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${theme.start}"/><stop offset="1" stop-color="${theme.end}"/></linearGradient><pattern id="mosaic" width="68" height="68" patternUnits="userSpaceOnUse"><path d="M34 0 68 34 34 68 0 34Z" fill="none" stroke="${theme.accent}" stroke-opacity=".1" stroke-width="1"/><circle cx="34" cy="34" r="3" fill="${theme.accent}" fill-opacity=".12"/></pattern></defs><rect width="1200" height="630" fill="url(#shade)"/><rect width="1200" height="630" fill="url(#mosaic)"/><path d="M740 0C842 119 850 228 812 319c-40 95-116 173-229 237 148 31 353 23 617-23V0Z" fill="${theme.accent}" fill-opacity=".06"/>${theme.pattern}<g fill="${theme.pale}"><text x="72" y="88" font-family="DejaVu Sans, sans-serif" font-size="20" font-weight="700" letter-spacing="5">MUSLIM BABY NAMES</text><rect x="72" y="120" width="128" height="4" fill="${theme.accent}"/><text x="72" y="290" font-family="Amiri, serif" font-size="116" font-weight="700">${escapeSvg(trim(record.name, 22))}</text>${arabic ? `<text x="78" y="365" font-family="Noto Naskh Arabic, serif" font-size="52" fill="${theme.accent}">${escapeSvg(trim(arabic, 34))}</text>` : ""}<text x="76" y="445" font-family="DejaVu Sans, sans-serif" font-size="28" fill="${theme.pale}">${escapeSvg(trim(phonetic, 60))}</text><text x="76" y="507" font-family="DejaVu Sans, sans-serif" font-size="24" fill="${theme.muted}">${escapeSvg(trim(record.meaning, 90))}</text><text x="76" y="572" font-family="DejaVu Sans, sans-serif" font-size="17" font-weight="700" letter-spacing="3" fill="${theme.accent}">${escapeSvg(footer)}</text></g><g transform="translate(1075 84)"><path d="M0 22 22 0l22 22-22 22z" fill="${theme.accent}"/><path d="M22 7v30M7 22h30" stroke="${theme.start}" stroke-width="5" stroke-linecap="round"/></g></svg>`;
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
