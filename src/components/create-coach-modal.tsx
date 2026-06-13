'use client';

import { useState } from 'react';
import { Modal } from '@/components/modal';
import { Field, TextInput, TextArea, Select, ActionButton } from '@/components/admin-form';
import { createCoach } from '@/lib/admin-actions';

interface CreateCoachModalProps {
  faculties: Array<{ id: string; name: string; code: string }>;
}

export function CreateCoachModal({ faculties }: CreateCoachModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      await createCoach(formData);
      setIsOpen(false);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Failed to create coach:', error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-hover)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus-ring)]"
      >
        Create Coach
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New Coach"
        size="lg"
      >
        <form action={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Faculty" hint="*Required">
              <Select name="facultyId" required defaultValue="">
                <option value="" disabled>
                  Select faculty
                </option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name} ({faculty.code})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Name" hint="*Required">
              <TextInput name="name" required />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Title / Role">
              <TextInput name="titleRole" />
            </Field>
            <Field label="Email" hint="*Required">
              <TextInput name="email" type="email" required />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Phone">
              <TextInput name="phone" />
            </Field>
            <Field label="Cell">
              <TextInput name="cell" />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Office Location">
              <TextInput name="officeLocation" />
            </Field>
            <Field label="Building">
              <TextInput name="building" />
            </Field>
          </div>

          <Field label="Appointment Link">
            <TextInput name="appointmentLink" type="url" />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Level">
              <Select name="level" defaultValue="UNKNOWN">
                <option value="UNDERGRADUATE">Undergraduate</option>
                <option value="POSTGRADUATE">Postgraduate</option>
                <option value="BOTH">Both</option>
                <option value="UNKNOWN">Unknown</option>
              </Select>
            </Field>
            <Field label="Cluster">
              <TextInput name="cluster" />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Verification Status">
              <TextInput name="verificationStatus" />
            </Field>
            <Field label="Last Verified">
              <TextInput name="lastVerified" type="date" />
            </Field>
          </div>

          <Field label="Source URL">
            <TextInput name="sourceUrl" type="url" />
          </Field>

          <Field label="Responsibilities">
            <TextArea name="responsibilities" />
          </Field>

          <Field label="Notes">
            <TextArea name="notes" />
          </Field>

          <div className="flex items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] p-4">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              defaultChecked
              className="h-4 w-4 rounded border-[color:var(--color-border)] text-[color:var(--color-primary)]"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-[color:var(--color-primary-dark)]">
              Coach is active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[color:var(--color-border)]">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-border)] px-5 py-3 text-sm font-semibold text-[color:var(--color-primary)] transition hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-bg-light)]"
            >
              Cancel
            </button>
            <ActionButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Coach'}
            </ActionButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
