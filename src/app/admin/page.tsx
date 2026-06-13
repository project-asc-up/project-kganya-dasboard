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
          { label: "Faculties", value: counts.faculties, color: "primary" },
          { label: "ASC Coaches", value: counts.coaches, color: "ochre" },
          { label: "Programmes", value: counts.programmes, color: "red" },
          { label: "Resources", value: counts.resources, color: "primary-light" },
          { label: "FAQs", value: counts.faqs, color: "primary-dark" },
        ].map((item, index) => (
          <article
            key={item.label}
            className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-gradient-to-br from-white to-[color:var(--color-bg-light)] p-5 shadow-[0_12px_40px_rgba(0,32,80,0.05)] hover-lift animate-slide-up overflow-hidden relative group"
            style={{
              "--animation-delay": `${index * 50}ms`,
            } as React.CSSProperties}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[color:var(--color-accent-ochre)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-1 h-16 bg-gradient-to-b from-[color:var(--color-accent-ochre)] to-transparent group-hover:h-full transition-all duration-500"></div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
              {item.label}
            </p>
            <div className="mt-3 text-3xl font-semibold text-[color:var(--color-primary-dark)] group-hover:text-[color:var(--color-primary)] transition-colors">
              {item.value}
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3 animate-slide-up">
        {shortcuts.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-gradient-to-br from-white to-[color:var(--color-bg-light)] p-6 shadow-[0_12px_40px_rgba(0,32,80,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(0,59,122,0.12)] animate-slide-up overflow-hidden group relative"
            style={{
              "--animation-delay": `${200 + index * 50}ms`,
            } as React.CSSProperties}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[color:var(--color-accent-ochre)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -bottom-1 -right-1 w-24 h-24 bg-gradient-to-tl from-[color:var(--color-accent-ochre)]/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent-ochre)]">
              Quick access
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--color-primary-dark)] group-hover:text-[color:var(--color-primary)] transition-colors">
              {item.label}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--color-text-muted)]">{item.description}</p>
            <div className="mt-4 flex items-center text-sm font-semibold text-[color:var(--color-primary)]">
              Manage →
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
