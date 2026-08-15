/**
 * Builds the client catalogue from the declared CC0 source while preserving provenance
 * and declining to invent fields that the source does not provide.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generatePhonetic } from "./phonetics.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "data", "muslim_names_source.json");
const outputPath = path.join(root, "client", "src", "lib", "names.ts");
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const tagRules = [
  ["light", /\b(light|luminous|moon|sun|bright|radiance|glow)\b/i],
  ["blessing", /\b(blessing|blessed|gift|grace|favour)\b/i],
  ["peace", /\b(peace|safe|safety|calm|serene|contentment)\b/i],
  ["virtue", /\b(virtue|righteous|pious|devout|honest|just|noble)\b/i],
  ["kindness", /\b(kind|kindness|merciful|mercy|compassion|gentle)\b/i],
  ["beauty", /\b(beauty|beautiful|flower|adornment|handsome)\b/i],
  ["strength", /\b(strong|strength|brave|courage|warrior|hero|lion)\b/i],
  ["wisdom", /\b(wise|wisdom|knowledge|learned|intelligent|scholar)\b/i],
  ["nature", /\b(tree|river|garden|mountain|sea|star|sky|earth|nature)\b/i],
  ["faith", /\b(allah|god|quran|islam|prayer|worship|prophet)\b/i],
];

const toSlug = (value) => value
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "") || "name";

const escapeTs = (value) => JSON.stringify(value).replace(/<\/script/gi, "<\\/script");
const normaliseGender = (value) => /^f/i.test(value || "") ? "girl" : /^m/i.test(value || "") ? "boy" : "unisex";
const entryScore = (entry) => (entry.meaning?.length || 0) + (entry.arabic_name?.length || 0) * 2;

const clean = source
  .map((record) => ({
    name: String(record.english_name || "").replace(/\s+/g, " ").trim(),
    arabic: String(record.arabic_name || "").replace(/\s+/g, " ").trim(),
    meaning: String(record.meaning || "").replace(/\s+/g, " ").trim(),
    gender: normaliseGender(record.gender),
  }))
  .filter((record) => record.name && record.meaning);

const deduplicated = new Map();
for (const record of clean) {
  const key = `${toSlug(record.name)}|${record.gender}`;
  if (!deduplicated.has(key) || entryScore(record) > entryScore(deduplicated.get(key))) deduplicated.set(key, record);
}

const baseSlugCounts = new Map();
for (const record of deduplicated.values()) {
  const baseSlug = toSlug(record.name);
  baseSlugCounts.set(baseSlug, (baseSlugCounts.get(baseSlug) || 0) + 1);
}

const preliminary = [...deduplicated.values()]
  .map((record) => {
    const baseSlug = toSlug(record.name);
    const slug = baseSlugCounts.get(baseSlug) > 1 ? `${baseSlug}-${record.gender}` : baseSlug;
    const letter = /^[A-Z]$/i.test(record.name[0]) ? record.name[0].toUpperCase() : "#";
    const meaningTags = tagRules.filter(([, matcher]) => matcher.test(record.meaning)).map(([tag]) => tag);
    const isQuranic = /\bquran(?:ic)?\b/i.test(record.meaning);
    const pronunciation = generatePhonetic(record.name, record.arabic, isQuranic);
    return { ...record, slug, letter, meaningTags: meaningTags.length ? meaningTags : ["meaning"], isQuranic, ...pronunciation };
  })
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

const grouped = new Map();
for (const record of preliminary) {
  const key = `${record.gender}|${record.letter}`;
  const list = grouped.get(key) || [];
  list.push(record);
  grouped.set(key, list);
}

const names = preliminary.map((record) => {
  const peers = grouped.get(`${record.gender}|${record.letter}`) || [];
  const related = peers.filter((peer) => peer.slug !== record.slug).slice(0, 6).map((peer) => peer.slug);
  const datasetGender = record.gender === "girl" ? "female" : record.gender === "boy" ? "male" : "unisex";
  return {
    slug: record.slug,
    name: record.name,
    arabic: record.arabic || "Not supplied by source",
    gender: record.gender,
    meaning: record.meaning,
    meaningTags: record.meaningTags,
    origin: "Not specified in source",
    phonetic: record.phonetic,
    phoneticConfidence: record.phoneticConfidence,
    letter: record.letter,
    popularity: 0,
    isUnique: false,
    isQuranic: record.isQuranic,
    description: `${record.name} is listed in the CC0 Muslim Names Dataset as a ${datasetGender} name. The source records its meaning as “${record.meaning}”. Its reader-friendly phonetic spelling is generated deterministically from the published transliteration and should be reviewed for names with complex or region-specific pronunciation. The imported record does not include an origin taxonomy or editorial historical context.`,
    related,
    source: "Muslim Names Dataset (CC0 1.0)",
  };
});

const availableTags = [...new Set(names.flatMap((record) => record.meaningTags))].sort();
const phoneticCounts = names.reduce((counts, record) => {
  const key = record.phonetic ? record.phoneticConfidence : "omitted";
  counts[key] = (counts[key] || 0) + 1;
  return counts;
}, {});
const generated = `/**
 * GENERATED FILE — do not edit manually.
 * Source: Takiuddin Ahmed, Muslim Names Dataset (CC0 1.0).
 * Run \`pnpm catalogue:build\` after refreshing data/muslim_names_source.json.
 */
export type Gender = "boy" | "girl" | "unisex";

export type NameRecord = {
  slug: string;
  name: string;
  arabic: string;
  gender: Gender;
  meaning: string;
  meaningTags: string[];
  origin: string;
  phonetic: string | null;
  phoneticConfidence: "high" | "auto";
  letter: string;
  popularity: number;
  isUnique?: boolean;
  isQuranic?: boolean;
  description: string;
  related: string[];
  source: string;
};

export const names: NameRecord[] = ${escapeTs(names)};
export const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const origins = ["Not specified in source"];
export const meaningTags = ${escapeTs(availableTags)};
export function getName(slug: string) { return names.find((entry) => entry.slug === slug); }
export function getRelatedNames(record: NameRecord) { return record.related.map(getName).filter((item): item is NameRecord => Boolean(item)); }
`;

fs.writeFileSync(outputPath, generated, "utf8");
console.log(`Normalised ${names.length.toLocaleString()} unique name records from ${source.length.toLocaleString()} source rows.`);
console.log(`Phonetic confidence — high: ${(phoneticCounts.high || 0).toLocaleString()}, auto: ${(phoneticCounts.auto || 0).toLocaleString()}, omitted: ${(phoneticCounts.omitted || 0).toLocaleString()}.`);
