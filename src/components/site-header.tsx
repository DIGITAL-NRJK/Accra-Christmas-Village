import Link from "next/link";
import { Gift, LayoutDashboard } from "lucide-react";
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-acv-ink/95 text-white shadow-lg shadow-black/10 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link className="flex items-center gap-3 font-semibold" href="/">
            <span className="flex size-10 items-center justify-center rounded-lg bg-acv-gold text-acv-ink">
              <Gift aria-hidden="true" className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-base">Accra Christmas Village</span>
              <span className="block text-xs font-medium text-white/65">Visitor and operations hub</span>
            </span>
          </Link>
          <div className="hidden items-center gap-3 sm:flex">
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
              href="/admin"
            >
              <LayoutDashboard aria-hidden="true" className="size-4 text-acv-gold" />
              Admin
            </Link>
            <AuthControls />
          </div>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {publicLinks.map((link) => (
            <Link
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold text-white/78 hover:bg-white/10 hover:text-white"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
          <Link
            className="whitespace-nowrap rounded-full bg-acv-palm px-3 py-1.5 text-sm font-semibold text-white hover:bg-acv-palm/85"
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
