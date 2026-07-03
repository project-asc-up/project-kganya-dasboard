"use server";

import { revalidatePath } from "next/cache";

import { updateManagedUserAccess } from "@/lib/rbac";

export type UserAccessActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialUserAccessActionState: UserAccessActionState = {
  status: "idle",
  message: "",
};

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
