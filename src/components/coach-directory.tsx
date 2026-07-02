"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { TextInput } from "@/components/admin-form";
import { MetricCard, MetricGrid } from "@/components/metric-card";
import { FacultyLogo } from "@/components/faculty-logo";
import { cn } from "@/lib/cn";
import { displayFacultyName } from "@/lib/faculty-display";
import {
  buildCoachSuggestions,
  coachMatchesQuery,
  indexCoach,
  type CoachSearchRecord,
} from "@/lib/coach-search";

type CoachRow = CoachSearchRecord & {
  phone: string | null;
  cell: string | null;
  level: string;
  verificationStatus: string | null;
};

type CoachStatsInput = Pick<CoachRow, "isActive" | "verificationStatus" | "phone" | "cell">;

export function getCoachDirectoryStats(coaches: CoachStatsInput[]) {
  const active = coaches.filter((coach) => coach.isActive).length;
  const inactive = coaches.length - active;
  const verified = coaches.filter((coach) =>
    normaliseStatus(coach.verificationStatus).includes("verified"),
  ).length;
  const withPhone = coaches.filter((coach) => Boolean(coach.phone || coach.cell)).length;

  return { active, inactive, verified, withPhone };
}

function normaliseStatus(value: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function statusTone(value: string | null) {
  const status = normaliseStatus(value);
  if (status.includes("verified")) return "success";
  if (status.includes("review") || status.includes("pending")) return "warning";
  return "neutral";
}

function safeContact(value: string | null) {
  return value?.trim() || "Not set";
}

function compactStatus(value: string | null) {
  const status = value?.trim();
  if (!status) return "Unspecified";
  return status.replace(/[_-]/g, " ");
}

type CoachDirectoryProps = {
  coaches: CoachRow[];
};

export function CoachDirectory({ coaches }: CoachDirectoryProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState<string>("all");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const deferredQuery = useDeferredValue(query);

  const indexedCoaches = useMemo(
    () => coaches.map((coach) => indexCoach(coach)),
    [coaches],
  );

  const facultyScopedCoaches = useMemo(
    () =>
      indexedCoaches.filter(
        (coach) => facultyFilter === "all" || coach.faculty.id === facultyFilter,
      ),
    [facultyFilter, indexedCoaches],
  );

  const visibleCoaches = useMemo(
    () =>
      facultyScopedCoaches.filter((coach) => {
        const status = normaliseStatus(coach.verificationStatus);
        return (
          statusFilter === "all" ||
          (statusFilter === "active" && coach.isActive) ||
          (statusFilter === "inactive" && !coach.isActive) ||
          (statusFilter === "verified" && status.includes("verified")) ||
          (statusFilter === "needs-review" && !status.includes("verified"))
        );
      }),
    [facultyScopedCoaches, statusFilter],
  );

  const grouped = useMemo(() => {
    const filtered = visibleCoaches.filter((coach) =>
      coachMatchesQuery(coach, deferredQuery),
    );

    const buckets = new Map<
      string,
      { faculty: CoachRow["faculty"]; coaches: CoachRow[] }
    >();

    for (const coach of filtered) {
      const bucket = buckets.get(coach.faculty.id);
      if (bucket) {
        bucket.coaches.push(coach);
      } else {
        buckets.set(coach.faculty.id, {
          faculty: coach.faculty,
          coaches: [coach],
        });
      }
    }

    return Array.from(buckets.values()).sort((a, b) =>
      displayFacultyName(a.faculty.name).localeCompare(displayFacultyName(b.faculty.name)),
    );
  }, [deferredQuery, visibleCoaches]);

  const facultyOptions = useMemo(
    () =>
      Array.from(
        new Map(coaches.map((coach) => [coach.faculty.id, coach.faculty])).values(),
      ).sort((a, b) => displayFacultyName(a.name).localeCompare(displayFacultyName(b.name))),
    [coaches],
  );

  const suggestions = useMemo(
    () => buildCoachSuggestions(visibleCoaches, query, 6),
    [query, visibleCoaches],
  );

  const stats = useMemo(
    () => getCoachDirectoryStats(facultyScopedCoaches),
    [facultyScopedCoaches],
  );

  return (
    <div className="space-y-4">
        <Card>
          <CardBody className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Coach directory
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
                  Structured like a contact book
                </h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Grouped by faculty so users can jump straight to the right team, and the live suggestions keep
                  search fast even as the directory grows.
                </p>
              </div>

              <MetricGrid className="w-full [grid-template-columns:repeat(auto-fit,minmax(14rem,1fr))]">
                <MetricCard compact label="Active" value={stats.active} detail="Current coach records." className="bg-[var(--color-surface)]" />
                <MetricCard compact label="Inactive" value={stats.inactive} detail="Archived coach records." className="bg-[var(--color-surface)]" />
                <MetricCard compact label="Verified" value={stats.verified} detail="Verified contact entries." className="bg-[var(--color-surface)]" />
                <MetricCard compact label="Contacts" value={stats.withPhone} detail="Rows with phone details." className="bg-[var(--color-surface)]" />
              </MetricGrid>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_auto]">
              <div className="relative">
                <TextInput
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setCollapsed({});
                  }}
                  placeholder="Search by first name, surname, or email"
                  aria-autocomplete="list"
                  aria-expanded={suggestions.length > 0 && query.trim().length > 0}
                  aria-controls="coach-search-suggestions"
                  className="pr-10"
                />
                {suggestions.length > 0 && query.trim().length > 0 ? (
                  <div
                    id="coach-search-suggestions"
                    role="listbox"
                    className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[0_20px_40px_rgba(0,32,80,0.12)]"
                  >
                    <div className="border-b border-[var(--color-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                      Live suggestions
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {suggestions.map(({ coach, matchLabel }) => (
                        <button
                          key={coach.id}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            setQuery(coach.name);
                            setCollapsed({});
                          }}
                          className="flex w-full items-start justify-between gap-4 border-b border-[var(--color-border)] px-4 py-3 text-left transition hover:bg-[var(--color-surface-sunken)] last:border-b-0"
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="truncate text-sm font-semibold text-[var(--color-text)]">
                              {coach.name}
                            </div>
                            <div className="truncate text-xs text-[var(--color-text-muted)]">
                              {matchLabel}
                            </div>
                            <div className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                              {displayFacultyName(coach.faculty.name)}
                            </div>
                          </div>
                          <span className="shrink-0 rounded-full bg-[var(--color-brand-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-soft-foreground)]">
                            {coach.faculty.code}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all", label: "All" },
                  { key: "active", label: "Active" },
                  { key: "inactive", label: "Inactive" },
                  { key: "verified", label: "Verified" },
                  { key: "needs-review", label: "Needs review" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={statusFilter === item.key}
                    onClick={() => setStatusFilter(item.key)}
                    className={cn(
                      "rounded-full border px-3 py-2 text-sm font-medium transition whitespace-nowrap",
                      statusFilter === item.key
                        ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-soft-foreground)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-text)]",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            aria-pressed={facultyFilter === "all"}
            onClick={() => setFacultyFilter("all")}
            className={cn(
              "rounded-full border px-3 py-2 text-sm font-medium transition whitespace-nowrap",
              facultyFilter === "all"
                ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-soft-foreground)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]",
            )}
          >
            All faculties
          </button>
          {facultyOptions.map((faculty) => (
            <button
              key={faculty.id}
              type="button"
              aria-pressed={facultyFilter === faculty.id}
              onClick={() => setFacultyFilter(faculty.id)}
              className={cn(
                "rounded-full border px-3 py-2 text-sm font-medium transition whitespace-nowrap",
                facultyFilter === faculty.id
                  ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-soft-foreground)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]",
              )}
            >
              {displayFacultyName(faculty.name)}
            </button>
          ))}
        </div>

        <div className="max-h-[72vh] space-y-4 overflow-y-auto pr-1">
          {grouped.length === 0 ? (
            <Card>
              <CardBody className="py-12 text-center">
                <p className="text-lg font-semibold">No coaches match this filter.</p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  Clear the search or switch faculty filters to bring the directory back.
                </p>
              </CardBody>
            </Card>
          ) : (
            grouped.map(({ faculty, coaches: facultyCoaches }) => {
              const isCollapsed = collapsed[faculty.id] ?? false;

              return (
                <section
                  key={faculty.id}
                  className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)]"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsed((current) => ({
                        ...current,
                        [faculty.id]: !isCollapsed,
                      }))
                    }
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <FacultyLogo size={44} />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold tracking-tight">
                            {displayFacultyName(faculty.name)}
                          </h3>
                          <Badge tone="neutral" outlined>
                            {faculty.code}
                          </Badge>
                        </div>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          {facultyCoaches.length} coach{facultyCoaches.length === 1 ? "" : "es"} in this section
                        </p>
                      </div>
                    </div>

                    <Badge tone="brand" outlined>
                      {isCollapsed ? "Expand" : "Collapse"}
                    </Badge>
                  </button>

                  {!isCollapsed ? (
                    <div className="grid gap-3 border-t border-[var(--color-border)] p-4 md:grid-cols-2 xl:grid-cols-3">
                      {facultyCoaches.map((coach) => {
                        const status = compactStatus(coach.verificationStatus);

                        return (
                          <Card
                            key={coach.id}
                            className="border-[var(--color-border)] shadow-none transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,32,80,0.08)]"
                          >
                            <CardBody className="space-y-4 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-base font-semibold tracking-tight">{coach.name}</h4>
                                    <Badge tone={coach.isActive ? "success" : "danger"} outlined>
                                      {coach.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-[var(--color-text-muted)]">
                                    {coach.titleRole ?? "Coach contact"}
                                  </p>
                                </div>
                                <Badge tone="neutral" outlined>
                                  {coach.level}
                                </Badge>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Badge tone={statusTone(coach.verificationStatus)} outlined>
                                  {status}
                                </Badge>
                                {coach.cluster ? (
                                  <Badge tone="neutral" outlined>
                                    {coach.cluster}
                                  </Badge>
                                ) : null}
                              </div>

                              <div className="space-y-2 text-sm">
                                <div className="flex items-start justify-between gap-4">
                                  <span className="text-[var(--color-text-muted)]">Email</span>
                                  <a
                                    className="break-all font-medium text-[var(--color-brand)] hover:underline"
                                    href={`mailto:${coach.email}`}
                                  >
                                    {coach.email}
                                  </a>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                  <span className="text-[var(--color-text-muted)]">Phone</span>
                                  <span className="font-medium">{safeContact(coach.phone)}</span>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                  <span className="text-[var(--color-text-muted)]">Cell</span>
                                  <span className="font-medium">{safeContact(coach.cell)}</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 pt-1">
                                <Link
                                  href={`/admin/coaches/${coach.id}`}
                                  className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand)] px-3 py-2 text-xs font-medium text-[var(--color-brand-foreground)] transition-colors hover:bg-[var(--color-brand-strong)]"
                                >
                                  Open
                                </Link>
                                <a
                                  href={`mailto:${coach.email}`}
                                  className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-sunken)]"
                                >
                                  Email
                                </a>
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
