import { UserProfile } from "@clerk/nextjs";

import { PageHeader, Section } from "@/components/admin-form";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Profile"
        title="Edit Profile"
        description="Update your Clerk-managed profile details, email addresses, password, and security settings."
      />

      <Section
        title="Account settings"
        description="Profile and credential changes are handled securely by Clerk."
      >
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-2">
          <UserProfile routing="path" path="/admin/profile" />
        </div>
      </Section>
    </div>
  );
}
