import Link from "next/link";

import { ActionButton, Field, PageHeader, Section, Select, TextArea, TextInput } from "@/components/admin-form";
import { createCourseModule } from "@/lib/admin-actions";
import { getCourseModulePage, getProgrammeRows } from "@/lib/admin-queries";

function safeString(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value : "Not set";
}

export default async function CourseModulesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const pageSize = 50;
  const currentPage = Math.max(Number(page ?? "1") || 1, 1);

  const [pageData, programmes] = await Promise.all([
    getCourseModulePage({ query: q, page: currentPage, pageSize }),
    getProgrammeRows(),
  ]);

  const totalPages = Math.max(Math.ceil(pageData.total / pageSize), 1);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Phase 3"
        title="Course Modules"
        description="Manage curriculum modules at scale with programme links, year ordering, and source tracking."
      />

      <Section title="Search modules" description="Filter the large curriculum dataset before editing.">
        <form className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <Field label="Search" hint="Module code, module name, programme code, or programme name">
            <TextInput name="q" defaultValue={q ?? ""} placeholder="Search modules" />
          </Field>
          <div className="flex items-end">
            <ActionButton type="submit">Search</ActionButton>
          </div>
        </form>
      </Section>

      <Section title="Create module" description="Add a module row for a specific programme and year.">
        <form action={createCourseModule} className="grid gap-5 md:grid-cols-2">
          <Field label="Programme">
            <Select name="programmeId" required defaultValue="">
              <option value="" disabled>
                Select programme
              </option>
              {programmes.map((programme) => (
                <option key={programme.id} value={programme.id}>
                  {programme.programmeCode} - {programme.programmeName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Faculty code">
            <TextInput name="facultyCode" placeholder="EBIT" />
          </Field>
          <Field label="Source faculty code">
            <TextInput name="sourceFacultyCode" placeholder="EBIT" />
          </Field>
          <Field label="Programme code">
            <TextInput name="programmeCode" required />
          </Field>
          <Field label="Programme name">
            <TextInput name="programmeName" />
          </Field>
          <Field label="Year level raw">
            <TextInput name="yearLevelRaw" required placeholder="01" />
          </Field>
          <Field label="Year level sort">
            <TextInput name="yearLevelSort" type="number" min="0" />
          </Field>
          <Field label="Module code">
            <TextInput name="moduleCode" required placeholder="COS 110" />
          </Field>
          <Field label="Module name">
            <TextInput name="moduleName" />
          </Field>
          <Field label="Module type">
            <TextInput name="moduleType" required placeholder="Core" />
          </Field>
          <Field label="Module units">
            <TextInput name="moduleUnits" type="number" min="0" required />
          </Field>
          <Field label="Source file">
            <TextInput name="sourceFile" />
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
            <ActionButton>Create module</ActionButton>
          </div>
        </form>
      </Section>

      <Section
        title={`Module directory ${pageData.total > 0 ? `(${pageData.total})` : ""}`}
        description="Paged list of curriculum modules with their linked programme context."
      >
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Module</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Programme</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Year</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Type</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Units</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {pageData.rows.map((module) => (
                <tr key={module.id} className="align-top">
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4">
                    <div className="font-semibold text-[color:var(--color-primary-dark)]">{module.moduleCode}</div>
                    <div className="mt-1 text-xs text-[color:var(--color-text-muted)]">
                      {safeString(module.moduleName)}
                    </div>
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm">
                    <div className="font-medium text-[color:var(--color-primary-dark)]">
                      {module.programme.faculty.code}
                    </div>
                    <div className="text-[color:var(--color-text-muted)]">
                      {module.programme.programmeCode} - {module.programme.programmeName}
                    </div>
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    <div>{module.yearLevelRaw}</div>
                    <div>Sort {module.yearLevelSort ?? "n/a"}</div>
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    {module.moduleType}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    {module.moduleUnits}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-right">
                    <Link
                      href={`/admin/course-modules/${module.id}`}
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

        <div className="mt-6 flex items-center justify-between gap-4 text-sm text-[color:var(--color-text-muted)]">
          <div>
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/course-modules?page=${Math.max(currentPage - 1, 1)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`rounded-full border px-4 py-2 font-semibold ${
                currentPage <= 1
                  ? "pointer-events-none border-[color:var(--color-border)] text-[color:var(--color-text-muted)]"
                  : "border-[color:var(--color-border)] text-[color:var(--color-primary)]"
              }`}
            >
              Previous
            </Link>
            <Link
              href={`/admin/course-modules?page=${Math.min(currentPage + 1, totalPages)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`rounded-full border px-4 py-2 font-semibold ${
                currentPage >= totalPages
                  ? "pointer-events-none border-[color:var(--color-border)] text-[color:var(--color-text-muted)]"
                  : "border-[color:var(--color-border)] text-[color:var(--color-primary)]"
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
