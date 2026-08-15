/** Quiet Courtyard title band: an archival paper title page framed by the recurring eight-point aperture. */
import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

/** Quiet Courtyard: collection titles use a sandstone architectural frame, gold rules, and a star-aperture marker before the archive workspace. */

export function PageIntro({ eyebrow, title, description, trail = [] }: { eyebrow: string; title: string; description: string; trail?: { label: string; href?: string }[] }) {
  return <section className="page-intro relative overflow-hidden border-b border-emerald-950/10 bg-[#f0ece1] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
    <div className="pattern-dots absolute inset-0 opacity-70" />
    <div className="absolute bottom-[-74px] right-[8%] h-44 w-44 border border-[#c9a227]/45 sm:h-56 sm:w-56" style={{ clipPath: "polygon(50% 0, 63% 15%, 79% 9%, 85% 27%, 100% 50%, 85% 63%, 91% 79%, 73% 85%, 50% 100%, 37% 85%, 21% 91%, 15% 73%, 0 50%, 15% 37%, 9% 21%, 27% 15%)" }} />
    <div className="absolute bottom-0 right-[18%] hidden h-32 w-24 border-x border-t border-[#0b6e4f]/15 sm:block" style={{ borderRadius: "5rem 5rem 0 0" }} />
    <div className="absolute bottom-8 right-[12%] hidden h-5 w-5 bg-[#c9a227] sm:block" style={{ clipPath: "polygon(50% 0, 63% 15%, 79% 9%, 85% 27%, 100% 50%, 85% 63%, 91% 79%, 73% 85%, 50% 100%, 37% 85%, 21% 91%, 15% 73%, 0 50%, 15% 37%, 9% 21%, 27% 15%)" }} />
    <div className="relative mx-auto max-w-[1440px]">
      <nav className="mb-7 flex items-center gap-1.5 text-xs font-medium text-emerald-950/55" aria-label="Breadcrumb">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-[#0b6e4f]"><Home className="h-3.5 w-3.5" /> Home</Link>
        {trail.map((item) => <span key={item.label} className="flex items-center gap-1.5"><ChevronRight className="h-3.5 w-3.5" />{item.href ? <Link className="hover:text-[#0b6e4f]" href={item.href}>{item.label}</Link> : <span>{item.label}</span>}</span>)}
      </nav>
      <div className="border-l-2 border-[#c9a227] pl-5 sm:pl-7"><div className="page-intro-rule mb-5" /><p className="eyebrow mb-3">{eyebrow}</p><h1 className="max-w-3xl font-display text-4xl font-semibold leading-[0.96] tracking-[-0.055em] text-emerald-950 sm:text-5xl lg:text-6xl">{title}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-emerald-950/67 sm:text-lg">{description}</p></div>
    </div>
  </section>;
}
