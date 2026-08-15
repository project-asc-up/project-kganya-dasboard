"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ExternalLink,
  FileText,
} from "lucide-react";

import { Field, Select } from "@/components/admin-form";
import { Button } from "@/components/ui/button";
import { formatReadableDate, type DisplayDateValue } from "@/lib/date-display";
import { displayFacultyName } from "@/lib/faculty-display";
import {
  buildResourceFacultyOptions,
  filterResourcesByFaculty,
} from "@/lib/resource-filters";
import { cn } from "@/lib/cn";

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

type SortKey = "title" | "faculty" | "description" | "date";
type SortDir = "asc" | "desc";

const ROWS_OPTIONS = [5, 10, 20, 50];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFacultyLabel(resource: ResourceRow) {
  return resource.faculty ? resource.faculty.code : "General";
}

function sortResources(
  items: ResourceRow[],
  key: SortKey,
  dir: SortDir
): ResourceRow[] {
  return [...items].sort((a, b) => {
    let cmp = 0;
    if (key === "title") cmp = a.title.localeCompare(b.title);
    else if (key === "faculty")
      cmp = getFacultyLabel(a).localeCompare(getFacultyLabel(b));
    else if (key === "description")
      cmp = (a.description ?? "").localeCompare(b.description ?? "");
    else if (key === "date") {
      const aDate = a.lastVerified ? String(a.lastVerified) : "";
      const bDate = b.lastVerified ? String(b.lastVerified) : "";
      cmp = aDate.localeCompare(bDate);
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SortButton({
  label,
  sortKey,
  current,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors",
        active
          ? "text-[var(--color-brand)]"
          : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      )}
    >
      {label}
      <ChevronsUpDown
        size={12}
        className={cn(
          "shrink-0 transition-opacity",
          active ? "opacity-100" : "opacity-40"
        )}
      />
    </button>
  );
}

function FacultyBadge({ resource }: { resource: ResourceRow }) {
  const label = resource.faculty ? resource.faculty.code : "GENERAL";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-full)] px-2.5 py-0.5",
        "text-[10px] font-bold uppercase tracking-[0.12em] whitespace-nowrap",
        resource.faculty
          ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-soft-foreground)]"
          : "bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
      )}
    >
      {label}
    </span>
  );
}

