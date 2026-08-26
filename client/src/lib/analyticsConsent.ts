export type AnalyticsConsent = "granted" | "denied";

export const ANALYTICS_CONSENT_KEY = "mbn_analytics_consent_v1";
const measurementId = "G-P742T9QYY1";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function removeAnalyticsCookies() {
  if (typeof document === "undefined") return;
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim();
    if (name?.startsWith("_ga")) document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
  });
}

export function loadAnalyticsAfterConsent() {
  if (typeof window === "undefined" || document.getElementById("mbn-google-analytics")) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
  window.gtag("consent", "default", { analytics_storage: "granted" });
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { anonymize_ip: true });

  const script = document.createElement("script");
  script.id = "mbn-google-analytics";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

export function persistAnalyticsConsent(consent: AnalyticsConsent) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, consent);
  if (consent === "granted") {
    loadAnalyticsAfterConsent();
    return;
  }
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  document.getElementById("mbn-google-analytics")?.remove();
  delete window.gtag;
  delete window.dataLayer;
  removeAnalyticsCookies();
}

export function readAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
  return stored === "granted" || stored === "denied" ? stored : null;
}
