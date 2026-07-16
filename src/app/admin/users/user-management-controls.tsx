"use client";

import { AlertCircle, LoaderCircle, Save, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useActionState } from "react";
import {
  deleteUserAction,
  updateUserRoleAction,
  type DeleteUserActionState,
} from "@/app/admin/users/actions";
import type { Role } from "@/lib/types";

type RoleOption = {
  label: string;
  value: Role;
};

type UserManagementControlsProps = {
  currentRole: Role;
  isCurrentUser: boolean;
  roleDescription: string;
  roleOptions: RoleOption[];
  userId: string;
  userName: string;
};

const initialDeleteState: DeleteUserActionState = {
  message: "",
  status: "idle",
};

export function UserManagementControls({
  currentRole,
  isCurrentUser,
  roleDescription,
  roleOptions,
  userId,
  userName,
}: UserManagementControlsProps) {
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteUserAction,
    initialDeleteState,
  );

  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      `Delete "${userName}" permanently? This removes the Clerk account and all linked participant data.`,
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <div className="grid gap-3 rounded-lg bg-acv-paper p-4">
      <form
        action={updateUserRoleAction}
        className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
      >
        <input name="userId" type="hidden" value={userId} />
        <label className="grid gap-2">
          <span className="text-xs font-bold uppercase text-slate-500">Role</span>
          <select
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            defaultValue={currentRole}
            disabled={isCurrentUser}
            name="role"
          >
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <span className="text-xs leading-5 text-slate-500">
            {isCurrentUser
              ? "Your superadmin account is protected against accidental changes."
              : roleDescription}
          </span>
        </label>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-acv-palm disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={isCurrentUser}
        >
          <Save aria-hidden="true" className="size-4" />
          Save role
        </button>
      </form>

      <form
        action={deleteAction}
        className="border-t border-slate-200 pt-3"
        onSubmit={confirmDelete}
      >
        <input name="userId" type="hidden" value={userId} />
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          disabled={isCurrentUser || deletePending}
        >
          {deletePending ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Trash2 aria-hidden="true" className="size-4" />
          )}
          {deletePending ? "Deleting" : "Delete user"}
        </button>
        {deleteState.status === "error" ? (
          <p
            aria-live="polite"
            className="mt-3 inline-flex items-start gap-2 rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {deleteState.message}
          </p>
        ) : null}
      </form>
    </div>
  );
}
