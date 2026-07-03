import { Bus, Car, Clock, Hand, MapPinned } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Practical Info",
};

const info = [
  {
    title: "Access",
    icon: MapPinned,
    body: "Use Gate A for main pedestrian entry. Gate B handles ride-hailing and accessible entry. Gate D supports evening exits.",
  },
  {
    title: "Parking",
    icon: Car,
    body: "Reserved parking and shuttle validation are handled at the parking point west of Gate D.",
  },
  {
    title: "Ride-hailing",
    icon: Bus,
    body: "Set the drop-off and pick-up point to Gate B. Drivers should follow marshal instructions.",
  },
  {
    title: "Opening hours",
    icon: Clock,
    body: "Public opening is 14:00-22:00 daily. Vendor setup is 08:00-11:30 through Gate C.",
  },
  {
    title: "Prohibited items",
    icon: Hand,
    body: "No weapons, outside alcohol, drones, fireworks, unapproved gas cylinders or oversized coolers.",
  },
];

export default function PracticalInfoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Practical information"
        title="Arrival, access and visitor services"
        description="Essential details for guests, families, vendors and partners moving through the village."
      />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        {info.map((item) => (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={item.title}>
            <item.icon aria-hidden="true" className="size-6 text-acv-palm" />
            <h2 className="mt-4 text-xl font-semibold text-acv-ink">{item.title}</h2>
            <p className="mt-2 leading-7 text-slate-600">{item.body}</p>
          </article>
        ))}
      </section>
    </>
  );
}
