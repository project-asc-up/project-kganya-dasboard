import { PageHeader, Section } from "@/components/admin-form";

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
  return (
    <div className="space-y-8">
      <PageHeader
        title="Imports and sync notes"
        description="Reference the supported seed files and the editorial workflow used to keep the admin data current."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Section title="Supported seed files" description="Current source files used by the seed pipeline.">
          <ul className="space-y-3 text-sm leading-6 text-[color:var(--color-text-muted)]">
            {importFiles.map((file) => (
              <li
                key={file}
                className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] px-4 py-3 font-medium text-[color:var(--color-primary-dark)]"
              >
                {file}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Operational workflow" description="How syncs and maintenance should happen in practice.">
          <ol className="space-y-4 text-sm leading-6 text-[color:var(--color-text-muted)]">
            {importSteps.map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Section>
      </div>
    </div>
  );
}
