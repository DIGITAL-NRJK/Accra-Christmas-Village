"use client";
import { Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { deleteCommitmentAction } from "@/app/admin/sponsor-deliverables/actions";
export function DeleteCommitment({ id, title }: { id: string; title: string }) { return <form action={deleteCommitmentAction} onSubmit={(event: FormEvent<HTMLFormElement>) => { if (!window.confirm(`Delete commitment "${title}"?`)) event.preventDefault(); }}><input name="commitmentId" type="hidden" value={id} /><button className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50"><Trash2 className="size-4" />Delete</button></form>; }
