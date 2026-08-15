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
  defaultFacultyId?: string;
  trigger?: React.ReactNode;
}

export function CreateResourceModal({
  faculties,
  className,
  defaultFacultyId,
  trigger,
}: CreateResourceModalProps) {
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
      {trigger ? (
        <span
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="inline-block"
        >
          {trigger}
        </span>
      ) : (
        <CreateButton onClick={() => setIsOpen(true)} className={className}>
          Create Resource
        </CreateButton>
      )}

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
            <Field label="Resource">
              <Select name="facultyId" defaultValue={defaultFacultyId ?? ""}>
                <option value="">DSA</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name} ({faculty.code})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Category" hint="*Required">
              <Select name="category" required defaultValue="Student Counselling Unit">
                <option value="Student Counselling Unit">Student Counselling Unit</option>
                <option value="Student Development and Disability unit">Student Development and Disability unit</option>
                <option value="Student health services unit">Student health services unit</option>
                <option value="Student Governance and leadership unit">Student Governance and leadership unit</option>
                <option value="ISFAP">ISFAP</option>
                <option value="SNAPP">SNAPP</option>
              </Select>
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
