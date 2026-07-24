export function buildFacultyText(input: {
  name: string;
  code: string;
  codeStatus: string;
  officialPageUrl: string | null;
  supportPageUrl: string | null;
  sourceUrl: string | null;
  notes: string | null;
}) {
  const lines = [
    `# Faculty: ${input.name}`,
    `- Code: ${input.code}`,
    `- Code Status: ${input.codeStatus}`,
    input.officialPageUrl ? `- Official Page URL: ${input.officialPageUrl}` : null,
    input.supportPageUrl ? `- Support Page URL: ${input.supportPageUrl}` : null,
    input.sourceUrl ? `- Source URL: ${input.sourceUrl}` : null,
    input.notes ? `- Notes: ${input.notes}` : null,
  ].filter(Boolean);
  return lines.join("\n").trim();
}

export function buildCoachText(input: {
  name: string;
  email: string;
  titleRole: string | null;
  phone: string | null;
  cell: string | null;
  officeLocation: string | null;
  building: string | null;
  appointmentLink: string | null;
  cluster: string | null;
  responsibilities: string | null;
  level: string;
  notes: string | null;
  facultyName?: string | null;
  facultyCode?: string | null;
}) {
  const lines = [
    `# Coach: ${input.name}`,
    input.facultyName ? `- Faculty: ${input.facultyName} (${input.facultyCode ?? ""})` : null,
    `- Email: ${input.email}`,
    input.titleRole ? `- Role/Title: ${input.titleRole}` : null,
    input.phone ? `- Phone: ${input.phone}` : null,
    input.cell ? `- Cell: ${input.cell}` : null,
    input.officeLocation ? `- Office Location: ${input.officeLocation}` : null,
    input.building ? `- Building: ${input.building}` : null,
    input.appointmentLink ? `- Appointment Link: ${input.appointmentLink}` : null,
    input.cluster ? `- Cluster: ${input.cluster}` : null,
    input.responsibilities ? `- Responsibilities: ${input.responsibilities}` : null,
    `- Level: ${input.level}`,
    input.notes ? `- Notes: ${input.notes}` : null,
  ].filter(Boolean);
  return lines.join("\n").trim();
}

export function buildProgrammeText(
  programme: {
    programmeName: string;
    programmeCode: string;
    degreeName: string | null;
    academicLevel: string | null;
    qualificationType: string | null;
    durationYears: number | null;
    programmeCredits: number | null;
    notes: string | null;
  },
  modules: Array<{
    moduleCode: string;
    moduleName: string | null;
    moduleType: string;
    moduleUnits: number;
    yearLevelRaw: string;
    notes: string | null;
  }>
) {
  const lines = [
    `# Programme: ${programme.programmeName}`,
    `- Programme Code: ${programme.programmeCode}`,
    programme.degreeName ? `- Degree Name: ${programme.degreeName}` : null,
    programme.academicLevel ? `- Academic Level: ${programme.academicLevel}` : null,
    programme.qualificationType ? `- Qualification Type: ${programme.qualificationType}` : null,
    programme.durationYears ? `- Duration (Years): ${programme.durationYears}` : null,
    programme.programmeCredits ? `- Credits: ${programme.programmeCredits}` : null,
    programme.notes ? `- Notes: ${programme.notes}` : null,
    "",
    "## Course Modules:",
  ].filter((l) => l !== null);

  if (modules.length === 0) {
    lines.push("No course modules registered for this programme.");
  } else {
    lines.push("| Module Code | Module Name | Type | Units | Year Level | Notes |");
    lines.push("|---|---|---|---|---|---|");
    for (const mod of modules) {
      lines.push(
        `| ${mod.moduleCode} | ${mod.moduleName ?? "N/A"} | ${mod.moduleType} | ${mod.moduleUnits} | ${mod.yearLevelRaw} | ${mod.notes ?? "N/A"} |`
      );
    }
  }

  return lines.join("\n").trim();
}

export function buildResourceTextContent(input: {
  title: string;
  category: string;
  description: string | null;
  url: string;
  sourceUrl: string | null;
  notes: string | null;
}) {
  const lines = [
    `# ${input.title}`,
    "",
    `- Category: ${input.category}`,
    `- URL: ${input.url}`,
    input.sourceUrl ? `- Source URL: ${input.sourceUrl}` : null,
    input.notes ? `- Notes: ${input.notes}` : null,
    input.description ? "" : null,
    input.description ? input.description : null,
  ].filter((line): line is string => line !== null);

  return lines.join("\n").trim();
}

export function buildFaqText(input: {
  question: string;
  answer: string;
  category: string;
}) {
  return `# FAQ: ${input.question}\n- Category: ${input.category}\n\nAnswer:\n${input.answer}`;
}
