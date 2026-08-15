/** Quiet Courtyard shell: ivory paper, emerald navigation, and a spacious editorial path through every page. */
import { Link, useLocation } from "wouter";
import { Heart, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { siteAssets } from "@/lib/siteAssets";

const navItems = [
  { label: "Boy names", href: "/boy-names" },
  { label: "Girl names", href: "/girl-names" },
  { label: "Quranic names", href: "/quranic-names" },
  { label: "Unique names", href: "/unique-muslim-names" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-[#faf7f0] text-[#20332d]">
      <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-[#faf7f0]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-3.5 sm:px-8 lg:px-12">
          <Link href="/" className="group flex items-center gap-3" aria-label="Muslim Baby Names home">
            <span className="brand-mark"><img src={siteAssets.mark} alt="Eight-point star aperture logo" className="h-10 w-10 object-contain transition-transform duration-200 group-hover:rotate-6" /></span>
            <span className="brand-wordmark font-display text-[1.2rem] font-semibold tracking-[-0.055em] text-emerald-950">Muslim <em className="font-normal text-[#a57f1f]">Baby</em> Names</span>
          </Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`text-sm font-medium transition-colors hover:text-[#0b6e4f] ${location.startsWith(item.href) ? "text-[#0b6e4f]" : "text-emerald-950/70"}`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/search" className="inline-flex h-10 items-center gap-2 border border-emerald-950/15 bg-white/70 px-4 text-sm font-medium text-emerald-950 transition hover:border-[#0b6e4f]/50 hover:bg-white">
              <Search className="h-4 w-4" /> Search names
            </Link>
            <Link href="/favorites" aria-label="View your saved names" className="inline-flex h-10 w-10 items-center justify-center border border-emerald-950/15 bg-white/70 text-emerald-950 transition hover:border-[#0b6e4f]/50 hover:bg-white">
              <Heart className="h-4 w-4" />
            </Link>
          </div>
          <button onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Toggle navigation menu" className="inline-flex h-10 w-10 items-center justify-center border border-emerald-950/15 text-emerald-950 lg:hidden">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-emerald-950/10 bg-[#faf7f0] px-5 pb-5 pt-3 lg:hidden">
            <nav className="mx-auto grid max-w-[1440px] gap-1" aria-label="Mobile navigation">
              {navItems.map((item) => <Link key={item.href} onClick={() => setMenuOpen(false)} href={item.href} className="border-b border-emerald-950/10 py-3 text-sm font-semibold text-emerald-950">{item.label}</Link>)}
              <Link onClick={() => setMenuOpen(false)} href="/favorites" className="flex items-center gap-2 pt-3 text-sm font-semibold text-[#0b6e4f]"><Heart className="h-4 w-4" /> Your shortlist</Link>
            </nav>
          </div>
        )}
      </header>
      {children}
      <footer className="border-t border-emerald-950/10 bg-[#f0ece1]">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr] lg:px-12">
          <div>
            <div className="mb-4 flex items-center gap-2"><img src={siteAssets.mark} alt="" className="h-7 w-7" /><span className="font-display text-lg font-semibold text-emerald-950">Muslim Baby Names</span></div>
            <p className="max-w-sm text-sm leading-6 text-emerald-950/65">A considered collection of names, meanings, and stories for families beginning something beautiful.</p>
          </div>
          <div><p className="eyebrow mb-3">Explore</p><div className="grid gap-2 text-sm text-emerald-950/75"><Link href="/boy-names">Boy names</Link><Link href="/girl-names">Girl names</Link><Link href="/meaning/light">Names meaning light</Link><Link href="/origin/arabic">Arabic names</Link></div></div>
          <div><p className="eyebrow mb-3">Our promise</p><div className="grid gap-2 text-sm text-emerald-950/75"><Link href="/about">About the collection</Link><Link href="/sources">Sources & methodology</Link><Link href="/favorites">Your private shortlist</Link></div></div>
        </div>
        <div className="border-t border-emerald-950/10 px-5 py-4 text-center text-xs text-emerald-950/50">© 2026 Muslim Baby Names. Built for meaningful discovery.</div>
      </footer>
    </div>
  );
}
