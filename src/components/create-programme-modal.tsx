'use client';

import { useState } from 'react';
import { Modal } from '@/components/modal';
import { Field, TextInput, TextArea, Select, ActionButton, CreateButton } from '@/components/admin-form';
import { displayFacultyName } from '@/lib/faculty-display';
import { createProgramme } from '@/lib/admin-actions';

interface CreateProgrammeModalProps {
  faculties: Array<{ id: string; name: string; code: string }>;
}

export function CreateProgrammeModal({ faculties }: CreateProgrammeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      await createProgramme(formData);
      setIsOpen(false);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Failed to create programme:', error);
    }
  };

  return (
    <>
      <CreateButton onClick={() => setIsOpen(true)}>
        Create Programme
      </CreateButton>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New Programme"
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
                  {displayFacultyName(faculty.name)} ({faculty.code})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Source Faculty Code">
              <TextInput name="sourceFacultyCode" />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Programme Code" hint="*Required">
              <TextInput name="programmeCode" required />
            </Field>
            <Field label="Programme Name" hint="*Required">
              <TextInput name="programmeName" required />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Degree Name">
              <TextInput name="degreeName" />
            </Field>
            <Field label="Academic Level">
              <TextInput name="academicLevel" />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Qualification Type">
              <TextInput name="qualificationType" />
            </Field>
            <Field label="Programme Credits">
              <TextInput name="programmeCredits" type="number" min="0" />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Duration Years">
              <TextInput name="durationYears" type="number" min="0" />
            </Field>
            <Field label="Year Levels">
              <TextInput name="yearLevels" placeholder="01;02;03;FIN" />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Source File">
              <TextInput name="sourceFile" />
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
              disabled={isSubmitting}
            >
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              loading={isSubmitting}
              loadingText="Creating..."
            >
              Create Programme
            </ActionButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
