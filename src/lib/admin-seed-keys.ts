function seedPart(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value.trim() : "general";
}

export function buildAdminSeedKey(kind: "resource" | "faq", scope: string | null | undefined, label: string) {
  return `${kind}::${seedPart(scope)}::${seedPart(label)}`;
}

export async function resolveUniqueAdminSeedKey(
  baseSeedKey: string,
  exists: (candidate: string) => Promise<boolean>,
) {
  if (!(await exists(baseSeedKey))) return baseSeedKey;

  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const candidate = `${baseSeedKey}::${suffix}`;
    if (!(await exists(candidate))) return candidate;
  }

  throw new Error("Unable to generate a unique seed key");
}
