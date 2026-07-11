'use client';

import { useState } from 'react';
import { Modal } from '@/components/modal';
import { Field, TextInput, TextArea, Select, ActionButton, CreateButton } from '@/components/admin-form';
import { displayFacultyName } from '@/lib/faculty-display';
import { createFaq } from '@/lib/admin-actions';

interface CreateFaqModalProps {
  faculties: Array<{ id: string; name: string; code: string }>;
  categoryOptions: string[];
}

export function CreateFaqModal({ faculties, categoryOptions }: CreateFaqModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      await createFaq(formData);
      setIsOpen(false);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Failed to create FAQ:', error);
    }
  };

  return (
    <>
      <CreateButton onClick={() => setIsOpen(true)}>
        Create FAQ
      </CreateButton>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New FAQ"
        size="lg"
      >
        <form action={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Faculty">
              <Select name="facultyId" defaultValue="">
                <option value="">General</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                  {displayFacultyName(faculty.name)} ({faculty.code})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Category" hint="*Required">
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
          </div>

          <Field label="Question" hint="*Required">
            <TextInput name="question" required />
          </Field>

          <Field label="Answer" hint="*Required">
            <TextArea name="answer" required />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Priority">
              <TextInput name="priority" type="number" min="0" />
            </Field>
            <Field label="Last Verified">
              <TextInput name="lastVerified" type="date" />
            </Field>
          </div>

          <Field label="Source URL">
            <TextInput name="sourceUrl" type="url" />
          </Field>

          <Field label="Notes">
            <TextArea name="notes" />
          </Field>

          <div className="flex justify-end gap-3 pt-4 border-t border-[color:var(--color-border)]">
            <ActionButton
              type="button"
              tone="secondary"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              loading={isSubmitting}
              loadingText="Creating FAQ..."
            >
              Create FAQ
            </ActionButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
