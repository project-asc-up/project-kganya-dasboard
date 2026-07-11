"use client";

import Link from "next/link";
import { ChevronDown, HelpCircle, Tag } from "lucide-react";

import { MetricCard, MetricGrid } from "@/components/metric-card";
import { Button } from "@/components/ui/button";
import { formatReadableDate, type DisplayDateValue } from "@/lib/date-display";
import { displayFacultyName } from "@/lib/faculty-display";

type FaqRow = {
  id: string;
  seedKey: string | null;
  question: string;
  answer: string;
  category: string;
  priority: number | null;
  sourceUrl: string | null;
  lastVerified: DisplayDateValue;
  faculty: { id: string; name: string; code: string } | null;
};

export function FaqExplorer({ faqs }: { faqs: FaqRow[] }) {
  const grouped = faqs.reduce<Map<string, FaqRow[]>>((acc, faq) => {
    const key = faq.faculty ? displayFacultyName(faq.faculty.name) : "General";
    const list = acc.get(key) ?? [];
    list.push(faq);
    acc.set(key, list);
    return acc;
  }, new Map());

  const sections = Array.from(grouped.entries()).sort(([left], [right]) => {
    if (left === "General") return -1;
    if (right === "General") return 1;
    return left.localeCompare(right);
  });

  const generalCount = grouped.get("General")?.length ?? 0;

  return (
    <div className="space-y-6">
      <MetricGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard compact label="Total FAQs" value={faqs.length} detail="All FAQ entries." className="bg-[color:var(--color-bg-light)]" />
        <MetricCard
          compact
          label="Faculty linked"
          value={faqs.length - generalCount}
          detail="Assigned to a faculty."
          className="bg-[color:var(--color-bg-light)]"
        />
        <MetricCard compact label="General answers" value={generalCount} detail="Shared support responses." className="bg-[color:var(--color-bg-light)]" />
      </MetricGrid>

      <div className="space-y-8">
        {sections.map(([facultyName, items]) => (
          <section key={facultyName} className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-[color:var(--color-primary-dark)]">
                  {facultyName}
                </h3>
                <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                  {items.length} answer{items.length === 1 ? "" : "s"} grouped under this faculty.
                </p>
              </div>
              <div className="rounded-full border border-[color:var(--color-border)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                Expand to read
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {items.map((faq) => (
                <article
                  key={faq.id}
                  className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-[0_12px_40px_rgba(0,32,80,0.04)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                        <Tag size={14} />
                        <span>{faq.category}</span>
                      </div>
                      <h4 className="mt-3 text-lg font-semibold tracking-tight text-[color:var(--color-primary-dark)]">
                        {faq.question}
                      </h4>
                    </div>
                    <span className="rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs font-medium text-[color:var(--color-text-muted)]">
                      Priority {faq.priority ?? 0}
                    </span>
                  </div>

                  <details className="group mt-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[color:var(--color-primary-dark)]">
                      <span className="flex items-center gap-2">
                        <HelpCircle size={15} />
                        Answer preview
                      </span>
                      <ChevronDown className="transition group-open:rotate-180" size={16} />
                    </summary>
                    <p className="mt-4 text-sm leading-6 text-[color:var(--color-text-muted)]">
                      {faq.answer}
                    </p>
                  </details>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[color:var(--color-text-muted)]">
                    <span>Verified {formatReadableDate(faq.lastVerified)}</span>
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                      rounded="full"
                    >
                      <Link href={`/admin/faqs/${faq.id}`}>
                        View / edit
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
