"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Field } from "@/components/admin-form";
import { LiveSearchInput } from "@/components/live-search-input";
import { Button } from "@/components/ui/button";
import { displayFacultyName } from "@/lib/faculty-display";
import { rankSuggestions } from "@/lib/search-suggestions";

type ProgrammeRow = {
  id: string;
  programmeName: string;
  programmeCode: string;
  degreeName: string | null;
  facultyId: string | null;
  faculty?: { id: string; name: string; code: string } | null;
  _count?: {
    courseModules?: number;
  };
};

type FacultyRow = {
  id: string;
  name: string;
  code: string;
};

export function ProgrammeTable({
  programmes,
  faculties,
}: Readonly<{ programmes: ProgrammeRow[]; faculties: FacultyRow[] }>) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProgrammes = useMemo(() => {
    if (!searchQuery.trim()) return programmes;
    const q = searchQuery.toLowerCase();
    return programmes.filter(
      (programme) =>
        programme.programmeName?.toLowerCase().includes(q) ||
        programme.programmeCode?.toLowerCase().includes(q) ||
        programme.degreeName?.toLowerCase().includes(q) ||
        programme.faculty?.name?.toLowerCase().includes(q),
    );
  }, [programmes, searchQuery]);

  const suggestions = useMemo(
    () =>
      rankSuggestions(
        searchQuery,
        programmes.map((programme) => ({
          id: programme.id,
          title: `${programme.programmeCode} · ${programme.programmeName}`,
          value: programme.programmeName ?? programme.programmeCode,
          detail: `${displayFacultyName(programme.faculty?.name ?? "Unknown")} · ${programme.degreeName ?? "No degree"}`,
          badge: programme.programmeCode,
          searchText: [
            programme.programmeName,
            programme.programmeCode,
            programme.degreeName,
            programme.faculty?.name,
          ]
            .filter(Boolean)
            .join(" "),
        })),
        6,
      ),
    [programmes, searchQuery],
  );

  const getFacultyName = (facultyId: string | null) => {
    if (!facultyId) return "General";
    return displayFacultyName(faculties.find((f) => f.id === facultyId)?.name || "Unknown");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Field label="Search programmes" hint="By code, name, degree, or faculty">
            <LiveSearchInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              suggestionsLoader={() => suggestions}
              placeholder="Search programmes..."
              onSelectSuggestion={(suggestion) => setSearchQuery(suggestion.value)}
            />
          </Field>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
              <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Programme</th>
              <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Code</th>
              <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Faculty</th>
              <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Degree</th>
              <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Modules</th>
              <th className="border-b border-[color:var(--color-border)] px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {filteredProgrammes.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="border-b border-[color:var(--color-border)] px-4 py-8 text-center text-[color:var(--color-text-muted)]"
                >
                  No programmes found matching your search
                </td>
              </tr>
            ) : (
              filteredProgrammes.map((programme) => (
                <tr key={programme.id} className="align-top transition-colors hover:bg-[color:var(--color-bg-light)]">
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4">
                    <div className="font-semibold text-[color:var(--color-primary-dark)]">{programme.programmeName}</div>
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4">
                    <span className="rounded-full bg-[color:var(--color-bg-light)] px-3 py-1 text-sm font-semibold text-[color:var(--color-primary-dark)]">
                      {programme.programmeCode}
                    </span>
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    {getFacultyName(programme.facultyId)}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    {programme.degreeName || "—"}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    {programme._count?.courseModules || 0}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-right">
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                      rounded="full"
                    >
                      <Link href={`/admin/programmes/${programme.id}`}>
                        View / edit
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
