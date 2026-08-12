/** Quiet Courtyard card: a compact archival catalogue entry with the eight-point aperture as its recurring corner detail. */
import { Heart, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import type { NameRecord } from "@/lib/names";

export function NameCard({ record, isFavorite, onToggle }: { record: NameRecord; isFavorite: boolean; onToggle: (slug: string) => void }) {
  return (
    <article className="name-card group relative flex min-h-[185px] flex-col justify-between overflow-hidden border border-emerald-950/10 bg-[#fffdf8] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#0b6e4f]/35 hover:shadow-[0_18px_45px_rgba(22,61,47,0.10)]">
      <span className="star-motif absolute right-[-18px] top-[-18px] h-16 w-16 opacity-[0.10]" aria-hidden="true" />
      <div className="absolute left-5 right-12 top-0 h-px bg-[#c9a227]/55" />
      <div className="absolute right-[-14px] top-[-16px] font-display text-8xl leading-none text-[#0b6e4f]/[0.045]">{record.letter}</div>
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl font-semibold tracking-[-0.04em] text-emerald-950">{record.name}</p>
          <p className="mt-1 font-arabic text-xl leading-none text-[#0b6e4f]" lang="ar" dir="rtl">{record.arabic}</p>
        </div>
        <button onClick={() => onToggle(record.slug)} aria-label={`${isFavorite ? "Remove" : "Save"} ${record.name} ${isFavorite ? "from" : "to"} shortlist`} className={`relative z-10 inline-flex h-8 w-8 items-center justify-center border transition ${isFavorite ? "border-[#c9a227] bg-[#fff6d6] text-[#9a7111]" : "border-emerald-950/12 bg-white text-emerald-950/55 hover:border-[#0b6e4f]/40 hover:text-[#0b6e4f]"}`}>
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>
      <div className="relative mt-6 flex items-end justify-between gap-3">
        <p className="max-w-[16rem] text-sm leading-5 text-emerald-950/65">{record.meaning}</p>
        <Link href={`/name/${record.slug}`} aria-label={`Read more about ${record.name}`} className="inline-flex h-8 w-8 shrink-0 items-center justify-center bg-emerald-950 text-[#faf7f0] transition group-hover:bg-[#0b6e4f]"><ArrowUpRight className="h-4 w-4" /></Link>
      </div>
    </article>
  );
}
