/** Quiet Courtyard fallback: a calm, useful exit route that keeps visitors inside the discovery experience. */
import { Link } from "wouter";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return <main className="grid min-h-[68vh] place-items-center bg-[#f0ece1] px-5 text-center"><div><p className="eyebrow">A quieter corner</p><h1 className="mt-4 font-display text-6xl font-semibold tracking-[-0.07em] text-emerald-950">This path<br /><em className="font-normal text-[#a57f1f]">is not here.</em></h1><p className="mx-auto mt-5 max-w-md text-sm leading-6 text-emerald-950/65">The name or collection you were looking for may have moved. Let’s return to a place with more to explore.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/" className="inline-flex items-center gap-2 bg-[#0b6e4f] px-5 py-3 text-sm font-semibold text-[#faf7f0]"><ArrowLeft className="h-4 w-4" /> Back home</Link><Link href="/search" className="inline-flex items-center gap-2 border border-emerald-950/15 bg-[#fffdf8] px-5 py-3 text-sm font-semibold text-emerald-950"><Search className="h-4 w-4" /> Search names</Link></div></div></main>;
}
