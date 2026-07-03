import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-acv-paper px-4 py-10">
      <section className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-acv-clay">
            Vendor / Sponsor / Partner
          </p>
          <h1 className="mt-3 text-4xl font-bold text-acv-ink">Create a participant account</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Use sign-up only if your organization needs event operations access. After sign-up, choose
            vendor, sponsor or partner and wait for organizer approval.
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp />
        </div>
      </section>
    </div>
  );
}
