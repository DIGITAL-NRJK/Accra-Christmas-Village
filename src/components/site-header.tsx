import Link from "next/link";
import { Gift, MapPin } from "lucide-react";
import { AuthControls } from "@/components/auth-controls";

const publicLinks = [
  { href: "/map", label: "Map" },
  { href: "/programme", label: "Programme" },
  { href: "/stands", label: "Stands" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/practical-info", label: "Info" },
  { href: "/safety", label: "Safety" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-acv-gold/25 bg-acv-night/96 text-white shadow-lg shadow-black/15 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link className="flex min-w-0 items-center gap-3 font-semibold" href="/">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-acv-gold text-acv-night">
              <Gift aria-hidden="true" className="size-5" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-display text-xl uppercase leading-none sm:text-2xl">
                Accra Christmas Village
              </span>
              <span className="mt-1 flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase text-white/62">
                <MapPin aria-hidden="true" className="size-3" />
                20-26 Dec / Accra
              </span>
            </span>
          </Link>
          <div className="hidden items-center gap-3 sm:flex">
            <AuthControls />
          </div>
        </div>
        <div className="flex w-full min-w-0 items-center gap-3 overflow-x-auto pb-1">
          {publicLinks.map((link) => (
            <Link
              className="whitespace-nowrap rounded-md border border-transparent px-3 py-1.5 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
          <Link
            className="whitespace-nowrap rounded-md bg-acv-gold px-3 py-1.5 text-sm font-bold text-acv-night transition hover:bg-white"
            href="/portal"
          >
            Portal
          </Link>
        </div>
        <div className="sm:hidden">
          <AuthControls />
        </div>
      </div>
    </header>
  );
}
