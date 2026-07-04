import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-acv-paper px-4 py-10">
      <section className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="mb-6 h-2 w-full max-w-sm acv-route-band" />
          <p className="acv-eyebrow">Vendor / Sponsor / Partner</p>
          <h1 className="mt-3 font-display text-5xl uppercase leading-none text-acv-ink sm:text-6xl">
            Create a participant account
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-700">
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
