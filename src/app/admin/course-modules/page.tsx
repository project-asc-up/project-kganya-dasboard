import Link from "next/link";

import { PageHeader, Section } from "@/components/admin-form";
import { CourseModuleFilters } from "@/components/course-module-filters";
import { CourseModuleAtlas } from "@/components/course-module-atlas";
import { CreateCourseModuleModal } from "@/components/create-course-module-modal";
import { getCourseModulePage, getProgrammeOptions } from "@/lib/admin-queries";
import { canAccess, getCurrentAuthorization } from "@/lib/rbac";

export default async function CourseModulesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; facultyId?: string; programmeId?: string }>;
}) {
  const { q, page, facultyId, programmeId } = await searchParams;
  const pageSize = 50;
  const currentPage = Math.max(Number(page ?? "1") || 1, 1);
  const [pageData, programmes, authz] = await Promise.all([
    getCourseModulePage({
      query: q,
      page: currentPage,
      pageSize,
      facultyId,
      programmeId,
    }),
    getProgrammeOptions(),
    getCurrentAuthorization(),
  ]);

  const totalPages = Math.max(Math.ceil(pageData.total / pageSize), 1);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Course Modules"
        description="Browse curriculum rows as grouped module cards, keeping the programme context visible."
        action={canAccess(authz, "course-module:create") ? <CreateCourseModuleModal programmes={programmes} /> : null}
      />

      <Section title="Search modules" description="Filter by module code, name, or programme context.">
        <CourseModuleFilters
          key={`${q ?? ""}|${facultyId ?? "all"}|${programmeId ?? "all"}`}
          query={q ?? ""}
          facultyId={facultyId ?? "all"}
          programmeId={programmeId ?? "all"}
          programmes={programmes}
        />
      </Section>

      <Section
        title={`Module atlas ${pageData.total > 0 ? `(${pageData.total})` : ""}`}
        description="Grouped card view for the current slice of curriculum data."
      >
        <CourseModuleAtlas
          rows={pageData.rows}
          total={pageData.total}
          currentPage={currentPage}
          totalPages={totalPages}
          query={q}
        />

        <div className="mt-6 flex items-center justify-between gap-4 text-sm text-[color:var(--color-text-muted)]">
          <div>
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/course-modules?page=${Math.max(currentPage - 1, 1)}${q ? `&q=${encodeURIComponent(q)}` : ""}${facultyId ? `&facultyId=${encodeURIComponent(facultyId)}` : ""}${programmeId ? `&programmeId=${encodeURIComponent(programmeId)}` : ""}`}
              className={`rounded-full border px-4 py-2 font-semibold ${
                currentPage <= 1
                  ? "pointer-events-none border-[color:var(--color-border)] text-[color:var(--color-text-muted)]"
                  : "border-[color:var(--color-border)] text-[color:var(--color-primary)]"
              }`}
            >
              Previous
            </Link>
            <Link
              href={`/admin/course-modules?page=${Math.min(currentPage + 1, totalPages)}${q ? `&q=${encodeURIComponent(q)}` : ""}${facultyId ? `&facultyId=${encodeURIComponent(facultyId)}` : ""}${programmeId ? `&programmeId=${encodeURIComponent(programmeId)}` : ""}`}
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
