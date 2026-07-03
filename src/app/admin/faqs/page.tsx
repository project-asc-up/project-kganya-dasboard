import { PageHeader, Section } from "@/components/admin-form";
import { CreateFaqModal } from "@/components/create-faq-modal";
import { FaqExplorer } from "@/components/faq-explorer";
import { getFaqRows, getFacultyOptions } from "@/lib/admin-queries";
import { canAccess, getCurrentAuthorization } from "@/lib/rbac";

const categoryOptions = [
  "Coach Referral",
  "Study Tips",
  "Registration",
  "Stress Management",
  "General UP",
];

export default async function FaqsPage() {
  const [faqs, faculties, authz] = await Promise.all([
    getFaqRows(),
    getFacultyOptions(),
    getCurrentAuthorization(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="FAQs"
        description="Curate support answers as expandable knowledge cards instead of a plain table."
        action={canAccess(authz, "faq:create") ? <CreateFaqModal faculties={faculties} categoryOptions={categoryOptions} /> : null}
      />

      <Section title="FAQ atlas" description="Grouped by faculty with answer previews and verification details.">
        <FaqExplorer faqs={faqs} />
      </Section>
    </div>
  );
}
