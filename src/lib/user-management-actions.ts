"use server";

import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";

import { permissionsForRole, normalizeRole, requireSuperAdmin, updateManagedUserAccess } from "@/lib/rbac";
import type { UserAccessActionState } from "./user-management-types";

export async function updateUserAccess(
  _previousState: UserAccessActionState,
  formData: FormData,
): Promise<UserAccessActionState> {
  try {
    await updateManagedUserAccess(formData);
    revalidatePath("/admin/users");

    return {
      status: "success",
      message: "User access was updated successfully.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to update user access.",
    };
  }
}

export async function createUserInvitation(
  _previousState: UserAccessActionState,
  formData: FormData,
): Promise<UserAccessActionState> {
  try {
    await requireSuperAdmin();

    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const role = normalizeRole(formData.get("role"));

    if (!email) {
      throw new Error("Email is required.");
    }

    const client = await clerkClient();
    await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: {
        role,
        permissions: permissionsForRole(role),
      },
    });

    revalidatePath("/admin/users");

    return {
      status: "success",
      message: `Invitation sent to ${email} with the ${role.replace("_", " ")} role.`,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to create the user invitation.",
    };
  }
}
