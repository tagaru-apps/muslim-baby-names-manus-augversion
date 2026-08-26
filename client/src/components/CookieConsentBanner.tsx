/** Quiet Courtyard: analytics stay off until a visitor explicitly chooses them. */
import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { Check, Cookie, Settings2, X } from "lucide-react";
import { AnalyticsConsent, persistAnalyticsConsent, readAnalyticsConsent } from "@/lib/analyticsConsent";

export function CookieConsentBanner() {
  const [consent, setConsent] = useState<AnalyticsConsent | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = readAnalyticsConsent();
    setConsent(saved);
    if (saved === "granted") persistAnalyticsConsent("granted");
    setReady(true);
  }, []);

  const choose = (value: AnalyticsConsent) => {
    persistAnalyticsConsent(value);
    setConsent(value);
    setOpen(false);
  };

  if (!ready) return null;
  const showBanner = consent === null || open;
  return <>{showBanner && <section aria-label="Cookie preferences" role="dialog" aria-modal={consent === null} className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-2xl border border-[#c9a227]/70 bg-[#fffdf8] p-5 shadow-[0_20px_60px_rgba(20,61,48,0.22)] sm:bottom-6 sm:p-6"><div className="flex gap-4"><div className="hidden h-10 w-10 shrink-0 items-center justify-center bg-[#f0ece1] text-[#a57f1f] sm:flex"><Cookie className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-[#8b6d22]">Your privacy choice</p><h2 className="mt-1 font-display text-2xl tracking-[-0.04em] text-emerald-950">Analytics are off until you say yes.</h2></div>{consent !== null && <button onClick={() => setOpen(false)} aria-label="Close cookie settings" className="text-emerald-950/55 hover:text-emerald-950"><X className="h-5 w-5" /></button>}</div><p className="mt-3 text-sm leading-6 text-emerald-950/68">We use optional Google Analytics to understand aggregate visits and improve the collection. Essential local storage, such as your private shortlist, continues to work without analytics. Read our <Link href="/privacy" className="font-semibold text-[#0b6e4f] underline underline-offset-2">Privacy Policy</Link>.</p><div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end"><button onClick={() => choose("denied")} className="border border-emerald-950/18 px-4 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-[#f0ece1]">Reject analytics</button><button onClick={() => choose("granted")} className="inline-flex items-center justify-center gap-2 bg-[#0b6e4f] px-4 py-2.5 text-sm font-semibold text-[#fffdf8] transition hover:bg-emerald-900"><Check className="h-4 w-4" /> Accept analytics</button></div></div></div></section>}{consent !== null && !open && <button onClick={() => setOpen(true)} className="fixed bottom-4 left-4 z-[90] inline-flex items-center gap-2 border border-emerald-950/15 bg-[#fffdf8]/95 px-3 py-2 text-xs font-semibold text-emerald-950 shadow-sm backdrop-blur transition hover:border-[#0b6e4f]" aria-label="Open cookie settings"><Settings2 className="h-3.5 w-3.5 text-[#a57f1f]" /> Cookie settings</button>}</>;
}
