"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard, MetricGrid } from "@/components/metric-card";
import { LiveSearchInput } from "@/components/live-search-input";
import { Button } from "@/components/ui/button";
import { formatIsoDate, type DisplayDateValue } from "@/lib/date-display";
import { displayFacultyName } from "@/lib/faculty-display";
import { cn } from "@/lib/cn";
import { rankSuggestions } from "@/lib/search-suggestions";
import { updateFaculty } from "@/lib/admin-actions";
import { Field, Select, TextArea, TextInput, ActionButton } from "@/components/admin-form";

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return typeof value === "string" ? value.slice(0, 10) : "";
}

type FacultyRow = {
  id: string;
  name: string;
  code: string;
  codeStatus: string;
  officialPageUrl: string | null;
  supportPageUrl: string | null;
  sourceUrl: string | null;
  notes: string | null;
  lastVerified: DisplayDateValue;
  aliases: string | null;
  _count: {
    ascCoaches: number;
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
  const [isEditing, setIsEditing] = useState(false);

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
          <CardBody className="p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_auto] lg:items-center">
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
                  <Button
                    key={item.key}
                    variant={statusFilter === item.key ? "primary" : "secondary"}
                    size="sm"
                    rounded="full"
                    onClick={() => setStatusFilter(item.key)}
                    className="h-10 px-4"
                  >
                    {item.label}
                  </Button>
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
                <Button
                  key={faculty.id}
                  variant="ghost"
                  onClick={() => {
                    setSelectedId(faculty.id);
                    setIsEditing(false);
                  }}
                  className={cn(
                    "w-full text-left transition focus-visible:outline-none h-auto p-0 rounded-[var(--radius-lg)] overflow-hidden",
                    selected ? "scale-[1.01]" : "hover:-translate-y-0.5",
                  )}
                >
                  <Card
                    className={cn(
                      "w-full border transition-all duration-200",
                      selected
                        ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)]/20"
                        : "border-[var(--color-border)] hover:border-[var(--color-brand)]/40",
                    )}
                  >
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-left">{displayFacultyName(faculty.name)}</div>
                        <Badge tone="neutral" outlined>
                          {faculty.code}
                        </Badge>
                      </div>
                      <Badge tone={statusTone(faculty.codeStatus)} outlined>
                        {statusLabel(faculty.codeStatus)}
                      </Badge>
                    </div>
                  </Card>
                </Button>
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

            {isEditing ? (
              <CardBody className="border-t border-[var(--color-border)] pt-5">
                <form 
                  action={async (formData) => {
                    await updateFaculty(selectedFaculty.id, formData);
                    setIsEditing(false);
                  }} 
                  className="grid gap-5"
                >
                  <Field label="Faculty name">
                    <TextInput name="name" defaultValue={selectedFaculty.name} required />
                  </Field>
                  <Field label="Faculty code">
                    <TextInput name="code" defaultValue={selectedFaculty.code} required />
                  </Field>
                  <Field label="Code status">
                    <Select name="codeStatus" defaultValue={selectedFaculty.codeStatus} required>
                      <option value="verified">Verified</option>
                      <option value="review">Needs review</option>
                      <option value="draft">Draft</option>
                    </Select>
                  </Field>
                  <Field label="Last verified">
                    <TextInput name="lastVerified" type="date" defaultValue={formatDate(selectedFaculty.lastVerified)} />
                  </Field>
                  <Field label="Official page URL">
                    <TextInput name="officialPageUrl" type="url" defaultValue={selectedFaculty.officialPageUrl ?? ""} />
                  </Field>
                  <Field label="Support page URL">
                    <TextInput name="supportPageUrl" type="url" defaultValue={selectedFaculty.supportPageUrl ?? ""} />
                  </Field>
                  <Field label="Source URL">
                    <TextInput name="sourceUrl" type="url" defaultValue={selectedFaculty.sourceUrl ?? ""} />
                  </Field>
                  <Field label="Aliases">
                    <TextInput name="aliases" defaultValue={selectedFaculty.aliases ?? ""} />
                  </Field>
                  <Field label="Notes">
                    <TextArea name="notes" defaultValue={selectedFaculty.notes ?? ""} />
                  </Field>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <ActionButton>Save changes</ActionButton>
                  </div>
                </form>
              </CardBody>
            ) : (
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
            )}

            <CardFooter className="flex-col items-stretch gap-3 sm:flex-row">
              <Button
                variant="primary"
                className="flex-1 px-4 py-3 text-sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "View details" : "Toggle edits"}
              </Button>
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
