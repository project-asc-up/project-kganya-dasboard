import Link from "next/link";

import { ActionButton, Field, PageHeader, Section, Select, TextArea, TextInput } from "@/components/admin-form";
import { createResource } from "@/lib/admin-actions";
import { getFacultyOptions, getResourceRows } from "@/lib/admin-queries";

export default async function ResourcesPage() {
  const [resources, faculties] = await Promise.all([getResourceRows(), getFacultyOptions()]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Phase 3"
        title="Resources"
        description="Manage general and faculty-specific support resources used by the bot and admin team."
      />

      <Section title="Create resource" description="Add a support resource and assign it to a faculty if needed.">
        <form action={createResource} className="grid gap-5 md:grid-cols-2">
          <Field label="Faculty">
            <Select name="facultyId" defaultValue="">
              <option value="">General</option>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name} ({faculty.code})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Category">
            <TextInput name="category" required placeholder="Study Skills" />
          </Field>
          <Field label="Title">
            <TextInput name="title" required />
          </Field>
          <Field label="URL">
            <TextInput name="url" type="url" required />
          </Field>
          <Field label="Description">
            <TextArea name="description" />
          </Field>
          <Field label="Source URL">
            <TextInput name="sourceUrl" type="url" />
          </Field>
          <Field label="Last verified">
            <TextInput name="lastVerified" type="date" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Notes">
              <TextArea name="notes" />
            </Field>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <ActionButton>Create resource</ActionButton>
          </div>
        </form>
      </Section>

      <Section title="Resource directory" description="Current support resources with faculty scope.">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Resource</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Category</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Scope</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">URL</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.id} className="align-top">
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4">
                    <div className="font-semibold text-[color:var(--color-primary-dark)]">{resource.title}</div>
                    {resource.description ? (
                      <div className="mt-1 text-xs text-[color:var(--color-text-muted)]">{resource.description}</div>
                    ) : null}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    {resource.category}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    {resource.faculty ? `${resource.faculty.code} - ${resource.faculty.name}` : "General"}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    <a href={resource.url} target="_blank" rel="noreferrer" className="text-[color:var(--color-primary)]">
                      Open link
                    </a>
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-right">
                    <Link
                      href={`/admin/resources/${resource.id}`}
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
