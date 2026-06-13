import Link from "next/link";

import { PageHeader, Section } from "@/components/admin-form";
import { CreateFacultyModal } from "@/components/create-faculty-modal";
import { getFacultyRows } from "@/lib/admin-queries";

function formatDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "Not set";
}

export default async function FacultiesPage() {
  const faculties = await getFacultyRows();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Phase 2"
        title="Faculties"
        description="Manage the master faculty records that drive coach, programme, resource, and FAQ relationships."
        action={<CreateFacultyModal />}
      />

      <Section title="Faculty directory" description="Current faculty records with linked content counts.">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
                <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Faculty</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Code</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Status</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Linked content</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Verified</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {faculties.map((faculty) => (
                <tr key={faculty.id} className="align-top hover:bg-[color:var(--color-bg-light)] transition-colors">
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4">
                    <div className="font-semibold text-[color:var(--color-primary-dark)]">{faculty.name}</div>
                    {faculty.aliases ? (
                      <div className="mt-1 text-xs text-[color:var(--color-text-muted)]">{faculty.aliases}</div>
                    ) : null}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4">
                    <span className="rounded-full bg-[color:var(--color-bg-light)] px-3 py-1 text-sm font-semibold text-[color:var(--color-primary-dark)]">
                      {faculty.code}
                    </span>
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm">
                    {faculty.codeStatus}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    Coaches {faculty._count.ascCoaches} | Programmes {faculty._count.programmes} | Resources{" "}
                    {faculty._count.resources} | FAQs {faculty._count.faqs}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    {formatDate(faculty.lastVerified)}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-right">
                    <Link
                      href={`/admin/faculties/${faculty.id}`}
                      className="inline-flex rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm font-semibold text-[color:var(--color-primary)] transition hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-bg-light)]"
                    >
                      View / edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
