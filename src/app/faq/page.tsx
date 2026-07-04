import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "FAQ",
};

const faqs = [
  {
    question: "What time does the village open?",
    answer: "Visitor gates open from 14:00 to 22:00 daily. Participants have earlier setup windows through Gate C.",
  },
  {
    question: "Where do ride-hailing cars pick up visitors?",
    answer: "Gate B is the ride-hailing point for both drop-off and pick-up.",
  },
  {
    question: "Can vendors bring vehicles onto the site?",
    answer: "Vendor vehicles may use Gate C during the setup window only. No vehicle movement is allowed after visitor gates open.",
  },
  {
    question: "Where are sponsor activations listed?",
    answer: "Sponsor cards and activation pages are available from the sponsor directory.",
  },
  {
    question: "Where should visitors report a missing child?",
    answer: "Go directly to the First Aid and lost child point near the main circulation route.",
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Common visitor and participant questions"
        description="Quick answers for the most frequent village access, safety and operations questions."
      />
      <section className="mx-auto grid w-full max-w-4xl gap-3 px-4 pb-10 sm:px-6 lg:px-8">
        {faqs.map((faq) => (
          <details
            className="rounded-md border border-acv-line bg-acv-porcelain p-5 shadow-[0_16px_40px_rgb(17_23_19/0.06)]"
            key={faq.question}
          >
            <summary className="cursor-pointer text-lg font-semibold text-acv-ink">{faq.question}</summary>
            <p className="mt-3 leading-7 text-slate-700">{faq.answer}</p>
          </details>
        ))}
      </section>
    </>
  );
}
