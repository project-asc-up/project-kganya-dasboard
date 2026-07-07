"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { LiveSearchInput } from "@/components/live-search-input";
import { MetricCard, MetricGrid } from "@/components/metric-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { displayFacultyName } from "@/lib/faculty-display";
import {
  filterProgrammeExplorerRows,
  getProgrammeExplorerStats,
  groupProgrammeExplorerRows,
  type ProgrammeExplorerRow,
} from "@/lib/programme-explorer";
import { rankSuggestions } from "@/lib/search-suggestions";

function yearTokens(value: string | null) {
  if (!value) return [];
  return value
    .split(/[;,|]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function detailTone(value: string | null) {
  const normalized = value?.toLowerCase() ?? "";
  if (normalized.includes("post")) return "accent";
  if (normalized.includes("under")) return "brand";
  if (normalized.includes("diploma")) return "info";
  return "neutral";
}

type ProgrammeExplorerProps = {
  programmes: ProgrammeExplorerRow[];
};

export function ProgrammeExplorer({ programmes }: ProgrammeExplorerProps) {
  const [query, setQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const facultyOptions = useMemo(
    () =>
      Array.from(new Map(programmes.map((programme) => [programme.faculty.id, programme.faculty])).values()).sort(
        (a, b) => displayFacultyName(a.name).localeCompare(displayFacultyName(b.name)),
      ),
    [programmes],
  );

  const filteredProgrammes = useMemo(
    () => filterProgrammeExplorerRows(programmes, query, facultyFilter),
    [facultyFilter, programmes, query],
  );

  const grouped = useMemo(() => groupProgrammeExplorerRows(filteredProgrammes), [filteredProgrammes]);

  const stats = useMemo(() => getProgrammeExplorerStats(filteredProgrammes), [filteredProgrammes]);

  const suggestions = useMemo(
    () =>
      rankSuggestions(
        query,
        programmes.map((programme) => ({
          id: programme.id,
          title: `${programme.programmeCode} · ${programme.programmeName}`,
          value: programme.programmeName,
          detail: `${displayFacultyName(programme.faculty.name)} · ${programme.degreeName ?? programme.qualificationType ?? "Programme"}`,
          badge: programme.faculty.code,
          searchText: [
            programme.programmeCode,
            programme.programmeName,
            programme.degreeName,
            programme.academicLevel,
            programme.qualificationType,
            programme.faculty.name,
            programme.faculty.code,
          ]
            .filter(Boolean)
            .join(" "),
        })),
        6,
      ),
    [programmes, query],
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="space-y-5">
          <MetricGrid className="grid-cols-1 sm:grid-cols-3">
            <MetricCard
              label="Programmes"
              value={filteredProgrammes.length}
              detail="Filtered programme records."
              className="bg-[var(--color-surface)]"
            />
            <MetricCard
              label="Modules"
              value={stats.totalModules}
              detail="Linked curriculum rows."
              className="bg-[var(--color-surface)]"
            />
            <MetricCard
              label="Year maps"
              value={stats.withYearLevels}
              detail="Visible programmes with year maps."
              className="bg-[var(--color-surface)]"
            />
          </MetricGrid>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <LiveSearchInput
              value={query}
              onValueChange={setQuery}
              suggestionsLoader={() => suggestions}
              placeholder="Search by programme, code, faculty, qualification, or degree"
              onSelectSuggestion={(suggestion) => setQuery(suggestion.value)}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                variant={facultyFilter === "all" ? "primary" : "secondary"}
                size="sm"
                rounded="full"
                onClick={() => setFacultyFilter("all")}
                className="h-10 px-4"
              >
                All faculties
              </Button>
              {facultyOptions.map((faculty) => (
                <Button
                  key={faculty.id}
                  variant={facultyFilter === faculty.id ? "primary" : "secondary"}
                  size="sm"
                  rounded="full"
                  onClick={() => setFacultyFilter(faculty.id)}
                  className="h-10 px-4 whitespace-nowrap"
                >
                  {displayFacultyName(faculty.name)}
                </Button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="max-h-[72vh] space-y-4 overflow-y-auto pr-1">
        {grouped.length === 0 ? (
          <Card>
            <CardBody className="py-12 text-center">
              <p className="text-lg font-semibold">No programmes match this filter.</p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Clear the search or switch faculties to continue browsing.
              </p>
            </CardBody>
          </Card>
        ) : (
          grouped.map(({ faculty, programmes: facultyProgrammes }) => {
            const isCollapsed = collapsed[faculty.id] ?? false;

            return (
              <section
                key={faculty.id}
                className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)] overflow-hidden"
              >
                <Button
                  variant="ghost"
                  onClick={() => setCollapsed((current) => ({ ...current, [faculty.id]: !isCollapsed }))}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left h-auto rounded-none hover:bg-[var(--color-surface-sunken)]/40"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold tracking-tight">{displayFacultyName(faculty.name)}</h3>
                      <Badge tone="neutral" outlined>
                        {faculty.code}
                      </Badge>
                      <Badge tone="brand" outlined>
                        {facultyProgrammes.length} programme{facultyProgrammes.length === 1 ? "" : "s"}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">Grouped curriculum records for this faculty.</p>
                  </div>
                  <Badge tone="brand" outlined>
                    {isCollapsed ? "Expand" : "Collapse"}
                  </Badge>
                </Button>

                {!isCollapsed ? (
                  <div className="grid gap-3 border-t border-[var(--color-border)] p-4 md:grid-cols-2 xl:grid-cols-3">
                    {facultyProgrammes.map((programme) => {
                      const years = yearTokens(programme.yearLevels);

                      return (
                        <Card
                          key={programme.id}
                          className="border-[var(--color-border)] shadow-none transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,32,80,0.08)]"
                        >
                          <CardBody className="space-y-4 p-4">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-base font-semibold tracking-tight">{programme.programmeName}</h4>
                                <Badge tone="neutral" outlined>
                                  {programme.programmeCode}
                                </Badge>
                              </div>
                              <CardDescription>
                                {programme.degreeName ?? "Degree not set"} ·{" "}
                                {programme.qualificationType ?? "Qualification not set"}
                              </CardDescription>
                            </div>

                            <MetricGrid className="grid-cols-2 gap-2">
                              <MetricCard
                                compact
                                label="Duration"
                                value={programme.durationYears ?? "—"}
                                detail={`year${programme.durationYears === 1 ? "" : "s"}`}
                                className="bg-[var(--color-surface)]"
                              />
                              <MetricCard
                                compact
                                label="Modules"
                                value={programme._count.courseModules}
                                detail="Linked rows."
                                className="bg-[var(--color-surface)]"
                              />
                              <MetricCard
                                compact
                                label="Credits"
                                value={programme.programmeCredits ?? "—"}
                                detail="Programme credits."
                                className="bg-[var(--color-surface)]"
                              />
                              <MetricCard
                                compact
                                label="Level"
                                value={programme.academicLevel ?? "—"}
                                detail="Academic level."
                                className="bg-[var(--color-surface)]"
                              />
                            </MetricGrid>

                            <div className="flex flex-wrap gap-2">
                              <Badge tone={detailTone(programme.academicLevel)} outlined>
                                {programme.academicLevel ?? "Unspecified"}
                              </Badge>
                              {years.map((year) => (
                                <Badge key={year} tone="neutral" outlined>
                                  {year}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                              <Link
                                href={`/admin/programmes/${programme.id}`}
                                className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand)] px-3 py-2 text-xs font-medium text-[var(--color-brand-foreground)] transition-colors hover:bg-[var(--color-brand-strong)]"
                              >
                                Open
                              </Link>
                              <span className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-medium text-[var(--color-text-muted)]">
                                {programme.faculty.code}
                              </span>
                            </div>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
