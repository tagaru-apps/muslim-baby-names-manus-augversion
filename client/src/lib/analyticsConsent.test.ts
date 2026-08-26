import { beforeEach, describe, expect, it, vi } from "vitest";
import { ANALYTICS_CONSENT_KEY, loadAnalyticsAfterConsent, persistAnalyticsConsent, readAnalyticsConsent } from "./analyticsConsent";

const storage = new Map<string, string>();
const scripts: Array<{ id?: string; src?: string; async?: boolean; remove?: () => void }> = [];

beforeEach(() => {
  storage.clear();
  scripts.length = 0;
  vi.stubGlobal("window", {
    localStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) },
    dataLayer: undefined,
    gtag: undefined,
  });
  vi.stubGlobal("document", {
    cookie: "",
    getElementById: (id: string) => scripts.find((script) => script.id === id) ?? null,
    createElement: () => {
      const script: { id?: string; src?: string; async?: boolean; remove?: () => void } = {};
      script.remove = () => {
        const index = scripts.indexOf(script);
        if (index >= 0) scripts.splice(index, 1);
      };
      return script;
    },
    head: { appendChild: (script: { id?: string; src?: string; async?: boolean; remove?: () => void }) => scripts.push(script) },
  });
});

describe("analytics consent", () => {
  it("keeps analytics unloaded when a visitor rejects it", () => {
    persistAnalyticsConsent("denied");
    expect(readAnalyticsConsent()).toBe("denied");
    expect(scripts).toHaveLength(0);
  });

  it("loads Google Analytics once after explicit opt-in and persists the decision", () => {
    persistAnalyticsConsent("granted");
    expect(readAnalyticsConsent()).toBe("granted");
    expect(storage.get(ANALYTICS_CONSENT_KEY)).toBe("granted");
    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toMatchObject({ id: "mbn-google-analytics", src: "https://www.googletagmanager.com/gtag/js?id=G-P742T9QYY1", async: true });

    loadAnalyticsAfterConsent();
    expect(scripts).toHaveLength(1);
  });

  it("removes the injected Google Analytics script when consent is later revoked", () => {
    persistAnalyticsConsent("granted");
    persistAnalyticsConsent("denied");

    expect(readAnalyticsConsent()).toBe("denied");
    expect(scripts).toHaveLength(0);
    expect(window.gtag).toBeUndefined();
    expect(window.dataLayer).toBeUndefined();
  });
});
