import { PageHeader, Section } from "@/components/admin-form";
import { FacultyGallery } from "@/components/faculty-gallery";
import { getFacultyRows } from "@/lib/admin-queries";

export default async function FacultiesPage() {
  const faculties = await getFacultyRows();

  const total = faculties.length;
  const verified = faculties.filter((f) => f.codeStatus.toLowerCase().includes("verified")).length;
  const needsReview = faculties.filter((f) => {
    const s = f.codeStatus.toLowerCase();
    return s.includes("review") || s.includes("pending");
  }).length;
  const content = faculties.reduce(
    (sum, f) => sum + f._count.ascCoaches + f._count.resources + f._count.faqs,
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculties"
        description="Manage the master faculty records that drive coach, programme, resource, and FAQ relationships."
        action={
          <div className="flex flex-wrap gap-4 text-sm mt-4 lg:mt-0">
            <div className="flex flex-col bg-[var(--color-surface-sunken)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider">Total</span>
              <span className="font-semibold text-base">{total}</span>
            </div>
            <div className="flex flex-col bg-[var(--color-surface-sunken)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider">Verified</span>
              <span className="font-semibold text-base text-[var(--color-success)]">{verified}</span>
            </div>
            <div className="flex flex-col bg-[var(--color-surface-sunken)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider">Review</span>
              <span className="font-semibold text-base text-[var(--color-warning)]">{needsReview}</span>
            </div>
            <div className="flex flex-col bg-[var(--color-surface-sunken)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider">Content</span>
              <span className="font-semibold text-base text-[var(--color-brand)]">{content}</span>
            </div>
          </div>
        }
      />

      <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-2 shadow-[0_12px_40px_rgba(0,32,80,0.04)] hover-lift animate-slide-up">
        <FacultyGallery faculties={faculties} />
      </div>
    </div>
  );
}
