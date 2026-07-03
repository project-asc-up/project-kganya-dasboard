import { notFound } from "next/navigation";

import { ActionButton, Field, PageHeader, Section, Select, TextArea, TextInput } from "@/components/admin-form";
import { deleteResource, updateResource } from "@/lib/admin-actions";
import { getFacultyOptions, getResourceById } from "@/lib/admin-queries";
import { displayFacultyName } from "@/lib/faculty-display";
import { canAccess, getCurrentAuthorization } from "@/lib/rbac";

function formatDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [resource, faculties, authz] = await Promise.all([
    getResourceById(id),
    getFacultyOptions(),
    getCurrentAuthorization(),
  ]);

  if (!resource) {
    notFound();
  }

  const updateAction = updateResource.bind(null, resource.id);
  const deleteAction = deleteResource.bind(null, resource.id);
  const canUpdate = canAccess(authz, "resource:update");
  const canDelete = canAccess(authz, "resource:delete");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Resource detail"
        title={resource.title}
        description={`${resource.category} | ${resource.faculty ? `${resource.faculty.code} - ${displayFacultyName(resource.faculty.name)}` : "General"}`}
        action={canDelete ? (
          <form action={deleteAction}>
            <ActionButton tone="danger">Delete resource</ActionButton>
          </form>
        ) : null}
      />

      {canUpdate ? (
      <Section title="Edit resource" description="Keep the support resource linked and verified.">
        <form action={updateAction} className="grid gap-5 md:grid-cols-2">
          <Field label="Faculty">
            <Select name="facultyId" defaultValue={resource.facultyId ?? ""}>
              <option value="">General</option>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {displayFacultyName(faculty.name)} ({faculty.code})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Category">
            <TextInput name="category" defaultValue={resource.category} required />
          </Field>
          <Field label="Title">
            <TextInput name="title" defaultValue={resource.title} required />
          </Field>
          <Field label="URL">
            <TextInput name="url" type="url" defaultValue={resource.url} required />
          </Field>
          <Field label="Description">
            <TextArea name="description" defaultValue={resource.description ?? ""} />
          </Field>
          <Field label="Source URL">
            <TextInput name="sourceUrl" type="url" defaultValue={resource.sourceUrl ?? ""} />
          </Field>
          <Field label="Last verified">
            <TextInput name="lastVerified" type="date" defaultValue={formatDate(resource.lastVerified)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Notes">
              <TextArea name="notes" defaultValue={resource.notes ?? ""} />
            </Field>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <ActionButton>Save changes</ActionButton>
          </div>
        </form>
      </Section>
      ) : (
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 text-sm leading-6 text-[var(--color-text-muted)]">
          You can view this resource, but you do not have permission to edit it.
        </section>
      )}
    </div>
  );
}
