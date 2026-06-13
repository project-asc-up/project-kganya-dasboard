import { PageHeader, Section } from "@/components/admin-form";
import { CreateResourceModal } from "@/components/create-resource-modal";
import { ResourceTable } from "@/components/resource-table";
import { getFacultyOptions, getResourceRows } from "@/lib/admin-queries";

export default async function ResourcesPage() {
  const [resources, faculties] = await Promise.all([getResourceRows(), getFacultyOptions()]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Resources"
        description="Manage general and faculty-specific support resources used by the bot and admin team."
        action={<CreateResourceModal faculties={faculties} />}
      />

      <Section title="Resource directory" description="Current support resources with faculty scope.">
        <ResourceTable resources={resources} faculties={faculties} />
      </Section>
    </div>
  );
}
