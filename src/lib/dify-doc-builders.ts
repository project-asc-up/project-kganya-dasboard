const METADATA_CONFIGS = {
  faculties: {
    tableName: "faculties",
    tableRole: "Organization Divisions",
    tableDescription: "Academic divisions (Faculties) of the university, containing support URLs and contact hubs."
  },
  asc_coaches: {
    tableName: "asc_coaches",
    tableRole: "Support Personnel",
    tableDescription: "Contact details, office locations, appointment links, and levels for Academic Success Coaches."
  },
  programmes: {
    tableName: "programmes",
    tableRole: "Academic Curriculums",
    tableDescription: "Degree programs offered by the university, including credit requirements, duration, and course modules."
  },
  resources: {
    tableName: "resources",
    tableRole: "Support Links",
    tableDescription: "Stores external web links and support document URLs grouped by category (e.g. Registration, Fees)."
  },
  faqs: {
    tableName: "faqs",
    tableRole: "Standard Q&As",
    tableDescription: "Stores frequently asked questions and answers for academic advising and general queries."
  }
} as const;

function formatMetadataHeader(tableKey: keyof typeof METADATA_CONFIGS, recordId: string) {
  const config = METADATA_CONFIGS[tableKey];
  return [
    `<!--`,
    `SOURCE DATABASE TABLE: ${config.tableName}`,
    `TABLE ROLE: ${config.tableRole}`,
    `TABLE DESCRIPTION: ${config.tableDescription}`,
    `RECORD IDENTIFIER (UUID): ${recordId}`,
    `-->`,
    `*System Note for AI Agent: This content represents a single row from the '${config.tableName}' database table. Use the metadata below for resolving references.*`,
    `Database Table: ${config.tableName}`,
    `Table Description: ${config.tableDescription}`,
    `Record ID (UUID): ${recordId}`,
    `---`,
    ""
  ].join("\n");
}

export function buildFacultyText(input: {
  id: string;
  name: string;
  code: string;
  codeStatus: string;
  officialPageUrl: string | null;
  supportPageUrl: string | null;
  sourceUrl: string | null;
  notes: string | null;
}) {
  const metadataHeader = formatMetadataHeader("faculties", input.id);
  const lines = [
    `# Faculty: ${input.name}`,
    `- Code: ${input.code}`,
    `- Code Status: ${input.codeStatus}`,
    input.officialPageUrl ? `- Official Page URL: ${input.officialPageUrl}` : null,
    input.supportPageUrl ? `- Support Page URL: ${input.supportPageUrl}` : null,
    input.sourceUrl ? `- Source URL: ${input.sourceUrl}` : null,
    input.notes ? `- Notes: ${input.notes}` : null,
  ].filter(Boolean);
  return metadataHeader + lines.join("\n").trim();
}

export function buildCoachText(input: {
  id: string;
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
  const metadataHeader = formatMetadataHeader("asc_coaches", input.id);
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
  return metadataHeader + lines.join("\n").trim();
}

export function buildProgrammeText(
  programme: {
    id: string;
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
  const metadataHeader = formatMetadataHeader("programmes", programme.id);
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

  return metadataHeader + lines.join("\n").trim();
}

export function buildResourceTextContent(input: {
  id: string;
  title: string;
  category: string;
  description: string | null;
  url: string;
  sourceUrl: string | null;
  notes: string | null;
}) {
  const metadataHeader = formatMetadataHeader("resources", input.id);
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

  return metadataHeader + lines.join("\n").trim();
}

export function buildFaqText(input: {
  id: string;
  question: string;
  answer: string;
  category: string;
}) {
  const metadataHeader = formatMetadataHeader("faqs", input.id);
  return metadataHeader + `# FAQ: ${input.question}\n- Category: ${input.category}\n\nAnswer:\n${input.answer}`;
}
