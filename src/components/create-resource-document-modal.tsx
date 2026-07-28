"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Modal } from "@/components/modal";
import { Field, TextInput, TextArea, Select, ActionButton, CreateButton } from "@/components/admin-form";
import { displayFacultyName } from "@/lib/faculty-display";
import { createResourceDocument } from "@/lib/admin-actions";
import { MutationForm } from "@/components/mutation-form";

interface CreateResourceDocumentModalProps {
  faculties: Array<{ id: string; name: string; code: string }>;
}

export function CreateResourceDocumentModal({ faculties }: CreateResourceDocumentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClose = () => {
    setFileError(null);
    setIsOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxBytes = 4 * 1024 * 1024; // 4 MB
      if (file.size > maxBytes) {
        setFileError("File size exceeds the 4 MB limit. Please select a smaller file.");
      } else {
        setFileError(null);
      }
    } else {
      setFileError(null);
    }
  };

  const handleValidate = (formData: FormData) => {
    const file = formData.get("documentFile");
    if (file && typeof file !== "string" && "size" in file) {
      const maxBytes = 4 * 1024 * 1024; // 4 MB
      if ((file as any).size > maxBytes) {
        return "File size exceeds the 4 MB limit. Please select a smaller file.";
      }
    }
    return null;
  };

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 4000);
  };

  return (
    <>
      <CreateButton
        onClick={() => setIsOpen(true)}
        className="border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] text-[color:var(--color-primary)] hover:border-[color:var(--color-primary)] hover:bg-white"
      >
        Upload Document or Image
      </CreateButton>

      {showSuccess && (
        <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>File uploaded successfully.</span>
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Upload Resource Document"
        size="lg"
      >
        <MutationForm
          action={createResourceDocument}
          className="space-y-5"
          onComplete={handleClose}
          validate={handleValidate}
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
                onChange={handleFileChange}
                className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] shadow-sm outline-none transition-smooth file:mr-4 file:rounded-full file:border-0 file:bg-[color:var(--color-bg-light)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-focus-ring)]/25"
              />
              {fileError && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {fileError}
                </p>
              )}
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
            <ActionButton
              type="button"
              tone="secondary"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              disabled={!!fileError}
              loadingText="Uploading..."
            >
              Upload File
            </ActionButton>
          </div>
        </MutationForm>
      </Modal>
    </>
  );
}
