"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard, MetricGrid } from "@/components/metric-card";
import { LiveSearchInput } from "@/components/live-search-input";
import { formatIsoDate, type DisplayDateValue } from "@/lib/date-display";
import { displayFacultyName } from "@/lib/faculty-display";
import { cn } from "@/lib/cn";
import { rankSuggestions } from "@/lib/search-suggestions";

type FacultyRow = {
  id: string;
  name: string;
  code: string;
  codeStatus: string;
  officialPageUrl: string | null;
  supportPageUrl: string | null;
  lastVerified: DisplayDateValue;
  aliases: string | null;
  _count: {
    ascCoaches: number;
    programmes: number;
    resources: number;
    faqs: number;
  };
};

function splitAliases(value: string | null) {
  if (!value) return [];
  return value
    .split(/[;,|]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function statusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("verified")) return "success";
  if (normalized.includes("review") || normalized.includes("pending")) return "warning";
  if (normalized.includes("inactive")) return "danger";
  return "neutral";
}

function statusLabel(status: string) {
  const normalized = status.trim();
  if (!normalized) return "Unspecified";
  return normalized
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function metricList(faculty: FacultyRow) {
  return [
    { label: "Coaches", value: faculty._count.ascCoaches },
    { label: "Programmes", value: faculty._count.programmes },
    { label: "Resources", value: faculty._count.resources },
    { label: "FAQs", value: faculty._count.faqs },
  ];
}

type FacultyGalleryProps = {
  faculties: FacultyRow[];
};

export function FacultyGallery({ faculties }: FacultyGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(faculties[0]?.id ?? null);

  const filteredFaculties = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return faculties.filter((faculty) => {
      const matchesQuery =
        !query ||
        faculty.name.toLowerCase().includes(query) ||
        faculty.code.toLowerCase().includes(query) ||
        (faculty.aliases ?? "").toLowerCase().includes(query);

      const normalizedStatus = faculty.codeStatus.toLowerCase();
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "verified" && normalizedStatus.includes("verified")) ||
        (statusFilter === "review" &&
          (normalizedStatus.includes("review") || normalizedStatus.includes("pending"))) ||
        (statusFilter === "other" &&
          !normalizedStatus.includes("verified") &&
          !normalizedStatus.includes("review") &&
          !normalizedStatus.includes("pending"));

      return matchesQuery && matchesStatus;
    });
  }, [faculties, searchQuery, statusFilter]);

  const selectedFaculty =
    filteredFaculties.find((faculty) => faculty.id === selectedId) ?? filteredFaculties[0] ?? null;

  const visibleCount = filteredFaculties.length;

  const suggestions = useMemo(
    () =>
      rankSuggestions(
        searchQuery,
        faculties.map((faculty) => ({
          id: faculty.id,
          title: displayFacultyName(faculty.name),
          value: faculty.name,
          detail: `${faculty.code} · ${faculty.aliases ?? "No aliases"}`,
          badge: faculty.codeStatus,
          searchText: [faculty.name, faculty.code, faculty.aliases, faculty.codeStatus].filter(Boolean).join(" "),
        })),
        6,
      ),
    [faculties, searchQuery],
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.85fr)]">
      <div className="space-y-4">
        <Card className="border-[color:var(--color-border)]/80 bg-[var(--color-surface-raised)]">
          <CardBody className="space-y-4">
            <div className="space-y-5">
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Faculty atlas
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
                  Browse faculties as cards, not rows
                </h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Scan the catalogue, then open one record in the detail pane to edit or inspect linked content.
                </p>
              </div>

              <MetricGrid className="faculty-directory-metrics grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:[grid-template-columns:repeat(4,minmax(11rem,1fr))]">
                <MetricCard
                  compact
                  label="Visible"
                  value={visibleCount}
                  detail="Matching faculties."
                  className="min-h-[9rem] bg-[var(--color-surface)] p-5"
                  labelClassName="whitespace-normal break-normal leading-5"
                  valueClassName="whitespace-nowrap text-[clamp(2.25rem,4.2vw,3.35rem)]"
                  detailClassName="text-sm leading-5"
                />
                <MetricCard
                  compact
                  label="Verified"
                  value={faculties.filter((faculty) => faculty.codeStatus.toLowerCase().includes("verified")).length}
                  detail="Status is verified."
                  className="min-h-[9rem] bg-[var(--color-surface)] p-5"
                  labelClassName="whitespace-normal break-normal leading-5"
                  valueClassName="whitespace-nowrap text-[clamp(2.25rem,4.2vw,3.35rem)]"
                  detailClassName="text-sm leading-5"
                />
                <MetricCard
                  compact
                  label="Needs review"
                  value={faculties.filter((faculty) => {
                    const normalized = faculty.codeStatus.toLowerCase();
                    return normalized.includes("review") || normalized.includes("pending");
                  }).length}
                  detail="Status needs attention."
                  className="min-h-[9rem] bg-[var(--color-surface)] p-5"
                  labelClassName="whitespace-normal break-normal leading-5"
                  valueClassName="whitespace-nowrap text-[clamp(2.25rem,4.2vw,3.35rem)]"
                  detailClassName="text-sm leading-5"
                />
                <MetricCard
                  compact
                  label="Content"
                  value={faculties.reduce(
                    (sum, faculty) =>
                      sum + faculty._count.ascCoaches + faculty._count.programmes + faculty._count.resources + faculty._count.faqs,
                    0,
                  )}
                  detail="Linked content total."
                  className="min-h-[9rem] bg-[var(--color-surface)] p-5"
                  labelClassName="whitespace-normal break-normal leading-5"
                  valueClassName="whitespace-nowrap text-[clamp(2.25rem,4.2vw,3.35rem)]"
                  detailClassName="text-sm leading-5"
                />
              </MetricGrid>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_auto] lg:items-end">
              <LiveSearchInput
                value={searchQuery}
                onValueChange={setSearchQuery}
                suggestionsLoader={() => suggestions}
                placeholder="Search by faculty name, code, or alias"
                onSelectSuggestion={(suggestion) => setSearchQuery(suggestion.value)}
              />

              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all", label: "All" },
                  { key: "verified", label: "Verified" },
                  { key: "review", label: "Needs review" },
                  { key: "other", label: "Other" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setStatusFilter(item.key)}
                    className={cn(
                      "rounded-full border px-3 py-2 text-sm font-medium transition",
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

        {filteredFaculties.length === 0 ? (
          <Card>
            <CardBody className="py-12 text-center">
              <p className="text-lg font-semibold text-[var(--color-text)]">No faculties match this filter.</p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Clear the search or switch status filters to bring the catalogue back.
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="max-h-[72vh] space-y-4 overflow-y-auto pr-1">
            {filteredFaculties.map((faculty) => {
              const selected = faculty.id === selectedFaculty?.id;
              const aliases = splitAliases(faculty.aliases);

              return (
                <button
                  key={faculty.id}
                  type="button"
                  onClick={() => setSelectedId(faculty.id)}
                  className={cn(
                    "w-full text-left transition focus-visible:outline-none",
                    selected ? "scale-[1.01]" : "hover:-translate-y-0.5",
                  )}
                >
                  <Card
                    className={cn(
                      "border transition-all duration-200",
                      selected
                        ? "border-[var(--color-brand)] ring-2 ring-[var(--color-brand-soft)]"
                        : "border-[var(--color-border)] hover:border-[var(--color-brand)]/40 hover:shadow-[0_18px_40px_rgba(0,32,80,0.08)]",
                    )}
                  >
                    <CardHeader className="flex-row items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-xl">{displayFacultyName(faculty.name)}</CardTitle>
                          <Badge tone="neutral" outlined>
                            {faculty.code}
                          </Badge>
                          <Badge tone={statusTone(faculty.codeStatus)} outlined>
                            {statusLabel(faculty.codeStatus)}
                          </Badge>
                        </div>
                        <CardDescription>
                          {faculty._count.ascCoaches} coach{faculty._count.ascCoaches === 1 ? "" : "es"} ·{" "}
                          {faculty._count.programmes} programme{faculty._count.programmes === 1 ? "" : "s"} ·{" "}
                          {faculty._count.resources} resource{faculty._count.resources === 1 ? "" : "s"} ·{" "}
                          {faculty._count.faqs} FAQ{faculty._count.faqs === 1 ? "" : "s"}
                        </CardDescription>
                      </div>

                      <Badge tone="brand" outlined>
                        {selected ? "Selected" : "Open"}
                      </Badge>
                    </CardHeader>

                    <CardBody className="pt-0">
                      <div className="grid gap-3 md:grid-cols-[1.5fr_1fr]">
                        <MetricGrid className="grid-cols-1 sm:grid-cols-2 gap-3">
                          {metricList(faculty).map((metric) => (
                            <MetricCard
                              key={metric.label}
                              compact
                              label={metric.label}
                              value={metric.value}
                              detail="Faculty metric."
                              className="bg-[var(--color-surface)]"
                            />
                          ))}
                        </MetricGrid>

                        <div className="space-y-3">
                          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                              Last verified
                            </div>
                            <div className="mt-1 font-medium">{formatIsoDate(faculty.lastVerified, "Not set")}</div>
                          </div>
                          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                              Links
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-sm">
                              <span
                                className={cn(
                                  "rounded-full px-2.5 py-1",
                                  faculty.officialPageUrl
                                    ? "bg-[var(--color-success-soft)] text-[var(--color-success-foreground)]"
                                    : "bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)]",
                                )}
                              >
                                Official page
                              </span>
                              <span
                                className={cn(
                                  "rounded-full px-2.5 py-1",
                                  faculty.supportPageUrl
                                    ? "bg-[var(--color-info-soft)] text-[var(--color-info-foreground)]"
                                    : "bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)]",
                                )}
                              >
                                Support page
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {aliases.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {aliases.map((alias) => (
                            <Badge key={alias} tone="neutral" outlined>
                              {alias}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </CardBody>
                  </Card>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="xl:sticky xl:top-6">
        {selectedFaculty ? (
          <Card className="overflow-hidden border-[color:var(--color-border)]/80">
            <div className="bg-[linear-gradient(135deg,var(--color-brand-soft),transparent)] px-6 py-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand">{selectedFaculty.code}</Badge>
                <Badge tone={statusTone(selectedFaculty.codeStatus)} outlined>
                  {statusLabel(selectedFaculty.codeStatus)}
                </Badge>
              </div>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight">{displayFacultyName(selectedFaculty.name)}</h3>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Detail view for the selected faculty. Use this panel to understand the record at a glance before opening
                the full editor.
              </p>
            </div>

            <CardBody className="space-y-5">
              <MetricGrid className="grid-cols-1 sm:grid-cols-2 gap-3">
                {metricList(selectedFaculty).map((metric) => (
                  <MetricCard
                    key={metric.label}
                    compact
                    label={metric.label}
                    value={metric.value}
                    detail="Selected faculty metric."
                    className="bg-[var(--color-surface)]"
                  />
                ))}
              </MetricGrid>

              <div className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  Record details
                </div>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-[var(--color-text-muted)]">Faculty code</dt>
                    <dd className="font-medium text-right">{selectedFaculty.code}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-[var(--color-text-muted)]">Verification</dt>
                    <dd className="font-medium text-right">{statusLabel(selectedFaculty.codeStatus)}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-[var(--color-text-muted)]">Last verified</dt>
                    <dd className="font-medium text-right">{formatIsoDate(selectedFaculty.lastVerified, "Not set")}</dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  External links
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--color-text-muted)]">Official page</span>
                    {selectedFaculty.officialPageUrl ? (
                      <a
                        href={selectedFaculty.officialPageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-[var(--color-brand)] hover:underline"
                      >
                        Open
                      </a>
                    ) : (
                      <span className="text-[var(--color-text-muted)]">Missing</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--color-text-muted)]">Support page</span>
                    {selectedFaculty.supportPageUrl ? (
                      <a
                        href={selectedFaculty.supportPageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-[var(--color-brand)] hover:underline"
                      >
                        Open
                      </a>
                    ) : (
                      <span className="text-[var(--color-text-muted)]">Missing</span>
                    )}
                  </div>
                </div>
              </div>

              {splitAliases(selectedFaculty.aliases).length > 0 ? (
                <div className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                    Known aliases
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {splitAliases(selectedFaculty.aliases).map((alias) => (
                      <Badge key={alias} tone="neutral" outlined>
                        {alias}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardBody>

            <CardFooter className="flex-col items-stretch gap-3 sm:flex-row">
              <Link
                href={`/admin/faculties/${selectedFaculty.id}`}
                className="inline-flex flex-1 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 py-3 text-sm font-medium text-[var(--color-brand-foreground)] shadow-sm transition-colors hover:bg-[var(--color-brand-strong)]"
              >
                Open record
              </Link>
              <Link
                href="/admin/coaches"
                className="inline-flex flex-1 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-sunken)]"
              >
                Coaches directory
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-[color:var(--color-border)]/80">
            <CardBody className="py-14 text-center">
              <p className="text-lg font-semibold">No faculty selected</p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Pick a card on the left to inspect the linked content and record details.
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
