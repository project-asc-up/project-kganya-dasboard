import Link from "next/link";

import { ActionButton, Field, PageHeader, Section, Select, TextArea, TextInput } from "@/components/admin-form";
import { createFaq } from "@/lib/admin-actions";
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
        eyebrow="Phase 3"
        title="FAQs"
        description="Manage concise support answers that the bot and admin team can surface quickly."
      />

      <Section title="Create FAQ" description="Add a question, answer, and priority so it can be surfaced in order.">
        <form action={createFaq} className="grid gap-5 md:grid-cols-2">
          <Field label="Faculty">
            <Select name="facultyId" defaultValue="">
              <option value="">General</option>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name} ({faculty.code})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Category">
            <Select name="category" required defaultValue="">
              <option value="" disabled>
                Select category
              </option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Question">
            <TextInput name="question" required />
          </Field>
          <Field label="Priority">
            <TextInput name="priority" type="number" min="0" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Answer">
              <TextArea name="answer" required />
            </Field>
          </div>
          <Field label="Source URL">
            <TextInput name="sourceUrl" type="url" />
          </Field>
          <Field label="Last verified">
            <TextInput name="lastVerified" type="date" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Notes">
              <TextArea name="notes" />
            </Field>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <ActionButton>Create FAQ</ActionButton>
          </div>
        </form>
      </Section>

      <Section title="FAQ directory" description="Answer records with category and priority ordering.">
        <div className="space-y-4">
          {faqs.map((faq) => (
            <article
              key={faq.id}
              className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-[0_12px_40px_rgba(0,32,80,0.04)]"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
                    <span>{faq.category}</span>
                    <span>Priority {faq.priority ?? "n/a"}</span>
                    <span>{faq.faculty ? `${faq.faculty.code}` : "General"}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-[color:var(--color-primary-dark)]">
                    {faq.question}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--color-text-muted)]">{faq.answer}</p>
                </div>
                <Link
                  href={`/admin/faqs/${faq.id}`}
                  className="inline-flex rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm font-semibold text-[color:var(--color-primary)] transition hover:border-[color:var(--color-primary)]"
                >
                  View / edit
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
