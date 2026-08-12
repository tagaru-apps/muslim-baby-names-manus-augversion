/** Quiet Courtyard profile: a spacious, source-minded name page that returns every detail to discovery. */
import { Link, useLocation } from "wouter";
import { ArrowLeft, Bookmark, Check, ChevronRight, Copy, Heart, Languages, Share2, Sparkles } from "lucide-react";
import { getName, getRelatedNames } from "@/lib/names";
import { useFavorites } from "@/hooks/useFavorites";
import { NameCard } from "@/components/NameCard";
import NotFound from "@/pages/NotFound";

export default function NameDetailPage() {
  const [location] = useLocation();
  const slug = location.split("/").filter(Boolean).pop() || "";
  const record = getName(slug);
  const { favorites, toggleFavorite } = useFavorites();
  if (!record) return <NotFound />;
  const related = getRelatedNames(record);
  const isFavorite = favorites.includes(record.slug);
  return <main>
    <section className="relative overflow-hidden bg-emerald-950 px-5 py-12 text-[#faf7f0] sm:px-8 lg:px-12 lg:py-16">
      <div className="hero-pattern absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-[1440px]">
        <nav className="mb-10 flex items-center gap-1.5 text-xs text-[#faf7f0]/55" aria-label="Breadcrumb"><Link href="/" className="hover:text-white">Home</Link><ChevronRight className="h-3.5 w-3.5" /><Link href={record.gender === "girl" ? "/girl-names" : "/boy-names"} className="hover:text-white">{record.gender === "girl" ? "Girl names" : "Boy names"}</Link><ChevronRight className="h-3.5 w-3.5" /><span>{record.name}</span></nav>
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div><p className="eyebrow text-[#d9be70]">{record.origin} {record.gender === "unisex" ? "unisex" : record.gender} name</p><h1 className="mt-4 font-display text-6xl font-semibold tracking-[-0.07em] sm:text-7xl lg:text-8xl">{record.name}</h1><p className="mt-3 font-arabic text-4xl text-[#d9be70]" lang="ar" dir="rtl">{record.arabic}</p><p className="mt-7 max-w-xl font-display text-2xl leading-tight text-[#faf7f0]/90 sm:text-3xl">“{record.meaning}”</p></div>
          <div className="flex flex-wrap gap-3 lg:justify-end"><button onClick={() => toggleFavorite(record.slug)} className={`inline-flex items-center gap-2 border px-4 py-3 text-sm font-semibold transition ${isFavorite ? "border-[#c9a227] bg-[#c9a227] text-emerald-950" : "border-white/30 bg-white/10 text-white hover:bg-white/15"}`}><Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} /> {isFavorite ? "Saved to shortlist" : "Save name"}</button><button onClick={() => navigator.clipboard?.writeText(`${record.name} — ${record.meaning}`)} className="inline-flex h-11 w-11 items-center justify-center border border-white/30 bg-white/10 text-white transition hover:bg-white/15" aria-label="Copy name and meaning"><Copy className="h-4 w-4" /></button></div>
        </div>
      </div>
    </section>
    <section className="mx-auto grid max-w-[1440px] gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-12 lg:py-16">
      <article className="max-w-3xl"><p className="eyebrow mb-4">The story of {record.name}</p><h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-emerald-950">A name that carries <em className="font-normal">{record.meaningTags[0]}</em>.</h2><p className="mt-6 text-base leading-8 text-emerald-950/70">{record.description} We present each name with the kind of detail that supports a thoughtful decision: an accessible pronunciation, its heritage, and the qualities most commonly associated with it. Meanings can have rich regional and linguistic nuance, so the Sources & Methodology page explains how our editorial process approaches them.</p>
        <div className="mt-10 grid gap-px overflow-hidden border border-emerald-950/12 bg-emerald-950/12 sm:grid-cols-2"><div className="bg-[#fffdf8] p-5"><p className="eyebrow">Pronunciation</p><p className="mt-2 font-display text-2xl text-emerald-950">{record.pronunciation}</p></div><div className="bg-[#fffdf8] p-5"><p className="eyebrow">Origin</p><Link href={`/origin/${record.origin.toLowerCase()}`} className="mt-2 inline-flex items-center gap-1 font-display text-2xl text-emerald-950 hover:text-[#0b6e4f]">{record.origin}<ArrowLeft className="h-4 w-4 rotate-180" /></Link></div><div className="bg-[#fffdf8] p-5"><p className="eyebrow">First letter</p><Link href={`/${record.gender === "girl" ? "girl" : "boy"}-names/${record.letter.toLowerCase()}`} className="mt-2 inline-flex items-center gap-1 font-display text-2xl text-emerald-950 hover:text-[#0b6e4f]">{record.letter}<ArrowLeft className="h-4 w-4 rotate-180" /></Link></div><div className="bg-[#fffdf8] p-5"><p className="eyebrow">Qualities</p><p className="mt-2 font-display text-2xl capitalize text-emerald-950">{record.meaningTags.join(" · ")}</p></div></div>
        <div className="mt-12 border-t border-emerald-950/12 pt-10"><p className="eyebrow mb-4">Explore by meaning</p><div className="flex flex-wrap gap-2">{record.meaningTags.map((tag) => <Link key={tag} href={`/meaning/${tag}`} className="border border-emerald-950/15 bg-[#f0ece1] px-4 py-2 text-sm font-semibold capitalize text-emerald-950 transition hover:border-[#0b6e4f] hover:bg-emerald-50">{tag}</Link>)}</div></div>
      </article>
      <aside><div className="border border-emerald-950/12 bg-[#f0ece1] p-6"><div className="flex h-10 w-10 items-center justify-center bg-[#c9a227] text-emerald-950"><Bookmark className="h-5 w-5" /></div><p className="mt-5 font-display text-2xl leading-tight text-emerald-950">A private shortlist, just for you.</p><p className="mt-3 text-sm leading-6 text-emerald-950/65">Save names as you browse. Your shortlist stays in this browser—no account, no pressure.</p><Link href="/favorites" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0b6e4f] underline underline-offset-4">View your shortlist <ChevronRight className="h-4 w-4" /></Link></div><div className="mt-5 border-l-2 border-[#c9a227] pl-4 text-sm leading-6 text-emerald-950/62"><Languages className="mb-2 h-4 w-4 text-[#a57f1f]" />Arabic spellings represent a name’s conventional written form and may vary by region or family preference.</div></aside>
    </section>
    <section className="border-y border-emerald-950/10 bg-[#f0ece1] px-5 py-12 sm:px-8 lg:px-12"><div className="mx-auto max-w-[1440px]"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="eyebrow mb-2">Continue the path</p><h2 className="font-display text-3xl font-semibold tracking-[-0.05em] text-emerald-950">Names with a similar feeling</h2></div><Link href="/search" className="hidden items-center gap-1 text-sm font-semibold text-[#0b6e4f] sm:inline-flex">Browse all <ChevronRight className="h-4 w-4" /></Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <NameCard key={item.slug} record={item} isFavorite={favorites.includes(item.slug)} onToggle={toggleFavorite} />)}</div></div></section>
  </main>;
}
