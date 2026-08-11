import { PageHeader, Section } from "@/components/admin-form";
import { CreateResourceDocumentModal } from "@/components/create-resource-document-modal";
import { CreateResourceModal } from "@/components/create-resource-modal";
import { ResourceExplorer } from "@/components/resource-explorer";
import { getFacultyOptions, getResourceRows } from "@/lib/admin-queries";
import { canAccess, getCurrentAuthorization } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const [resources, faculties, authz] = await Promise.all([
    getResourceRows(),
    getFacultyOptions(),
    getCurrentAuthorization(),
  ]);

  const total = resources.length;
  const generalCount = resources.filter((r) => !r.faculty).length;
  const linkedCount = total - generalCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description="Browse support links as grouped cards instead of a dense table."
        action={
          <div className="flex flex-col items-end gap-4 mt-4 lg:mt-0">
            {canAccess(authz, "resource:create") ? (
              <div className="flex flex-wrap gap-3">
                <CreateResourceModal faculties={faculties} />
                <CreateResourceDocumentModal faculties={faculties} />
              </div>
            ) : null}
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
        <ResourceExplorer resources={resources} />
      </div>
    </div>
  );
}
