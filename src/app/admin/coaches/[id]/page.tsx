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
import { ClientActionButton } from "@/components/client-action-button";
import { deleteCoach, updateCoach } from "@/lib/admin-actions";
import { getFacultyOptions, getCoachById } from "@/lib/admin-queries";
import { displayFacultyName } from "@/lib/faculty-display";
import { canAccess, getCurrentAuthorization } from "@/lib/rbac";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export default async function CoachDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [coach, faculties, authz] = await Promise.all([
    getCoachById(id),
    getFacultyOptions(),
    getCurrentAuthorization(),
  ]);

  if (!coach) {
    notFound();
  }

  const updateAction = updateCoach.bind(null, coach.id);
  const deleteAction = deleteCoach.bind(null, coach.id);
  const canUpdate = canAccess(authz, "coach:update");
  const canDelete = canAccess(authz, "coach:delete");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Coach detail"
        title={coach.name}
        description={`${coach.faculty.code} | ${displayFacultyName(coach.faculty.name)} | ${coach.email}`}
        action={canDelete ? (
          <form action={deleteAction}>
            <ActionButton tone="danger">Delete coach</ActionButton>
          </form>
        ) : null}
      />

      {canUpdate ? (
      <Section title="Edit coach" description="Update contact, role, level, and verification details.">
        <form action={updateAction} className="grid gap-5 md:grid-cols-2">
          <Field label="Faculty">
            <Select name="facultyId" defaultValue={coach.facultyId} required>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {displayFacultyName(faculty.name)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Name">
            <TextInput name="name" defaultValue={coach.name} required />
          </Field>
          <Field label="Title / role">
            <TextInput name="titleRole" defaultValue={coach.titleRole ?? ""} />
          </Field>
          <Field label="Email">
            <TextInput name="email" type="email" defaultValue={coach.email} required />
          </Field>
          <Field label="Phone">
            <TextInput name="phone" defaultValue={coach.phone ?? ""} />
          </Field>
          <Field label="Cell">
            <TextInput name="cell" defaultValue={coach.cell ?? ""} />
          </Field>
          <Field label="Office location">
            <TextInput name="officeLocation" defaultValue={coach.officeLocation ?? ""} />
          </Field>
          <Field label="Building">
            <TextInput name="building" defaultValue={coach.building ?? ""} />
          </Field>
          <Field label="Appointment link">
            <TextInput name="appointmentLink" type="url" defaultValue={coach.appointmentLink ?? ""} />
          </Field>
          <Field label="Level">
            <Select name="level" defaultValue={coach.level}>
              <option value="UNDERGRADUATE">Undergraduate</option>
              <option value="POSTGRADUATE">Postgraduate</option>
              <option value="BOTH">Both</option>
              <option value="UNKNOWN">Unknown</option>
            </Select>
          </Field>
          <Field label="Cluster">
            <TextInput name="cluster" defaultValue={coach.cluster ?? ""} />
          </Field>
          <Field label="Verification status">
            <TextInput name="verificationStatus" defaultValue={coach.verificationStatus ?? ""} />
          </Field>
          <Field label="Source URL">
            <TextInput name="sourceUrl" type="url" defaultValue={coach.sourceUrl ?? ""} />
          </Field>
          <Field label="Last verified">
            <TextInput name="lastVerified" type="date" defaultValue={formatDate(coach.lastVerified)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Responsibilities">
              <TextArea name="responsibilities" defaultValue={coach.responsibilities ?? ""} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Notes">
              <TextArea name="notes" defaultValue={coach.notes ?? ""} />
            </Field>
          </div>
          <div className="md:col-span-2 flex items-center justify-between gap-4">
            <label className="flex items-center gap-3 text-sm font-medium text-[color:var(--color-primary-dark)]">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={coach.isActive}
                className="h-4 w-4 rounded border-[color:var(--color-border)] text-[color:var(--color-primary)]"
              />
              Active coach
            </label>
            <ClientActionButton loadingText="Saving Changes...">Save changes</ClientActionButton>
          </div>
        </form>
      </Section>
      ) : (
        <ReadOnlyNotice />
      )}
    </div>
  );
}

function ReadOnlyNotice() {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 text-sm leading-6 text-[var(--color-text-muted)]">
      You can view this coach record, but you do not have permission to edit it.
    </section>
  );
}
