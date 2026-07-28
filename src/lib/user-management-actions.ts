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

export async function suspendUserAction(
  _previousState: UserAccessActionState,
  formData: FormData,
): Promise<UserAccessActionState> {
  try {
    const { requireSuperAdmin } = await import("@/lib/rbac");
    const { getPrismaClient } = await import("@/lib/prisma");

    const authz = await requireSuperAdmin();
    const userId = String(formData.get("userId") ?? "");
    const reason = String(formData.get("reason") ?? "").trim();

    if (!userId) {
      throw new Error("User ID is required.");
    }
    if (!reason) {
      throw new Error("Reason is required.");
    }

    if (userId === authz.userId) {
      throw new Error("You cannot suspend yourself.");
    }

    const client = await clerkClient();
    const targetUser = await client.users.getUser(userId);
    const targetEmail = targetUser.emailAddresses.find(
      (email) => email.id === targetUser.primaryEmailAddressId
    )?.emailAddress ?? targetUser.emailAddresses[0]?.emailAddress ?? null;

    // In Clerk, banUser invalidates all active sessions and blocks login
    await client.users.banUser(userId);

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        isSuspended: true,
        suspensionReason: reason,
        isBanned: false,
      },
    });

    const prisma = getPrismaClient();
    await prisma.userModerationRecord.create({
      data: {
        actorUserId: authz.userId,
        actorEmail: authz.email,
        targetUserId: userId,
        targetEmail,
        actionType: "SUSPEND",
        reason,
      },
    });

    revalidatePath("/admin/users");

    return {
      status: "success",
      message: "User was suspended successfully.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to suspend user.",
    };
  }
}

export async function unsuspendUserAction(
  _previousState: UserAccessActionState,
  formData: FormData,
): Promise<UserAccessActionState> {
  try {
    const { requireSuperAdmin } = await import("@/lib/rbac");
    const { getPrismaClient } = await import("@/lib/prisma");

    const authz = await requireSuperAdmin();
    const userId = String(formData.get("userId") ?? "");
    const reason = String(formData.get("reason") ?? "").trim();

    if (!userId) {
      throw new Error("User ID is required.");
    }
    if (!reason) {
      throw new Error("Reason is required.");
    }

    const client = await clerkClient();
    const targetUser = await client.users.getUser(userId);
    const targetEmail = targetUser.emailAddresses.find(
      (email) => email.id === targetUser.primaryEmailAddressId
    )?.emailAddress ?? targetUser.emailAddresses[0]?.emailAddress ?? null;

    // Unban on Clerk
    await client.users.unbanUser(userId);

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        isSuspended: false,
        suspensionReason: null,
      },
    });

    const prisma = getPrismaClient();
    await prisma.userModerationRecord.create({
      data: {
        actorUserId: authz.userId,
        actorEmail: authz.email,
        targetUserId: userId,
        targetEmail,
        actionType: "UNSUSPEND",
        reason,
      },
    });

    revalidatePath("/admin/users");

    return {
      status: "success",
      message: "User suspension was lifted successfully.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to unsuspend user.",
    };
  }
}

export async function banUserAction(
  _previousState: UserAccessActionState,
  formData: FormData,
): Promise<UserAccessActionState> {
  try {
    const { requireSuperAdmin } = await import("@/lib/rbac");
    const { getPrismaClient } = await import("@/lib/prisma");

    const authz = await requireSuperAdmin();
    const userId = String(formData.get("userId") ?? "");
    const reason = String(formData.get("reason") ?? "").trim();

    if (!userId) {
      throw new Error("User ID is required.");
    }
    if (!reason) {
      throw new Error("Reason is required.");
    }

    if (userId === authz.userId) {
      throw new Error("You cannot ban yourself.");
    }

    const client = await clerkClient();
    const targetUser = await client.users.getUser(userId);
    const targetEmail = targetUser.emailAddresses.find(
      (email) => email.id === targetUser.primaryEmailAddressId
    )?.emailAddress ?? targetUser.emailAddresses[0]?.emailAddress ?? null;

    // Ban on Clerk
    await client.users.banUser(userId);

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        isBanned: true,
        banReason: reason,
        isSuspended: false,
      },
    });

    const prisma = getPrismaClient();
    await prisma.userModerationRecord.create({
      data: {
        actorUserId: authz.userId,
        actorEmail: authz.email,
        targetUserId: userId,
        targetEmail,
        actionType: "BAN",
        reason,
      },
    });

    // Notify base44 agent to send ban email
    if (targetEmail) {
      try {
        const messageText = `Please send an email to ${targetEmail} informing them that their account has been permanently banned from our platform. Reason: "${reason}". If they wish to appeal this decision, they can contact support at support@up.ac.za.`;
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
        console.error("Failed to notify base44 agent of user ban:", apiError);
      }
    }

    revalidatePath("/admin/users");

    return {
      status: "success",
      message: "User was permanently banned successfully.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to ban user.",
    };
  }
}
