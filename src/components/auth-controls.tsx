"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Bell, LayoutDashboard, LogIn, UserPlus } from "lucide-react";

type AuthControlsProps = {
  compact?: boolean;
  unreadNotifications?: number;
};

export function AuthControls({ compact = false, unreadNotifications = 0 }: AuthControlsProps = {}) {
  const signInLabel = compact ? "Sign in" : "Participant sign in";
  const signUpLabel = compact ? "Apply" : "Vendor/Sponsor/Partner";
  const signInClass = compact
    ? "inline-flex items-center gap-2 rounded-full border border-white/[0.18] bg-white/[0.08] px-3 py-2 text-sm font-bold text-white transition hover:bg-white/[0.16]"
    : "inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20";
  const signUpClass = compact
    ? "hidden items-center gap-2 rounded-full bg-acv-gold px-3 py-2 text-sm font-black text-acv-night transition hover:bg-white sm:inline-flex"
    : "hidden items-center gap-2 rounded-md bg-acv-gold px-3 py-2 text-sm font-bold text-acv-night transition hover:bg-white sm:inline-flex";

  return (
    <div className="flex items-center gap-2">
      <Show when="signed-out">
        <SignInButton fallbackRedirectUrl="/portal" forceRedirectUrl="/portal" mode="modal">
          <button className={signInClass}>
            <LogIn aria-hidden="true" className="size-4 text-acv-gold" />
            {signInLabel}
          </button>
        </SignInButton>
        <SignUpButton fallbackRedirectUrl="/portal" forceRedirectUrl="/portal" mode="modal">
          <button className={signUpClass}>
            <UserPlus aria-hidden="true" className="size-4" />
            {signUpLabel}
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <Link
          aria-label={`${unreadNotifications} unread notifications`}
          className="relative inline-flex size-9 items-center justify-center rounded-full border border-white/[0.18] bg-white/[0.08] text-white transition hover:bg-white/[0.16]"
          href="/notifications"
        >
          <Bell aria-hidden="true" className="size-4" />
          {unreadNotifications > 0 ? (
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-acv-gold px-1 text-center text-[10px] font-black leading-5 text-acv-night">
              {unreadNotifications > 99 ? "99+" : unreadNotifications}
            </span>
          ) : null}
        </Link>
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Link
              href="/portal"
              label="Dashboard"
              labelIcon={<LayoutDashboard aria-hidden="true" className="size-4" />}
            />
          </UserButton.MenuItems>
        </UserButton>
      </Show>
    </div>
  );
}
