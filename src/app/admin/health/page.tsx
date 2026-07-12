import Link from "next/link";

import { PageHeader, Section } from "@/components/admin-form";
import { MetricCard, MetricGrid } from "@/components/metric-card";
import { getHealthOverview } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

function StatusPill({ label, tone }: { label: string; tone: "good" | "warn" | "bad" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "warn"
        ? "bg-amber-50 text-amber-700"
        : "bg-rose-50 text-rose-700";

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>{label}</span>;
}

export default async function HealthPage() {
  const { data, error } = await getHealthOverview()
    .then((result) => ({ data: result, error: null as string | null }))
    .catch((caught) => ({
      data: {
        totals: {
          faculties: 0,
          coaches: 0,
          programmes: 0,
          modules: 0,
          resources: 0,
          faqs: 0,
        },
        risk: {
          facultyNeedsReview: 0,
          coachInactive: 0,
          coachNeedReview: 0,
          programmeNoDuration: 0,
          moduleNoYearSort: 0,
          resourceNoVerification: 0,
          faqNoVerification: 0,
        },
      },
      error: caught instanceof Error ? caught.message : "Unknown database error",
    }));

  const freshnessSignals: Array<{
    label: string;
    value: number;
    tone: "good" | "warn" | "bad";
    detail: string;
  }> = [
    {
      label: "Faculties needing review",
      value: data.risk.facultyNeedsReview,
      tone: data.risk.facultyNeedsReview > 0 ? "warn" : "good",
      detail: "Records with non-verified status or missing verification dates.",
    },
    {
      label: "Inactive coaches",
      value: data.risk.coachInactive,
      tone: data.risk.coachInactive > 0 ? "warn" : "good",
      detail: "Coach rows marked inactive and hidden from runtime routing.",
    },
    {
      label: "Coach records needing review",
      value: data.risk.coachNeedReview,
      tone: data.risk.coachNeedReview > 0 ? "warn" : "good",
      detail: "Missing verification or a non-standard verification status.",
    },
    {
      label: "Programmes needing duration review",
      value: data.risk.programmeNoDuration,
      tone: data.risk.programmeNoDuration > 0 ? "warn" : "good",
      detail: "Programme records missing duration or verification metadata.",
    },
    {
      label: "Modules needing year review",
      value: data.risk.moduleNoYearSort,
      tone: data.risk.moduleNoYearSort > 0 ? "warn" : "good",
      detail: "Course modules missing year sort or verification metadata.",
    },
    {
      label: "Resources missing verification",
      value: data.risk.resourceNoVerification,
      tone: data.risk.resourceNoVerification > 0 ? "warn" : "good",
      detail: "Support resources that need a freshness check.",
    },
    {
      label: "FAQs missing verification",
      value: data.risk.faqNoVerification,
      tone: data.risk.faqNoVerification > 0 ? "warn" : "good",
      detail: "FAQ entries without a recent verification date.",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Health & Quality"
        description="Monitor database consistency, verification freshness, and data quality across all content types."
      />

      {error ? (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger-foreground)]"
        >
          <p className="font-medium">Live health checks are temporarily unavailable.</p>
          <p className="mt-0.5 text-xs opacity-80">
            The database could not be reached while loading this page. The metrics below are showing zero until the
            connection recovers. ({error})
          </p>
        </div>
      ) : null}

      <MetricGrid className="items-stretch md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard label="Faculties" value={data.totals.faculties} detail="Master faculty records." />
        <MetricCard label="Coaches" value={data.totals.coaches} detail="Faculty-linked ASC contacts." />
        <MetricCard label="Programmes" value={data.totals.programmes} detail="Programme master data." />
        <MetricCard label="Modules" value={data.totals.modules} detail="Curriculum rows by programme." />
        <MetricCard label="Resources" value={data.totals.resources} detail="General and faculty resources." />
        <MetricCard label="FAQs" value={data.totals.faqs} detail="Support questions and answers." />
      </MetricGrid>

      <Section
        title="Freshness and risk signals"
        description="These checks help editors see which records need a verification pass."
      >
        <MetricGrid className="md:grid-cols-2 xl:grid-cols-3">
          {freshnessSignals.map((item) => (
            <MetricCard
              key={item.label}
              compact
              label={item.label}
              value={item.value}
              detail={item.detail}
              meta={
                <StatusPill
                  label={item.value === 0 ? "Clear" : "Needs attention"}
                  tone={item.tone}
                />
              }
              className="bg-[color:var(--color-bg-light)]"
            />
          ))}
        </MetricGrid>
      </Section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Section title="Sync status" description="Use these controls and links to verify the operational surface.">
          <div className="space-y-4 text-sm leading-6 text-[color:var(--color-text-muted)]">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--color-border)] bg-white p-4">
              <div>
                <div className="font-semibold text-[color:var(--color-primary-dark)]">Database connection</div>
                <div>Verified through `/api/health` and Prisma server rendering.</div>
              </div>
              <StatusPill label="Healthy" tone="good" />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--color-border)] bg-white p-4">
              <div>
                <div className="font-semibold text-[color:var(--color-primary-dark)]">Revalidation</div>
                <div>Admin actions refresh the relevant routes after mutation.</div>
              </div>
              <StatusPill label="Ready" tone="good" />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--color-border)] bg-white p-4">
              <div>
                <div className="font-semibold text-[color:var(--color-primary-dark)]">Runtime endpoint</div>
                <div>Bot-facing health check remains available at `/api/health`.</div>
              </div>
              <Link
                href="/api/health"
                className="inline-flex rounded-full border border-[color:var(--color-border)] px-4 py-2 font-semibold text-[color:var(--color-primary)] transition hover:border-[color:var(--color-primary)]"
              >
                Open JSON
              </Link>
            </div>
          </div>
        </Section>

        <Section title="Operational notes" description="What to look for during local testing and maintenance.">
          <ul className="space-y-3 text-sm leading-6 text-[color:var(--color-text-muted)]">
            <li>1. Use the dashboard counts to confirm seeded data is present.</li>
            <li>2. Inspect the warning cards for missing verification or stale records.</li>
            <li>3. Use the refresh button after edits to force the page to rerender cleanly.</li>
            <li>4. Keep `lastVerified` populated for records that reflect public UP pages.</li>
          </ul>
        </Section>
      </div>
    </div>
  );
}
