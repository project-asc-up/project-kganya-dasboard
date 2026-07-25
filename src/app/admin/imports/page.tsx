import { PageHeader, Section } from "@/components/admin-form";
import { DifySyncPanel } from "@/components/dify-sync-panel";

const importFiles = [
  "docs/seed-faculties.csv",
  "docs/seed-asc-coaches.csv",
  "docs/seed-programmes.csv",
  "docs/seed-course-modules.csv",
  "docs/seed-resources.csv",
  "docs/seed-faqs.csv",
];

const importSteps = [
  "Prepare curated data in the docs seed files or the knowledge base source set.",
  "Run the Prisma seed workflow to upsert faculty, coach, programme, module, resource, and FAQ rows.",
  "Use the health page to confirm counts and highlight stale or unverified records.",
  "Use the admin CRUD pages for targeted corrections and follow-up verification.",
];

export default function ImportsPage() {
  const isDifyConfigured = !!(
    process.env.DIFY_KB_API_KEY && 
    process.env.DIFY_DATASET_ID
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Imports and sync notes"
        description="Reference the supported seed files and the editorial workflow used to keep the admin data current."
      />

      <DifySyncPanel difyConfigured={isDifyConfigured} />

      <Section title="Import overview" description="These notes keep the seed workflow visible and repeatable.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {importFiles.map((file, index) => (
            <article
              key={file}
              className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                  Source {index + 1}
                </span>
                <span className="rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs font-medium text-[color:var(--color-primary-dark)]">
                  Seed input
                </span>
              </div>
              <p className="mt-4 break-all text-sm font-semibold text-[color:var(--color-primary-dark)]">{file}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Operational workflow" description="How syncs and maintenance should happen in practice.">
        <div className="grid gap-4 xl:grid-cols-2">
          {importSteps.map((step, index) => (
            <article
              key={step}
              className="flex gap-4 rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-[0_12px_40px_rgba(0,32,80,0.04)]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-sm font-bold text-white">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-[color:var(--color-primary-dark)]">Step {index + 1}</p>
                <p className="mt-1 text-sm leading-6 text-[color:var(--color-text-muted)]">{step}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
