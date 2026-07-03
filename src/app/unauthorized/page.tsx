import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export const metadata = {
  title: "Access denied",
};

export default function UnauthorizedPage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <span className="flex size-14 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
        <LockKeyhole aria-hidden="true" className="size-7" />
      </span>
      <h1 className="mt-6 text-3xl font-semibold text-acv-ink">Access denied</h1>
      <p className="mt-3 max-w-xl leading-7 text-slate-600">
        Your account is signed in, but it is not assigned to a role that can open this workspace.
        Ask an organizer to link your Clerk account to the correct Accra Christmas Village profile.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link className="rounded-full bg-acv-ink px-5 py-3 text-sm font-bold text-white" href="/">
          Go home
        </Link>
        <Link
          className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-acv-ink"
          href="/sign-in"
        >
          Use another account
        </Link>
      </div>
    </section>
  );
}
