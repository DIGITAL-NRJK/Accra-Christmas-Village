"use client";

import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

const targets = {
  visitor: "/",
  vendor: "/portal?role=vendor",
  sponsor: "/portal?role=sponsor",
  admin: "/admin",
};

function getCurrentRole(pathname: string) {
  if (pathname.startsWith("/admin")) {
    return "admin";
  }

  if (pathname.startsWith("/portal")) {
    return "vendor";
  }

  return "visitor";
}

export function RoleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentRole = getCurrentRole(pathname);

  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm text-white shadow-sm backdrop-blur">
      <ShieldCheck aria-hidden="true" className="size-4 text-acv-gold" />
      <span className="sr-only">Demo role</span>
      <select
        value={currentRole}
        onChange={(event) => router.push(targets[event.target.value as keyof typeof targets])}
        className="bg-transparent text-sm font-semibold outline-none"
      >
        <option className="text-acv-ink" value="visitor">
          Visitor
        </option>
        <option className="text-acv-ink" value="vendor">
          Vendor
        </option>
        <option className="text-acv-ink" value="sponsor">
          Sponsor
        </option>
        <option className="text-acv-ink" value="admin">
          Admin
        </option>
      </select>
    </label>
  );
}
