import Link from "next/link";
import { Gift, MapPin, Ticket } from "lucide-react";
import { AnnouncementBanner } from "@/components/announcement-banner";
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

export async function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-acv-gold/[0.35] bg-acv-night/[0.96] text-white shadow-[0_18px_45px_rgb(0_0_0/0.18)] backdrop-blur-xl">
      <div className="flex w-full flex-col">
        <div className="flex min-h-[74px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8 2xl:px-10">
          <Link
            className="group flex min-w-0 shrink-0 items-center gap-3 font-semibold lg:max-w-[360px] xl:max-w-[420px]"
            href="/"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-acv-gold text-acv-night shadow-[inset_0_-3px_0_rgb(17_23_19/0.18)] transition group-hover:bg-white">
              <Gift aria-hidden="true" className="size-5" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-display text-2xl uppercase leading-none sm:text-3xl xl:text-[2rem]">
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
            className="hidden min-w-0 flex-1 items-center justify-center lg:flex"
          >
            <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/[0.18] bg-white/[0.08] p-1 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]">
              {publicLinks.map((link) => (
                <Link
                  className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold text-white/[0.8] transition hover:bg-white/[0.12] hover:text-white"
                  href={link.href}
                  key={link.href}
                >
                  <span className="rounded-md bg-white/[0.12] px-1.5 py-0.5 font-mono text-[10px] font-black text-acv-gold transition group-hover:bg-acv-gold group-hover:text-acv-night">
                    {link.code}
                  </span>
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="ml-auto hidden shrink-0 items-center xl:flex">
            <AuthControls compact />
          </div>
        </div>

        <div className="flex w-full min-w-0 items-center gap-2 overflow-x-auto border-t border-white/10 px-4 py-2 sm:px-6 lg:hidden">
          {publicLinks.map((link) => (
            <Link
              className="inline-flex shrink-0 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm font-semibold text-white/[0.78] transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
          <Link
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-acv-gold px-3 py-1.5 text-sm font-bold text-acv-night transition hover:bg-white"
            href="/portal"
          >
            <Ticket aria-hidden="true" className="size-4" />
            Portal
          </Link>
        </div>
        <div className="border-t border-white/10 px-4 py-3 sm:px-6 xl:hidden">
          <AuthControls compact />
        </div>
      </div>
      <div className="h-1.5 acv-route-band" />
      <AnnouncementBanner />
    </header>
  );
}
