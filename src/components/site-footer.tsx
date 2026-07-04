import Link from "next/link";
import { Gift } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-acv-gold/25 bg-acv-night text-white">
      <div className="h-1.5 w-full acv-route-band" />
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 text-sm text-white/64 sm:grid-cols-[1.2fr_0.9fr_0.9fr] sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-acv-gold text-acv-night">
              <Gift aria-hidden="true" className="size-5" />
            </span>
            <p className="font-display text-2xl uppercase leading-none text-white">
              Accra Christmas Village
            </p>
          </div>
          <p className="mt-4 max-w-sm leading-6">
            A visitor guide and operations platform shaped around gates, routes, stands and live festival moments.
          </p>
        </div>
        <div>
          <p className="font-mono text-xs font-bold uppercase text-acv-gold">Visitor routes</p>
          <div className="mt-2 grid gap-2">
            <Link className="transition hover:text-white" href="/programme">Programme</Link>
            <Link className="transition hover:text-white" href="/stands">Stands</Link>
            <Link className="transition hover:text-white" href="/safety">Safety</Link>
          </div>
        </div>
        <div>
          <p className="font-mono text-xs font-bold uppercase text-acv-gold">Operations</p>
          <div className="mt-2 grid gap-2">
            <Link className="transition hover:text-white" href="/portal">Participant portal</Link>
            <Link className="transition hover:text-white" href="/practical-info">Practical info</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
