"use server";

import { revalidatePath } from "next/cache";
import { updateUserRole } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";
import { roles, type Role } from "@/lib/types";

function isRole(value: string): value is Role {
  return roles.includes(value as Role);
}

export async function updateUserRoleAction(formData: FormData) {
  const session = await requireAdminSection("users");
  const userId = String(formData.get("userId") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  if (!userId || !isRole(role)) {
    return;
  }

  if (session.user?.id === userId && role !== "super_admin") {
    return;
  }

  await updateUserRole(userId, role);
  revalidatePath("/admin");
  revalidatePath("/admin/users");
}
