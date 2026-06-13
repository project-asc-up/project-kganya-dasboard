import Link from "next/link";

import {
  ActionButton,
  Field,
  PageHeader,
  Section,
  Select,
  TextArea,
  TextInput,
} from "@/components/admin-form";
import { createCoach } from "@/lib/admin-actions";
import { getFacultyOptions, getCoachRows } from "@/lib/admin-queries";

function formatLevel(level: string) {
  return level.replaceAll("_", " ").toLowerCase();
}

export default async function CoachesPage() {
  const [coaches, faculties] = await Promise.all([getCoachRows(), getFacultyOptions()]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Phase 2"
        title="ASC Coaches"
        description="Maintain the faculty-linked coach directory with role, contact, level, and activation status."
      />

      <Section title="Create coach" description="Capture a new ASC coach and link them to a faculty.">
        <form action={createCoach} className="grid gap-5 md:grid-cols-2">
          <Field label="Faculty">
            <Select name="facultyId" required defaultValue="">
              <option value="" disabled>
                Select faculty
              </option>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name} ({faculty.code})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Name">
            <TextInput name="name" required />
          </Field>
          <Field label="Title / role">
            <TextInput name="titleRole" />
          </Field>
          <Field label="Email">
            <TextInput name="email" type="email" required />
          </Field>
          <Field label="Phone">
            <TextInput name="phone" />
          </Field>
          <Field label="Cell">
            <TextInput name="cell" />
          </Field>
          <Field label="Office location">
            <TextInput name="officeLocation" />
          </Field>
          <Field label="Building">
            <TextInput name="building" />
          </Field>
          <Field label="Appointment link">
            <TextInput name="appointmentLink" type="url" />
          </Field>
          <Field label="Level">
            <Select name="level" defaultValue="UNKNOWN">
              <option value="UNDERGRADUATE">Undergraduate</option>
              <option value="POSTGRADUATE">Postgraduate</option>
              <option value="BOTH">Both</option>
              <option value="UNKNOWN">Unknown</option>
            </Select>
          </Field>
          <Field label="Cluster">
            <TextInput name="cluster" />
          </Field>
          <Field label="Verification status">
            <TextInput name="verificationStatus" />
          </Field>
          <Field label="Source URL">
            <TextInput name="sourceUrl" type="url" />
          </Field>
          <Field label="Last verified">
            <TextInput name="lastVerified" type="date" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Responsibilities">
              <TextArea name="responsibilities" />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Notes">
              <TextArea name="notes" />
            </Field>
          </div>
          <div className="md:col-span-2 flex items-center justify-between gap-4">
            <label className="flex items-center gap-3 text-sm font-medium text-[color:var(--color-primary-dark)]">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked
                className="h-4 w-4 rounded border-[color:var(--color-border)] text-[color:var(--color-primary)]"
              />
              Active coach
            </label>
            <ActionButton>Create coach</ActionButton>
          </div>
        </form>
      </Section>

      <Section title="Coach directory" description="Current coach records across all faculties.">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Coach</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Faculty</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Contact</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Level</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Status</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {coaches.map((coach) => (
                <tr key={coach.id} className="align-top">
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4">
                    <div className="font-semibold text-[color:var(--color-primary-dark)]">{coach.name}</div>
                    {coach.titleRole ? (
                      <div className="mt-1 text-xs text-[color:var(--color-text-muted)]">{coach.titleRole}</div>
                    ) : null}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm">
                    <div className="font-medium text-[color:var(--color-primary-dark)]">{coach.faculty.code}</div>
                    <div className="text-[color:var(--color-text-muted)]">{coach.faculty.name}</div>
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    <div>{coach.email}</div>
                    <div>{coach.phone ?? coach.cell ?? "No number set"}</div>
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm capitalize text-[color:var(--color-text-muted)]">
                    {formatLevel(coach.level)}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm">
                    <span
                      className={`rounded-full px-3 py-1 font-semibold ${
                        coach.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {coach.isActive ? "Active" : "Inactive"}
                    </span>
                    {coach.verificationStatus ? (
                      <div className="mt-2 text-xs text-[color:var(--color-text-muted)]">
                        {coach.verificationStatus}
                      </div>
                    ) : null}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-right">
                    <Link
                      href={`/admin/coaches/${coach.id}`}
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
