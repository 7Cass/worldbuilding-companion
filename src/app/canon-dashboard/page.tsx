import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CANON_ELEMENT_TYPES } from "@/domain/canon-vocabulary";

export default function CanonDashboardPage() {
  return (
    <main className="grid gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            Canon Dashboard
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
            Canon shape
          </h2>
        </div>
        <Button asChild variant="secondary">
          <Link href="/entity-workspace">
            <span>Open workspace</span>
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {CANON_ELEMENT_TYPES.map((type) => (
          <article className="rounded-lg border border-slate-200 bg-white p-4" key={type}>
            <p className="text-sm font-medium text-slate-600">{type}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">0</p>
            <p className="mt-1 text-sm text-slate-500">Awaiting Notion sync</p>
          </article>
        ))}
      </section>
    </main>
  );
}
