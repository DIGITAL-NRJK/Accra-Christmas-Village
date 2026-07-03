import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { programmeItems } from "@/lib/data";

export const metadata = {
  title: "Programme Admin",
};

export default function AdminProgrammePage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Programme management"
        description="Published schedule items with day, category, audience, location and timing."
      />
      <AdminNav activeHref="/admin/programme" />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="grid gap-3">
          {programmeItems.map((item) => (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-acv-clay">
                    {item.day} / {item.startsAt}-{item.endsAt}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-acv-ink">{item.title}</h2>
                </div>
                <span className="rounded-full bg-acv-palm/10 px-3 py-1 text-xs font-semibold capitalize text-acv-palm">
                  {item.category}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
        <form className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-acv-ink">New programme item</h2>
          <div className="mt-4 grid gap-3">
            {["Title", "Day", "Start time", "End time", "Category", "Location"].map((label) => (
              <label className="grid gap-2" key={label}>
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <input className="rounded-md border border-slate-200 px-3 py-2 text-sm" name={label} />
              </label>
            ))}
            <button className="rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white">
              Save programme item
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
