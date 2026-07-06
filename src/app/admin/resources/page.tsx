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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Resources"
        description="Browse support links as grouped cards instead of a dense table."
        action={
          canAccess(authz, "resource:create") ? (
            <div className="flex flex-wrap gap-3">
              <CreateResourceModal faculties={faculties} />
              <CreateResourceDocumentModal faculties={faculties} />
            </div>
          ) : null
        }
      />

      <Section title="Resource atlas" description="Scrollable cards grouped by faculty, with external links and verification status.">
        <ResourceExplorer resources={resources} />
      </Section>
    </div>
  );
}
