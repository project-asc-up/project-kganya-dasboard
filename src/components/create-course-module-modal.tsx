'use client';

import { useState } from 'react';
import { Modal } from '@/components/modal';
import { Field, TextInput, TextArea, Select, CreateButton, ActionButton } from '@/components/admin-form';
import { createCourseModule } from '@/lib/admin-actions';

interface Programme {
  id: string;
  programmeCode: string;
  programmeName: string;
}

export function CreateCourseModuleModal({ programmes }: { programmes: Programme[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    programmeId: '',
    facultyCode: '',
    sourceFacultyCode: '',
    programmeCode: '',
    programmeName: '',
    yearLevelRaw: '',
    yearLevelSort: '',
    moduleCode: '',
    moduleName: '',
    moduleType: '',
    moduleUnits: '',
    sourceFile: '',
    lastVerified: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) fd.append(key, value);
      });
      await createCourseModule(fd);
      setIsOpen(false);
      setFormData({
        programmeId: '',
        facultyCode: '',
        sourceFacultyCode: '',
        programmeCode: '',
        programmeName: '',
        yearLevelRaw: '',
        yearLevelSort: '',
        moduleCode: '',
        moduleName: '',
        moduleType: '',
        moduleUnits: '',
        sourceFile: '',
        lastVerified: '',
        notes: '',
      });
    } catch (error) {
      setIsSubmitting(false);
      console.error('Failed to create module:', error);
    }
  };

  return (
    <>
      <CreateButton onClick={() => setIsOpen(true)}>
        Create Module
      </CreateButton>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New Module"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Programme" hint="*Required">
              <Select
                name="programmeId"
                value={formData.programmeId}
                onChange={handleChange}
                required
              >
                <option value="">Select programme</option>
                {programmes.map((programme) => (
                  <option key={programme.id} value={programme.id}>
                    {programme.programmeCode} - {programme.programmeName}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Faculty code">
              <TextInput
                name="facultyCode"
                placeholder="EBIT"
                value={formData.facultyCode}
                onChange={handleChange}
              />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Source faculty code">
              <TextInput
                name="sourceFacultyCode"
                placeholder="EBIT"
                value={formData.sourceFacultyCode}
                onChange={handleChange}
              />
            </Field>
            <Field label="Programme code" hint="*Required">
              <TextInput
                name="programmeCode"
                required
                value={formData.programmeCode}
                onChange={handleChange}
              />
            </Field>
          </div>

          <Field label="Programme name">
            <TextInput
              name="programmeName"
              value={formData.programmeName}
              onChange={handleChange}
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Year level raw" hint="*Required">
              <TextInput
                name="yearLevelRaw"
                placeholder="01"
                required
                value={formData.yearLevelRaw}
                onChange={handleChange}
              />
            </Field>
            <Field label="Year level sort">
              <TextInput
                name="yearLevelSort"
                type="number"
                min="0"
                value={formData.yearLevelSort}
                onChange={handleChange}
              />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Module code" hint="*Required">
              <TextInput
                name="moduleCode"
                placeholder="COS 110"
                required
                value={formData.moduleCode}
                onChange={handleChange}
              />
            </Field>
            <Field label="Module name">
              <TextInput
                name="moduleName"
                value={formData.moduleName}
                onChange={handleChange}
              />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Module type" hint="*Required">
              <TextInput
                name="moduleType"
                placeholder="Core"
                required
                value={formData.moduleType}
                onChange={handleChange}
              />
            </Field>
            <Field label="Module units" hint="*Required">
              <TextInput
                name="moduleUnits"
                type="number"
                min="0"
                required
                value={formData.moduleUnits}
                onChange={handleChange}
              />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Source file">
              <TextInput
                name="sourceFile"
                value={formData.sourceFile}
                onChange={handleChange}
              />
            </Field>
            <Field label="Last verified">
              <TextInput
                name="lastVerified"
                type="date"
                value={formData.lastVerified}
                onChange={handleChange}
              />
            </Field>
          </div>

          <Field label="Notes">
            <TextArea
              name="notes"
              placeholder="Editorial notes or clarifications"
              value={formData.notes}
              onChange={handleChange}
            />
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
              Create Module
            </ActionButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
