"use client";

import { AlertTriangle, CheckCircle2, Send } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import type {
  ProvisionCanonAction,
  ProvisionCanonActionState,
} from "./provision-canon-action-state";

type ProvisionCanonFormProps = {
  action: ProvisionCanonAction;
  isConfigured: boolean;
};

const initialState = {
  status: "idle",
} satisfies ProvisionCanonActionState;

export function ProvisionCanonForm({ action, isConfigured }: ProvisionCanonFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <div className="grid gap-4">
      <form action={formAction} className="flex w-full flex-col gap-3 sm:max-w-md">
        <label className="grid gap-1 text-sm font-medium text-slate-800">
          <span>Canon name</span>
          <input
            className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-600"
            disabled={!isConfigured || isPending}
            name="canonName"
            placeholder="Ashen Coast"
            required
            type="text"
          />
        </label>
        <Button disabled={!isConfigured || isPending} type="submit">
          <Send aria-hidden="true" className="size-4" />
          <span>{isPending ? "Provisioning" : "Provision Notion structure"}</span>
        </Button>
      </form>

      {state.status === "failed" ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-950">
            <AlertTriangle aria-hidden="true" className="size-4" />
            Provisioning needs attention
          </h4>
          <ul className="mt-3 grid gap-2 text-sm text-amber-900">
            {state.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {state.status === "succeeded" || state.status === "needs_attention" ? (
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            {state.status === "succeeded" ? (
              <CheckCircle2 aria-hidden="true" className="size-4 text-emerald-600" />
            ) : (
              <AlertTriangle aria-hidden="true" className="size-4 text-amber-600" />
            )}
            {state.canonName}
          </h4>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {state.databases.map((database) => (
              <div
                className="rounded-md border border-slate-200 bg-white px-3 py-2"
                key={database.elementType}
              >
                <dt className="font-medium text-slate-950">{database.elementType}</dt>
                <dd className="mt-1 text-slate-600">{formatStatus(database.status)}</dd>
                {database.attentionReason ? (
                  <dd className="mt-1 text-amber-700">{database.attentionReason}</dd>
                ) : null}
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </div>
  );
}

function formatStatus(status: string): string {
  return status.replaceAll("_", " ");
}
