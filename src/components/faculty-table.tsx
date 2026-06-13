'use client';

import Link from "next/link";
import { useState, useMemo } from 'react';
import { TextInput } from "@/components/admin-form";

function formatDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "Not set";
}

export function FacultyTable({ faculties }: { faculties: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaculties = useMemo(() => {
    if (!searchQuery.trim()) return faculties;
    
    const query = searchQuery.toLowerCase();
    return faculties.filter(faculty => 
      faculty.name.toLowerCase().includes(query) ||
      faculty.code.toLowerCase().includes(query) ||
      faculty.aliases?.toLowerCase().includes(query)
    );
  }, [faculties, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="w-full sm:w-64">
          <TextInput
            name="search"
            placeholder="Search faculties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredFaculties.length === 0 && searchQuery ? (
        <div className="text-center py-8 text-[color:var(--color-text-muted)]">
          No faculties found matching "{searchQuery}"
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
                    <div className="font-semibold text-[color:var(--color-primary-dark)]">{faculty.name}</div>
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
                    {formatDate(faculty.lastVerified)}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-right">
                    <Link
                      href={`/admin/faculties/${faculty.id}`}
                      className="inline-flex rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm font-semibold text-[color:var(--color-primary)] transition hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-bg-light)]"
                    >
                      View / edit
                    </Link>
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
