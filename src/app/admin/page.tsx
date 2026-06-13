import Link from "next/link";

import { PageHeader } from "@/components/admin-form";
import { getPrismaClient } from "@/lib/prisma";

async function getOverviewCounts() {
  const prisma = getPrismaClient();
  const [faculties, coaches, programmes, resources, faqs] = await Promise.all([
    prisma.faculty.count(),
    prisma.ascCoach.count(),
    prisma.programme.count(),
    prisma.resource.count(),
    prisma.faq.count(),
  ]);

  return { faculties, coaches, programmes, resources, faqs };
}

const shortcuts = [
  { href: "/admin/faculties", label: "Faculties", description: "Manage faculty master records and verification metadata." },
  { href: "/admin/coaches", label: "ASC Coaches", description: "Maintain coach contact details and active assignments." },
  { href: "/admin/programmes", label: "Programmes", description: "Review programme metadata and curriculum links." },
];

export default async function AdminHomePage() {
  const counts = await getOverviewCounts();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Project ASC admin dashboard"
        description="Use this workspace to keep the core support content accurate, linked, and ready for the bot."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 animate-slide-up">
        {[
          { label: "Faculties", value: counts.faculties },
          { label: "ASC Coaches", value: counts.coaches },
          { label: "Programmes", value: counts.programmes },
          { label: "Resources", value: counts.resources },
          { label: "FAQs", value: counts.faqs },
        ].map((item, index) => (
          <article
            key={item.label}
            className="rounded-lg border border-[color:var(--color-border)] bg-white p-5 animate-slide-up"
            style={{
              "--animation-delay": `${index * 50}ms`,
            } as React.CSSProperties}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
              {item.label}
            </p>
            <div className="mt-3 text-3xl font-semibold text-[color:var(--color-primary-dark)]">{item.value}</div>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3 animate-slide-up">
        {shortcuts.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-[color:var(--color-border)] bg-white p-6 transition animate-slide-up"
            style={{
              "--animation-delay": `${200 + index * 50}ms`,
            } as React.CSSProperties}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent-ochre)]">
              Quick access
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--color-primary-dark)]">
              {item.label}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--color-text-muted)]">{item.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