function PaginationBar({
  total,
  page,
  rowsPerPage,
  onPage,
  onRowsPerPage,
}: {
  total: number;
  page: number;
  rowsPerPage: number;
  onPage: (p: number) => void;
  onRowsPerPage: (n: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const from = total === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const to = Math.min(page * rowsPerPage, total);

  const pages: (number | "…")[] = [];
  if (totalPages <= 6) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
      <span className="text-[13px] font-medium text-[var(--color-text-muted)]">
        {total === 0
          ? "No resources"
          : `Showing ${from} to ${to} of ${total} resource${total === 1 ? "" : "s"}`}
      </span>

      <div className="flex items-center gap-1.5">
        {/* Prev */}
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text)] disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-[var(--color-text-muted)]">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
              onClick={() => onPage(p as number)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border text-[13px] font-semibold transition",
                p === page
                  ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white"
                  : "border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text)] hover:bg-[var(--color-surface-sunken)]"
              )}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text)] disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Rows per page */}
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-[var(--color-text-muted)] font-medium">Rows per page</span>
        <div className="relative">
          <select
            value={rowsPerPage}
            onChange={(e) => {
              onRowsPerPage(Number(e.target.value));
              onPage(1);
            }}
            className="h-8 appearance-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-0 pl-3 pr-7 text-[13px] font-semibold text-[var(--color-text)] transition hover:border-[var(--color-border-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
          >
            {ROWS_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Table Section ────────────────────────────────────────────────────────────

function TableSection({
  sectionName,
  items,
}: {
  sectionName: string;
  items: ResourceRow[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  const sorted = useMemo(
    () => sortResources(items, sortKey, sortDir),
    [items, sortKey, sortDir]
  );

  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  return (
    <section aria-label={sectionName}>
      {/* Section header */}
      <div className="flex items-end justify-between gap-4 mb-3">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
            {sectionName}
          </h3>
          <p className="mt-0.5 text-sm font-medium text-[var(--color-text-muted)]">
            {items.length} resource{items.length === 1 ? "" : "s"} in this
            collection.
          </p>
        </div>
      </div>

      {/* Table container */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] overflow-hidden shadow-[var(--shadow-xs)]">
        {/* Column headers */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
                <th className="py-3 pl-4 pr-3 text-left w-[32%]">
                  <SortButton
                    label="Title"
                    sortKey="title"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                </th>
                <th className="py-3 px-3 text-left w-[14%]">
                  <SortButton
                    label="Faculty / Unit"
                    sortKey="faculty"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                </th>
                <th className="py-3 px-3 text-left w-[28%]">
                  <SortButton
                    label="Description"
                    sortKey="description"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                </th>
                <th className="py-3 px-3 text-left w-[14%]">
                  <SortButton
                    label="Date"
                    sortKey="date"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                </th>
                <th className="py-3 pl-3 pr-4 text-right w-[12%]">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                    Links
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-sm font-medium text-[var(--color-text-muted)]"
                  >
                    No resources in this section.
                  </td>
                </tr>
              ) : (
                paginated.map((resource) => (
                  <tr
                    key={resource.id}
                    className="group bg-[var(--color-surface-raised)] transition-colors hover:bg-[var(--color-surface-sunken)]/50"
                  >
                    {/* Title */}
                    <td className="py-3 pl-4 pr-3 align-middle">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
                          <FileText size={13} />
                        </span>
                        <span
                          className="font-bold text-[var(--color-text)] truncate"
                          title={resource.title}
                        >
                          {resource.title}
                        </span>
                      </div>
                    </td>

                    {/* Faculty / Unit badge */}
                    <td className="py-3 px-3 align-middle">
                      <FacultyBadge resource={resource} />
                    </td>

                    {/* Description */}
                    <td className="py-3 px-3 align-middle">
                      {resource.description ? (
                        <span
                          className="block text-[13px] text-[var(--color-text-muted)] leading-5 overflow-hidden font-normal"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                          title={resource.description}
                        >
                          {resource.description}
                        </span>
                      ) : (
                        <span className="text-[13px] text-[var(--color-text-muted)] italic opacity-60">
                          No description
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 align-middle">
                      <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-text-muted)] whitespace-nowrap">
                        <Calendar size={13} className="shrink-0 text-[var(--color-text-subtle)]" />
                        <span>{formatReadableDate(resource.lastVerified) || "—"}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 pl-3 pr-4 align-middle">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          asChild
                          variant="secondary"
                          size="sm"
                          className="h-7 px-2.5 text-[12px] font-bold text-[var(--color-text)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-sunken)] whitespace-nowrap"
                        >
                          <Link href={`/admin/resources/${resource.id}`}>
                            View / edit
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="primary"
                          size="sm"
                          className="h-7 px-2.5 text-[12px] font-bold text-white bg-[var(--color-brand)] hover:bg-[var(--color-brand-strong)] whitespace-nowrap"
                        >
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open
                            <ExternalLink size={11} />
                          </a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <PaginationBar
          total={sorted.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPage={setPage}
          onRowsPerPage={(n) => {
            setRowsPerPage(n);
            setPage(1);
          }}
        />
      </div>
    </section>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ResourceExplorer({
  resources,
}: {
  resources: ResourceRow[];
}) {
  const [facultyFilter, setFacultyFilter] = useState("all");

  const facultyOptions = useMemo(
    () => buildResourceFacultyOptions(resources),
    [resources]
  );

  const filtered = useMemo(
    () => filterResourcesByFaculty(resources, facultyFilter),
    [facultyFilter, resources]
  );

  const grouped = filtered.reduce<Map<string, ResourceRow[]>>((acc, resource) => {
    const key = resource.faculty
      ? displayFacultyName(resource.faculty.name)
      : "General";
    const list = acc.get(key) ?? [];
    list.push(resource);
    acc.set(key, list);
    return acc;
  }, new Map());

  const sections = Array.from(grouped.entries()).sort(([a], [b]) => {
    if (a === "General") return -1;
    if (b === "General") return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-6">
      {/* Faculty filter */}
      <Field label="Faculty filter" hint="All or a specific faculty">
        <Select
          value={facultyFilter}
          onChange={(e) => setFacultyFilter(e.target.value)}
        >
          <option value="all">All faculties</option>
          {facultyOptions.map((f) => (
            <option key={f.id} value={f.id}>
              {displayFacultyName(f.name)}
            </option>
          ))}
        </Select>
      </Field>

      {/* Table Sections */}
      <div className="space-y-10">
        {sections.map(([sectionName, items]) => (
          <TableSection key={sectionName} sectionName={sectionName} items={items} />
        ))}

        {sections.length === 0 && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-16 text-center text-sm font-medium text-[var(--color-text-muted)]">
            No resources match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}
