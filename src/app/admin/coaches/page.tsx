import Link from "next/link";

import { PageHeader, Section } from "@/components/admin-form";
import { CreateCoachModal } from "@/components/create-coach-modal";
import { getFacultyOptions, getCoachRows } from "@/lib/admin-queries";

function formatLevel(level: string) {
  return level.replaceAll("_", " ").toLowerCase();
}

export default async function CoachesPage() {
  const [coaches, faculties] = await Promise.all([getCoachRows(), getFacultyOptions()]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Phase 2"
        title="ASC Coaches"
        description="Maintain the faculty-linked coach directory with role, contact, level, and activation status."
        action={<CreateCoachModal faculties={faculties} />}
      />

      <Section title="Coach directory" description="Current coach records across all faculties.">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Coach</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Faculty</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Contact</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Level</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3">Status</th>
                <th className="border-b border-[color:var(--color-border)] px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {coaches.map((coach) => (
                <tr key={coach.id} className="align-top hover:bg-[color:var(--color-bg-light)] transition-colors">
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4">
                    <div className="font-semibold text-[color:var(--color-primary-dark)]">{coach.name}</div>
                    {coach.titleRole ? (
                      <div className="mt-1 text-xs text-[color:var(--color-text-muted)]">{coach.titleRole}</div>
                    ) : null}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm">
                    <div className="font-medium text-[color:var(--color-primary-dark)]">{coach.faculty.code}</div>
                    <div className="text-[color:var(--color-text-muted)]">{coach.faculty.name}</div>
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm text-[color:var(--color-text-muted)]">
                    <div>{coach.email}</div>
                    <div>{coach.phone ?? coach.cell ?? "No number set"}</div>
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm capitalize text-[color:var(--color-text-muted)]">
                    {formatLevel(coach.level)}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-sm">
                    <span
                      className={`rounded-full px-3 py-1 font-semibold transition ${
                        coach.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {coach.isActive ? "Active" : "Inactive"}
                    </span>
                    {coach.verificationStatus ? (
                      <div className="mt-2 text-xs text-[color:var(--color-text-muted)]">
                        {coach.verificationStatus}
                      </div>
                    ) : null}
                  </td>
                  <td className="border-b border-[color:var(--color-border)] px-4 py-4 text-right">
                    <Link
                      href={`/admin/coaches/${coach.id}`}
                      className="inline-flex rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm font-semibold text-[color:var(--color-primary)] transition hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-bg-light)]"
                    >
                      View / edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
