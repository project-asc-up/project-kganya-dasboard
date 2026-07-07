import { PageHeader, Section } from "@/components/admin-form";
import { ProgrammeExplorer } from "@/components/programme-explorer";
import { getProgrammeRows } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function ProgrammesPage() {
  const programmes = await getProgrammeRows();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Programmes"
        description="Maintain programme master data, qualification details, and curriculum provenance."
      />

      <Section title="Programme directory" description="Current programme records with linked module counts.">
        <ProgrammeExplorer programmes={programmes} />
      </Section>
    </div>
  );
}
