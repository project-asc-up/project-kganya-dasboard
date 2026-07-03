import { notFound } from "next/navigation";

import {
  ActionButton,
  Field,
  PageHeader,
  Section,
  Select,
  TextArea,
  TextInput,
} from "@/components/admin-form";
import { updateFaculty } from "@/lib/admin-actions";
import { getFacultyById } from "@/lib/admin-queries";
import { displayFacultyName } from "@/lib/faculty-display";
import { canAccess, getCurrentAuthorization } from "@/lib/rbac";

function formatDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export default async function FacultyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [faculty, authz] = await Promise.all([
    getFacultyById(id),
    getCurrentAuthorization(),
  ]);

  if (!faculty) {
    notFound();
  }

  const updateAction = updateFaculty.bind(null, faculty.id);
  const canUpdate = canAccess(authz, "faculty:update");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Faculty detail"
        title={displayFacultyName(faculty.name)}
        description={`Code ${faculty.code} | ${faculty._count.ascCoaches} coaches | ${faculty._count.programmes} programmes`}
      />

      {canUpdate ? (
      <Section title="Edit faculty" description="Update the master record and keep source data current.">
        <form action={updateAction} className="grid gap-5 md:grid-cols-2">
          <Field label="Faculty name">
            <TextInput name="name" defaultValue={faculty.name} required />
          </Field>
          <Field label="Faculty code">
            <TextInput name="code" defaultValue={faculty.code} required />
          </Field>
          <Field label="Code status">
            <Select name="codeStatus" defaultValue={faculty.codeStatus} required>
              <option value="verified">Verified</option>
              <option value="review">Needs review</option>
              <option value="draft">Draft</option>
            </Select>
          </Field>
          <Field label="Last verified">
            <TextInput name="lastVerified" type="date" defaultValue={formatDate(faculty.lastVerified)} />
          </Field>
          <Field label="Official page URL">
            <TextInput name="officialPageUrl" type="url" defaultValue={faculty.officialPageUrl ?? ""} />
          </Field>
          <Field label="Support page URL">
            <TextInput name="supportPageUrl" type="url" defaultValue={faculty.supportPageUrl ?? ""} />
          </Field>
          <Field label="Source URL">
            <TextInput name="sourceUrl" type="url" defaultValue={faculty.sourceUrl ?? ""} />
          </Field>
          <Field label="Aliases">
            <TextInput name="aliases" defaultValue={faculty.aliases ?? ""} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Notes">
              <TextArea name="notes" defaultValue={faculty.notes ?? ""} />
            </Field>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <ActionButton>Save changes</ActionButton>
          </div>
        </form>
      </Section>
      ) : (
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 text-sm leading-6 text-[var(--color-text-muted)]">
          You can view this faculty record, but you do not have permission to edit it.
        </section>
      )}

      <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] p-5 text-sm leading-6 text-[color:var(--color-text-muted)]">
        Faculty deletion is intentionally not exposed in the UI because linked coaches and programmes use
        restrictive relationships. Keep this record and update it instead of removing it.
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Linked coaches" description="Faculty-owned ASC contacts linked to this record.">
          <div className="space-y-3">
            {faculty.ascCoaches.length > 0 ? (
              faculty.ascCoaches.map((coach) => (
                <div
                  key={coach.id}
                  className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] p-4"
                >
                  <div className="font-semibold text-[color:var(--color-primary-dark)]">{coach.name}</div>
                  <div className="text-sm text-[color:var(--color-text-muted)]">
                    {coach.email} | {coach.level} | {coach.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[color:var(--color-text-muted)]">No coaches linked yet.</p>
            )}
          </div>
        </Section>

        <Section title="Linked programmes" description="Programme records that belong to this faculty.">
          <div className="space-y-3">
            {faculty.programmes.length > 0 ? (
              faculty.programmes.map((programme) => (
                <div
                  key={programme.id}
                  className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] p-4"
                >
                  <div className="font-semibold text-[color:var(--color-primary-dark)]">
                    {programme.programmeName}
                  </div>
                  <div className="text-sm text-[color:var(--color-text-muted)]">
                    {programme.programmeCode} | {programme.qualificationType ?? "Qualification type not set"}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[color:var(--color-text-muted)]">No programmes linked yet.</p>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
