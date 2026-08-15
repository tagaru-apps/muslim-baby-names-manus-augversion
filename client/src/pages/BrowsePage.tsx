/** Quiet Courtyard: browse collections are designed as an archival courtyard—gold indexing rails, star apertures, paper name slips, and calm discovery controls. */
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Check, Filter, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { alphabet, editorialUniquePicks, meaningTags, names, origins } from "@/lib/names";
import { useFavorites } from "@/hooks/useFavorites";
import { NameCard } from "@/components/NameCard";
import { PageIntro } from "@/components/PageIntro";

type BrowseProps = { forcedGender?: "boy" | "girl"; mode?: "quranic" | "unique" | "search" | "origin" | "meaning" };

export default function BrowsePage({ forcedGender, mode }: BrowseProps) {
  const [location, navigate] = useLocation();
  const queryParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : location.split("?")[1] || "");
  const path = location.split("?")[0];
  const pathParts = path.split("/").filter(Boolean);
  const routeParameter = mode === "origin" || mode === "meaning" ? decodeURIComponent(pathParts[1] || "") : "";
  const routeLetter = forcedGender && pathParts.length > 1 ? pathParts[1]?.toUpperCase() : "";
  const canonicalOrigin = origins.find((item) => item.toLowerCase() === routeParameter.toLowerCase()) || routeParameter;
  const routeGender = mode === "unique" ? queryParams.get("gender") || "all" : forcedGender || "all";
  const routeOrigin = mode === "origin" ? canonicalOrigin : queryParams.get("origin") || "all";
  const [search, setSearch] = useState(mode === "search" ? queryParams.get("q") || "" : "");
  const [gender, setGender] = useState(routeGender);
  const [origin, setOrigin] = useState(routeOrigin);
  const [tag, setTag] = useState(mode === "meaning" ? routeParameter : "all");
  const [letter, setLetter] = useState(routeLetter || "all");
  const [uniqueOnly, setUniqueOnly] = useState(mode === "unique");
  const [sort, setSort] = useState("popularity");
  const [mobileFilters, setMobileFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(48);
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    setGender(routeGender);
    setOrigin(routeOrigin);
    setTag(mode === "meaning" ? routeParameter : "all");
    setLetter(routeLetter || "all");
    setUniqueOnly(mode === "unique");
    setVisibleCount(48);
  }, [location, mode, routeGender, routeLetter, routeOrigin, routeParameter]);

  const updateUniqueUrl = (nextGender: string, nextOrigin: string) => {
    const params = new URLSearchParams();
    if (nextGender !== "all") params.set("gender", nextGender);
    if (nextOrigin !== "all") params.set("origin", nextOrigin);
    const query = params.toString();
    navigate(`/unique-muslim-names${query ? `?${query}` : ""}`);
  };
  const selectGender = (value: string) => { setGender(value); setVisibleCount(48); if (mode === "unique") updateUniqueUrl(value, origin); };
  const selectOrigin = (value: string) => {
    setOrigin(value);
    setVisibleCount(48);
    if (mode === "unique") { updateUniqueUrl(gender, value); return; }
    if (mode === "origin") { navigate(value === "all" ? "/search" : `/origin/${encodeURIComponent(value.toLowerCase())}`); return; }
    const params = new URLSearchParams(queryParams);
    if (value === "all") params.delete("origin"); else params.set("origin", value);
    const query = params.toString();
    navigate(`${path}${query ? `?${query}` : ""}`);
  };

  const matchesFilters = (record: typeof names[number], includeSearch = true) => {
    const haystack = `${record.name} ${record.meaning} ${record.origin} ${record.meaningTags.join(" ")}`.toLowerCase();
    return (gender === "all" || record.gender === gender || (gender === "girl" && record.gender === "unisex")) &&
      (origin === "all" || record.origin.toLowerCase() === origin.toLowerCase()) &&
      (tag === "all" || record.meaningTags.includes(tag.toLowerCase())) &&
      (letter === "all" || record.letter === letter) &&
      (!uniqueOnly || record.isUnique) &&
      (mode !== "quranic" || record.isQuranic) &&
      (!includeSearch || !search || haystack.includes(search.toLowerCase()));
  };
  const filtered = useMemo(() => names.filter((record) => matchesFilters(record)).sort((a, b) => sort === "alphabetical" ? a.name.localeCompare(b.name) : b.popularity - a.popularity), [gender, letter, mode, origin, search, sort, tag, uniqueOnly]);
  const editorial = useMemo(() => mode === "unique" ? editorialUniquePicks.filter((record) => matchesFilters(record)).slice(0, 6) : [], [gender, letter, mode, origin, search, tag, uniqueOnly]);
  const visibleNames = filtered.slice(0, visibleCount);
  const heading = mode === "quranic" ? "Quranic Muslim names" : mode === "unique" ? "Unique Muslim names" : mode === "origin" ? `${canonicalOrigin} Muslim names` : mode === "meaning" ? `Muslim names meaning ${routeParameter}` : forcedGender ? `${forcedGender === "boy" ? "Muslim boy" : "Muslim girl"} names${routeLetter ? ` starting with ${routeLetter}` : ""}` : mode === "search" ? "Search Muslim baby names" : "Explore Muslim names";
  const description = mode === "quranic" ? "Names selected for Quranic connection, meaning, and an accessible pronunciation guide." : mode === "unique" ? "Distinctive choices with depth, selected through transparent linguistic signals such as regional lineages, longer forms, and uncommon sound patterns—not popularity claims." : mode === "origin" ? `A considered ${canonicalOrigin} collection, brought together for heritage, meaning, and an accessible pronunciation guide.` : mode === "meaning" ? `A focused collection of names connected with ${routeParameter}, helping you discover the feeling behind a name.` : forcedGender ? `Names selected for meaning, heritage, and pronunciation—browse by first letter or follow the origin that speaks to your family.` : "Search through meaning, heritage, and sound to find the name that feels like your family’s beginning.";
  const resetFilters = () => { setSearch(""); setGender(forcedGender || "all"); setOrigin("all"); setTag(mode === "meaning" ? routeParameter : "all"); setLetter(routeLetter || "all"); setUniqueOnly(mode === "unique"); setVisibleCount(48); if (mode === "unique") navigate("/unique-muslim-names"); else if (mode === "origin") navigate("/search"); else navigate(path); };
  const originCounts = useMemo(() => names.reduce<Record<string, number>>((counts, record) => { counts[record.origin] = (counts[record.origin] || 0) + 1; return counts; }, {}), []);
  const originBrowse = <section className="courtyard-origin-rail"><div className="mb-3 flex items-baseline justify-between"><p className="filter-label mb-0">Browse by origin</p><span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-emerald-950/40">{origins.length} paths</span></div><div className="grid grid-cols-2 gap-1.5"><button onClick={() => selectOrigin("all")} className={`origin-filter-row col-span-2 ${origin === "all" ? "selected" : ""}`}><span>All origins</span><span>{names.length.toLocaleString()}</span></button>{origins.map((item) => <button key={item} onClick={() => selectOrigin(item)} className={`origin-filter-row ${origin === item ? "selected" : ""}`}><span>{item}</span><span>{(originCounts[item] || 0).toLocaleString()}</span></button>)}</div></section>;
  const filters = <div className="space-y-7"><div><p className="filter-label">Gender</p><div className="grid grid-cols-3 gap-1.5">{["all", "boy", "girl"].map((value) => <button key={value} onClick={() => selectGender(value)} className={`filter-button ${gender === value ? "selected" : ""}`}>{value === "all" ? "All" : `${value[0].toUpperCase()}${value.slice(1)}`}</button>)}</div></div><div><p className="filter-label">First letter</p><div className="grid grid-cols-7 gap-1">{["all", ...alphabet].map((value) => <button key={value} onClick={() => { setLetter(value); setVisibleCount(48); }} className={`letter-button ${letter === value ? "selected" : ""}`}>{value === "all" ? "All" : value}</button>)}</div></div><div><p className="filter-label">Meaning</p><select value={tag} onChange={(event) => { setTag(event.target.value); setVisibleCount(48); }} className="select-field"><option value="all">All meanings</option>{meaningTags.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></div>{mode !== "unique" && <button onClick={() => setUniqueOnly((selected) => !selected)} className={`flex w-full items-center justify-between border px-3.5 py-3 text-left text-sm font-medium transition ${uniqueOnly ? "border-[#0b6e4f] bg-emerald-50 text-[#0b6e4f]" : "border-emerald-950/15 bg-[#fffdf8] text-emerald-950/70"}`}><span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Unique names only</span>{uniqueOnly && <Check className="h-4 w-4" />}</button>}<button onClick={resetFilters} className="text-sm font-semibold text-[#0b6e4f] underline underline-offset-4">Reset filters</button></div>;

  return <><PageIntro eyebrow={mode === "search" ? "Discovery tool" : "Name collection"} title={heading} description={description} trail={[{ label: "Explore", href: "/search" }, { label: heading }]} /><main className="mx-auto max-w-[1440px] px-5 py-9 sm:px-8 lg:px-12 lg:py-12"><div className="courtyard-workspace mb-7 flex flex-col gap-3 border-b border-emerald-950/10 pb-6 md:flex-row md:items-center md:justify-between"><div className="relative max-w-xl flex-1"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-950/45" /><input value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(48); }} placeholder="Search by name or meaning..." className="w-full border border-emerald-950/15 bg-[#fffdf8] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-emerald-950/40 focus:border-[#0b6e4f]" /></div><div className="flex items-center gap-3"><button onClick={() => setMobileFilters(true)} className="inline-flex items-center gap-2 border border-emerald-950/15 bg-[#fffdf8] px-4 py-3 text-sm font-semibold text-emerald-950 lg:hidden"><Filter className="h-4 w-4" /> Filters</button><label className="inline-flex items-center gap-2 text-sm text-emerald-950/65"><SlidersHorizontal className="hidden h-4 w-4 sm:block" /><span className="hidden sm:block">Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="border border-emerald-950/15 bg-[#fffdf8] px-3 py-3 text-sm font-medium text-emerald-950 outline-none"><option value="popularity">Most loved</option><option value="alphabetical">A–Z</option></select></label></div></div><div className="grid gap-10 lg:grid-cols-[270px_minmax(0,1fr)]"><aside className="hidden border-r border-emerald-950/10 pr-7 lg:block">{originBrowse}{filters}</aside><section>{mode === "unique" && editorial.length > 0 && <section className="mb-10 border border-[#c9a227]/55 bg-[#f0ece1] p-5 sm:p-7"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow text-[#8b6d22]">The editorial 100</p><h2 className="mt-2 font-display text-3xl tracking-[-0.05em] text-emerald-950">A considered first reading</h2></div><p className="max-w-md text-sm leading-6 text-emerald-950/65">Balanced across girl and boy names, selected by the same transparent distinctiveness signals used throughout this collection.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{editorial.map((record) => <NameCard key={`editorial-${record.slug}`} record={record} isFavorite={favorites.includes(record.slug)} onToggle={toggleFavorite} showDistinctiveness />)}</div></section>}<div className="mb-6 flex items-center justify-between"><p className="text-sm text-emerald-950/60"><span className="font-display text-xl text-emerald-950">{filtered.length.toLocaleString()}</span> names to explore</p><p className="hidden text-xs uppercase tracking-[0.16em] text-emerald-950/45 sm:block">Meaning before trend</p></div>{filtered.length ? <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visibleNames.map((record) => <NameCard key={record.slug} record={record} isFavorite={favorites.includes(record.slug)} onToggle={toggleFavorite} showDistinctiveness={mode === "unique"} />)}</div>{visibleCount < filtered.length && <div className="mt-8 text-center"><button onClick={() => setVisibleCount((count) => count + 48)} className="border border-[#0b6e4f] bg-[#fffdf8] px-5 py-3 text-sm font-semibold text-[#0b6e4f] transition hover:bg-[#0b6e4f] hover:text-[#faf7f0]">Show 48 more names <span className="ml-2 text-[#a57f1f]">({filtered.length - visibleCount} remaining)</span></button></div>}</> : <div className="border border-dashed border-emerald-950/20 bg-[#f0ece1] px-6 py-16 text-center"><p className="font-display text-2xl text-emerald-950">No names match just yet.</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-emerald-950/60">Try lifting a filter or exploring a different meaning. There are many paths into the collection.</p><button onClick={resetFilters} className="mt-5 text-sm font-semibold text-[#0b6e4f] underline underline-offset-4">Clear filters</button></div>}</section></div></main>{mobileFilters && <div className="fixed inset-0 z-[70] bg-emerald-950/30 p-4 sm:p-8"><div className="ml-auto flex h-full max-w-md flex-col overflow-auto bg-[#faf7f0] p-6 shadow-2xl"><div className="mb-8 flex items-center justify-between"><div><p className="eyebrow">Refine your search</p><p className="mt-1 font-display text-2xl text-emerald-950">Filters</p></div><button onClick={() => setMobileFilters(false)} className="inline-flex h-10 w-10 items-center justify-center border border-emerald-950/15"><X className="h-5 w-5" /></button></div>{originBrowse}{filters}<button onClick={() => setMobileFilters(false)} className="mt-7 bg-[#0b6e4f] px-4 py-3 text-sm font-semibold text-[#faf7f0]">Show {filtered.length} names</button></div></div>}</>;
}
