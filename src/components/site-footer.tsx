import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 text-sm text-slate-600 sm:grid-cols-3 sm:px-6 lg:px-8">
        <div>
          <p className="font-semibold text-acv-ink">Accra Christmas Village</p>
          <p className="mt-2 leading-6">A PWA-ready event, tourism and operations platform for the village.</p>
        </div>
        <div>
          <p className="font-semibold text-acv-ink">Visitor routes</p>
          <div className="mt-2 grid gap-2">
            <Link href="/programme">Programme</Link>
            <Link href="/stands">Stands</Link>
            <Link href="/safety">Safety</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-acv-ink">Operations</p>
          <div className="mt-2 grid gap-2">
            <Link href="/portal">Participant portal</Link>
            <Link href="/practical-info">Practical info</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
