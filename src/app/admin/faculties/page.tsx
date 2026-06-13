import Link from "next/link";

import { ActionButton, Field, PageHeader, Section, Select, TextArea, TextInput } from "@/components/admin-form";
import { createFaculty } from "@/lib/admin-actions";
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
      />

      <Section
        title="Create faculty"
        description="Add a new faculty record and capture its source and verification details in one place."
      >
        <form action={createFaculty} className="grid gap-5 md:grid-cols-2">
          <Field label="Faculty name">
            <TextInput name="name" placeholder="Faculty of Engineering, Built Environment and Information Technology" required />
          </Field>
          <Field label="Faculty code">
            <TextInput name="code" placeholder="EBIT" required />
          </Field>
          <Field label="Code status">
            <Select name="codeStatus" defaultValue="verified" required>
              <option value="verified">Verified</option>
              <option value="review">Needs review</option>
              <option value="draft">Draft</option>
            </Select>
          </Field>
          <Field label="Last verified" hint="YYYY-MM-DD">
            <TextInput name="lastVerified" type="date" />
          </Field>
          <Field label="Official page URL">
            <TextInput name="officialPageUrl" type="url" placeholder="https://www.up.ac.za/..." />
          </Field>
          <Field label="Support page URL">
            <TextInput name="supportPageUrl" type="url" placeholder="https://www.up.ac.za/..." />
          </Field>
          <Field label="Source URL">
            <TextInput name="sourceUrl" type="url" placeholder="https://www.up.ac.za/..." />
          </Field>
          <Field label="Aliases" hint="Optional pipe- or comma-separated">
            <TextInput name="aliases" placeholder="EBIT | Engineering | Built Environment" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Notes">
              <TextArea name="notes" placeholder="Editorial notes or clarifications" />
            </Field>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <ActionButton>Create faculty</ActionButton>
          </div>
        </form>
      </Section>

      <Section title="Faculty directory" description="Current faculty records with linked content counts.">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Faculty</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Code</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Status</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Linked content</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Verified</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {faculties.map((faculty) => (
                <tr key={faculty.id} className="align-top">
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
                      className="inline-flex rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm font-semibold text-[color:var(--color-primary)] transition hover:border-[color:var(--color-primary)]"
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
