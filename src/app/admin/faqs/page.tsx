import { PageHeader, Section } from "@/components/admin-form";
import { CreateFaqModal } from "@/components/create-faq-modal";
import { FaqTable } from "@/components/faq-table";
import { getFaqRows, getFacultyOptions } from "@/lib/admin-queries";

const categoryOptions = [
  "Coach Referral",
  "Study Tips",
  "Registration",
  "Stress Management",
  "General UP",
];

export default async function FaqsPage() {
  const [faqs, faculties] = await Promise.all([getFaqRows(), getFacultyOptions()]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="FAQs"
        description="Manage concise support answers that the bot and admin team can surface quickly."
        action={<CreateFaqModal faculties={faculties} categoryOptions={categoryOptions} />}
      />

      <Section title="FAQ directory" description="Answer records with category and priority ordering.">
        <FaqTable faqs={faqs} faculties={faculties} />
      </Section>
    </div>
  );
}
