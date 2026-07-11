"use client";

import { useState } from "react";

import { Modal } from "@/components/modal";
import { Field, TextInput, TextArea, Select } from "@/components/admin-form";
import { displayFacultyName } from "@/lib/faculty-display";
import { createResourceDocument } from "@/lib/admin-actions";

interface CreateResourceDocumentModalProps {
  faculties: Array<{ id: string; name: string; code: string }>;
}

export function CreateResourceDocumentModal({ faculties }: CreateResourceDocumentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      await createResourceDocument(formData);
      setIsOpen(false);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error("Failed to Upload Resource Document:", error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] px-5 py-3 text-sm font-semibold text-[color:var(--color-primary)] transition hover:border-[color:var(--color-primary)] hover:bg-white"
      >
        Upload Document
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Upload Resource Document"
        size="lg"
      >
        <form action={handleSubmit} className="space-y-5" encType="multipart/form-data">
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
              <TextInput name="category" required placeholder="Admissions guide" />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Title" hint="*Required">
              <TextInput name="title" required placeholder="Faculty handbook 2026" />
            </Field>
            <Field label="Document file" hint="*Required">
              <input
                type="file"
                name="documentFile"
                accept=".md,.txt,.pdf,.docx,.png,.jpg,.jpeg,image/png,image/jpeg"
                required
                className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] shadow-sm outline-none transition-smooth file:mr-4 file:rounded-full file:border-0 file:bg-[color:var(--color-bg-light)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-focus-ring)]/25"
              />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Source URL">
              <TextInput name="sourceUrl" type="url" placeholder="https://www.up.ac.za/..." />
            </Field>
            <Field label="Last verified">
              <TextInput name="lastVerified" type="date" />
            </Field>
          </div>

          <Field label="Description">
            <TextArea name="description" placeholder="What this document covers and why it matters." />
          </Field>

          <Field label="Notes">
            <TextArea name="notes" placeholder="Editorial notes or upload context." />
          </Field>

          <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] px-4 py-3 text-sm leading-6 text-[color:var(--color-text-muted)]">
            Uploaded files are staged locally, then queued into Dify as document sync jobs. If the sync fails after retries, the resource stays visible for manual repair.
          </div>

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
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Uploading..." : "Upload File"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

