/** Representative pre-generation sample: validates deterministic output before rebuilding every record. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generatePhonetic } from "./phonetics.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "muslim_names_source.json"), "utf8"));
const letters = "ABCDEFGHIJKLMNOPQRST".split("");
const sample = letters.map((letter, index) => source.find((record) => record.english_name?.trim().toUpperCase().startsWith(letter) && (index % 2 ? /^f/i.test(record.gender || "") : /^m/i.test(record.gender || ""))) || source.find((record) => record.english_name?.trim().toUpperCase().startsWith(letter))).filter(Boolean);

if (sample.length !== 20) throw new Error(`Expected 20 alphabet-spread sample records; found ${sample.length}.`);

console.log("NAME\tPHONETIC\tCONFIDENCE");
for (const record of sample) {
  const generated = generatePhonetic(record.english_name, record.arabic_name, /\bquran(?:ic)?\b/i.test(record.meaning || ""));
  console.log(`${record.english_name}\t${generated.phonetic || "(omitted)"}\t${generated.phoneticConfidence}`);
}
