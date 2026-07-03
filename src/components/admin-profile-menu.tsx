"use client";

import { UserButton } from "@clerk/nextjs";
import { UserRound } from "lucide-react";

export function AdminProfileMenu() {
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
