'use client';

import { useState } from 'react';
import { Modal } from '@/components/modal';
import { Field, TextInput, TextArea, Select } from '@/components/admin-form';
import { createResource } from '@/lib/admin-actions';

interface CreateResourceModalProps {
  faculties: Array<{ id: string; name: string; code: string }>;
}

export function CreateResourceModal({ faculties }: CreateResourceModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      await createResource(formData);
      setIsOpen(false);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Failed to create resource:', error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-hover)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus-ring)]"
      >
        Create Resource
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New Resource"
        size="lg"
      >
        <form action={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
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
            <Field label="Category" hint="*Required">
              <TextInput name="category" required placeholder="Study Skills" />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Title" hint="*Required">
              <TextInput name="title" required />
            </Field>
            <Field label="URL" hint="*Required">
              <TextInput name="url" type="url" required />
            </Field>
          </div>

          <Field label="Description">
            <TextArea name="description" />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Source URL">
              <TextInput name="sourceUrl" type="url" />
            </Field>
            <Field label="Last Verified">
              <TextInput name="lastVerified" type="date" />
            </Field>
          </div>

          <Field label="Notes">
            <TextArea name="notes" />
          </Field>

          <div className="flex justify-end gap-3 pt-4 border-t border-[color:var(--color-border)]">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-border)] px-5 py-3 text-sm font-semibold text-[color:var(--color-primary)] transition hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-bg-light)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-hover)] disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Resource'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
