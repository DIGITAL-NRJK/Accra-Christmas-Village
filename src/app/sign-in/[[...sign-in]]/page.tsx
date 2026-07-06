import { SignIn } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const user = await currentUser();

  if (user) {
    redirect("/portal");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-acv-paper px-4 py-10">
      <section className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="mb-6 h-2 w-full max-w-sm acv-route-band" />
          <p className="acv-eyebrow">Participant and organizer access</p>
          <h1 className="mt-3 font-display text-5xl uppercase leading-none text-acv-ink sm:text-6xl">
            Sign in to your event workspace
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-700">
            Accounts are for approved vendors, sponsors, partners and organizers. Public visitors can use the
            event guide without creating an account.
          </p>
        </div>
        <div className="flex justify-center">
          <SignIn fallbackRedirectUrl="/portal" forceRedirectUrl="/portal" />
        </div>
      </section>
    </div>
  );
}
