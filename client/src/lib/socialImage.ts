import type { NameRecord } from "@/lib/names";

export type SocialFormat = "landscape" | "instagram" | "story";
export type SocialImageOptions = { includePhonetic?: boolean };
type Theme = { start: string; end: string; accent: string; pale: string; muted: string };

const themeFor = (record: NameRecord): Theme => {
  if (record.isQuranic) return { start: "#151a42", end: "#413468", accent: "#e7c66d", pale: "#f7f2e9", muted: "#d3cce7" };
  if (record.gender === "girl") return { start: "#642541", end: "#934c5e", accent: "#f0c878", pale: "#fff5ed", muted: "#efd8d4" };
  return { start: "#003f3b", end: "#164b62", accent: "#d5b24b", pale: "#fff9ed", muted: "#c7d6ce" };
};

const crop = (value: string, limit: number) => value.length > limit ? `${value.slice(0, limit - 1).trimEnd()}…` : value;
const footerFor = (record: NameRecord) => record.isQuranic ? "QURANIC NAME · MEANINGFUL NAMES" : `${record.gender === "girl" ? "GIRL" : "BOY"} · ${record.origin.toUpperCase()} · MEANINGFUL NAMES`;
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/); const lines: string[] = []; let line = "";
  for (const word of words) { const next = line ? `${line} ${word}` : word; if (ctx.measureText(next).width > maxWidth && line) { lines.push(line); line = word; if (lines.length === maxLines - 1) break; } else line = next; }
  if (line && lines.length < maxLines) lines.push(line);
  if (words.join(" ") !== lines.join(" ")) lines[lines.length - 1] = crop(lines[lines.length - 1], Math.max(12, lines[lines.length - 1].length - 1));
  return lines;
}

export async function createNameSocialImage(record: NameRecord, format: SocialFormat, options: SocialImageOptions = {}): Promise<Blob> {
  await document.fonts?.ready;
  const includePhonetic = options.includePhonetic ?? true;
  const dimensions = format === "story" ? { width: 1080, height: 1920, grid: 80, nameY: 760, arabicY: 846, phoneticY: 1000, meaningY: 1075, footerY: 1668, ruleY: 1598, circleY: 495, circleRadius: 430, brandY: 94, ruleBrandY: 126, titleSize: 134, bodySize: 29 } : format === "instagram" ? { width: 1080, height: 1080, grid: 72, nameY: 432, arabicY: 516, phoneticY: 655, meaningY: 732, footerY: 912, ruleY: 850, circleY: 310, circleRadius: 330, brandY: 94, ruleBrandY: 126, titleSize: 134, bodySize: 27 } : { width: 1200, height: 630, grid: 68, nameY: 290, arabicY: 365, phoneticY: 445, meaningY: 507, footerY: 572, ruleY: 0, circleY: 220, circleRadius: 230, brandY: 88, ruleBrandY: 120, titleSize: 116, bodySize: 24 };
  const { width, height, grid, nameY, arabicY, phoneticY, meaningY, footerY, ruleY, circleY, circleRadius, brandY, ruleBrandY, titleSize, bodySize } = dimensions;
  const theme = themeFor(record); const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas is unavailable");
  const gradient = ctx.createLinearGradient(0, 0, width, height); gradient.addColorStop(0, theme.start); gradient.addColorStop(1, theme.end); ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 0.12; ctx.strokeStyle = theme.accent; ctx.lineWidth = 1;
  for (let x = 0; x < width + grid; x += grid) for (let y = 0; y < height + grid; y += grid) { ctx.beginPath(); ctx.moveTo(x + grid / 2, y); ctx.lineTo(x + grid, y + grid / 2); ctx.lineTo(x + grid / 2, y + grid); ctx.lineTo(x, y + grid / 2); ctx.closePath(); ctx.stroke(); }
  ctx.globalAlpha = 0.08; ctx.fillStyle = theme.accent; ctx.beginPath(); ctx.arc(width * 0.83, circleY, circleRadius, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  const margin = 72; ctx.fillStyle = theme.pale; ctx.font = "700 20px 'DM Sans', sans-serif"; ctx.letterSpacing = "5px"; ctx.fillText("MUSLIM BABY NAMES", margin, brandY); ctx.letterSpacing = "0px";
  ctx.fillStyle = theme.accent; ctx.fillRect(margin, ruleBrandY, format === "story" || format === "instagram" ? 132 : 128, 4);
  ctx.fillStyle = theme.pale; ctx.font = `700 ${titleSize}px 'Fraunces', Georgia, serif`; ctx.fillText(crop(record.name, format === "story" || format === "instagram" ? 16 : 22), margin, nameY);
  if (/[\u0600-\u06FF]/.test(record.arabic)) { ctx.fillStyle = theme.accent; ctx.font = `${format === "story" || format === "instagram" ? 64 : 52}px 'Amiri', 'Noto Naskh Arabic', serif`; ctx.fillText(crop(record.arabic, format === "story" || format === "instagram" ? 26 : 34), margin + 4, arabicY); }
  const actualMeaningY = includePhonetic ? meaningY : phoneticY;
  if (includePhonetic) { ctx.fillStyle = theme.pale; ctx.font = `${format === "story" || format === "instagram" ? 31 : 28}px 'DM Sans', sans-serif`; ctx.fillText(crop(record.phonetic ? `Pronounced ${record.phonetic}` : "A meaningful Muslim baby name", format === "story" || format === "instagram" ? 45 : 60), margin + 4, phoneticY); }
  ctx.fillStyle = theme.muted; ctx.font = `${bodySize}px 'DM Sans', sans-serif`; const meaningLines = wrap(ctx, record.meaning, width - margin * 2, format === "landscape" ? 1 : 2); meaningLines.forEach((line, index) => ctx.fillText(line, margin + 4, actualMeaningY + index * (bodySize + 9)));
  if (ruleY) { ctx.fillStyle = theme.accent; ctx.globalAlpha = 0.6; ctx.fillRect(margin, ruleY, width - margin * 2, 1); ctx.globalAlpha = 1; }
  ctx.fillStyle = theme.accent; ctx.font = `700 ${format === "landscape" ? 17 : 18}px 'DM Sans', sans-serif`; ctx.letterSpacing = "3px"; ctx.fillText(footerFor(record), margin + 4, footerY); ctx.letterSpacing = "0px";
  if (format === "story" || format === "instagram") { ctx.fillStyle = theme.muted; ctx.font = "18px 'DM Sans', sans-serif"; ctx.fillText("A name to carry with care.", margin + 4, footerY + 65); }
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not create social image")), "image/png"));
}

export async function downloadNameSocialImage(record: NameRecord, format: SocialFormat, options: SocialImageOptions = {}) {
  const blob = await createNameSocialImage(record, format, options); const url = URL.createObjectURL(blob); const link = document.createElement("a");
  link.href = url; link.download = `${record.slug}-${format === "story" ? "instagram-story" : format === "instagram" ? "instagram" : "muslim-baby-name"}.png`; document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1200); return blob;
}
