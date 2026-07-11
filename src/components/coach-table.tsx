"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Field } from "@/components/admin-form";
import { LiveSearchInput } from "@/components/live-search-input";
import { Button } from "@/components/ui/button";
import { coachMatchesQuery } from "@/lib/coach-search";
import { displayFacultyName } from "@/lib/faculty-display";
import { rankSuggestions } from "@/lib/search-suggestions";

type LegacyCoach = {
  id: string;
  name: string;
  role?: string | null;
  email: string;
  facultyId: string | null;
  faculty?: {
    id: string;
    name: string;
    code: string;
  } | null;
  level: string;
};

export function CoachTable({ coaches, faculties }: Readonly<{ coaches: LegacyCoach[]; faculties: LegacyCoach["faculty"][] }>) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCoaches = useMemo(() => {
    if (!searchQuery.trim()) return coaches;
    return coaches.filter(
      (coach) =>
        coachMatchesQuery(
          {
            id: coach.id,
            name: coach.name,
            email: coach.email,
            titleRole: coach.role ?? null,
            cluster: null,
            faculty: {
              id: coach.facultyId ?? "general",
              name: coach.faculty?.name ?? "General",
              code: coach.faculty?.code ?? "GEN",
            },
          },
          searchQuery,
        )
    );
  }, [coaches, searchQuery]);

  const suggestions = useMemo(
    () =>
      rankSuggestions(
        searchQuery,
        coaches.map((coach) => ({
          id: coach.id,
          title: coach.name,
          value: coach.name,
          detail: `${coach.email} · ${displayFacultyName(coach.faculty?.name ?? "General")}`,
          badge: coach.faculty?.code ?? "GEN",
          searchText: [coach.name, coach.email, coach.role, coach.faculty?.name, coach.faculty?.code]
            .filter(Boolean)
            .join(" "),
        })),
        6,
      ),
    [coaches, searchQuery],
  );

  const getFacultyName = (facultyId: string | null) => {
    return displayFacultyName(faculties.find((f) => f?.id === facultyId)?.name || "General");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Field label="Search coaches" hint="By name, role, email, or faculty">
            <LiveSearchInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              suggestionsLoader={() => suggestions}
              placeholder="Search coaches..."
              onSelectSuggestion={(suggestion) => setSearchQuery(suggestion.value)}
            />
          </Field>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
              <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Coach</th>
              <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Role</th>
              <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Faculty</th>
              <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Contact</th>
              <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Level</th>
              <th className="border-b border-[color:var(--color-border)] px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {filteredCoaches.length === 0 ? (
              <tr>
                <td colSpan={6} className="border-b border-[color:var(--color-border)] px-4 py-8 text-center text-[color:var(--color-text-muted)]">
                  No coaches found matching your search
                </td>
              </tr>
            ) : (
              filteredCoaches.map((coach) => (
                <tr key={coach.id} className="align-top hover:bg-[color:var(--color-bg-light)] transition-colors">
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4">
                    <div className="font-semibold text-[color:var(--color-primary-dark)]">{coach.name}</div>
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm">
                    {coach.role}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    {getFacultyName(coach.facultyId)}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    {coach.email}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    {coach.level}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-right">
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                      rounded="full"
                    >
                      <Link href={`/admin/coaches/${coach.id}`}>
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
