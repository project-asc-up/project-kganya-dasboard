"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { TextInput, Field } from "@/components/admin-form";

function formatDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "Not set";
}

export function CoachTable({ coaches, faculties }: Readonly<{ coaches: any[]; faculties: any[] }>) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCoaches = useMemo(() => {
    if (!searchQuery.trim()) return coaches;
    const q = searchQuery.toLowerCase();
    return coaches.filter(
      (coach) =>
        coach.name?.toLowerCase().includes(q) ||
        coach.role?.toLowerCase().includes(q) ||
        coach.email?.toLowerCase().includes(q) ||
        coach.faculty?.name?.toLowerCase().includes(q)
    );
  }, [coaches, searchQuery]);

  const getFacultyName = (facultyId: string | null) => {
    return faculties.find((f) => f.id === facultyId)?.name || "General";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Field label="Search coaches" hint="By name, role, email, or faculty">
            <div className="relative flex items-center">
              <TextInput
                placeholder="Search coaches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-[color:var(--color-text-muted)]" size={16} />
            </div>
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
                    <Link
                      href={`/admin/coaches/${coach.id}`}
                      className="inline-flex rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm font-semibold text-[color:var(--color-primary)] transition hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-bg-light)]"
                    >
                      View / edit
                    </Link>
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
