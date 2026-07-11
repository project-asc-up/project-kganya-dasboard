"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { LiveSearchInput } from "@/components/live-search-input";
import { Button } from "@/components/ui/button";
import { formatIsoDate, type DisplayDateValue } from "@/lib/date-display";
import { displayFacultyName } from "@/lib/faculty-display";
import { rankSuggestions } from "@/lib/search-suggestions";

type FacultyRow = {
  id: string;
  name: string;
  code: string;
  codeStatus: string;
  aliases: string | null;
  lastVerified: DisplayDateValue;
  _count: {
    ascCoaches: number;
    programmes: number;
    resources: number;
    faqs: number;
  };
};

export function FacultyTable({ faculties }: { faculties: FacultyRow[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaculties = useMemo(() => {
    if (!searchQuery.trim()) return faculties;

    const query = searchQuery.toLowerCase();
    return faculties.filter((faculty) =>
      faculty.name.toLowerCase().includes(query) ||
      faculty.code.toLowerCase().includes(query) ||
      faculty.aliases?.toLowerCase().includes(query)
    );
  }, [faculties, searchQuery]);

  const suggestions = useMemo(
    () =>
      rankSuggestions(
        searchQuery,
        faculties.map((faculty) => ({
          id: faculty.id,
          title: displayFacultyName(faculty.name),
          value: faculty.name,
          detail: `${faculty.code} · ${faculty.codeStatus}`,
          badge: faculty.code,
          searchText: [faculty.name, faculty.code, faculty.aliases, faculty.codeStatus].filter(Boolean).join(" "),
        })),
        6,
      ),
    [faculties, searchQuery],
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="w-full sm:w-64">
          <LiveSearchInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            suggestionsLoader={() => suggestions}
            placeholder="Search faculties..."
            onSelectSuggestion={(suggestion) => setSearchQuery(suggestion.value)}
          />
        </div>
      </div>

      {filteredFaculties.length === 0 && searchQuery ? (
        <div className="text-center py-8 text-[color:var(--color-text-muted)]">
            No faculties found matching &quot;{searchQuery}&quot;
          </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
                <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Faculty</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Code</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Status</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Linked content</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Verified</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculties.map((faculty) => (
                <tr key={faculty.id} className="align-top hover:bg-[color:var(--color-bg-light)] transition-colors">
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4">
                    <div className="font-semibold text-[color:var(--color-primary-dark)]">{displayFacultyName(faculty.name)}</div>
                    {faculty.aliases ? (
                      <div className="mt-1 text-xs text-[color:var(--color-text-muted)]">{faculty.aliases}</div>
                    ) : null}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4">
                    <span className="rounded-full bg-[color:var(--color-bg-light)] px-3 py-1 text-sm font-semibold text-[color:var(--color-primary-dark)]">
                      {faculty.code}
                    </span>
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm">
                    {faculty.codeStatus}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    Coaches {faculty._count.ascCoaches} | Programmes {faculty._count.programmes} | Resources{" "}
                    {faculty._count.resources} | FAQs {faculty._count.faqs}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    {formatIsoDate(faculty.lastVerified, "Not set")}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-right">
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                      rounded="full"
                    >
                      <Link href={`/admin/faculties/${faculty.id}`}>
                        View / edit
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
