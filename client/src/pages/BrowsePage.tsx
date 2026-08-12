/** Quiet Courtyard browsing: a tool-like catalogue with calm filtering and clear, generous name cards. */
import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Check, ChevronDown, Filter, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { alphabet, meaningTags, names, origins } from "@/lib/names";
import { useFavorites } from "@/hooks/useFavorites";
import { NameCard } from "@/components/NameCard";
import { PageIntro } from "@/components/PageIntro";

type BrowseProps = { forcedGender?: "boy" | "girl"; mode?: "quranic" | "unique" | "search" | "origin" | "meaning" };

export default function BrowsePage({ forcedGender, mode }: BrowseProps) {
  const [location] = useLocation();
  const queryParams = new URLSearchParams(location.split("?")[1] || "");
  const pathParts = location.split("?")[0].split("/").filter(Boolean);
  const routeParameter = mode === "origin" || mode === "meaning" ? decodeURIComponent(pathParts[1] || "") : "";
  const routeLetter = forcedGender && pathParts.length > 1 ? pathParts[1]?.toUpperCase() : "";
  const [search, setSearch] = useState(mode === "search" ? queryParams.get("q") || "" : "");
  const [gender, setGender] = useState(forcedGender || "all");
  const [origin, setOrigin] = useState(mode === "origin" ? routeParameter : "all");
  const [tag, setTag] = useState(mode === "meaning" ? routeParameter : "all");
  const [letter, setLetter] = useState(routeLetter || "all");
  const [uniqueOnly, setUniqueOnly] = useState(mode === "unique");
  const [sort, setSort] = useState("popularity");
  const [mobileFilters, setMobileFilters] = useState(false);
  const { favorites, toggleFavorite } = useFavorites();

  const filtered = useMemo(() => names.filter((record) => {
    const haystack = `${record.name} ${record.meaning} ${record.origin} ${record.meaningTags.join(" ")}`.toLowerCase();
    return (gender === "all" || record.gender === gender || (gender === "girl" && record.gender === "unisex")) &&
      (origin === "all" || record.origin.toLowerCase() === origin.toLowerCase()) &&
      (tag === "all" || record.meaningTags.includes(tag.toLowerCase())) &&
      (letter === "all" || record.letter === letter) &&
      (!uniqueOnly || record.isUnique) &&
      (mode !== "quranic" || record.isQuranic) &&
      (!search || haystack.includes(search.toLowerCase()));
  }).sort((a, b) => sort === "alphabetical" ? a.name.localeCompare(b.name) : b.popularity - a.popularity), [gender, letter, mode, origin, search, sort, tag, uniqueOnly]);

  const heading = mode === "quranic" ? "Quranic Muslim names" : mode === "unique" ? "Unique Muslim names" : mode === "origin" ? `${routeParameter} Muslim names` : mode === "meaning" ? `Muslim names meaning ${routeParameter}` : forcedGender ? `${forcedGender === "boy" ? "Muslim boy" : "Muslim girl"} names${routeLetter ? ` starting with ${routeLetter}` : ""}` : mode === "search" ? "Search Muslim baby names" : "Explore Muslim names";
  const description = mode === "quranic" ? "Explore names mentioned in or deeply connected to the Quran, with clear meanings and pronunciation support." : mode === "unique" ? "Distinctive choices with depth, made for families hoping to find something less expected without losing meaning." : mode === "origin" ? `Browse names in our ${routeParameter} collection, selected for their meaningful heritage and accessible pronunciation.` : mode === "meaning" ? `A focused collection of names connected with ${routeParameter}, helping you discover the feeling behind a name.` : forcedGender ? `Browse meaningful ${forcedGender} names by first letter, origin, or the quality you hope a name will carry.` : "Search through meanings, origin, and sound to find the name that feels like your family’s beginning.";

  const resetFilters = () => { setSearch(""); setGender(forcedGender || "all"); setOrigin(mode === "origin" ? routeParameter : "all"); setTag(mode === "meaning" ? routeParameter : "all"); setLetter(routeLetter || "all"); setUniqueOnly(mode === "unique"); };
  const filters = <div className="space-y-7">
    <div><p className="filter-label">Gender</p><div className="grid grid-cols-3 gap-1.5">{["all", "boy", "girl"].map((value) => <button key={value} onClick={() => setGender(value)} className={`filter-button ${gender === value ? "selected" : ""}`}>{value === "all" ? "All" : `${value[0].toUpperCase()}${value.slice(1)}`}</button>)}</div></div>
    <div><p className="filter-label">First letter</p><div className="grid grid-cols-7 gap-1">{["all", ...alphabet].map((value) => <button key={value} onClick={() => setLetter(value)} className={`letter-button ${letter === value ? "selected" : ""}`}>{value === "all" ? "All" : value}</button>)}</div></div>
    <div><p className="filter-label">Origin</p><select value={origin} onChange={(event) => setOrigin(event.target.value)} className="select-field"><option value="all">All origins</option>{origins.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
    <div><p className="filter-label">Meaning</p><select value={tag} onChange={(event) => setTag(event.target.value)} className="select-field"><option value="all">All meanings</option>{meaningTags.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></div>
    <button onClick={() => setUniqueOnly((selected) => !selected)} className={`flex w-full items-center justify-between border px-3.5 py-3 text-left text-sm font-medium transition ${uniqueOnly ? "border-[#0b6e4f] bg-emerald-50 text-[#0b6e4f]" : "border-emerald-950/15 bg-[#fffdf8] text-emerald-950/70"}`}><span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Unique names only</span>{uniqueOnly && <Check className="h-4 w-4" />}</button>
    <button onClick={resetFilters} className="text-sm font-semibold text-[#0b6e4f] underline underline-offset-4">Reset filters</button>
  </div>;

  return <>
    <PageIntro eyebrow={mode === "search" ? "Discovery tool" : "Name collection"} title={heading} description={description} trail={[{ label: "Explore", href: "/search" }, { label: heading }]} />
    <main className="mx-auto max-w-[1440px] px-5 py-9 sm:px-8 lg:px-12 lg:py-12">
      <div className="mb-7 flex flex-col gap-3 border-b border-emerald-950/10 pb-6 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-xl flex-1"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-950/45" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or meaning..." className="w-full border border-emerald-950/15 bg-[#fffdf8] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-emerald-950/40 focus:border-[#0b6e4f]" /></div>
        <div className="flex items-center gap-3"><button onClick={() => setMobileFilters(true)} className="inline-flex items-center gap-2 border border-emerald-950/15 bg-[#fffdf8] px-4 py-3 text-sm font-semibold text-emerald-950 lg:hidden"><Filter className="h-4 w-4" /> Filters</button><label className="inline-flex items-center gap-2 text-sm text-emerald-950/65"><SlidersHorizontal className="hidden h-4 w-4 sm:block" /><span className="hidden sm:block">Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="border border-emerald-950/15 bg-[#fffdf8] px-3 py-3 text-sm font-medium text-emerald-950 outline-none"><option value="popularity">Most loved</option><option value="alphabetical">A–Z</option></select></label></div>
      </div>
      <div className="grid gap-10 lg:grid-cols-[245px_minmax(0,1fr)]">
        <aside className="hidden border-r border-emerald-950/10 pr-7 lg:block">{filters}</aside>
        <section>
          <div className="mb-6 flex items-center justify-between"><p className="text-sm text-emerald-950/60"><span className="font-semibold text-emerald-950">{filtered.length}</span> names to explore</p><p className="hidden text-xs uppercase tracking-[0.16em] text-emerald-950/45 sm:block">Meaning before trend</p></div>
          {filtered.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((record) => <NameCard key={record.slug} record={record} isFavorite={favorites.includes(record.slug)} onToggle={toggleFavorite} />)}</div> : <div className="border border-dashed border-emerald-950/20 bg-[#f0ece1] px-6 py-16 text-center"><p className="font-display text-2xl text-emerald-950">No names match just yet.</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-emerald-950/60">Try lifting a filter or exploring a different meaning. There are many paths into the collection.</p><button onClick={resetFilters} className="mt-5 text-sm font-semibold text-[#0b6e4f] underline underline-offset-4">Clear filters</button></div>}
        </section>
      </div>
    </main>
    {mobileFilters && <div className="fixed inset-0 z-[70] bg-emerald-950/30 p-4 sm:p-8"><div className="ml-auto flex h-full max-w-md flex-col overflow-auto bg-[#faf7f0] p-6 shadow-2xl"><div className="mb-8 flex items-center justify-between"><div><p className="eyebrow">Refine your search</p><p className="mt-1 font-display text-2xl text-emerald-950">Filters</p></div><button onClick={() => setMobileFilters(false)} className="inline-flex h-10 w-10 items-center justify-center border border-emerald-950/15"><X className="h-5 w-5" /></button></div>{filters}<button onClick={() => setMobileFilters(false)} className="mt-7 bg-[#0b6e4f] px-4 py-3 text-sm font-semibold text-[#faf7f0]">Show {filtered.length} names</button></div></div>}
  </>;
}
