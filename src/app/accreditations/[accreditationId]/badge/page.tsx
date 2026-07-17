import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, CalendarDays, ShieldCheck } from "lucide-react";
import { PrintBadgeButton } from "@/app/accreditations/[accreditationId]/badge/print-button";
import { getAccreditationById } from "@/db/queries";
import { canAccessAdminSection } from "@/lib/admin-rbac";
import { getCurrentAppSession, isParticipantRole } from "@/lib/auth";

export const metadata = { title: "Accreditation badge" };

export default async function BadgePage({ params }: { params: Promise<{ accreditationId: string }> }) {
  const session = await getCurrentAppSession();
  if (!session) redirect("/sign-in");
  const { accreditationId } = await params;
  const details = await getAccreditationById(accreditationId);
  if (!details) redirect("/unauthorized");
  const organizer = canAccessAdminSection(session.role, "accreditations");
  const owner = isParticipantRole(session.role) && session.organization?.id === details.organization.id;
  if (!organizer && !owner) redirect("/unauthorized");
  const returnHref = organizer ? "/admin/accreditations" : "/portal/staff";
  const qrConfigured = Boolean(process.env.ACCREDITATION_QR_SECRET && process.env.ACCREDITATION_QR_SECRET.length >= 32);

  return <main className="min-h-screen bg-[#e9efe9] px-4 py-8 print:bg-white print:p-0">
    <div className="mx-auto mb-5 flex w-full max-w-3xl items-center justify-between gap-3 print:hidden"><Link className="text-sm font-bold text-acv-ink" href={returnHref}>← Back to accreditations</Link><PrintBadgeButton /></div>
    <article className="mx-auto grid w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl print:rounded-none print:shadow-none sm:grid-cols-[0.7fr_1.3fr]">
      <div className="relative flex min-h-72 flex-col justify-between overflow-hidden bg-acv-ink p-7 text-white">
        <div className="absolute -right-20 -top-16 size-60 rounded-full border-[28px] border-acv-gold/25" />
        <div className="relative"><p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-acv-gold">Accra Christmas Village</p><p className="mt-3 text-sm font-semibold text-white/70">20–26 December 2026</p></div>
        <div className="relative"><BadgeCheck className="size-10 text-acv-gold" /><p className="mt-4 text-4xl font-black uppercase leading-none tracking-tight">{details.accreditation.badgeType}</p><p className="mt-3 font-mono text-sm font-bold text-white/70">{details.accreditation.badgeNumber}</p></div>
      </div>
      <div className="grid gap-6 p-7 sm:p-9">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-acv-clay">Accredited team member</p><h1 className="mt-3 text-4xl font-semibold leading-tight text-acv-ink">{details.staffMember.fullName}</h1><p className="mt-2 text-lg font-semibold text-acv-palm">{details.staffMember.roleLabel}</p><p className="mt-1 text-sm text-slate-600">{details.organization.name}</p></div>
        <div className="grid grid-cols-[1fr_auto] items-center gap-5 border-t border-slate-200 pt-6">
          <div className="grid gap-3 text-sm text-slate-600"><p className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-acv-clay" />Valid {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(details.accreditation.validFrom)} – {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(details.accreditation.validUntil)}</p><p className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-acv-clay" />Status: <strong className="uppercase text-acv-ink">{details.accreditation.status}</strong></p><p className="text-xs leading-5">Present this QR at controlled entrances. The code contains no personal contact details.</p></div>
          {qrConfigured ? <div className="rounded-2xl border-4 border-acv-ink bg-white p-2"><Image alt={`QR badge ${details.accreditation.badgeNumber}`} height={180} src={`/api/accreditations/${details.accreditation.id}/qr`} unoptimized width={180} /></div> : <div className="max-w-44 rounded-2xl border-4 border-amber-400 bg-amber-50 p-4 text-center text-xs font-bold leading-5 text-amber-900">QR signing must be configured by the organizer.</div>}
        </div>
      </div>
    </article>
  </main>;
}
