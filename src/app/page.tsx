import { AdminShell } from "@/components/admin-shell";

const metrics = [
  { label: "Phase", value: "1 / 6", detail: "Design system and app shell" },
  { label: "Target model", value: "6 tables", detail: "Faculties, coaches, programmes, modules, resources, FAQs" },
  { label: "Brand system", value: "UP Blue", detail: "Based on design.md tokens and layout rules" },
  { label: "Next focus", value: "CRUD", detail: "Phase 2 will add the first editable entity screens" },
];

const entityCards = [
  {
    id: "faculties",
    title: "Faculties",
    description: "Master records with code, aliases, official pages, support pages, and verification metadata.",
  },
  {
    id: "coaches",
    title: "ASC Coaches",
    description: "Faculty-linked contacts with role, level, office, appointment links, active state, and source data.",
  },
  {
    id: "programmes",
    title: "Programmes",
    description: "Programme metadata, qualification type, duration, credits, and curriculum provenance.",
  },
  {
    id: "modules",
    title: "Course Modules",
    description: "Programme-linked modules with year sorting, unit values, module type, and source file traceability.",
  },
  {
    id: "resources",
    title: "Resources",
    description: "General or faculty-specific support links with category, description, and verification context.",
  },
  {
    id: "faqs",
    title: "FAQs",
    description: "Searchable question-and-answer records with category, priority, faculty scope, and source links.",
  },
];

const phases = [
  {
    phase: "Phase 1",
    title: "Design system and shell",
    outcome: "UP-themed layout, navigation, tokens, and shared patterns.",
  },
  {
    phase: "Phase 2",
    title: "Core master data CRUD",
    outcome: "Faculties, ASC coaches, and programmes with linked forms and detail pages.",
  },
  {
    phase: "Phase 3",
    title: "Curriculum content",
    outcome: "Course modules, resources, and FAQs with filtering and search.",
  },
  {
    phase: "Phase 4",
    title: "Operations",
    outcome: "Health, sync, verification, and editorial confidence tools.",
  },
];

export default function Home() {
  return (
    <AdminShell>
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-[color:var(--color-border)] bg-white shadow-[0_18px_60px_rgba(0,32,80,0.08)]">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.25fr_0.75fr] lg:p-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-bg-light)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-primary)]">
                Phase 1 foundation
              </div>
              <div className="space-y-4">
                <h2 className="max-w-3xl font-[family-name:var(--font-display)] text-4xl leading-tight text-[color:var(--color-primary-dark)] sm:text-5xl">
                  A calm, branded admin workspace for UP support content.
                </h2>
                <p className="max-w-2xl text-base leading-7 text-[color:var(--color-text-muted)] sm:text-lg">
                  This shell establishes the visual language and layout patterns that every CRUD screen will
                  inherit. It is built from the UP design system and aligned to the Prisma schema so the next
                  phases can focus on data workflows instead of restyling.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] px-4 py-2 text-sm font-medium text-[color:var(--color-text)]">
                  Next.js 16 App Router
                </span>
                <span className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] px-4 py-2 text-sm font-medium text-[color:var(--color-text)]">
                  Prisma schema aligned
                </span>
                <span className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] px-4 py-2 text-sm font-medium text-[color:var(--color-text)]">
                  UP design tokens
                </span>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,#002050_0%,#003b7a_100%)] p-6 text-white shadow-[0_20px_60px_rgba(0,32,80,0.22)]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                Phase sequencing
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                  <div className="text-sm text-white/70">Current deliverable</div>
                  <div className="mt-1 text-xl font-semibold">Shell, tokens, and navigation</div>
                </div>
                <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                  <div className="text-sm text-white/70">Why this matters</div>
                  <div className="mt-1 text-sm leading-6 text-white/85">
                    Every future form, table, and detail page can reuse the same structure, spacing, and
                    validation language.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((item) => (
            <article
              key={item.label}
              className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-6 shadow-[0_12px_40px_rgba(0,32,80,0.05)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
                {item.label}
              </p>
              <div className="mt-4 text-3xl font-semibold tracking-tight text-[color:var(--color-primary-dark)]">
                {item.value}
              </div>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">{item.detail}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[1.75rem] border border-[color:var(--color-border)] bg-white p-6 shadow-[0_12px_40px_rgba(0,32,80,0.05)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--color-text-muted)]">
                  Schema-aware design
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--color-primary-dark)]">
                  What the UI must support
                </h3>
              </div>
              <div className="rounded-full bg-[color:var(--color-accent-ochre)] px-4 py-2 text-sm font-semibold text-white">
                Database first
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {entityCards.map((item) => (
                <div
                  key={item.title}
                  id={item.id}
                  className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] p-5"
                >
                  <h4 className="text-lg font-semibold text-[color:var(--color-primary-dark)]">{item.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">{item.description}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[color:var(--color-border)] bg-white p-6 shadow-[0_12px_40px_rgba(0,32,80,0.05)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--color-text-muted)]">
              Phase roadmap
            </p>
            <div className="mt-5 space-y-4">
              {phases.map((item, index) => (
                <div
                  key={item.phase}
                  className="flex gap-4 rounded-2xl border border-[color:var(--color-border)] p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--color-primary)] text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent-ochre)]">
                        {item.phase}
                      </span>
                      <span className="text-base font-semibold text-[color:var(--color-primary-dark)]">
                        {item.title}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">{item.outcome}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[1.75rem] border border-[color:var(--color-border)] bg-[color:var(--color-primary-dark)] p-6 text-white shadow-[0_12px_40px_rgba(0,32,80,0.12)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
              Local test focus
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">What you should verify in this phase</h3>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-white/80">
              <li>1. The app shell feels like a real admin product, not a starter template.</li>
              <li>2. The UP color system reads clearly on cards, nav, and buttons.</li>
              <li>3. Typography, spacing, and focus states feel consistent.</li>
              <li>4. The next CRUD phases have a shared pattern to build on.</li>
            </ul>
          </article>

          <article id="health" className="rounded-[1.75rem] border border-[color:var(--color-border)] bg-white p-6 shadow-[0_12px_40px_rgba(0,32,80,0.05)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--color-text-muted)]">
              Ready for next phase
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--color-primary-dark)]">
              Build direction from here
            </h3>
            <div className="mt-5 space-y-4 text-sm leading-6 text-[color:var(--color-text-muted)]">
              <p>
                The next step is to add the CRUD routes and reusable form/table components on top of this shell.
                Because the layout and theme are now established, those screens can focus on data entry, relation
                selection, and validation.
              </p>
              <p>
                Once you test this phase locally, I can move directly into Phase 2 and wire up the first
                entity pages.
              </p>
            </div>
          </article>
        </section>
      </div>
    </AdminShell>
  );
}
