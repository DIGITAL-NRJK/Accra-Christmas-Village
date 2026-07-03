import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-acv-paper px-4 py-10">
      <section className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-acv-clay">
            Participant and organizer access
          </p>
          <h1 className="mt-3 text-4xl font-bold text-acv-ink">Sign in to your event workspace</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Accounts are for approved vendors, sponsors, partners and organizers. Public visitors can use the
            event guide without creating an account.
          </p>
        </div>
        <div className="flex justify-center">
          <SignIn />
        </div>
      </section>
    </div>
  );
}
