import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { ProgressBar } from "@/components/progress-bar";
import { StatusPill } from "@/components/status-pill";
import { getDemoSession } from "@/lib/auth";
import { getOnboardingProgress, onboardingTasks } from "@/lib/data";

export const metadata = {
  title: "Onboarding",
};

export default function OnboardingPage() {
  const session = getDemoSession("vendor");
  const organizationId = session.organization?.id ?? "";
  const tasks = onboardingTasks.filter((task) => task.organizationId === organizationId);
  const progress = getOnboardingProgress(organizationId);

  return (
    <>
      <PageHeader
        eyebrow="Onboarding"
        title="Checklist and operational readiness"
        description="Required participant tasks before final stand confirmation, badge printing and public opening."
      />
      <PortalNav activeHref="/portal/onboarding" />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <ClipboardList aria-hidden="true" className="size-7 text-acv-palm" />
          <h2 className="mt-4 text-xl font-semibold text-acv-ink">{session.organization?.name}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Compliance status is based on required documents and organizer review.
          </p>
          <div className="mt-6">
            <ProgressBar label="Checklist complete" value={progress} />
          </div>
        </aside>
        <div className="grid gap-3">
          {tasks.map((task) => (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={task.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-acv-ink">{task.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{task.notes}</p>
                </div>
                <StatusPill status={task.status} />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-500">Due {task.dueDate}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
