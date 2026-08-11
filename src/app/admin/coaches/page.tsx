import { PageHeader, Section } from "@/components/admin-form";
import { CreateCoachModal } from "@/components/create-coach-modal";
import { CoachDirectory } from "@/components/coach-directory";
import { getFacultyOptions, getCoachRows } from "@/lib/admin-queries";
import { canAccess, getCurrentAuthorization } from "@/lib/rbac";

export default async function CoachesPage() {
  const [coaches, faculties, authz] = await Promise.all([
    getCoachRows(),
    getFacultyOptions(),
    getCurrentAuthorization(),
  ]);

  const active = coaches.filter((coach) => coach.isActive).length;
  const inactive = coaches.length - active;
  const verified = coaches.filter((coach) => (coach.verificationStatus || "").toLowerCase().includes("verified")).length;
  const withPhone = coaches.filter((coach) => Boolean(coach.phone || coach.cell)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="ASC Coaches"
        description="Maintain the faculty-linked coach directory with role, contact, level, and activation status."
        action={
          <div className="flex flex-col items-end gap-4 mt-4 lg:mt-0">
            {canAccess(authz, "coach:create") ? <CreateCoachModal faculties={faculties} /> : null}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex flex-col bg-[var(--color-surface-sunken)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider">Active</span>
                <span className="font-semibold text-base text-[var(--color-success)]">{active}</span>
              </div>
              <div className="flex flex-col bg-[var(--color-surface-sunken)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider">Inactive</span>
                <span className="font-semibold text-base text-[var(--color-text-muted)]">{inactive}</span>
              </div>
              <div className="flex flex-col bg-[var(--color-surface-sunken)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider">Verified</span>
                <span className="font-semibold text-base text-[var(--color-brand)]">{verified}</span>
              </div>
              <div className="flex flex-col bg-[var(--color-surface-sunken)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider">Contacts</span>
                <span className="font-semibold text-base">{withPhone}</span>
              </div>
            </div>
          </div>
        }
      />

      <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-2 shadow-[0_12px_40px_rgba(0,32,80,0.04)] hover-lift animate-slide-up">
        <CoachDirectory coaches={coaches} />
      </div>
    </div>
  );
}
