"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { revalidatePath } from "next/cache";
import {
  deleteUserAndRelatedData,
  getUserDeletionContext,
  updateUserRole,
} from "@/db/queries";
import { requireAnyRole } from "@/lib/auth";
import { documentStorage } from "@/lib/storage";
import { roles, type Role } from "@/lib/types";

export type DeleteUserActionState = {
  message: string;
  status: "idle" | "error" | "success";
};

function isRole(value: string): value is Role {
  return roles.includes(value as Role);
}

function revalidateUserPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/vendors");
  revalidatePath("/admin/sponsors");
  revalidatePath("/admin/documents");
  revalidatePath("/admin/stands");
}

export async function updateUserRoleAction(formData: FormData) {
  const session = await requireAnyRole(["super_admin"]);
  const userId = String(formData.get("userId") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  if (!userId || !isRole(role)) {
    return;
  }

  if (session.user?.id === userId && role !== "super_admin") {
    return;
  }

  await updateUserRole(userId, role);
  revalidateUserPaths();
}

export async function deleteUserAction(
  _previousState: DeleteUserActionState,
  formData: FormData,
): Promise<DeleteUserActionState> {
  const session = await requireAnyRole(["super_admin"]);
  const userId = String(formData.get("userId") ?? "").trim();

  if (!userId) {
    return { message: "The user could not be identified.", status: "error" };
  }

  if (session.user?.id === userId) {
    return { message: "You cannot delete your own superadmin account.", status: "error" };
  }

  const context = await getUserDeletionContext(userId);

  if (!context) {
    return { message: "The user no longer exists.", status: "error" };
  }

  try {
    if (context.user.clerkUserId) {
      const client = await clerkClient();
      await client.users.deleteUser(context.user.clerkUserId);
    }
  } catch (error) {
    if (!isClerkAPIResponseError(error) || error.status !== 404) {
      console.error("Failed to delete Clerk user.", { error, userId });
      return { message: "Clerk could not delete this account. Please retry.", status: "error" };
    }
  }

  try {
    await Promise.all(context.storageKeys.map((storageKey) => documentStorage.delete(storageKey)));
    await deleteUserAndRelatedData(userId);
  } catch (error) {
    console.error("Failed to delete user data.", { error, userId });
    return {
      message: "The account was disabled, but linked data cleanup failed. Please retry.",
      status: "error",
    };
  }

  revalidateUserPaths();

  return { message: "User and linked data deleted.", status: "success" };
}
