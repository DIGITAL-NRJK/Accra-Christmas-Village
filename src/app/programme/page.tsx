import { PageHeader } from "@/components/page-header";
import { ProgrammeFilter } from "@/components/programme-filter";
import { listPublishedEvents } from "@/db/queries";
import { programmeItems } from "@/lib/data";

export const metadata = {
  title: "Programme",
};

export const dynamic = "force-dynamic";

export default async function ProgrammePage() {
  const databaseEvents = await listPublishedEvents();
  const events = databaseEvents.length > 0 ? databaseEvents : programmeItems.filter((event) => event.published);

  return (
    <>
      <PageHeader
        eyebrow="Programme"
        title="Daily events and operational moments"
        description="Filter the published village schedule by day and category across stage, family, food, sponsor and participant activity."
      />
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <ProgrammeFilter events={events} />
      </section>
    </>
  );
}
