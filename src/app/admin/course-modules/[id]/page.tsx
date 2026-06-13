import { notFound } from "next/navigation";

import { ActionButton, Field, PageHeader, Section, Select, TextArea, TextInput } from "@/components/admin-form";
import { deleteCourseModule, updateCourseModule } from "@/lib/admin-actions";
import { getCourseModuleById, getProgrammeRows } from "@/lib/admin-queries";

function formatDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export default async function CourseModuleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [module, programmes] = await Promise.all([getCourseModuleById(id), getProgrammeRows()]);

  if (!module) {
    notFound();
  }

  const updateAction = updateCourseModule.bind(null, module.id);
  const deleteAction = deleteCourseModule.bind(null, module.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Module detail"
        title={module.moduleCode}
        description={`${module.programme.programmeCode} | ${module.programme.programmeName} | ${module.programme.faculty.code}`}
        action={
          <form action={deleteAction}>
            <ActionButton tone="danger">Delete module</ActionButton>
          </form>
        }
      />

      <Section title="Edit module" description="Keep module identity, year sorting, and provenance aligned.">
        <form action={updateAction} className="grid gap-5 md:grid-cols-2">
          <Field label="Programme">
            <Select name="programmeId" defaultValue={module.programmeId} required>
              {programmes.map((programme) => (
                <option key={programme.id} value={programme.id}>
                  {programme.programmeCode} - {programme.programmeName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Faculty code">
            <TextInput name="facultyCode" defaultValue={module.facultyCode ?? ""} />
          </Field>
          <Field label="Source faculty code">
            <TextInput name="sourceFacultyCode" defaultValue={module.sourceFacultyCode ?? ""} />
          </Field>
          <Field label="Programme code">
            <TextInput name="programmeCode" defaultValue={module.programmeCode} required />
          </Field>
          <Field label="Programme name">
            <TextInput name="programmeName" defaultValue={module.programmeName ?? ""} />
          </Field>
          <Field label="Year level raw">
            <TextInput name="yearLevelRaw" defaultValue={module.yearLevelRaw} required />
          </Field>
          <Field label="Year level sort">
            <TextInput name="yearLevelSort" type="number" min="0" defaultValue={module.yearLevelSort ?? ""} />
          </Field>
          <Field label="Module code">
            <TextInput name="moduleCode" defaultValue={module.moduleCode} required />
          </Field>
          <Field label="Module name">
            <TextInput name="moduleName" defaultValue={module.moduleName ?? ""} />
          </Field>
          <Field label="Module type">
            <TextInput name="moduleType" defaultValue={module.moduleType} required />
          </Field>
          <Field label="Module units">
            <TextInput name="moduleUnits" type="number" min="0" defaultValue={module.moduleUnits} required />
          </Field>
          <Field label="Source file">
            <TextInput name="sourceFile" defaultValue={module.sourceFile ?? ""} />
          </Field>
          <Field label="Last verified">
            <TextInput name="lastVerified" type="date" defaultValue={formatDate(module.lastVerified)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Notes">
              <TextArea name="notes" defaultValue={module.notes ?? ""} />
            </Field>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <ActionButton>Save changes</ActionButton>
          </div>
        </form>
      </Section>
    </div>
  );
}
