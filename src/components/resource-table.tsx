"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { TextInput, Field } from "@/components/admin-form";

export function ResourceTable({ resources, faculties }: Readonly<{ resources: any[]; faculties: any[] }>) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResources = useMemo(() => {
    if (!searchQuery.trim()) return resources;
    const q = searchQuery.toLowerCase();
    return resources.filter(
      (resource) =>
        resource.title?.toLowerCase().includes(q) ||
        resource.category?.toLowerCase().includes(q) ||
        resource.url?.toLowerCase().includes(q) ||
        resource.faculty?.name?.toLowerCase().includes(q)
    );
  }, [resources, searchQuery]);

  const getFacultyName = (facultyId: string | null) => {
    if (!facultyId) return "General";
    return faculties.find((f) => f.id === facultyId)?.name || "Unknown";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Field label="Search resources" hint="By title, category, URL, or faculty">
            <div className="relative flex items-center">
              <TextInput
                placeholder="Search resources..."
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
              <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Title</th>
              <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Category</th>
              <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">Faculty</th>
              <th className="border-b border-[color:var(--color-border)] px-4 py-4 font-semibold">URL</th>
              <th className="border-b border-[color:var(--color-border)] px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {filteredResources.length === 0 ? (
              <tr>
                <td colSpan={5} className="border-b border-[color:var(--color-border)] px-4 py-8 text-center text-[color:var(--color-text-muted)]">
                  No resources found matching your search
                </td>
              </tr>
            ) : (
              filteredResources.map((resource) => (
                <tr key={resource.id} className="align-top hover:bg-[color:var(--color-bg-light)] transition-colors">
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4">
                    <div className="font-semibold text-[color:var(--color-primary-dark)]">{resource.title}</div>
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4">
                    <span className="rounded-full bg-[color:var(--color-bg-light)] px-3 py-1 text-sm font-semibold text-[color:var(--color-primary-dark)]">
                      {resource.category}
                    </span>
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    {getFacultyName(resource.facultyId)}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)] truncate max-w-xs">
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-[color:var(--color-primary)] hover:underline">
                      {resource.url}
                    </a>
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-right">
                    <Link
                      href={`/admin/resources/${resource.id}`}
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
