"use server";

import { revalidatePath } from "next/cache";
import { getPrismaClient } from "@/lib/prisma";
import { getCurrentAuthorization } from "@/lib/rbac";
import { CONFIGURABLE_TABS } from "./tab-access-config";

export type TabAccessActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function saveTabAccessAction(
  _previousState: TabAccessActionState,
  formData: FormData,
): Promise<TabAccessActionState> {
  try {
    const authz = await getCurrentAuthorization();
    if (!authz || (authz.role !== "admin" && authz.role !== "super_admin")) {
      throw new Error("You must be an administrator to modify tab access.");
    }

    const adminTabs = formData.getAll("admin-tabs") as string[];
    const userTabs = formData.getAll("user-tabs") as string[];

    const prisma = getPrismaClient();

    await prisma.$transaction(async (tx) => {
      // Clear out existing mappings for user and admin roles
      await tx.roleTabAccess.deleteMany({
        where: {
          role: { in: ["admin", "user"] },
        },
      });

      // Insert the configured state for each tab
      const createOps = [];

      for (const tab of CONFIGURABLE_TABS) {
        const isAllowedAdmin = adminTabs.includes(tab.href);
        const isAllowedUser = userTabs.includes(tab.href);

        createOps.push(
          tx.roleTabAccess.create({
            data: {
              role: "admin",
              tab: tab.href,
              isAllowed: isAllowedAdmin,
            },
          })
        );

        createOps.push(
          tx.roleTabAccess.create({
            data: {
              role: "user",
              tab: tab.href,
              isAllowed: isAllowedUser,
            },
          })
        );
      }

      await Promise.all(createOps);
    });

    // Revalidate pages and layout cache
    revalidatePath("/admin");
    revalidatePath("/admin", "layout");

    return {
      status: "success",
      message: "Tab access permissions updated successfully.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to update tab access permissions.",
    };
  }
}
