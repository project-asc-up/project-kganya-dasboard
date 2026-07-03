import { PageHeader, Section } from "@/components/admin-form";
import { CreateCoachModal } from "@/components/create-coach-modal";
import { CoachDirectory } from "@/components/coach-directory";
import { getFacultyOptions, getCoachRows } from "@/lib/admin-queries";
import { canAccess, getCurrentAuthorization } from "@/lib/rbac";

export default async function CoachesPage() {
  const [coaches, faculties, authz] = await Promise.all([
    getCoachRows(),
    getFacultyOptions(),
    getCurrentAuthorization(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="ASC Coaches"
        description="Maintain the faculty-linked coach directory with role, contact, level, and activation status."
        action={canAccess(authz, "coach:create") ? <CreateCoachModal faculties={faculties} /> : null}
      />

      <Section title="Coach directory" description="Current coach records across all faculties.">
        <CoachDirectory coaches={coaches} />
      </Section>
    </div>
  );
}
