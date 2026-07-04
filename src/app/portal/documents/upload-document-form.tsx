"use client";

import { AlertCircle, CheckCircle2, LoaderCircle, UploadCloud } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { uploadDocument, type UploadDocumentState } from "@/app/portal/documents/actions";
import { documentUploadAccept, formatFileSize } from "@/lib/document-upload";

type UploadDocumentFormProps = {
  maxUploadBytes: number;
  required: boolean;
  requirementId: string;
};

const initialUploadState: UploadDocumentState = {
  message: "",
  status: "idle",
};

export function UploadDocumentForm({ maxUploadBytes, required, requirementId }: UploadDocumentFormProps) {
  const [state, formAction, pending] = useActionState(uploadDocument, initialUploadState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.status === "success" && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [state.status, state.uploadedFileName]);

  const isError = state.status === "error";
  const isSuccess = state.status === "success";

  return (
    <form action={formAction} className="mt-5 grid gap-3 rounded-lg bg-acv-paper p-3">
      <input name="requirementId" type="hidden" value={requirementId} />
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          accept={documentUploadAccept}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          name="file"
          ref={fileInputRef}
          required={required}
          type="file"
        />
        <button
          className="inline-flex min-w-32 items-center justify-center gap-2 rounded-md bg-acv-palm px-4 py-2 text-sm font-bold text-white hover:bg-acv-palm/90 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={pending}
        >
          {pending ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <UploadCloud aria-hidden="true" className="size-4" />
          )}
          {pending ? "Uploading" : "Upload"}
        </button>
      </div>
      <p className="text-xs font-medium text-slate-500">
        PDF, image, Word or spreadsheet. Max {formatFileSize(maxUploadBytes)}.
      </p>
      {state.message ? (
        <p
          aria-live="polite"
          className={`inline-flex items-start gap-2 rounded-md px-3 py-2 text-sm font-medium ${
            isError
              ? "bg-rose-50 text-rose-800"
              : isSuccess
                ? "bg-emerald-50 text-emerald-800"
                : "bg-slate-50 text-slate-700"
          }`}
        >
          {isError ? (
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          ) : (
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          )}
          <span>{state.message}</span>
        </p>
      ) : null}
    </form>
  );
}
