import { redirect } from "next/navigation";
import { requireAdminSection } from "@/lib/admin-rbac";

export const metadata = {
  title: "Compliance",
};

export default async function AdminCompliancePage() {
  await requireAdminSection("compliance");

  redirect("/admin/documents");
}
