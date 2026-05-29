import { ClipboardCheck, Clock3 } from "lucide-react";

export default function ReviewQueuePage() {
  return (
    <main className="grid gap-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Review Queue
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
          AI output awaiting approval
        </h2>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
              <Clock3 aria-hidden="true" className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-950">Pending</h3>
              <p className="mt-1 text-2xl font-semibold text-slate-950">0</p>
            </div>
          </div>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
              <ClipboardCheck aria-hidden="true" className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-950">Reviewed</h3>
              <p className="mt-1 text-2xl font-semibold text-slate-950">0</p>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
