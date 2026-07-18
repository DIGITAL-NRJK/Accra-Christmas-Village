"use client";

import { Printer } from "lucide-react";

export function PrintBadgeButton() {
  return <button className="inline-flex items-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white print:hidden" onClick={() => window.print()}><Printer className="size-4" />Print badge</button>;
}
