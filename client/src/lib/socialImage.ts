import type { NameRecord } from "@/lib/names";

type SocialFormat = "landscape" | "instagram";
type Theme = { start: string; end: string; accent: string; pale: string; muted: string };

const themeFor = (record: NameRecord): Theme => {
  if (record.isQuranic) return { start: "#151a42", end: "#413468", accent: "#e7c66d", pale: "#f7f2e9", muted: "#d3cce7" };
  if (record.gender === "girl") return { start: "#642541", end: "#934c5e", accent: "#f0c878", pale: "#fff5ed", muted: "#efd8d4" };
  return { start: "#003f3b", end: "#164b62", accent: "#d5b24b", pale: "#fff9ed", muted: "#c7d6ce" };
};

const crop = (value: string, limit: number) => value.length > limit ? `${value.slice(0, limit - 1).trimEnd()}…` : value;
const footerFor = (record: NameRecord) => record.isQuranic ? "QURANIC NAME · MEANINGFUL NAMES" : `${record.gender === "girl" ? "GIRL" : "BOY"} · ${record.origin.toUpperCase()} · MEANINGFUL NAMES`;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else line = next;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (words.join(" ") !== lines.join(" ")) lines[lines.length - 1] = crop(lines[lines.length - 1], Math.max(12, lines[lines.length - 1].length - 1));
  return lines;
}

export async function createNameSocialImage(record: NameRecord, format: SocialFormat): Promise<Blob> {
  await document.fonts?.ready;
  const square = format === "instagram";
  const width = square ? 1080 : 1200;
  const height = square ? 1080 : 630;
  const theme = themeFor(record);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, theme.start);
  gradient.addColorStop(1, theme.end);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 1;
  const grid = square ? 72 : 68;
  for (let x = 0; x < width + grid; x += grid) for (let y = 0; y < height + grid; y += grid) {
    ctx.beginPath(); ctx.moveTo(x + grid / 2, y); ctx.lineTo(x + grid, y + grid / 2); ctx.lineTo(x + grid / 2, y + grid); ctx.lineTo(x, y + grid / 2); ctx.closePath(); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = theme.accent;
  ctx.globalAlpha = 0.08;
  ctx.beginPath(); ctx.arc(width * 0.83, square ? 310 : 220, square ? 330 : 230, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  const margin = 72;
  ctx.fillStyle = theme.pale;
  ctx.font = "700 20px 'DM Sans', sans-serif";
  ctx.letterSpacing = "5px";
  ctx.fillText("MUSLIM BABY NAMES", margin, square ? 94 : 88);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = theme.accent;
  ctx.fillRect(margin, square ? 126 : 120, square ? 132 : 128, 4);
  ctx.fillStyle = theme.pale;
  ctx.font = `700 ${square ? 134 : 116}px 'Fraunces', Georgia, serif`;
  ctx.fillText(crop(record.name, square ? 16 : 22), margin, square ? 432 : 290);
  if (/[\u0600-\u06FF]/.test(record.arabic)) {
    ctx.fillStyle = theme.accent;
    ctx.font = `${square ? 64 : 52}px 'Amiri', 'Noto Naskh Arabic', serif`;
    ctx.fillText(crop(record.arabic, square ? 26 : 34), margin + 4, square ? 516 : 365);
  }
  const phoneticY = square ? 655 : 445;
  ctx.fillStyle = theme.pale;
  ctx.font = `${square ? 31 : 28}px 'DM Sans', sans-serif`;
  ctx.fillText(crop(record.phonetic ? `Pronounced ${record.phonetic}` : "A meaningful Muslim baby name", square ? 45 : 60), margin + 4, phoneticY);
  ctx.fillStyle = theme.muted;
  ctx.font = `${square ? 27 : 24}px 'DM Sans', sans-serif`;
  const meaningLines = wrap(ctx, record.meaning, square ? 900 : 980, square ? 2 : 1);
  meaningLines.forEach((line, index) => ctx.fillText(line, margin + 4, (square ? 732 : 507) + index * (square ? 36 : 28)));
  const footerY = square ? 912 : 572;
  if (square) { ctx.fillStyle = theme.accent; ctx.globalAlpha = 0.6; ctx.fillRect(margin, 850, width - margin * 2, 1); ctx.globalAlpha = 1; }
  ctx.fillStyle = theme.accent;
  ctx.font = `700 ${square ? 18 : 17}px 'DM Sans', sans-serif`;
  ctx.letterSpacing = "3px";
  ctx.fillText(footerFor(record), margin + 4, footerY);
  ctx.letterSpacing = "0px";
  if (square) { ctx.fillStyle = theme.muted; ctx.font = "18px 'DM Sans', sans-serif"; ctx.fillText("A name to carry with care.", margin + 4, 977); }
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not create social image")), "image/png"));
}

export async function downloadNameSocialImage(record: NameRecord, format: SocialFormat) {
  const blob = await createNameSocialImage(record, format);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${record.slug}-${format === "instagram" ? "instagram" : "muslim-baby-name"}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  return blob;
}
