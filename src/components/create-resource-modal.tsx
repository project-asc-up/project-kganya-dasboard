'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/modal';
import { Field, TextInput, TextArea, Select, ActionButton, CreateButton } from '@/components/admin-form';
import { displayFacultyName } from '@/lib/faculty-display';
import { createResource } from '@/lib/admin-actions';
import { MutationForm } from '@/components/mutation-form';

interface CreateResourceModalProps {
  faculties: Array<{ id: string; name: string; code: string }>;
  className?: string;
}

export function CreateResourceModal({ faculties, className }: CreateResourceModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 4000);
  };

  return (
    <>
      <CreateButton onClick={() => setIsOpen(true)} className={className}>
        Create Resource
      </CreateButton>

      {showSuccess && (
        <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>Resource created successfully.</span>
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New Resource"
        size="lg"
      >
        <MutationForm
          action={createResource}
          className="space-y-5"
          onComplete={() => setIsOpen(false)}
          onSuccess={handleSuccess}
        >
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
            <ActionButton
              type="button"
              tone="secondary"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              loadingText="Creating..."
            >
              Create Resource
            </ActionButton>
          </div>
        </MutationForm>
      </Modal>
    </>
  );
}
