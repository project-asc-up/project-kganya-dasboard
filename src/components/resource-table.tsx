"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Field } from "@/components/admin-form";
import { LiveSearchInput } from "@/components/live-search-input";
import { Button } from "@/components/ui/button";
import { displayFacultyName } from "@/lib/faculty-display";
import { rankSuggestions } from "@/lib/search-suggestions";

type ResourceRow = {
  id: string;
  title: string;
  category: string;
  url: string;
  resourceType?: string;
  attachmentName?: string | null;
  facultyId: string | null;
  faculty?: { id: string; name: string; code: string } | null;
};

type FacultyRow = {
  id: string;
  name: string;
  code: string;
};

export function ResourceTable({ resources, faculties }: Readonly<{ resources: ResourceRow[]; faculties: FacultyRow[] }>) {
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

  const suggestions = useMemo(
    () =>
      rankSuggestions(
        searchQuery,
        resources.map((resource) => ({
          id: resource.id,
          title: resource.title,
          value: resource.title,
          detail: `${resource.category} · ${displayFacultyName(resource.faculty?.name ?? "General")}`,
          badge: resource.faculty?.code ?? "General",
          searchText: [resource.title, resource.category, resource.url, resource.faculty?.name, resource.faculty?.code]
            .filter(Boolean)
            .join(" "),
        })),
        6,
      ),
    [resources, searchQuery],
  );

  const getFacultyName = (facultyId: string | null) => {
    if (!facultyId) return "General";
    return faculties.find((f) => f.id === facultyId)?.name || "Unknown";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Field label="Search resources" hint="By title, category, URL, or faculty">
            <LiveSearchInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              suggestionsLoader={() => suggestions}
              placeholder="Search resources..."
              onSelectSuggestion={(suggestion) => setSearchQuery(suggestion.value)}
            />
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
                    {resource.resourceType === "document" ? (
                      <div className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                        {resource.attachmentName ?? "Uploaded document"}
                      </div>
                    ) : null}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4">
                    <span className="rounded-full bg-[color:var(--color-bg-light)] px-3 py-1 text-sm font-semibold text-[color:var(--color-primary-dark)]">
                      {resource.category}
                    </span>
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    {displayFacultyName(getFacultyName(resource.facultyId))}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)] truncate max-w-xs">
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-[color:var(--color-primary)] hover:underline">
                      {resource.url}
                    </a>
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-right">
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                      rounded="full"
                    >
                      <Link href={`/admin/resources/${resource.id}`}>
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
