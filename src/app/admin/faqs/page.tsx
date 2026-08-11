import { PageHeader, Section } from "@/components/admin-form";
import { CreateFaqModal } from "@/components/create-faq-modal";
import { FaqExplorer } from "@/components/faq-explorer";
import { getFaqRows, getFacultyOptions } from "@/lib/admin-queries";
import { canAccess, getCurrentAuthorization } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const categoryOptions = [
  "Coach Referral",
  "Study Tips",
  "Registration",
  "Stress Management",
  "General UP",
];

export default async function FaqsPage() {
  const [faqs, faculties, authz] = await Promise.all([
    getFaqRows(),
    getFacultyOptions(),
    getCurrentAuthorization(),
  ]);

  const total = faqs.length;
  const generalCount = faqs.filter((f) => !f.faculty).length;
  const linkedCount = total - generalCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQs"
        description="Curate support answers as expandable knowledge cards instead of a plain table."
        action={
          <div className="flex flex-col items-end gap-4 mt-4 lg:mt-0">
            {canAccess(authz, "faq:create") ? <CreateFaqModal faculties={faculties} categoryOptions={categoryOptions} /> : null}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex flex-col bg-[var(--color-surface-sunken)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider">Total</span>
                <span className="font-semibold text-base">{total}</span>
              </div>
              <div className="flex flex-col bg-[var(--color-surface-sunken)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider">Faculty Linked</span>
                <span className="font-semibold text-base text-[var(--color-brand)]">{linkedCount}</span>
              </div>
              <div className="flex flex-col bg-[var(--color-surface-sunken)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider">General</span>
                <span className="font-semibold text-base">{generalCount}</span>
              </div>
            </div>
          </div>
        }
      />

      <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-2 shadow-[0_12px_40px_rgba(0,32,80,0.04)] hover-lift animate-slide-up">
        <FaqExplorer faqs={faqs} />
      </div>
    </div>
  );
}
