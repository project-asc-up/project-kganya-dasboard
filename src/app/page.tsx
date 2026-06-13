const seedCounts = [
  { label: "Faculties", value: "10" },
  { label: "ASC coaches", value: "30" },
  { label: "Programmes", value: "262" },
  { label: "Course modules", value: "14,643" },
  { label: "Resources", value: "9" },
  { label: "FAQs", value: "6" },
];

const nextSteps = [
  "Link this `chatbot/` directory as the Vercel project root.",
  "Install or connect a Neon Postgres database in Vercel.",
  "Set `DATABASE_URL` to the pooled Neon connection string.",
  "Set `DIRECT_URL` to the direct non-pooled Neon connection string.",
  "Run the Prisma schema deployment and seed import.",
  "Call `/api/health` to confirm the database is connected and populated.",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f3f7f2_0%,#ffffff_100%)] text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-10 sm:px-10 lg:px-12">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          <div className="grid gap-10 px-8 py-10 lg:grid-cols-[1.4fr_0.8fr] lg:px-10">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
                Project ASC
              </p>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  Neon-backed MVP workspace for University of Pretoria ASC routing.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  The app scaffold, Prisma schema, and seed pipeline are ready. Once
                  Vercel is linked to Neon, the database can be created, migrated, and
                  verified from this repo.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-700">
                <span className="rounded-full bg-emerald-50 px-4 py-2 font-medium text-emerald-800">
                  Next.js 16
                </span>
                <span className="rounded-full bg-slate-100 px-4 py-2 font-medium">
                  Prisma 7 + Neon adapter
                </span>
                <span className="rounded-full bg-slate-100 px-4 py-2 font-medium">
                  Vercel-ready subdirectory root
                </span>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-6 text-slate-50">
              <p className="text-sm font-medium text-slate-300">Verification endpoint</p>
              <div className="mt-4 rounded-2xl bg-black/40 p-4 font-mono text-sm leading-7 text-emerald-300">
                <div>GET /api/health</div>
                <div className="mt-3 text-slate-300">
                  Returns DB connectivity plus table counts for faculties, coaches,
                  programmes, modules, resources, and FAQs.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-semibold tracking-tight">Seed coverage</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {seedCounts.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
                >
                  <div className="text-2xl font-semibold">{item.value}</div>
                  <div className="mt-1 text-sm text-slate-600">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-semibold tracking-tight">Deployment path</h2>
            <ol className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
              {nextSteps.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}
