import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/admin-form";
import { MetricCard, MetricGrid } from "@/components/metric-card";
import { getHealthOverview } from "@/lib/admin-queries";

const shortcuts = [
  {
    href: "/admin/faculties",
    label: "Faculties",
    description: "Manage faculty master records and verification metadata.",
  },
  {
    href: "/admin/coaches",
    label: "ASC Coaches",
    description: "Maintain coach contact details and active assignments.",
  },
  {
    href: "/admin/programmes",
    label: "Programmes",
    description: "Review programme metadata and curriculum links.",
  },
];

export default async function AdminHomePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Academic Success Coaches admin dashboard"
        description="Use this workspace to keep the core support content accurate, linked, and ready for the bot."
      />

      <Suspense fallback={<AdminMetricsFallback />}>
        <AdminOverviewMetrics />
      </Suspense>

      <section className="grid gap-4 lg:grid-cols-3 animate-slide-up">
        {shortcuts.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-md)] animate-slide-up focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2"
            style={
              {
                "--animation-delay": `${200 + index * 50}ms`,
              } as React.CSSProperties
            }
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">Quick access</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text)]">{item.label}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">{item.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

async function AdminOverviewMetrics() {
  const { totals: counts, error } = await getHealthOverview()
    .then((data) => ({ totals: data.totals, error: null as string | null }))
    .catch((caught) => ({
      totals: { faculties: 0, coaches: 0, programmes: 0, resources: 0, faqs: 0 },
      error: caught instanceof Error ? caught.message : "Unknown database error",
    }));

  const metricItems = [
    { label: "Faculties", value: counts.faculties, detail: "Master faculty records in the workspace." },
    { label: "ASC Coaches", value: counts.coaches, detail: "Faculty-linked contact records." },
    { label: "Programmes", value: counts.programmes, detail: "Programme master records and links." },
    { label: "Resources", value: counts.resources, detail: "Support links and reference material." },
    { label: "FAQs", value: counts.faqs, detail: "Searchable knowledge-base entries." },
  ];

  return (
    <>
      {error ? (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger-foreground)]"
        >
          <p className="font-medium">Live counts are temporarily unavailable.</p>
          <p className="mt-0.5 text-xs opacity-80">
            The database could not be reached. Counts below show zero until the connection is restored. ({error})
          </p>
        </div>
      ) : null}

      <MetricGrid className="md:grid-cols-2 xl:grid-cols-5 animate-slide-up">
        {metricItems.map((item, index) => (
          <MetricCard
            key={item.label}
            label={item.label}
            value={item.value}
            detail={item.detail}
            className="animate-slide-up bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-md)]"
            valueClassName="text-[color:var(--color-brand-strong)]"
            style={
              {
                "--animation-delay": `${index * 50}ms`,
              } as React.CSSProperties
            }
          />
        ))}
      </MetricGrid>
    </>
  );
}

function AdminMetricsFallback() {
  return (
    <MetricGrid className="md:grid-cols-2 xl:grid-cols-5 animate-slide-up">
      {["Faculties", "ASC Coaches", "Programmes", "Resources", "FAQs"].map((label) => (
        <MetricCard
          key={label}
          label={label}
          value="..."
          detail="Loading workspace count."
          className="animate-pulse bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)]"
          valueClassName="text-[color:var(--color-brand-strong)]"
        />
      ))}
    </MetricGrid>
  );
}
