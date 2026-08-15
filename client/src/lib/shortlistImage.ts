import type { NameRecord } from "@/lib/names";

const paper = "#faf7f0";
const ink = "#123d30";
const emerald = "#0b6e4f";
const gold = "#c9a227";

const truncate = (value: string, max: number) => value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;

export async function downloadShortlistImage(records: NameRecord[]) {
  if (!records.length) return;
  await document.fonts?.ready;
  const width = 1200;
  const columns = 3;
  const cardWidth = 328;
  const cardHeight = 170;
  const gap = 24;
  const rows = Math.ceil(records.length / columns);
  const height = Math.max(1080, 398 + rows * (cardHeight + gap) + 88);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");

  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = emerald;
  ctx.fillRect(0, 0, width, 284);
  ctx.globalAlpha = 0.14;
  ctx.strokeStyle = gold;
  for (let x = 72; x < width; x += 86) {
    for (let y = 0; y < 284; y += 86) {
      ctx.beginPath();
      ctx.moveTo(x, y + 43);
      ctx.lineTo(x + 43, y);
      ctx.lineTo(x + 86, y + 43);
      ctx.lineTo(x + 43, y + 86);
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = gold;
  ctx.fillRect(72, 74, 128, 4);
  ctx.fillStyle = paper;
  ctx.font = "700 20px 'DM Sans', sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText("MUSLIM BABY NAMES", 72, 54);
  ctx.letterSpacing = "0px";
  ctx.font = "700 66px 'Fraunces', Georgia, serif";
  ctx.fillText("Our Shortlist", 72, 157);
  ctx.font = "400 24px 'DM Sans', sans-serif";
  ctx.fillStyle = "#dfece5";
  ctx.fillText(`${records.length} ${records.length === 1 ? "name" : "names"} kept close`, 74, 206);

  records.forEach((record, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = 72 + column * (cardWidth + gap);
    const y = 338 + row * (cardHeight + gap);
    ctx.fillStyle = "#f1ede2";
    ctx.fillRect(x, y, cardWidth, cardHeight);
    ctx.strokeStyle = "rgba(18,61,48,0.18)";
    ctx.strokeRect(x, y, cardWidth, cardHeight);
    ctx.fillStyle = gold;
    ctx.fillRect(x, y, 5, cardHeight);
    ctx.fillStyle = ink;
    ctx.font = "700 33px 'Fraunces', Georgia, serif";
    ctx.fillText(truncate(record.name, 19), x + 24, y + 56);
    ctx.font = "400 26px 'Amiri', 'Noto Naskh Arabic', serif";
    ctx.fillStyle = emerald;
    ctx.fillText(truncate(record.arabic, 26), x + 24, y + 88);
    ctx.font = "600 14px 'DM Sans', sans-serif";
    ctx.fillStyle = "#8b6d22";
    ctx.fillText(truncate(record.phonetic || "A meaningful name", 36).toUpperCase(), x + 24, y + 116);
    ctx.font = "400 15px 'DM Sans', sans-serif";
    ctx.fillStyle = "rgba(18,61,48,0.72)";
    ctx.fillText(truncate(record.meaning, 48), x + 24, y + 146);
  });

  ctx.fillStyle = "rgba(18,61,48,0.62)";
  ctx.font = "600 15px 'DM Sans', sans-serif";
  ctx.fillText("A private collection, kept only in this browser.", 72, height - 42);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Could not create shortlist image")), "image/png"));
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "muslim-baby-names-shortlist.png";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}
