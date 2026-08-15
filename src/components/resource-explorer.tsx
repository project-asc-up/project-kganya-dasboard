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
        "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors cursor-pointer",
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
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text)] disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
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
                "flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border text-[13px] font-semibold transition cursor-pointer",
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
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text)] disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
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
            className="h-8 appearance-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-0 pl-3 pr-7 text-[13px] font-semibold text-[var(--color-text)] transition hover:border-[var(--color-border-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] cursor-pointer"
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

// ─── Collapsible Table Section ────────────────────────────────────────────────

function TableSection({
  sectionName,
  items,
}: {
  sectionName: string;
  items: ResourceRow[];
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    <section aria-label={sectionName} className="space-y-3">
      {/* Collapsible Section Header */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-expanded={!isCollapsed}
        className="w-full flex items-center justify-between gap-4 p-3 -mx-3 rounded-2xl hover:bg-[var(--color-surface-sunken)]/60 transition-colors text-left group cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
            {sectionName}
          </h3>
          <span className="inline-flex items-center rounded-full bg-[var(--color-brand-soft)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-brand-soft-foreground)]">
            {items.length} resource{items.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]">
          <span>{isCollapsed ? "Expand" : "Collapse"}</span>
          <ChevronDown
            size={20}
            className={cn(
              "transition-transform duration-200 text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]",
              isCollapsed && "-rotate-90"
            )}
          />
        </div>
      </button>

      {/* Table container (collapsible) */}
      {!isCollapsed && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] overflow-hidden shadow-[var(--shadow-xs)] transition-all">
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
      )}
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
      ? resource.faculty.name
      : "DSA";
    const list = acc.get(key) ?? [];
    list.push(resource);
    acc.set(key, list);
    return acc;
  }, new Map());

  const sections = Array.from(grouped.entries()).sort(([a], [b]) => {
    if (a === "DSA") return -1;
    if (b === "DSA") return 1;
    return a.localeCompare(b);
  });

  const allCount = resources.length;

  return (
    <div className="space-y-6">
      {/* Faculty Filter Chips */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-bold text-[var(--color-text)]">
            Faculty filter
          </label>
          <span className="text-xs text-[var(--color-text-muted)]">
            All or a specific faculty
          </span>
        </div>

        {/* Filter Chips Container */}
        <div className="flex flex-wrap items-center gap-2">
          {/* "All faculties" Chip */}
          <button
            type="button"
            onClick={() => setFacultyFilter("all")}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
              facultyFilter === "all"
                ? "bg-[var(--color-brand)] text-white shadow-sm"
                : "bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
            )}
          >
            <span>All faculties</span>
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold leading-none",
                facultyFilter === "all"
                  ? "bg-white/20 text-white"
                  : "bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)]"
              )}
            >
              {allCount}
            </span>
          </button>

          {/* Individual Faculty Chips */}
          {facultyOptions.map((faculty) => {
            const isSelected = facultyFilter === faculty.id;
            const count = resources.filter(
              (r) => r.faculty?.id === faculty.id
            ).length;
            const label = faculty.name;

            return (
              <button
                key={faculty.id}
                type="button"
                onClick={() => setFacultyFilter(faculty.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
                  isSelected
                    ? "bg-[var(--color-brand)] text-white shadow-sm"
                    : "bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
                )}
              >
                <span>{label}</span>
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold leading-none",
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)]"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Sections */}
      <div className="space-y-8 pt-2">
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
