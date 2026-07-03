"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { updateManagedUserAccess } from "@/lib/rbac";

export async function updateUserAccess(formData: FormData) {
  await updateManagedUserAccess(formData);
  revalidatePath("/admin/users");
  redirect("/admin/users");
}
