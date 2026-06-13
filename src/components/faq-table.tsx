"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { TextInput, Field } from "@/components/admin-form";

export function FaqTable({ faqs, faculties }: Readonly<{ faqs: any[]; faculties: any[] }>) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question?.toLowerCase().includes(q) ||
        faq.answer?.toLowerCase().includes(q) ||
        faq.category?.toLowerCase().includes(q) ||
        faq.faculty?.name?.toLowerCase().includes(q)
    );
  }, [faqs, searchQuery]);

  const getFacultyName = (facultyId: string | null) => {
    if (!facultyId) return "General";
    return faculties.find((f) => f.id === facultyId)?.name || "Unknown";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Field label="Search FAQs" hint="By question, answer, category, or faculty">
            <div className="relative flex items-center">
              <TextInput
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-[color:var(--color-text-muted)]" size={16} />
            </div>
          </Field>
        </div>
      </div>

      <div className="space-y-2">
        {filteredFaqs.length === 0 ? (
          <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] p-8 text-center">
            <p className="text-[color:var(--color-text-muted)]">No FAQs found matching your search</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <div key={faq.id} className="rounded-lg border border-[color:var(--color-border)] bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-[color:var(--color-primary-dark)]">{faq.question}</h3>
                  <p className="mt-2 text-sm text-[color:var(--color-text-muted)] line-clamp-2">{faq.answer}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[color:var(--color-bg-light)] px-3 py-1 text-xs font-semibold text-[color:var(--color-primary-dark)]">
                      {faq.category}
                    </span>
                    <span className="rounded-full bg-white border border-[color:var(--color-border)] px-3 py-1 text-xs font-medium text-[color:var(--color-text-muted)]">
                      {getFacultyName(faq.facultyId)}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/admin/faqs/${faq.id}`}
                  className="flex-shrink-0 rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm font-semibold text-[color:var(--color-primary)] transition hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-bg-light)]"
                >
                  View / edit
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
