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
import { deleteCoach, updateCoach } from "@/lib/admin-actions";
import { getFacultyOptions, getCoachById } from "@/lib/admin-queries";

function formatDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export default async function CoachDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [coach, faculties] = await Promise.all([getCoachById(id), getFacultyOptions()]);

  if (!coach) {
    notFound();
  }

  const updateAction = updateCoach.bind(null, coach.id);
  const deleteAction = deleteCoach.bind(null, coach.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Coach detail"
        title={coach.name}
        description={`${coach.faculty.code} | ${coach.faculty.name} | ${coach.email}`}
        action={
          <form action={deleteAction}>
            <ActionButton tone="danger">Delete coach</ActionButton>
          </form>
        }
      />

      <Section title="Edit coach" description="Update contact, role, level, and verification details.">
        <form action={updateAction} className="grid gap-5 md:grid-cols-2">
          <Field label="Faculty">
            <Select name="facultyId" defaultValue={coach.facultyId} required>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name} ({faculty.code})
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
            <ActionButton>Save changes</ActionButton>
          </div>
        </form>
      </Section>
    </div>
  );
}
