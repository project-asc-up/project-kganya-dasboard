import { PageHeader, Section } from "@/components/admin-form";
import { CreateProgrammeModal } from "@/components/create-programme-modal";
import { ProgrammeTable } from "@/components/programme-table";
import { getFacultyOptions, getProgrammeRows } from "@/lib/admin-queries";

export default async function ProgrammesPage() {
  const [programmes, faculties] = await Promise.all([getProgrammeRows(), getFacultyOptions()]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Programmes"
        description="Maintain programme master data, qualification details, and curriculum provenance."
        action={<CreateProgrammeModal faculties={faculties} />}
      />

      <Section title="Programme directory" description="Current programme records with linked module counts.">
        <ProgrammeTable programmes={programmes} faculties={faculties} />
      </Section>
    </div>
  );
}
