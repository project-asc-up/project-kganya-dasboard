import { notFound } from "next/navigation";

import { ActionButton, Field, PageHeader, Section, Select, TextArea, TextInput } from "@/components/admin-form";
import { deleteResource, updateResource } from "@/lib/admin-actions";
import { getFacultyOptions, getResourceById } from "@/lib/admin-queries";
import { displayFacultyName } from "@/lib/faculty-display";
import { canAccess, getCurrentAuthorization } from "@/lib/rbac";

export const dynamic = "force-dynamic";

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
  const isDocument = resource.resourceType === "document";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Resource detail"
        title={resource.title}
        description={`${resource.category} | ${resource.faculty ? `${resource.faculty.code} - ${displayFacultyName(resource.faculty.name)}` : "General"} | ${isDocument ? "Uploaded document" : "Link resource"}`}
        action={canDelete ? (
          <form action={deleteAction}>
            <ActionButton tone="danger">Delete resource</ActionButton>
          </form>
        ) : null}
      />

      {isDocument ? (
        <Section title="Document ingest" description="This resource was uploaded as a document and chunked into the Kganya vector pipeline.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Upload file</div>
              <div className="mt-1 font-medium text-[var(--color-text)]">{resource.attachmentName ?? "Unknown"}</div>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Status</div>
              <div className="mt-1 font-medium text-[var(--color-text)]">{resource.attachmentStatus ?? "Unknown"}</div>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">File type</div>
              <div className="mt-1 font-medium text-[var(--color-text)]">{resource.attachmentMimeType ?? "Unknown"}</div>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Vector source key</div>
              <div className="mt-1 break-all font-mono text-xs text-[var(--color-text-muted)]">{resource.kganyaSourceKey ?? "Pending"}</div>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Chunk count</div>
              <div className="mt-1 font-medium text-[var(--color-text)]">{resource.chunkCount ?? 0}</div>
            </div>
          </div>
          {resource.attachmentError ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {resource.attachmentError}
            </div>
          ) : null}
        </Section>
      ) : null}

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
          <Field label="Resource type">
            <TextInput name="resourceType" defaultValue={resource.resourceType} disabled />
          </Field>
          {isDocument ? (
            <Field label="Uploaded file type">
              <TextInput name="attachmentMimeType" defaultValue={resource.attachmentMimeType ?? ""} disabled />
            </Field>
          ) : null}
          <Field label="Description">
            <TextArea name="description" defaultValue={resource.description ?? ""} />
          </Field>
          <Field label="Source URL">
            <TextInput name="sourceUrl" type="url" defaultValue={resource.sourceUrl ?? ""} />
          </Field>
          <Field label="Last verified">
            <TextInput name="lastVerified" type="date" defaultValue={formatDate(resource.lastVerified)} />
          </Field>
          {isDocument ? (
            <Field label="Document status">
              <TextInput name="attachmentStatus" defaultValue={resource.attachmentStatus ?? ""} disabled />
            </Field>
          ) : null}
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
