import { PageHeader, Section } from "@/components/admin-form";
import { FacultyGallery } from "@/components/faculty-gallery";
import { getFacultyRows } from "@/lib/admin-queries";

export default async function FacultiesPage() {
  const faculties = await getFacultyRows();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Faculties"
        description="Manage the master faculty records that drive coach, programme, resource, and FAQ relationships."
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
