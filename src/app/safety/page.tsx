import { Baby, DoorOpen, HeartPulse, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Safety",
};

const safetyItems = [
  {
    title: "First aid",
    icon: HeartPulse,
    body: "The first aid point sits beside the main circulation route between Gate A and the WC block.",
  },
  {
    title: "Lost child point",
    icon: Baby,
    body: "Families should report missing children to First Aid. Wristband details help the team contact guardians quickly.",
  },
  {
    title: "Emergency exits",
    icon: DoorOpen,
    body: "Follow marshal instructions toward Gates A, B, C or D. Keep central paths clear at all times.",
  },
  {
    title: "Visitor rules",
    icon: ShieldAlert,
    body: "Respect queue lines, vendor boundaries, family areas, sponsor activations and security checks.",
  },
];

export default function SafetyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Safety"
        title="First aid, exits and visitor rules"
        description="Clear safety instructions for families, visitors, vendors and organizers during village operating hours."
      />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        {safetyItems.map((item) => (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={item.title}>
            <item.icon aria-hidden="true" className="size-6 text-acv-clay" />
            <h2 className="mt-4 text-xl font-semibold text-acv-ink">{item.title}</h2>
            <p className="mt-2 leading-7 text-slate-600">{item.body}</p>
          </article>
        ))}
      </section>
    </>
  );
}
