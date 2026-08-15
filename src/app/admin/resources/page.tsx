import { Folder, Layers, Link2, Users } from "lucide-react";
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
      {/* Top Banner Card matching exact reference design */}
      <div className="rounded-[1.75rem] border border-[color:var(--color-border)] bg-white p-6 shadow-[0_12px_40px_rgba(0,32,80,0.04)] sm:p-8 hover-lift animate-slide-up">
        {/* Top Row */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e6f0fa] text-[var(--color-brand)]">
              <Folder className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
                Resources
              </h1>
              <p className="mt-1 text-sm text-[var(--color-text-muted)] sm:text-base">
                Browse support links as grouped cards instead of a dense table.
              </p>
            </div>
          </div>

          {canAccess(authz, "resource:create") ? (
            <div className="flex flex-wrap items-center gap-3">
              <CreateResourceModal
                faculties={faculties}
                className="bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-strong)] rounded-full px-5 py-2.5 font-medium shadow-sm"
              />
              <CreateResourceDocumentModal
                faculties={faculties}
                className="border border-[#b8d5f2] bg-white text-[var(--color-brand)] hover:border-[var(--color-brand)] hover:bg-[#f0f7fc] rounded-full px-5 py-2.5 font-medium shadow-none"
              />
            </div>
          ) : null}
        </div>

        {/* Divider */}
        <hr className="my-6 border-[var(--color-border)] opacity-60" />

        {/* Bottom Row */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left indicator badge */}
          <div className="space-y-2">
            <div className="h-1 w-8 rounded-full bg-[var(--color-brand)]" />
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e6f0fa] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-brand-strong)]">
              <Link2 className="h-3.5 w-3.5 text-[var(--color-brand)]" />
              <span>Organized support. Quick access.</span>
            </div>
          </div>

          {/* Right metrics section */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            {/* Metric 1: Total Resources */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f0fa] text-[var(--color-brand)]">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Total Resources
                </p>
                <p className="text-xl font-bold text-[var(--color-text)] sm:text-2xl">
                  {total}
                </p>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden h-10 w-px bg-[var(--color-border)] opacity-60 sm:block" />

            {/* Metric 2: Faculty Linked */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f0fa] text-[var(--color-brand)]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Faculty Linked
                </p>
                <p className="text-xl font-bold text-[var(--color-brand)] sm:text-2xl">
                  {linkedCount}
                </p>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden h-10 w-px bg-[var(--color-border)] opacity-60 sm:block" />

            {/* Metric 3: General */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f0fa] text-[var(--color-brand)]">
                <Folder className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  General
                </p>
                <p className="text-xl font-bold text-[var(--color-text)] sm:text-2xl">
                  {generalCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-2 shadow-[0_12px_40px_rgba(0,32,80,0.04)] hover-lift animate-slide-up">
        <ResourceExplorer resources={resources} />
      </div>
    </div>
  );
}
