/** Quiet Courtyard profile: a spacious, source-minded name page that returns every detail to discovery. */
import { Link, useLocation } from "wouter";
/** Quiet Courtyard: archival emerald, gold linework, and considered utility actions over a low-key geometric field. */
import { ArrowLeft, Bookmark, ChevronRight, Download, Eye, Heart, Instagram, Languages, Link2, Share2, Smartphone, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getName, getRelatedNames } from "@/lib/names";
import { useFavorites } from "@/hooks/useFavorites";
import { NameCard } from "@/components/NameCard";
import NotFound from "@/pages/NotFound";
import { useShareCount } from "@/hooks/useShareCount";
import { createNameSocialImage, downloadNameSocialImage, type SocialFormat } from "@/lib/socialImage";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { recordExport } from "@/lib/exportHistory";

export default function NameDetailPage() {
  const [location] = useLocation();
  const slug = location.split("/").filter(Boolean).pop() || "";
  const record = getName(slug);
  const { favorites, toggleFavorite } = useFavorites();
  const { shareCount, recordShare } = useShareCount(slug);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [activeVoice, setActiveVoice] = useState<"arabic" | "english" | null>(null);
  const [shareStatus, setShareStatus] = useState<"idle" | "shared" | "copied">("idle");
  const [imageAction, setImageAction] = useState<"landscape" | "instagram" | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFormat, setPreviewFormat] = useState<SocialFormat>("landscape");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [includePhonetic, setIncludePhonetic] = useState(true);
  const [dedication, setDedication] = useState("");
  useEffect(() => {
    setSpeechSupported(typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
    return () => window.speechSynthesis?.cancel();
  }, []);
  useEffect(() => {
    if (!previewOpen || !record) return;
    let active = true;
    let objectUrl = "";
    setPreviewLoading(true);
    setPreviewUrl(null);
    createNameSocialImage(record, previewFormat, { includePhonetic, dedication }).then((blob) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
    }).catch(() => {
      if (active) toast.error("Could not prepare preview");
    }).finally(() => {
      if (active) setPreviewLoading(false);
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [dedication, includePhonetic, previewFormat, previewOpen, record]);
  if (!record) return <NotFound />;
  const related = getRelatedNames(record);
  const isFavorite = favorites.includes(record.slug);
  const sourceIndexed = record.origin === "Not specified in source";
  const hasArabicScript = /[\u0600-\u06FF]/.test(record.arabic);
  const shareMessage = `${record.name}${record.phonetic ? ` (${record.phonetic})` : ""} — ${record.meaning}. Discover this name on Muslim Baby Names.`;
  const copyText = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const fallback = document.createElement("textarea");
    fallback.value = text;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    document.body.appendChild(fallback);
    fallback.select();
    document.execCommand("copy");
    fallback.remove();
  };
  const shareName = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const copyShareText = async () => {
      await copyText(`${shareMessage}${url ? ` ${url}` : ""}`);
      recordShare();
      setShareStatus("copied");
      toast.success("Share text copied", { description: "Ready to paste into WhatsApp or social apps." });
      window.setTimeout(() => setShareStatus("idle"), 2400);
    };
    if (navigator.share) {
      try {
        let shareData: ShareData = { title: `${record.name} — Muslim Baby Names`, text: shareMessage, url };
        if (navigator.canShare) {
          const image = await createNameSocialImage(record, "landscape", { includePhonetic, dedication });
          const file = new File([image], `${record.slug}-muslim-baby-name.png`, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) shareData = { ...shareData, files: [file] };
        }
        await navigator.share(shareData);
        recordShare();
        setShareStatus("shared");
        toast.success("Ready to share", { description: "Your name card and link were sent to the sharing sheet." });
        window.setTimeout(() => setShareStatus("idle"), 2400);
        return;
      } catch (error) {
        if ((error as DOMException)?.name === "AbortError") {
          toast.info("Share dismissed");
          return;
        }
      }
    }
    try {
      await copyShareText();
    } catch {
      setShareStatus("idle");
      toast.error("Could not start sharing", { description: "Please use the Copy link button instead." });
    }
  };
  const openPreview = (format: SocialFormat) => {
    setPreviewFormat(format);
    setPreviewOpen(true);
  };
  const downloadImage = async (format: SocialFormat = previewFormat) => {
    try {
      setImageAction(format === "story" ? "instagram" : format);
      await downloadNameSocialImage(record, format, { includePhonetic, dedication });
      recordExport(record, { format, includePhonetic, dedication });
      toast.success(format === "story" ? "Story image downloaded" : format === "instagram" ? "Instagram image downloaded" : "Social image downloaded", { description: "Your image is ready to share." });
    } catch {
      toast.error("Could not create image", { description: "Please try the download again." });
    } finally {
      setImageAction(null);
    }
  };
  const shareStory = async () => {
    try {
      const image = await createNameSocialImage(record, "story", { includePhonetic, dedication });
      const storyFile = new File([image], `${record.slug}-instagram-story.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [storyFile] })) {
        await navigator.share({ files: [storyFile], title: `${record.name} Story card` });
        recordShare();
        recordExport(record, { format: "story", includePhonetic, dedication });
        toast.success("Story image ready to share", { description: "Choose Instagram Stories from your device share sheet." });
      } else {
        openPreview("story");
        toast.info("Preview your Story card", { description: "Download it, then add it to an Instagram Story." });
      }
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") toast.error("Could not prepare Story image");
    }
  };
  const copyLink = async () => {
    try {
      await copyText(window.location.href);
      recordShare();
      toast.success("Link copied", { description: "Ready to paste into WhatsApp or social apps." });
    } catch {
      toast.error("Could not copy the link", { description: "Please copy the address from your browser." });
    }
  };
  const speak = (voice: "arabic" | "english") => {
    if (!speechSupported || !record.phonetic) return;
    const useArabic = voice === "arabic" && hasArabicScript;
    const utterance = new SpeechSynthesisUtterance(useArabic ? record.arabic : record.phonetic);
    utterance.lang = useArabic ? "ar-SA" : "en-US";
    utterance.rate = 0.82;
    utterance.onstart = () => setActiveVoice(voice);
    utterance.onend = () => setActiveVoice(null);
    utterance.onerror = () => setActiveVoice(null);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };
  return <main>
    <section className="relative overflow-hidden bg-emerald-950 px-5 py-12 text-[#faf7f0] sm:px-8 lg:px-12 lg:py-16">
      <div className="hero-pattern absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-[1440px]">
        <nav className="mb-10 flex items-center gap-1.5 text-xs text-[#faf7f0]/55" aria-label="Breadcrumb"><Link href="/" className="hover:text-white">Home</Link><ChevronRight className="h-3.5 w-3.5" /><Link href={record.gender === "girl" ? "/girl-names" : "/boy-names"} className="hover:text-white">{record.gender === "girl" ? "Girl names" : "Boy names"}</Link><ChevronRight className="h-3.5 w-3.5" /><span>{record.name}</span></nav>
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div><p className="eyebrow text-[#d9be70]">{sourceIndexed ? "Source-indexed" : record.origin} {record.gender === "unisex" ? "unisex" : record.gender} name</p><h1 className="mt-4 font-display text-6xl font-semibold tracking-[-0.07em] sm:text-7xl lg:text-8xl">{record.name}</h1><p className="mt-3 font-arabic text-4xl text-[#d9be70]" lang="ar" dir="rtl">{record.arabic}</p><p className="mt-7 max-w-xl font-display text-2xl leading-tight text-[#faf7f0]/90 sm:text-3xl">“{record.meaning}”</p></div>
          <div className="flex flex-wrap gap-3 lg:justify-end"><button onClick={() => toggleFavorite(record.slug)} className={`inline-flex items-center gap-2 border px-4 py-3 text-sm font-semibold transition ${isFavorite ? "border-[#c9a227] bg-[#c9a227] text-emerald-950" : "border-white/30 bg-white/10 text-white hover:bg-white/15"}`}><Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} /> {isFavorite ? "Saved to shortlist" : "Save name"}</button><button onClick={shareName} className={`inline-flex h-11 items-center gap-2 border px-3 text-sm font-semibold transition ${shareStatus !== "idle" ? "border-[#c9a227] bg-[#c9a227] text-emerald-950" : "border-white/30 bg-white/10 text-white hover:bg-white/15"}`} aria-label="Share this name and pronunciation" title="Share name and pronunciation"><Share2 className="h-4 w-4" /><span className="hidden sm:inline">{shareStatus === "shared" ? "Shared" : shareStatus === "copied" ? "Copied" : "Share"}</span></button><button onClick={() => openPreview("landscape")} className="inline-flex h-11 items-center gap-2 border border-white/30 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/15" aria-label="Preview landscape social image" title="Preview landscape social image"><Eye className="h-4 w-4" /><span className="hidden sm:inline">Image</span></button><button onClick={() => openPreview("instagram")} className="inline-flex h-11 items-center gap-2 border border-[#d9be70]/70 bg-[#d9be70]/12 px-3 text-sm font-semibold text-[#fff8e9] transition hover:bg-[#d9be70] hover:text-emerald-950" aria-label="Preview square Instagram image" title="Preview 1080 by 1080 Instagram image"><Instagram className="h-4 w-4" /><span className="hidden sm:inline">Instagram</span></button><button onClick={shareStory} className="inline-flex h-11 items-center gap-2 border border-[#d9be70]/70 bg-[#d9be70]/12 px-3 text-sm font-semibold text-[#fff8e9] transition hover:bg-[#d9be70] hover:text-emerald-950" aria-label="Share a vertical Instagram Story image" title="Share image only to Instagram Stories"><Smartphone className="h-4 w-4" /><span className="hidden sm:inline">Story</span></button><button onClick={copyLink} className="inline-flex h-11 items-center gap-2 border border-white/30 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/15" aria-label="Copy page link" title="Copy page link"><Link2 className="h-4 w-4" /><span className="hidden sm:inline">Copy link</span></button><p className="basis-full text-right text-xs text-white/55" aria-live="polite">Shared {shareCount} {shareCount === 1 ? "time" : "times"} on this device</p></div>
        </div>
      </div>
    </section>
    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}><DialogContent className="max-h-[calc(100vh-2rem)] max-w-2xl overflow-y-auto border-[#c9a227]/55 bg-[#faf7f0] p-5 sm:p-7"><DialogHeader><p className="eyebrow text-[#8b6d22]">Social card preview</p><DialogTitle className="font-display text-3xl tracking-[-0.05em] text-emerald-950">{previewFormat === "story" ? "Instagram Story card" : previewFormat === "instagram" ? "Instagram square card" : "Landscape social card"}</DialogTitle><DialogDescription>Choose whether to include the phonetic reading guide and add a short personal note before exporting.</DialogDescription></DialogHeader><div className={`relative overflow-hidden border border-emerald-950/12 bg-emerald-950/10 ${previewFormat === "story" ? "mx-auto max-w-[300px]" : ""}`}>{previewLoading && <div className="grid min-h-64 place-items-center text-sm font-semibold text-emerald-950/65">Preparing your card…</div>}{previewUrl && <img src={previewUrl} alt={`${record.name} social card preview`} className="block h-auto w-full" />}</div><div className="divide-y divide-emerald-950/10 border-y border-emerald-950/10"><label className="flex items-center justify-between gap-4 py-4"><span><span className="block text-sm font-semibold text-emerald-950">Include phonetic spelling</span><span className="mt-1 block text-xs leading-5 text-emerald-950/60">Shows the reader-friendly pronunciation guide on your card.</span></span><input type="checkbox" checked={includePhonetic} onChange={(event) => setIncludePhonetic(event.target.checked)} className="h-5 w-5 accent-[#0b6e4f]" /></label><label className="block py-4"><span className="block text-sm font-semibold text-emerald-950">Personal dedication</span><span className="mt-1 block text-xs leading-5 text-emerald-950/60">Optional. Add a short note such as “For our little light.”</span><input value={dedication} onChange={(event) => setDedication(event.target.value.slice(0, 80))} maxLength={80} placeholder="A short note for this name" className="mt-3 w-full border border-emerald-950/15 bg-[#fffdf8] px-3 py-2.5 text-sm text-emerald-950 outline-none transition placeholder:text-emerald-950/35 focus:border-[#0b6e4f]" /><span className="mt-1 block text-right text-[0.68rem] text-emerald-950/45">{dedication.length}/80</span></label></div><DialogFooter><button onClick={() => setPreviewOpen(false)} className="border border-emerald-950/15 px-4 py-2.5 text-sm font-semibold text-emerald-950">Close</button><button onClick={() => downloadImage()} disabled={previewLoading || imageAction !== null} className="inline-flex items-center justify-center gap-2 bg-[#0b6e4f] px-4 py-2.5 text-sm font-semibold text-[#faf7f0] transition hover:bg-emerald-950 disabled:cursor-wait disabled:opacity-60"><Download className="h-4 w-4" />{imageAction ? "Creating image" : "Download image"}</button></DialogFooter></DialogContent></Dialog>
    <section className="mx-auto grid max-w-[1440px] gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-12 lg:py-16">
      <article className="max-w-3xl"><p className="eyebrow mb-4">The story of {record.name}</p><h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-emerald-950">A name that carries <em className="font-normal">{record.meaningTags[0]}</em>.</h2><p className="mt-6 text-base leading-8 text-emerald-950/70">{record.description} We present each name with the kind of detail that supports a thoughtful decision: an accessible pronunciation, its heritage, and the qualities most commonly associated with it. Meanings can have rich regional and linguistic nuance, so the Sources & Methodology page explains how our editorial process approaches them.</p>
        <div className="mt-10 grid gap-px overflow-hidden border border-emerald-950/12 bg-emerald-950/12 sm:grid-cols-2">{record.phonetic && <div className="bg-[#fffdf8] p-5"><p className="eyebrow">Pronunciation</p><div className="mt-2 flex flex-wrap items-center gap-2"><p className="font-display text-2xl text-emerald-950">{record.phonetic}</p>{speechSupported && <div className="flex items-center gap-1">{hasArabicScript && <button onClick={() => speak("arabic")} title="Listen in Arabic" aria-label="Listen to Arabic pronunciation" className={`pronunciation-play ${activeVoice === "arabic" ? "is-speaking" : ""}`}><Languages className="h-3.5 w-3.5" /><Volume2 className="h-3.5 w-3.5" /></button>}<button onClick={() => speak("english")} title="Listen to English reading guide" aria-label="Listen to English phonetic pronunciation" className={`pronunciation-play ${activeVoice === "english" ? "is-speaking" : ""}`}><Volume2 className="h-4 w-4" /></button></div>}</div><p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.13em] text-[#a57f1f]">{record.phoneticConfidence === "high" ? "Rule-based reading guide" : "Auto-generated — review advised"}</p></div>}<div className="bg-[#fffdf8] p-5"><p className="eyebrow">Origin</p>{sourceIndexed ? <p className="mt-2 font-display text-xl text-emerald-950/65">Not supplied by source</p> : <><Link href={`/origin/${record.origin.toLowerCase()}`} className="mt-2 inline-flex items-center gap-1 font-display text-2xl text-emerald-950 hover:text-[#0b6e4f]">{record.origin}<ArrowLeft className="h-4 w-4 rotate-180" /></Link><p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.13em] text-[#a57f1f]">{record.originConfidence === "explicit" ? "Source-stated" : "Linguistic inference"}</p></>}</div><div className="bg-[#fffdf8] p-5"><p className="eyebrow">First letter</p><Link href={`/${record.gender === "girl" ? "girl" : "boy"}-names/${record.letter.toLowerCase()}`} className="mt-2 inline-flex items-center gap-1 font-display text-2xl text-emerald-950 hover:text-[#0b6e4f]">{record.letter}<ArrowLeft className="h-4 w-4 rotate-180" /></Link></div><div className="bg-[#fffdf8] p-5"><p className="eyebrow">Qualities</p><p className="mt-2 font-display text-2xl capitalize text-emerald-950">{record.meaningTags.join(" · ")}</p></div></div>
        <div className="mt-12 border-t border-emerald-950/12 pt-10"><p className="eyebrow mb-4">Explore by meaning</p><div className="flex flex-wrap gap-2">{record.meaningTags.map((tag) => <Link key={tag} href={`/meaning/${tag}`} className="border border-emerald-950/15 bg-[#f0ece1] px-4 py-2 text-sm font-semibold capitalize text-emerald-950 transition hover:border-[#0b6e4f] hover:bg-emerald-50">{tag}</Link>)}</div></div>
      </article>
      <aside><div className="border border-emerald-950/12 bg-[#f0ece1] p-6"><div className="flex h-10 w-10 items-center justify-center bg-[#c9a227] text-emerald-950"><Bookmark className="h-5 w-5" /></div><p className="mt-5 font-display text-2xl leading-tight text-emerald-950">A private shortlist, just for you.</p><p className="mt-3 text-sm leading-6 text-emerald-950/65">Save names as you browse. Your shortlist stays in this browser—no account, no pressure.</p><Link href="/favorites" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0b6e4f] underline underline-offset-4">View your shortlist <ChevronRight className="h-4 w-4" /></Link></div><div className="mt-5 border-l-2 border-[#c9a227] pl-4 text-sm leading-6 text-emerald-950/62"><Languages className="mb-2 h-4 w-4 text-[#a57f1f]" />Arabic spellings represent a name’s conventional written form and may vary by region or family preference.</div></aside>
    </section>
    <section className="border-y border-emerald-950/10 bg-[#f0ece1] px-5 py-12 sm:px-8 lg:px-12"><div className="mx-auto max-w-[1440px]"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="eyebrow mb-2">Continue the path</p><h2 className="font-display text-3xl font-semibold tracking-[-0.05em] text-emerald-950">Names with a similar feeling</h2></div><Link href="/search" className="hidden items-center gap-1 text-sm font-semibold text-[#0b6e4f] sm:inline-flex">Browse all <ChevronRight className="h-4 w-4" /></Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <NameCard key={item.slug} record={item} isFavorite={favorites.includes(item.slug)} onToggle={toggleFavorite} />)}</div></div></section>
  </main>;
}
