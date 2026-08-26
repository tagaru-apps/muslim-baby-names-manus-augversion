/** @vitest-environment jsdom */
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CookieConsentBanner } from "./CookieConsentBanner";
import { ANALYTICS_CONSENT_KEY } from "@/lib/analyticsConsent";

let container: HTMLDivElement;
let root: Root;

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

async function renderBanner() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<CookieConsentBanner />));
}

async function clickButton(text: string) {
  const button = Array.from(container.querySelectorAll("button")).find((candidate) => candidate.textContent?.includes(text));
  expect(button, `Expected a button containing “${text}”`).toBeTruthy();
  await act(async () => button?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
}

beforeEach(() => {
  localStorage.clear();
  document.querySelector("#mbn-google-analytics")?.remove();
});

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
});

describe("CookieConsentBanner", () => {
  it("keeps analytics unloaded after rejection and lets a visitor reopen the saved preference", async () => {
    await renderBanner();
    await clickButton("Reject analytics");

    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe("denied");
    expect(document.querySelector("#mbn-google-analytics")).toBeNull();
    expect(container.querySelector("[role=dialog]")).toBeNull();

    await clickButton("Cookie settings");
    expect(container.querySelector("[role=dialog]")).not.toBeNull();
  });

  it("loads analytics only after opt-in and preserves the accepted state across a simulated reload", async () => {
    await renderBanner();
    await clickButton("Accept analytics");

    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe("granted");
    expect(document.querySelectorAll("#mbn-google-analytics")).toHaveLength(1);

    await act(async () => root.unmount());
    container.remove();
    await renderBanner();
    expect(container.querySelector("[role=dialog]")).toBeNull();
    expect(Array.from(container.querySelectorAll("button")).some((button) => button.textContent?.includes("Cookie settings"))).toBe(true);
    expect(document.querySelectorAll("#mbn-google-analytics")).toHaveLength(1);

    await clickButton("Cookie settings");
    await clickButton("Reject analytics");
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe("denied");
    expect(document.querySelector("#mbn-google-analytics")).toBeNull();
  });
});
