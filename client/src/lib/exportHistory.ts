import type { NameRecord } from "@/lib/names";
import type { CardStyle, SocialFormat } from "@/lib/socialImage";

const STORAGE_KEY = "muslim-baby-names:recent-exports";
const MAX_ENTRIES = 8;

export type ExportHistoryEntry = {
  id: string;
  slug: string;
  name: string;
  format: SocialFormat;
  includePhonetic: boolean;
  dedication: string;
  cardStyle: CardStyle;
  createdAt: string;
};

export function getRecentExports(): ExportHistoryEntry[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((entry) => entry?.slug && entry?.createdAt).slice(0, MAX_ENTRIES) : [];
  } catch {
    return [];
  }
}

export function recordExport(record: NameRecord, settings: { format: SocialFormat; includePhonetic: boolean; dedication: string; cardStyle: CardStyle }) {
  const entry: ExportHistoryEntry = {
    id: `${record.slug}-${Date.now()}`,
    slug: record.slug,
    name: record.name,
    format: settings.format,
    includePhonetic: settings.includePhonetic,
    dedication: settings.dedication.trim().slice(0, 80),
    cardStyle: settings.cardStyle,
    createdAt: new Date().toISOString(),
  };
  try {
    const existing = getRecentExports().filter((item) => !(item.slug === entry.slug && item.format === entry.format && item.cardStyle === entry.cardStyle));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...existing].slice(0, MAX_ENTRIES)));
  } catch {
    // Recent exports are a progressive enhancement when local storage is unavailable.
  }
  return entry;
}
