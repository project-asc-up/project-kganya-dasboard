import { PageHeader, Section } from "@/components/admin-form";
import { CreateProgrammeModal } from "@/components/create-programme-modal";
import { ProgrammeExplorer } from "@/components/programme-explorer";
import { getFacultyOptions, getProgrammeRows } from "@/lib/admin-queries";
import { canAccess, getCurrentAuthorization } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function ProgrammesPage() {
  const [programmes, faculties, authz] = await Promise.all([
    getProgrammeRows(),
    getFacultyOptions(),
    getCurrentAuthorization(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Programmes"
        description="Maintain programme master data, qualification details, and curriculum provenance."
        action={canAccess(authz, "programme:create") ? <CreateProgrammeModal faculties={faculties} /> : null}
      />

      <Section title="Programme directory" description="Current programme records with linked module counts.">
        <ProgrammeExplorer programmes={programmes} />
      </Section>
    </div>
  );
}
