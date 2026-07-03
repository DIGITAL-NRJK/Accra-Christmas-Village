import { PageHeader } from "@/components/page-header";
import { ProgrammeFilter } from "@/components/programme-filter";
import { programmeItems } from "@/lib/data";

export const metadata = {
  title: "Programme",
};

export default function ProgrammePage() {
  return (
    <>
      <PageHeader
        eyebrow="Programme"
        title="Daily events and operational moments"
        description="Filter the published village schedule by day and category across stage, family, food, sponsor and participant activity."
      />
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <ProgrammeFilter events={programmeItems.filter((event) => event.published)} />
      </section>
    </>
  );
}
