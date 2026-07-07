"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, Hash } from "lucide-react";

import { MetricCard, MetricGrid } from "@/components/metric-card";
import { Button } from "@/components/ui/button";
import { displayFacultyName } from "@/lib/faculty-display";

type ModuleRow = {
  id: string;
  moduleCode: string;
  moduleName: string | null;
  yearLevelRaw: string;
  yearLevelSort: number | null;
  moduleType: string;
  moduleUnits: number;
  programmeCode: string;
  programmeName: string | null;
  facultyCode: string | null;
  sourceFile: string | null;
  programme: {
    id: string;
    programmeCode: string;
    programmeName: string;
    faculty: { id: string; name: string; code: string };
  };
};

function safeString(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value : "Not set";
}

export function CourseModuleAtlas({
  rows,
  total,
  currentPage,
  totalPages,
  query,
}: {
  rows: ModuleRow[];
  total: number;
  currentPage: number;
  totalPages: number;
  query?: string;
}) {
  const grouped = rows.reduce<Map<string, ModuleRow[]>>((acc, row) => {
    const key = `${row.programme.faculty.code} - ${displayFacultyName(row.programme.faculty.name)}`;
    const list = acc.get(key) ?? [];
    list.push(row);
    acc.set(key, list);
    return acc;
  }, new Map());

  const sections = Array.from(grouped.entries()).sort(([left], [right]) => left.localeCompare(right));

  return (
    <div className="space-y-6">
      <MetricGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard compact label="Results" value={total} detail="Matching module rows." className="bg-[color:var(--color-bg-light)]" />
        <MetricCard compact label="Current page" value={`${currentPage} / ${totalPages}`} detail="Pagination position." className="bg-[color:var(--color-bg-light)]" />
        <MetricCard compact label="Current slice" value={rows.length} detail="Rows on this page." className="bg-[color:var(--color-bg-light)]" />
      </MetricGrid>

      {query ? (
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] px-4 py-3 text-sm text-[color:var(--color-text-muted)]">
          Showing matches for <span className="font-semibold text-[color:var(--color-primary-dark)]">{query}</span>.
        </div>
      ) : null}

      <div className="space-y-8">
        {sections.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] p-10 text-center">
            <BookOpen className="mx-auto text-[color:var(--color-text-muted)]" size={34} />
            <p className="mt-4 text-lg font-semibold text-[color:var(--color-primary-dark)]">
              No modules on this page.
            </p>
            <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
              Try a different search term or move to another page of results.
            </p>
          </div>
        ) : (
          sections.map(([facultyLabel, items]) => (
            <section key={facultyLabel} className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-[color:var(--color-primary-dark)]">
                    {facultyLabel}
                  </h3>
                  <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                    {items.length} module{items.length === 1 ? "" : "s"} in this slice.
                  </p>
                </div>
                <div className="rounded-full border border-[color:var(--color-border)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                  Programme grouped
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {items.map((module) => (
                  <article
                    key={module.id}
                    className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-[0_12px_40px_rgba(0,32,80,0.04)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                          <Hash size={14} />
                          <span>{module.moduleCode}</span>
                        </div>
                        <h4 className="mt-3 text-lg font-semibold tracking-tight text-[color:var(--color-primary-dark)]">
                          {safeString(module.moduleName)}
                        </h4>
                      </div>
                      <span className="rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs font-medium text-[color:var(--color-text-muted)]">
                        {module.moduleUnits} units
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-[color:var(--color-text-muted)]">
                      {module.programme.faculty.code} - {displayFacultyName(module.programme.faculty.name)}
                      <br />
                      {module.programme.programmeCode} - {safeString(module.programme.programmeName)}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-[color:var(--color-text-muted)]">
                      <span className="rounded-full bg-[color:var(--color-bg-light)] px-3 py-1">
                        Year {module.yearLevelRaw}
                      </span>
                      <span className="rounded-full bg-[color:var(--color-bg-light)] px-3 py-1">
                        Sort {module.yearLevelSort ?? "n/a"}
                      </span>
                      <span className="rounded-full bg-[color:var(--color-bg-light)] px-3 py-1">
                        {module.moduleType}
                      </span>
                      <span className="rounded-full bg-[color:var(--color-bg-light)] px-3 py-1">
                        {safeString(module.sourceFile)}
                      </span>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Button
                        asChild
                        variant="secondary"
                        size="sm"
                        rounded="full"
                      >
                        <Link href={`/admin/course-modules/${module.id}`}>
                          View / edit
                          <ChevronRight size={14} className="ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
