"use client";

import { UserButton } from "@clerk/nextjs";
import { UserRound } from "lucide-react";

export function AdminProfileMenu({ localSession = false }: { localSession?: boolean }) {
  if (localSession) {
    return (
      <div className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-xs font-semibold text-[var(--color-text-muted)]">
        Local admin
      </div>
    );
  }

  return (
    <UserButton userProfileMode="navigation" userProfileUrl="/admin/profile">
      <UserButton.MenuItems>
        <UserButton.Link
          href="/admin/profile"
          label="Edit Profile"
          labelIcon={<UserRound size={16} />}
        />
        <UserButton.Action label="signOut" />
      </UserButton.MenuItems>
    </UserButton>
  );
}
