"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { TextInput, Field } from "@/components/admin-form";

function formatDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "Not set";
}

export function ProgrammeTable({ programmes, faculties }: Readonly<{ programmes: any[]; faculties: any[] }>) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProgrammes = useMemo(() => {
    if (!searchQuery.trim()) return programmes;
    const q = searchQuery.toLowerCase();
    return programmes.filter(
      (prog) =>
        prog.programmeName?.toLowerCase().includes(q) ||
        prog.programmeCode?.toLowerCase().includes(q) ||
        prog.degreeName?.toLowerCase().includes(q) ||
        prog.faculty?.name?.toLowerCase().includes(q)
    );
  }, [programmes, searchQuery]);

  const getFacultyName = (facultyId: string) => {
    return faculties.find((f) => f.id === facultyId)?.name || "Unknown";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Field label="Search programmes" hint="By code, name, degree, or faculty">
            <div className="relative flex items-center">
              <TextInput
                placeholder="Search programmes..."
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
                <td colSpan={6} className="border-b border-[color:var(--color-border)] px-4 py-8 text-center text-[color:var(--color-text-muted)]">
                  No programmes found matching your search
                </td>
              </tr>
            ) : (
              filteredProgrammes.map((programme) => (
                <tr key={programme.id} className="align-top hover:bg-[color:var(--color-bg-light)] transition-colors">
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
                    <Link
                      href={`/admin/programmes/${programme.id}`}
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
