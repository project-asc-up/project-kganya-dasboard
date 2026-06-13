import { PageHeader, Section } from "@/components/admin-form";
import { CreateCoachModal } from "@/components/create-coach-modal";
import { CoachTable } from "@/components/coach-table";
import { getFacultyOptions, getCoachRows } from "@/lib/admin-queries";

export default async function CoachesPage() {
  const [coaches, faculties] = await Promise.all([getCoachRows(), getFacultyOptions()]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="ASC Coaches"
        description="Maintain the faculty-linked coach directory with role, contact, level, and activation status."
        action={<CreateCoachModal faculties={faculties} />}
      />

      <Section title="Coach directory" description="Current coach records across all faculties.">
        <CoachTable coaches={coaches} faculties={faculties} />
      </Section>
    </div>
  );
}
