"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { PageHeader, Section } from "@/components/admin-form";

// This would fetch from actual data sources
async function searchAcrossAllTables(query: string) {
  // Placeholder - in real app would query actual tables
  return {
    faculties: [],
    coaches: [],
    programmes: [],
    resources: [],
    faqs: [],
  };
}

type SearchResult = {
  id: string;
  type: "faculty" | "coach" | "programme" | "resource" | "faq";
  title: string;
  subtitle?: string;
  href: string;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Client-side search results - would be hydrated from server
  const mockResults = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    
    const q = query.toLowerCase();
    // Mock data for demonstration
    return [
      {
        id: "1",
        type: "faculty",
        title: "Faculty of Engineering",
        subtitle: "Code: ENG",
        href: "/admin/faculties/1",
      },
      {
        id: "2",
        type: "coach",
        title: "Dr. Jane Smith",
        subtitle: "Mathematics Coach - Faculty of Science",
        href: "/admin/coaches/2",
      },
      {
        id: "3",
        type: "programme",
        title: "BSc Computer Science",
        subtitle: "Faculty of Engineering - 3 Years",
        href: "/admin/programmes/3",
      },
    ].filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle?.toLowerCase().includes(q)
    );
  }, [query]);

  const typeLabels = {
    faculty: "Faculty",
    coach: "Coach",
    programme: "Programme",
    resource: "Resource",
    faq: "FAQ",
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Search Results${query ? `: "${query}"` : ""}`}
        description="Results across faculties, coaches, programmes, resources, and FAQs"
      />

      <Section title="Results" description={`Found ${mockResults.length} result${mockResults.length !== 1 ? "s" : ""}`}>
        {mockResults.length === 0 ? (
          <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] p-8 text-center">
            <Search className="mx-auto mb-3 text-[color:var(--color-text-muted)]" size={32} />
            <p className="text-[color:var(--color-text-muted)]">
              {query ? `No results found for "${query}"` : "Enter a search term to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {mockResults.map((result) => (
              <Link
                key={`${result.type}-${result.id}`}
                href={result.href}
                className="block rounded-lg border border-[color:var(--color-border)] bg-white p-4 transition hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-bg-light)]"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[color:var(--color-primary-dark)]">{result.title}</h3>
                    {result.subtitle && (
                      <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">{result.subtitle}</p>
                    )}
                  </div>
                  <span className="ml-4 flex-shrink-0 rounded-full bg-[color:var(--color-bg-light)] px-3 py-1 text-xs font-semibold text-[color:var(--color-primary)]">
                    {typeLabels[result.type]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
