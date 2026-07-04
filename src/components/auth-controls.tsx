"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { LogIn, UserPlus } from "lucide-react";

export function AuthControls() {
  return (
    <div className="flex items-center gap-2">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
            <LogIn aria-hidden="true" className="size-4 text-acv-gold" />
            Participant sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="hidden items-center gap-2 rounded-md bg-acv-gold px-3 py-2 text-sm font-bold text-acv-night transition hover:bg-white sm:inline-flex">
            <UserPlus aria-hidden="true" className="size-4" />
            Vendor/Sponsor/Partner
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  );
}
