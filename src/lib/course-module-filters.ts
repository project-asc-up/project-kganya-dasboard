import { displayFacultyName } from "@/lib/faculty-display";
import { rankSuggestions, type SearchSuggestion } from "@/lib/search-suggestions";

export type CourseModuleProgrammeOption = {
  id: string;
  programmeCode: string;
  programmeName: string;
  faculty: {
    id: string;
    name: string;
    code: string;
  };
};

export type CourseModuleSuggestionRow = {
  id: string;
  moduleCode: string;
  moduleName: string | null;
  programmeCode: string;
  programmeName: string | null;
  programme: {
    faculty: {
      id: string;
      name: string;
      code: string;
    };
  };
};

export function buildCourseModuleFacultyOptions(programmes: CourseModuleProgrammeOption[]) {
  return Array.from(new Map(programmes.map((programme) => [programme.faculty.id, programme.faculty])).values()).sort(
    (a, b) => displayFacultyName(a.name).localeCompare(displayFacultyName(b.name)),
  );
}

export function buildCourseModuleProgrammeOptions(
  programmes: CourseModuleProgrammeOption[],
  facultyId: string,
) {
  const filtered =
    facultyId !== "all"
      ? programmes.filter((programme) => programme.faculty.id === facultyId)
      : programmes;

  return [...filtered].sort((a, b) => a.programmeName.localeCompare(b.programmeName));
}

export function buildCourseModuleSearchSuggestions(
  rows: CourseModuleSuggestionRow[],
  query: string,
  limit = 8,
) {
  const suggestions: SearchSuggestion[] = rows.flatMap((module) => {
    const programmeName = module.programmeName ?? module.programmeCode;
    const moduleName = module.moduleName ?? "Unnamed module";
    const facultyName = displayFacultyName(module.programme.faculty.name);
    const detail = `${module.programmeCode} - ${programmeName} | ${facultyName}`;
    const searchText = [
      module.moduleCode,
      module.moduleName,
      module.programmeCode,
      module.programmeName,
      module.programme.faculty.code,
      facultyName,
    ]
      .filter(Boolean)
      .join(" ");

    return [
      {
        id: `module-code:${module.id}`,
        title: `${module.moduleCode} - ${moduleName}`,
        value: module.moduleCode,
        detail,
        badge: "Module code",
        searchText,
      },
      {
        id: `module-name:${module.id}`,
        title: moduleName,
        value: moduleName,
        detail: `${module.moduleCode} | ${detail}`,
        badge: "Module name",
        searchText,
      },
      {
        id: `programme-code:${module.id}`,
        title: `${module.programmeCode} - ${programmeName}`,
        value: module.programmeCode,
        detail: `${module.moduleCode} | ${facultyName}`,
        badge: "Programme code",
        searchText,
      },
      {
        id: `programme-name:${module.id}`,
        title: programmeName,
        value: programmeName,
        detail: `${module.programmeCode} | ${module.moduleCode} | ${facultyName}`,
        badge: "Programme name",
        searchText,
      },
    ];
  });

  const uniqueSuggestions = Array.from(
    new Map(suggestions.map((suggestion) => [`${suggestion.badge}:${suggestion.value}`, suggestion])).values(),
  );

  return rankSuggestions(query, uniqueSuggestions, limit);
}
