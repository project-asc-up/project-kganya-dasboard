import { auth } from "@clerk/nextjs/server";

import { getKganyaPrismaClient } from "@/lib/kganya-prisma";

const DEFAULT_KGANYA_CLERK_ORG_ID = process.env.KGANYA_CLERK_ORG_ID ?? "up-student-support";
const DEFAULT_KGANYA_ORG_SLUG = process.env.KGANYA_ORG_SLUG ?? "up-student-support";
const DEFAULT_KGANYA_ORG_NAME = process.env.KGANYA_ORG_NAME ?? "UP Student Support";

export async function resolveKganyaOrganization() {
  const session = await auth();
  const clerkOrgId = session.orgId ?? DEFAULT_KGANYA_CLERK_ORG_ID;
  const prisma = getKganyaPrismaClient();

  return prisma.organization.upsert({
    where: { clerkOrgId },
    create: {
      clerkOrgId,
      name: DEFAULT_KGANYA_ORG_NAME,
      slug: DEFAULT_KGANYA_ORG_SLUG,
      status: "active",
    },
    update: {
      name: DEFAULT_KGANYA_ORG_NAME,
      slug: DEFAULT_KGANYA_ORG_SLUG,
      status: "active",
    },
  });
}
