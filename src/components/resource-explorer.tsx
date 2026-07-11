"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText, MapPin } from "lucide-react";

import { Field, Select } from "@/components/admin-form";
import { MetricCard, MetricGrid } from "@/components/metric-card";
import { Button } from "@/components/ui/button";
import { formatReadableDate, type DisplayDateValue } from "@/lib/date-display";
import { displayFacultyName } from "@/lib/faculty-display";
import { buildResourceFacultyOptions, filterResourcesByFaculty } from "@/lib/resource-filters";

type ResourceRow = {
  id: string;
  seedKey: string | null;
  resourceType?: string;
  category: string;
  title: string;
  description: string | null;
  url: string;
  sourceUrl: string | null;
  lastVerified: DisplayDateValue;
  attachmentName?: string | null;
  attachmentStatus?: string | null;
  faculty: { id: string; name: string; code: string } | null;
};

function getHostName(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "External link";
  }
}

export function ResourceExplorer({ resources }: { resources: ResourceRow[] }) {
  const [facultyFilter, setFacultyFilter] = useState("all");

  const facultyOptions = useMemo(() => buildResourceFacultyOptions(resources), [resources]);

  const filteredResources = useMemo(
    () => filterResourcesByFaculty(resources, facultyFilter),
    [facultyFilter, resources],
  );

  const grouped = filteredResources.reduce<Map<string, ResourceRow[]>>((acc, resource) => {
    const key = resource.faculty ? displayFacultyName(resource.faculty.name) : "General";
    const list = acc.get(key) ?? [];
    list.push(resource);
    acc.set(key, list);
    return acc;
  }, new Map());

  const sections = Array.from(grouped.entries()).sort(([left], [right]) => {
    if (left === "General") return -1;
    if (right === "General") return 1;
    return left.localeCompare(right);
  });

  const generalCount = filteredResources.filter((resource) => !resource.faculty).length;

  return (
    <div className="space-y-6">
      <Field label="Faculty filter" hint="All or a specific faculty">
        <Select value={facultyFilter} onChange={(event) => setFacultyFilter(event.target.value)}>
          <option value="all">All faculties</option>
          {facultyOptions.map((faculty) => (
            <option key={faculty.id} value={faculty.id}>
              {displayFacultyName(faculty.name)}
            </option>
          ))}
        </Select>
      </Field>

      <MetricGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard compact label="Total resources" value={filteredResources.length} detail="All support links." className="bg-[color:var(--color-bg-light)]" />
        <MetricCard
          compact
          label="Faculty linked"
          value={filteredResources.length - generalCount}
          detail="Scoped to a faculty."
          className="bg-[color:var(--color-bg-light)]"
        />
        <MetricCard compact label="General library" value={generalCount} detail="Shared support links." className="bg-[color:var(--color-bg-light)]" />
      </MetricGrid>

      <div className="space-y-8">
        {sections.map(([facultyName, items]) => (
          <section key={facultyName} className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-[color:var(--color-primary-dark)]">
                  {facultyName}
                </h3>
                <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                  {items.length} resource{items.length === 1 ? "" : "s"} in this collection.
                </p>
              </div>
              <div className="rounded-full border border-[color:var(--color-border)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                Scrollable cards
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
              {items.map((resource) => (
                <article
                  key={resource.id}
                  className="min-w-[19rem] max-w-[24rem] flex-1 rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-[0_12px_40px_rgba(0,32,80,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(0,32,80,0.08)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-[color:var(--color-bg-light)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-primary-dark)]">
                      {resource.category}
                    </span>
                    <div className="flex flex-wrap justify-end gap-2">
                      {resource.resourceType === "document" ? (
                        <span className="rounded-full bg-[color:var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
                          Document
                        </span>
                      ) : null}
                      <span className="rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs font-medium text-[color:var(--color-text-muted)]">
                        {formatReadableDate(resource.lastVerified)}
                      </span>
                    </div>
                  </div>

                  <h4 className="mt-4 text-lg font-semibold tracking-tight text-[color:var(--color-primary-dark)]">
                    {resource.title}
                  </h4>

                  {resource.description ? (
                    <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">
                      {resource.description}
                    </p>
                  ) : null}

                  <div className="mt-4 space-y-2 text-sm text-[color:var(--color-text-muted)]">
                    {resource.resourceType === "document" ? (
                      <div className="flex items-center gap-2">
                        <FileText size={15} />
                        <span className="truncate">{resource.attachmentName ?? "Uploaded document"}</span>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-2">
                      <FileText size={15} />
                      <span className="truncate">{getHostName(resource.url)}</span>
                    </div>
                    {resource.faculty ? (
                      <div className="flex items-center gap-2">
                        <MapPin size={15} />
                        <span>
                          {resource.faculty.code} - {displayFacultyName(resource.faculty.name)}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                      rounded="full"
                    >
                      <Link href={`/admin/resources/${resource.id}`}>
                        View / edit
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="primary"
                      size="sm"
                      rounded="full"
                    >
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                        <ExternalLink size={14} className="ml-2" />
                      </a>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
