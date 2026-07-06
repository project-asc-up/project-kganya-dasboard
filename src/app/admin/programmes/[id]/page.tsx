import { notFound } from "next/navigation";

import { ActionButton, Field, PageHeader, Section, Select, TextArea, TextInput } from "@/components/admin-form";
import { deleteProgramme, updateProgramme } from "@/lib/admin-actions";
import { getFacultyOptions, getProgrammeById } from "@/lib/admin-queries";
import { displayFacultyName } from "@/lib/faculty-display";
import { canAccess, getCurrentAuthorization } from "@/lib/rbac";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export default async function ProgrammeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [programme, faculties, authz] = await Promise.all([
    getProgrammeById(id),
    getFacultyOptions(),
    getCurrentAuthorization(),
  ]);

  if (!programme) {
    notFound();
  }

  const updateAction = updateProgramme.bind(null, programme.id);
  const deleteAction = deleteProgramme.bind(null, programme.id);
  const canUpdate = canAccess(authz, "programme:update");
  const canDelete = canAccess(authz, "programme:delete");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Programme detail"
        title={programme.programmeName}
        description={`${programme.programmeCode} | ${programme.faculty.code} | ${displayFacultyName(programme.faculty.name)}`}
        action={canDelete ? (
          <form action={deleteAction}>
            <ActionButton tone="danger">Delete programme</ActionButton>
          </form>
        ) : null}
      />

      {canUpdate ? (
      <Section title="Edit programme" description="Keep programme metadata and curriculum provenance up to date.">
        <form action={updateAction} className="grid gap-5 md:grid-cols-2">
          <Field label="Faculty">
            <Select name="facultyId" defaultValue={programme.facultyId} required>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {displayFacultyName(faculty.name)} ({faculty.code})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Source faculty code">
            <TextInput name="sourceFacultyCode" defaultValue={programme.sourceFacultyCode ?? ""} />
          </Field>
          <Field label="Programme code">
            <TextInput name="programmeCode" defaultValue={programme.programmeCode} required />
          </Field>
          <Field label="Programme name">
            <TextInput name="programmeName" defaultValue={programme.programmeName} required />
          </Field>
          <Field label="Degree name">
            <TextInput name="degreeName" defaultValue={programme.degreeName ?? ""} />
          </Field>
          <Field label="Academic level">
            <TextInput name="academicLevel" defaultValue={programme.academicLevel ?? ""} />
          </Field>
          <Field label="Qualification type">
            <TextInput name="qualificationType" defaultValue={programme.qualificationType ?? ""} />
          </Field>
          <Field label="Programme credits">
            <TextInput
              name="programmeCredits"
              type="number"
              min="0"
              defaultValue={programme.programmeCredits ?? ""}
            />
          </Field>
          <Field label="Duration years">
            <TextInput name="durationYears" type="number" min="0" defaultValue={programme.durationYears ?? ""} />
          </Field>
          <Field label="Year levels">
            <TextInput name="yearLevels" defaultValue={programme.yearLevels ?? ""} />
          </Field>
          <Field label="Source file">
            <TextInput name="sourceFile" defaultValue={programme.sourceFile ?? ""} />
          </Field>
          <Field label="Last verified">
            <TextInput name="lastVerified" type="date" defaultValue={formatDate(programme.lastVerified)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Notes">
              <TextArea name="notes" defaultValue={programme.notes ?? ""} />
            </Field>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <ActionButton>Save changes</ActionButton>
          </div>
        </form>
      </Section>
      ) : (
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 text-sm leading-6 text-[var(--color-text-muted)]">
          You can view this programme record, but you do not have permission to edit it.
        </section>
      )}

      <Section title="Linked modules" description="Module records grouped under this programme.">
        <div className="space-y-3">
          {programme.courseModules.length > 0 ? (
            programme.courseModules.map((module) => (
              <div
                key={module.id}
                className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] p-4"
              >
                <div className="font-semibold text-[color:var(--color-primary-dark)]">{module.moduleCode}</div>
                <div className="text-sm text-[color:var(--color-text-muted)]">
                  {module.moduleName ?? "Unnamed module"} | {module.yearLevelRaw} | {module.moduleType} |{" "}
                  {module.moduleUnits} units
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[color:var(--color-text-muted)]">No modules linked yet.</p>
          )}
        </div>
      </Section>
    </div>
  );
}
