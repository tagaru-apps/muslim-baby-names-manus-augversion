/** Reports source-text origin signals before catalogue-wide origin inference is enabled. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "muslim_names_source.json"), "utf8"));
const languages = ["Arabic", "Persian", "Turkish", "Urdu", "Swahili", "Hindi", "Bengali", "Punjabi", "Kurdish", "Pashto", "Malay", "Indonesian", "Somali", "African", "Indian subcontinent"];
const hasArabic = (value) => /[\u0600-\u06FF]/.test(String(value || ""));
const counts = Object.fromEntries(languages.map((language) => [language, 0]));
const examples = Object.fromEntries(languages.map((language) => [language, []]));
let scriptFallback = 0;
let quranicMentions = 0;
let rootHints = 0;

for (const record of source) {
  const text = `${record.english_name || ""} ${record.meaning || ""}`;
  if (hasArabic(record.arabic_name)) scriptFallback += 1;
  if (/\bquran(?:ic)?\b/i.test(text)) quranicMentions += 1;
  if (/\b(?:derived from|root)\b.*\broot\b|\b[A-Z](?:-[A-Z]){1,}-N\b/i.test(text)) rootHints += 1;
  for (const language of languages) {
    const pattern = new RegExp(`\\b${language.replace(" ", "\\s+")}\\b`, "i");
    if (pattern.test(text)) {
      counts[language] += 1;
      if (examples[language].length < 3) examples[language].push(`${record.english_name}: ${record.meaning}`);
    }
  }
}

console.log(JSON.stringify({ total: source.length, scriptFallback, quranicMentions, rootHints, explicitLanguageMentions: counts, examples }, null, 2));
