import { PageHeader, Section } from "@/components/admin-form";
import { CreateFacultyModal } from "@/components/create-faculty-modal";
import { FacultyGallery } from "@/components/faculty-gallery";
import { getFacultyRows } from "@/lib/admin-queries";
import { canAccess, getCurrentAuthorization } from "@/lib/rbac";

export default async function FacultiesPage() {
  const [faculties, authz] = await Promise.all([
    getFacultyRows(),
    getCurrentAuthorization(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Faculties"
        description="Manage the master faculty records that drive coach, programme, resource, and FAQ relationships."
        action={canAccess(authz, "faculty:create") ? <CreateFacultyModal /> : null}
      />

      <Section
        title="Faculty directory"
        description="Current faculty records with linked content counts."
      >
        <FacultyGallery faculties={faculties} />
      </Section>
    </div>
  );
}
