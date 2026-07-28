'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Modal } from '@/components/modal';
import { Field, TextInput, TextArea, Select, ActionButton, CreateButton } from '@/components/admin-form';
import { createCoach } from '@/lib/admin-actions';
import { displayFacultyName } from '@/lib/faculty-display';

interface CreateCoachModalProps {
  faculties: Array<{ id: string; name: string; code: string }>;
}

export function CreateCoachModal({ faculties }: CreateCoachModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setError(null);
      setIsSubmitting(true);
      await createCoach(formData);
      setIsOpen(false);
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 4000);
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Failed to create coach. Please try again.');
      console.error('Failed to create coach:', err);
    }
  };

  const handleClose = () => {
    setError(null);
    setIsOpen(false);
  };

  return (
    <>
      <CreateButton onClick={() => setIsOpen(true)}>
        Create Coach
      </CreateButton>

      {showSuccess && (
        <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>Coach successfully created.</span>
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Create New Coach"
        size="lg"
      >
        <form action={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3">
              <XCircle className="h-5 w-5 mt-0.5 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Faculty" hint="*Required">
              <Select name="facultyId" required defaultValue="">
                <option value="" disabled>
                  Select faculty
                </option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {displayFacultyName(faculty.name)}
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
            <ActionButton
              type="button"
              tone="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              loading={isSubmitting}
              loadingText="Creating Coach..."
            >
              Create Coach
            </ActionButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
