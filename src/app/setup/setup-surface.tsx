import { AlertTriangle, CheckCircle2, Database, KeyRound, Sparkles } from "lucide-react";
import type { LocalConfigResult } from "@/config/local-config";
import type { ProvisionCanonAction } from "./provision-canon-action-state";
import { ProvisionCanonForm } from "./provision-canon-form";

const configChecks = [
  {
    label: "Postgres",
    field: "DATABASE_URL",
    icon: Database,
  },
  {
    label: "Internal Notion integration",
    field: "NOTION_TOKEN",
    icon: KeyRound,
  },
  {
    label: "Notion parent page",
    field: "NOTION_PARENT_PAGE_ID",
    icon: KeyRound,
  },
  {
    label: "AI provider and model",
    field: "AI_MODEL",
    icon: Sparkles,
  },
] as const;

type SetupSurfaceProps = {
  configResult: LocalConfigResult;
  provisionAction: ProvisionCanonAction;
};

export function SetupSurface({ configResult, provisionAction }: SetupSurfaceProps) {
  const errorFields = new Set(
    configResult.ok ? [] : configResult.errors.map((error) => error.field),
  );

  return (
    <main className="grid gap-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Setup
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
          Local configuration
        </h2>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        {configChecks.map((check) => {
          const hasError =
            errorFields.has(check.field) ||
            (check.field === "AI_MODEL" && errorFields.has("AI_PROVIDER")) ||
            (check.field === "AI_MODEL" && errorFields.has("OPENAI_API_KEY"));
          const Icon = check.icon;

          return (
            <div className="rounded-lg border border-slate-200 bg-white p-4" key={check.field}>
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">{check.label}</h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                    {hasError ? (
                      <>
                        <AlertTriangle aria-hidden="true" className="size-4 text-amber-600" />
                        Needs attention
                      </>
                    ) : (
                      <>
                        <CheckCircle2 aria-hidden="true" className="size-4 text-emerald-600" />
                        Configured
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Create or register Canon
            </h3>
          </div>
          <ProvisionCanonForm action={provisionAction} isConfigured={configResult.ok} />
        </div>
      </section>

      {!configResult.ok ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-950">Configuration errors</h3>
          <ul className="mt-3 grid gap-2 text-sm text-amber-900">
            {configResult.errors.map((error) => (
              <li key={`${error.field}-${error.message}`}>{error.message}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
