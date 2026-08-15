/** Quiet Courtyard shortlist: a private, browser-local space framed like a personal page from the naming journal. */
/** Quiet Courtyard: a private cream-paper shortlist with gold accents and an archival export utility. */
import { Link } from "wouter";
import { ArrowRight, Download, Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { names } from "@/lib/names";
import { useFavorites } from "@/hooks/useFavorites";
import { NameCard } from "@/components/NameCard";
import { PageIntro } from "@/components/PageIntro";
import { downloadShortlistImage } from "@/lib/shortlistImage";

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites();
  const saved = names.filter((name) => favorites.includes(name.slug));
  const [isExporting, setIsExporting] = useState(false);
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
  return <><PageIntro eyebrow="Your private shortlist" title="Names that stayed with you" description="Save, revisit, and compare the names that feel worth a second look. Your shortlist lives only in this browser." trail={[{ label: "Your shortlist" }]} />
    <main className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">{saved.length ? <><div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-[#c9a227]/55 pb-4"><p className="text-sm text-emerald-950/65"><span className="font-semibold text-emerald-950">{saved.length}</span> {saved.length === 1 ? "name" : "names"} saved</p><div className="flex items-center gap-4"><p className="hidden text-xs uppercase tracking-[0.16em] text-emerald-950/45 sm:block">Kept close</p><button onClick={exportShortlist} disabled={isExporting} className="inline-flex items-center gap-2 bg-[#0b6e4f] px-4 py-2.5 text-sm font-semibold text-[#faf7f0] transition hover:bg-emerald-950 disabled:cursor-wait disabled:opacity-60"><Download className="h-4 w-4" />{isExporting ? "Creating image" : "Download shortlist"}</button></div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{saved.map((record) => <NameCard key={record.slug} record={record} isFavorite onToggle={toggleFavorite} />)}</div></> : <section className="shortlist-empty relative grid min-h-[360px] place-items-center overflow-hidden border border-emerald-950/12 bg-[#f0ece1] p-8 text-center"><span className="star-motif absolute -bottom-20 -left-16 h-56 w-56 opacity-[0.10]" aria-hidden="true" /><span className="star-motif absolute -right-8 -top-8 h-28 w-28 opacity-[0.16]" aria-hidden="true" /><div className="relative"><div className="mx-auto grid h-14 w-14 place-items-center bg-[#c9a227] text-emerald-950"><Heart className="h-6 w-6" /></div><div className="mx-auto mt-3 h-px w-20 bg-[#c9a227]" /><p className="mt-5 font-display text-3xl text-emerald-950">Your shortlist is waiting.</p><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-emerald-950/65">When a name feels right, tap the heart to keep it here. You can come back to it whenever you need a little clarity.</p><Link href="/search" className="mt-6 inline-flex items-center gap-2 bg-[#0b6e4f] px-5 py-3 text-sm font-semibold text-[#faf7f0] transition hover:bg-emerald-950">Explore names <ArrowRight className="h-4 w-4" /></Link></div></section>}</main></>;
}
