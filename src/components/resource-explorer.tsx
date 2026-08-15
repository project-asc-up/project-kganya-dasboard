"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart2,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Cog,
  ExternalLink,
  FileText,
  Filter,
  GraduationCap,
  Heart,
  Landmark,
  LayoutGrid,
  PawPrint,
  Scale,
  User,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatReadableDate, type DisplayDateValue } from "@/lib/date-display";
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

// ─── Faculty Color & Icon Helper ──────────────────────────────────────────────

function getFacultyTheme(sectionName: string) {
  const name = sectionName.toLowerCase();
  if (name.includes("dsa")) {
    return {
      bg: "bg-purple-100",
      text: "text-purple-600",
      icon: Landmark,
    };
  }
  if (
    name.includes("economic") ||
    name.includes("management") ||
    name.includes("ems")
  ) {
    return {
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      icon: BarChart2,
    };
  }
  if (name.includes("education")) {
    return {
      bg: "bg-amber-100",
      text: "text-amber-600",
      icon: GraduationCap,
    };
  }
  if (
    name.includes("engineering") ||
    name.includes("built environment") ||
    name.includes("information technology") ||
    name.includes("ebit")
  ) {
    return {
      bg: "bg-blue-100",
      text: "text-blue-600",
      icon: Cog,
    };
  }
  if (name.includes("health")) {
    return {
      bg: "bg-rose-100",
      text: "text-rose-600",
      icon: Heart,
    };
  }
  if (name.includes("law")) {
    return {
      bg: "bg-indigo-100",
      text: "text-indigo-600",
      icon: Scale,
    };
  }
  if (name.includes("theology") || name.includes("religion")) {
    return {
      bg: "bg-teal-100",
      text: "text-teal-600",
      icon: BookOpen,
    };
  }
  if (name.includes("veterinary")) {
    return {
      bg: "bg-orange-100",
      text: "text-orange-600",
      icon: PawPrint,
    };
  }
  if (name.includes("gordon") || name.includes("gibs")) {
    return {
      bg: "bg-slate-100",
      text: "text-slate-700",
      icon: Briefcase,
    };
  }
  return {
    bg: "bg-blue-100",
    text: "text-blue-600",
    icon: Building2,
  };
}

function getFacultyIcon(facultyName: string) {
  const name = facultyName.toLowerCase();
  if (name.includes("engineering") || name.includes("built environment") || name.includes("ebit")) return Cog;
  if (name.includes("education")) return GraduationCap;
  if (name.includes("economic") || name.includes("management") || name.includes("ems")) return BarChart2;
  if (name.includes("gordon") || name.includes("gibs")) return Briefcase;
  if (name.includes("health")) return Heart;
  if (name.includes("law")) return Scale;
  if (name.includes("theology") || name.includes("religion")) return BookOpen;
  if (name.includes("veterinary")) return PawPrint;
  return Building2;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFacultyLabel(resource: ResourceRow) {
  return resource.faculty ? resource.faculty.name : "DSA";
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
        "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors cursor-pointer",
        active
          ? "text-[var(--color-brand)]"
          : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      )}
    >
      {label}
      <ChevronsUpDown
        size={12}
        className={cn(
          "transition-opacity",
          active ? "opacity-100" : "opacity-40"
        )}
      />
    </button>
  );
}

