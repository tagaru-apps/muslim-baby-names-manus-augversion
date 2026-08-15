/** Representative deterministic origin sample before full regeneration, selected entirely from source data. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { classifyOrigin } from "./origins.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "muslim_names_source.json"), "utf8"));
const classified = source.map((record) => ({ ...record, ...classifyOrigin({ name: record.english_name, meaning: record.meaning, arabic: record.arabic_name, isQuranic: /\bquran(?:ic)?\b/i.test(record.meaning || "") }) }));
const priorityOrigins = ["Quranic", "Arabic", "Persian", "Turkish", "Urdu", "Kurdish", "Hindi", "Indonesian", "Somali", "African", "Indian subcontinent"];
const chosen = [];
for (const origin of priorityOrigins) {
  const found = classified.find((record) => record.origin === origin && !chosen.some((entry) => entry.english_name === record.english_name));
  if (found) chosen.push(found);
}
for (const letter of "ABCDEFGHIJKLMNOPQRST".split("")) {
  const found = classified.find((record) => record.english_name?.toUpperCase().startsWith(letter) && !chosen.some((entry) => entry.english_name === record.english_name));
  if (found) chosen.push(found);
  if (chosen.length >= 20) break;
}
console.log("NAME\tORIGIN\tCONFIDENCE\tSOURCE MEANING");
for (const record of chosen.slice(0, 20)) console.log(`${record.english_name}\t${record.origin}\t${record.originConfidence}\t${record.meaning}`);
