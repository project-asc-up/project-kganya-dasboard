import { notFound } from "next/navigation";

import { ActionButton, Field, PageHeader, Section, Select, TextArea, TextInput } from "@/components/admin-form";
import { ClientActionButton } from "@/components/client-action-button";
import { deleteFaq, updateFaq } from "@/lib/admin-actions";
import { getFacultyOptions, getFaqById } from "@/lib/admin-queries";
import { displayFacultyName } from "@/lib/faculty-display";
import { canAccess, getCurrentAuthorization } from "@/lib/rbac";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

const categoryOptions = [
  "Coach Referral",
  "Study Tips",
  "Registration",
  "Stress Management",
  "General UP",
];

export default async function FaqDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [faq, faculties, authz] = await Promise.all([
    getFaqById(id),
    getFacultyOptions(),
    getCurrentAuthorization(),
  ]);

  if (!faq) {
    notFound();
  }

  const updateAction = async (formData: FormData) => {
    await updateFaq(faq.id, formData);
  };
  const deleteAction = async () => {
    await deleteFaq(faq.id);
  };
  const canUpdate = canAccess(authz, "faq:update");
  const canDelete = canAccess(authz, "faq:delete");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="FAQ detail"
        title={faq.question}
        description={`${faq.category} | ${faq.faculty ? `${faq.faculty.code} - ${displayFacultyName(faq.faculty.name)}` : "General"}`}
        action={canDelete ? (
          <form action={deleteAction}>
            <ActionButton tone="danger">Delete FAQ</ActionButton>
          </form>
        ) : null}
      />

      {canUpdate ? (
      <Section title="Edit FAQ" description="Keep the question, answer, and priority aligned with the source.">
        <form action={updateAction} className="grid gap-5 md:grid-cols-2">
          <Field label="Faculty">
            <Select name="facultyId" defaultValue={faq.facultyId ?? ""}>
              <option value="">General</option>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {displayFacultyName(faculty.name)} ({faculty.code})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Category">
            <Select name="category" required defaultValue={faq.category}>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Question">
            <TextInput name="question" defaultValue={faq.question} required />
          </Field>
          <Field label="Priority">
            <TextInput name="priority" type="number" min="0" defaultValue={faq.priority ?? ""} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Answer">
              <TextArea name="answer" defaultValue={faq.answer} required />
            </Field>
          </div>
          <Field label="Source URL">
            <TextInput name="sourceUrl" type="url" defaultValue={faq.sourceUrl ?? ""} />
          </Field>
          <Field label="Last verified">
            <TextInput name="lastVerified" type="date" defaultValue={formatDate(faq.lastVerified)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Notes">
              <TextArea name="notes" defaultValue={faq.notes ?? ""} />
            </Field>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <ClientActionButton loadingText="Saving Changes...">Save changes</ClientActionButton>
          </div>
        </form>
      </Section>
      ) : (
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 text-sm leading-6 text-[var(--color-text-muted)]">
          You can view this FAQ, but you do not have permission to edit it.
        </section>
      )}
    </div>
  );
}
