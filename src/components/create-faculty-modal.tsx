'use client';

import { useState } from 'react';
import { Modal } from '@/components/modal';
import { Field, TextInput, TextArea, Select, CreateButton, ActionButton } from '@/components/admin-form';
import { createFaculty } from '@/lib/admin-actions';

export function CreateFacultyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    codeStatus: 'verified',
    lastVerified: '',
    officialPageUrl: '',
    supportPageUrl: '',
    sourceUrl: '',
    aliases: '',
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
      await createFaculty(fd);
      setIsOpen(false);
      setFormData({
        name: '',
        code: '',
        codeStatus: 'verified',
        lastVerified: '',
        officialPageUrl: '',
        supportPageUrl: '',
        sourceUrl: '',
        aliases: '',
        notes: '',
      });
    } catch (error) {
      setIsSubmitting(false);
      console.error('Failed to create faculty:', error);
    }
  };

  return (
    <>
      <CreateButton onClick={() => setIsOpen(true)}>
        Create Faculty
      </CreateButton>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New Faculty"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Faculty name" hint="*Required">
              <TextInput
                name="name"
                placeholder="Faculty of Engineering, Built Environment and Information Technology"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Field>
            <Field label="Faculty code" hint="*Required">
              <TextInput
                name="code"
                placeholder="EBIT"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Code status">
              <Select 
                name="codeStatus" 
                value={formData.codeStatus}
                onChange={handleChange}
              >
                <option value="verified">Verified</option>
                <option value="review">Needs review</option>
                <option value="draft">Draft</option>
              </Select>
            </Field>
            <Field label="Last verified" hint="YYYY-MM-DD">
              <TextInput 
                name="lastVerified" 
                type="date"
                value={formData.lastVerified}
                onChange={handleChange}
              />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Official page URL">
              <TextInput
                name="officialPageUrl"
                type="url"
                placeholder="https://www.up.ac.za/..."
                value={formData.officialPageUrl}
                onChange={handleChange}
              />
            </Field>
            <Field label="Support page URL">
              <TextInput
                name="supportPageUrl"
                type="url"
                placeholder="https://www.up.ac.za/..."
                value={formData.supportPageUrl}
                onChange={handleChange}
              />
            </Field>
          </div>

          <Field label="Source URL">
            <TextInput
              name="sourceUrl"
              type="url"
              placeholder="https://www.up.ac.za/..."
              value={formData.sourceUrl}
              onChange={handleChange}
            />
          </Field>

          <Field label="Aliases" hint="Optional pipe- or comma-separated">
            <TextInput
              name="aliases"
              placeholder="EBIT | Engineering | Built Environment"
              value={formData.aliases}
              onChange={handleChange}
            />
          </Field>

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
              Create Faculty
            </ActionButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
