"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function deviceClass() {
  if (window.innerWidth < 640) return "mobile";
  if (window.innerWidth < 1024) return "tablet";
  return "desktop";
}

function sourceClass() {
  if (!document.referrer) return "direct";
  try {
    const referrer = new URL(document.referrer);
    if (referrer.origin === window.location.origin) return "internal";
    if (/google|bing|duckduckgo|yahoo|ecosia/i.test(referrer.hostname)) return "search";
    if (/facebook|instagram|tiktok|linkedin|x\.com|twitter|youtube/i.test(referrer.hostname)) return "social";
    return "referral";
  } catch {
    return "direct";
  }
}

export function AnonymousAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || navigator.doNotTrack === "1") return;
    const sessionKey = `acv-page-view:${pathname}`;
    try {
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, "1");
    } catch {
      // Tracking still works when session storage is unavailable.
    }
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, device: deviceClass(), source: sourceClass() }),
      keepalive: true,
    });
  }, [pathname]);
  return null;
}
