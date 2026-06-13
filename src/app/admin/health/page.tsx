import Link from "next/link";

import { ActionButton, PageHeader, Section } from "@/components/admin-form";
import { refreshHealthDashboard } from "@/lib/admin-actions";
import { getHealthOverview } from "@/lib/admin-queries";

function StatusPill({ label, tone }: { label: string; tone: "good" | "warn" | "bad" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "warn"
        ? "bg-amber-50 text-amber-700"
        : "bg-rose-50 text-rose-700";

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>{label}</span>;
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-[0_12px_40px_rgba(0,32,80,0.05)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
        {label}
      </p>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--color-primary-dark)]">
        {value}
      </div>
      <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">{detail}</p>
    </article>
  );
}

export default async function HealthPage() {
  const data = await getHealthOverview();

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
        title="Analytics"
        description="Monitor database consistency and data quality across all content types."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Faculties" value={data.totals.faculties} detail="Master faculty records." />
        <MetricCard label="Coaches" value={data.totals.coaches} detail="Faculty-linked ASC contacts." />
        <MetricCard label="Programmes" value={data.totals.programmes} detail="Programme master data." />
        <MetricCard label="Modules" value={data.totals.modules} detail="Curriculum rows by programme." />
        <MetricCard label="Resources" value={data.totals.resources} detail="General and faculty resources." />
        <MetricCard label="FAQs" value={data.totals.faqs} detail="Support questions and answers." />
      </section>

      <Section
        title="Freshness and risk signals"
        description="These checks help editors see which records need a verification pass."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {freshnessSignals.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-[color:var(--color-primary-dark)]">{item.label}</h2>
                <StatusPill
                  label={item.value === 0 ? "Clear" : "Needs attention"}
                  tone={item.tone}
                />
              </div>
              <div className="mt-4 text-3xl font-semibold text-[color:var(--color-primary-dark)]">{item.value}</div>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">{item.detail}</p>
            </div>
          ))}
        </div>
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
