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
    const invitation = await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: {
        role,
        permissions: permissionsForRole(role),
      },
      notify: false,
    });

    // Notify base44 agent to send an invitation email
    try {
      const roleLabel = role.replace("_", " ");
      const invitationUrl = invitation.url || `https://up-asc-chatbot.vercel.app/sign-up`;
      const messageText = `Please send an email to ${email} with the invitation link: ${invitationUrl} to join our team as a ${roleLabel}.`;
      await fetch(
        "https://app.base44.com/api/agents/6a00597ec92cb8615f50b66d/conversations/6a005983777455158d138471/messages",
        {
          method: "POST",
          headers: {
            "api_key": "9c927acf70fc416f824973df94136003",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: messageText,
          }),
        }
      );
    } catch (apiError) {
      console.error("Failed to notify base44 agent:", apiError);
    }

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