function FacultyBadge({ resource }: { resource: ResourceRow }) {
  const label = resource.faculty ? resource.faculty.name : "DSA";
  const theme = getFacultyTheme(label);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap",
        theme.bg,
        theme.text
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
  const to = Math.min(total, page * rowsPerPage);

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between text-xs">
      <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
        <span>Rows per page:</span>
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPage(Number(e.target.value))}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1 font-semibold text-[var(--color-text)] outline-none cursor-pointer"
        >
          {ROWS_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span className="ml-2 font-medium">
          {from}–{to} of {total}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft size={14} />
        </Button>
        <span className="px-2 font-semibold text-[var(--color-text)]">
          {page} / {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="h-7 w-7 p-0"
        >
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}

// ─── Table Section ─────────────────────────────────────────────────────────────

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

  const theme = getFacultyTheme(sectionName);
  const IconComponent = theme.icon;

  return (
    <section aria-label={sectionName} className="space-y-3">
      {/* Collapsible Bar Card matching reference image */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-expanded={!isCollapsed}
        className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between gap-4 text-left group cursor-pointer"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Round Icon Circle */}
          <div className={cn("p-2.5 rounded-full shrink-0", theme.bg, theme.text)}>
            <IconComponent size={20} />
          </div>

          {/* Title and Count Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="text-base sm:text-lg font-extrabold text-[#0b1521] tracking-tight truncate">
              {sectionName}
            </h3>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-xs font-extrabold text-[#005baa] whitespace-nowrap">
              {items.length} {items.length === 1 ? "resource" : "resources"}
            </span>
          </div>
        </div>

        {/* Expand / Collapse Toggle */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 group-hover:text-[#005baa] transition-colors shrink-0">
          <span>{isCollapsed ? "Expand" : "Collapse"}</span>
          <ChevronDown
            size={18}
            className={cn(
              "transition-transform duration-200 text-slate-500 group-hover:text-[#005baa]",
              !isCollapsed && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Table container (collapsible) */}
      {!isCollapsed && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs transition-all">
          {/* Column headers */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-3 pl-4 pr-3 text-left w-[32%]">
                    <SortButton
                      label="Title"
                      sortKey="title"
                      current={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="py-3 px-3 text-left w-[18%]">
                    <SortButton
                      label="Faculty / Unit"
                      sortKey="faculty"
                      current={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="py-3 px-3 text-left w-[24%]">
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
              <tbody className="divide-y divide-slate-200">
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-sm font-medium text-slate-500"
                    >
                      No resources in this section.
                    </td>
                  </tr>
                ) : (
                  paginated.map((resource) => (
                    <tr
                      key={resource.id}
                      className="group bg-white transition-colors hover:bg-slate-50"
                    >
                      {/* Title */}
                      <td className="py-3.5 pl-4 pr-3 align-middle">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#e6f0fa] text-[#005baa]">
                            <FileText size={14} />
                          </span>
                          <span
                            className="font-bold text-slate-900 truncate"
                            title={resource.title}
                          >
                            {resource.title}
                          </span>
                        </div>
                      </td>

                      {/* Faculty / Unit badge */}
                      <td className="py-3.5 px-3 align-middle">
                        <FacultyBadge resource={resource} />
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-3 align-middle">
                        {resource.description ? (
                          <span
                            className="block text-[13px] text-slate-600 leading-5 overflow-hidden font-medium"
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
                          <span className="text-[13px] text-slate-400 italic">
                            No description
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 align-middle">
                        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 whitespace-nowrap">
                          <Calendar size={13} className="shrink-0 text-slate-400" />
                          <span>{formatReadableDate(resource.lastVerified) || "—"}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-3 pr-4 align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            asChild
                            variant="secondary"
                            size="sm"
                            className="h-7 px-2.5 text-[12px] font-bold text-slate-800 border border-slate-300 hover:bg-slate-100 whitespace-nowrap"
                          >
                            <Link href={`/admin/resources/${resource.id}`}>
                              View / edit
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="primary"
                            size="sm"
                            className="h-7 px-2.5 text-[12px] font-bold text-white bg-[#005baa] hover:bg-[#00457f] whitespace-nowrap"
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
      {/* Top Faculty Filter Box matching exact reference image */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-extrabold text-slate-900 text-sm">
            <Filter size={16} className="text-slate-700" />
            <span>Filter by faculty</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <User size={14} className="text-slate-400" />
            <span>All or a specific faculty</span>
          </div>
        </div>

        {/* Filter Chips Container matching reference image */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* "All faculties" Chip */}
          <button
            type="button"
            onClick={() => setFacultyFilter("all")}
            className={cn(
              "inline-flex items-center gap-2.5 rounded-[1.25rem] px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer border",
              facultyFilter === "all"
                ? "bg-[#005baa] text-white border-[#005baa] shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-slate-200"
            )}
          >
            <LayoutGrid size={15} />
            <span>All faculties</span>
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-black leading-none",
                facultyFilter === "all"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
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
            const ChipIcon = getFacultyIcon(label);

            return (
              <button
                key={faculty.id}
                type="button"
                onClick={() => setFacultyFilter(faculty.id)}
                className={cn(
                  "inline-flex items-center gap-2.5 rounded-[1.25rem] px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer border",
                  isSelected
                    ? "bg-[#005baa] text-white border-[#005baa] shadow-sm"
                    : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-slate-200"
                )}
              >
                <ChipIcon size={15} />
                <span>{label}</span>
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-black leading-none",
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Sections matching reference image */}
      <div className="space-y-4 pt-1">
        {sections.map(([sectionName, items]) => (
          <TableSection key={sectionName} sectionName={sectionName} items={items} />
        ))}

        {sections.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-sm font-semibold text-slate-500">
            No resources match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}
