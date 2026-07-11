const PUNCTUATION_REPLACEMENTS: ReadonlyArray<[RegExp, string]> = [
  [/[‘’‚‛]/g, "'"],
  [/[“”„‟]/g, '"'],
  [/[‐-―−]/g, "-"],
  [/[…]/g, "..."],
];

/** Normalize user-entered identity fields without changing their meaning. */
export function normalizeIdentityPart(value: string | null | undefined): string {
  let normalized = (value ?? "").normalize("NFKC");
  for (const [pattern, replacement] of PUNCTUATION_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized.trim().replace(/\s+/gu, " ").toLocaleLowerCase("en-US");
}

export type FaqIdentityInput = {
  facultyId: string | null | undefined;
  category: string | null | undefined;
  question: string;
};

export function faqIdentity(input: FaqIdentityInput): string {
  const faculty = normalizeIdentityPart(input.facultyId) || "general";
  const category = normalizeIdentityPart(input.category) || "uncategorized";
  const question = normalizeIdentityPart(input.question);
  return domainIdentity("faq", [faculty, category, question]);
}

export function domainIdentity(
  namespace: string,
  parts: ReadonlyArray<string | null | undefined> | Record<string, string | null | undefined>,
): string {
  const values = Array.isArray(parts)
    ? parts
    : Object.keys(parts)
        .sort()
        .map((key) => `${normalizeIdentityPart(key)}=${normalizeIdentityPart(parts[key])}`);
  return [normalizeIdentityPart(namespace), ...values.map(normalizeIdentityPart)].join("|");
}
