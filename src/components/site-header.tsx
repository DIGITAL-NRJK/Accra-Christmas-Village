import Link from "next/link";
import { Gift, MapPin, Ticket } from "lucide-react";
import { AuthControls } from "@/components/auth-controls";

const publicLinks = [
  { href: "/map", label: "Map", code: "A" },
  { href: "/programme", label: "Programme", code: "B" },
  { href: "/stands", label: "Stands", code: "FC" },
  { href: "/sponsors", label: "Sponsors", code: "SP" },
  { href: "/practical-info", label: "Info", code: "I" },
  { href: "/safety", label: "Safety", code: "S" },
  { href: "/faq", label: "FAQ", code: "?" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-acv-gold/30 bg-acv-night/[0.94] text-white shadow-[0_18px_45px_rgb(0_0_0/0.18)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[76px] items-center justify-between gap-3 py-3">
          <Link className="group flex min-w-0 items-center gap-3 font-semibold" href="/">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-acv-gold text-acv-night shadow-[inset_0_-3px_0_rgb(17_23_19/0.18)] transition group-hover:bg-white">
              <Gift aria-hidden="true" className="size-5" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-display text-2xl uppercase leading-none sm:text-3xl">
                Accra Christmas Village
              </span>
              <span className="mt-1 flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase text-white/[0.65]">
                <MapPin aria-hidden="true" className="size-3" />
                20-26 Dec / Accra
              </span>
            </span>
          </Link>

          <nav
            aria-label="Visitor routes"
            className="hidden min-w-0 flex-1 items-center justify-center xl:flex"
          >
            <div className="flex max-w-full items-center gap-1 rounded-md border border-white/15 bg-white/[0.06] p-1">
              {publicLinks.map((link) => (
                <Link
                  className="group inline-flex items-center gap-2 whitespace-nowrap rounded-[5px] px-2.5 py-2 text-sm font-semibold text-white/[0.76] transition hover:bg-white/10 hover:text-white"
                  href={link.href}
                  key={link.href}
                >
                  <span className="rounded-[4px] bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-black text-acv-gold transition group-hover:bg-acv-gold group-hover:text-acv-night">
                    {link.code}
                  </span>
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <AuthControls />
          </div>
        </div>

        <div className="flex w-full min-w-0 items-center gap-2 overflow-x-auto border-t border-white/10 py-2 xl:hidden">
          {publicLinks.map((link) => (
            <Link
              className="inline-flex whitespace-nowrap rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-semibold text-white/[0.78] transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
          <Link
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-acv-gold px-3 py-1.5 text-sm font-bold text-acv-night transition hover:bg-white"
            href="/portal"
          >
            <Ticket aria-hidden="true" className="size-4" />
            Portal
          </Link>
        </div>
        <div className="pb-3 lg:hidden">
          <AuthControls />
        </div>
      </div>
      <div className="h-1.5 acv-route-band" />
    </header>
  );
}
