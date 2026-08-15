/** Quiet Courtyard: a private cream-paper shortlist with gold accents, archival exports, and a local visual history. */
import { Link } from "wouter";
import { ArrowRight, Download, Heart, History } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { names } from "@/lib/names";
import { useFavorites } from "@/hooks/useFavorites";
import { NameCard } from "@/components/NameCard";
import { PageIntro } from "@/components/PageIntro";
import { downloadShortlistImage } from "@/lib/shortlistImage";
import { getRecentExports, type ExportHistoryEntry } from "@/lib/exportHistory";
import { createNameSocialImage } from "@/lib/socialImage";

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites();
  const saved = names.filter((name) => favorites.includes(name.slug));
  const nameBySlug = useMemo(() => new Map(names.map((name) => [name.slug, name])), []);
  const [isExporting, setIsExporting] = useState(false);
  const [recentExports, setRecentExports] = useState<ExportHistoryEntry[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  useEffect(() => setRecentExports(getRecentExports()), []);
  useEffect(() => {
    let active = true;
    const urls: string[] = [];
    Promise.all(recentExports.map(async (entry) => {
      const record = nameBySlug.get(entry.slug);
      if (!record) return null;
      const blob = await createNameSocialImage(record, entry.format, { includePhonetic: entry.includePhonetic, dedication: entry.dedication });
      const url = URL.createObjectURL(blob);
      urls.push(url);
      return [entry.id, url] as const;
    })).then((entries) => {
      if (!active) return;
      setThumbnails(Object.fromEntries(entries.filter(Boolean) as [string, string][]));
    }).catch(() => { if (active) setThumbnails({}); });
    return () => { active = false; urls.forEach((url) => URL.revokeObjectURL(url)); };
  }, [nameBySlug, recentExports]);

  const exportShortlist = async () => {
    try {
      setIsExporting(true);
      await downloadShortlistImage(saved);
      toast.success("Shortlist image downloaded", { description: "Your saved names are ready to share." });
    } catch {
      toast.error("Could not create shortlist image", { description: "Please try again in a moment." });
    } finally {
      setIsExporting(false);
    }
  };
  const formatLabel = (format: ExportHistoryEntry["format"]) => format === "story" ? "Story" : format === "instagram" ? "Instagram" : "Landscape";

  return <><PageIntro eyebrow="Your private shortlist" title="Names that stayed with you" description="Save, revisit, and compare the names that feel worth a second look. Your shortlist lives only in this browser." trail={[{ label: "Your shortlist" }]} />
    <main className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      {recentExports.length > 0 && <section className="mb-11 border border-[#c9a227]/55 bg-[#f0ece1] p-5 sm:p-7"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow text-[#8b6d22]">Kept on this device</p><h2 className="mt-2 flex items-center gap-2 font-display text-3xl tracking-[-0.05em] text-emerald-950"><History className="h-5 w-5 text-[#a57f1f]" /> Recent exports</h2></div><p className="max-w-sm text-sm leading-6 text-emerald-950/65">Your last eight name cards stay here privately, so you can revisit the images you made.</p></div><div className="flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]">{recentExports.map((entry) => { const record = nameBySlug.get(entry.slug); if (!record) return null; return <article key={entry.id} className="min-w-[214px] max-w-[214px] snap-start overflow-hidden border border-emerald-950/12 bg-[#fffdf8]"><div className="aspect-square bg-emerald-950/10">{thumbnails[entry.id] ? <img src={thumbnails[entry.id]} alt={`${entry.name} ${formatLabel(entry.format)} export`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs font-semibold uppercase tracking-[0.14em] text-emerald-950/45">Preparing</div>}</div><div className="p-3"><div className="flex items-center justify-between gap-2"><p className="font-display text-xl text-emerald-950">{entry.name}</p><span className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#8b6d22]">{formatLabel(entry.format)}</span></div>{entry.dedication && <p className="mt-2 line-clamp-2 text-xs leading-5 text-emerald-950/65">“{entry.dedication}”</p>}<Link href={`/name/${entry.slug}`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#0b6e4f] underline underline-offset-4">Open name <ArrowRight className="h-3.5 w-3.5" /></Link></div></article>; })}</div></section>}
      {saved.length ? <><div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-[#c9a227]/55 pb-4"><p className="text-sm text-emerald-950/65"><span className="font-semibold text-emerald-950">{saved.length}</span> {saved.length === 1 ? "name" : "names"} saved</p><div className="flex items-center gap-4"><p className="hidden text-xs uppercase tracking-[0.16em] text-emerald-950/45 sm:block">Kept close</p><button onClick={exportShortlist} disabled={isExporting} className="inline-flex items-center gap-2 bg-[#0b6e4f] px-4 py-2.5 text-sm font-semibold text-[#faf7f0] transition hover:bg-emerald-950 disabled:cursor-wait disabled:opacity-60"><Download className="h-4 w-4" />{isExporting ? "Creating image" : "Download shortlist"}</button></div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{saved.map((record) => <NameCard key={record.slug} record={record} isFavorite onToggle={toggleFavorite} />)}</div></> : <section className="shortlist-empty relative grid min-h-[360px] place-items-center overflow-hidden border border-emerald-950/12 bg-[#f0ece1] p-8 text-center"><span className="star-motif absolute -bottom-20 -left-16 h-56 w-56 opacity-[0.10]" aria-hidden="true" /><span className="star-motif absolute -right-8 -top-8 h-28 w-28 opacity-[0.16]" aria-hidden="true" /><div className="relative"><div className="mx-auto grid h-14 w-14 place-items-center bg-[#c9a227] text-emerald-950"><Heart className="h-6 w-6" /></div><div className="mx-auto mt-3 h-px w-20 bg-[#c9a227]" /><p className="mt-5 font-display text-3xl text-emerald-950">Your shortlist is waiting.</p><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-emerald-950/65">When a name feels right, tap the heart to keep it here. You can come back to it whenever you need a little clarity.</p><Link href="/search" className="mt-6 inline-flex items-center gap-2 bg-[#0b6e4f] px-5 py-3 text-sm font-semibold text-[#faf7f0] transition hover:bg-emerald-950">Explore names <ArrowRight className="h-4 w-4" /></Link></div></section>}</main></>;
}
