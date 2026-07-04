import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  buildCourseModuleFacultyOptions,
  buildCourseModuleProgrammeOptions,
  buildCourseModuleSearchSuggestions,
} from "@/lib/course-module-filters";
import {
  buildResourceFacultyOptions,
  filterResourcesByFaculty,
} from "@/lib/resource-filters";

const programmes = [
  {
    id: "1",
    programmeCode: "EMS101",
    programmeName: "Economics",
    faculty: { id: "ems", name: "Faculty of Economic and Management Sciences", code: "EMS" },
  },
  {
    id: "2",
    programmeCode: "VET201",
    programmeName: "Veterinary Science",
    faculty: { id: "vet", name: "Faculty of Veterinary Sciences", code: "VET" },
  },
  {
    id: "3",
    programmeCode: "EMS102",
    programmeName: "Business Science",
    faculty: { id: "ems", name: "Faculty of Economic and Management Sciences", code: "EMS" },
  },
];

const resources = [
  { id: "r1", title: "Study Skills", faculty: null },
  { id: "r2", title: "Vet Guide", faculty: { id: "vet", name: "Faculty of Veterinary Sciences", code: "VET" } },
  { id: "r3", title: "EMS Guide", faculty: { id: "ems", name: "Faculty of Economic and Management Sciences", code: "EMS" } },
];

function readSourceFile(pathFromRoot: string) {
  return readFileSync(join(process.cwd(), pathFromRoot), "utf8");
}

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) return listSourceFiles(path);
    if (/\.(ts|tsx|css)$/.test(entry)) return [path];
    return [];
  });
}

test("course module faculty options are deduplicated and sorted", () => {
  const options = buildCourseModuleFacultyOptions(programmes);
  assert.deepEqual(options.map((option) => option.code), ["EMS", "VET"]);
});

test("course module programme options cascade by faculty", () => {
  const emsOnly = buildCourseModuleProgrammeOptions(programmes, "ems");
  assert.deepEqual(emsOnly.map((programme) => programme.programmeCode), ["EMS102", "EMS101"]);

  const allProgrammes = buildCourseModuleProgrammeOptions(programmes, "all");
  assert.equal(allProgrammes.length, 3);
});

test("course module search suggestions cover module and programme fields", () => {
  const suggestions = buildCourseModuleSearchSuggestions(
    [
      {
        id: "mod-1",
        moduleCode: "VKK 120",
        moduleName: "Veterinary Anatomy",
        programmeCode: "BVSC",
        programmeName: "Bachelor of Veterinary Science",
        programme: {
          faculty: { id: "vet", name: "Faculty of Veterinary Sciences", code: "VET" },
        },
      },
      {
        id: "mod-2",
        moduleCode: "OBS 114",
        moduleName: "Business Management",
        programmeCode: "BCom",
        programmeName: "Bachelor of Commerce",
        programme: {
          faculty: { id: "ems", name: "Faculty of Economic and Management Sciences", code: "EMS" },
        },
      },
    ],
    "veterinary",
  );

  assert.deepEqual(
    suggestions.slice(0, 2).map((suggestion) => suggestion.id),
    ["module-name:mod-1", "programme-name:mod-1"],
  );
  assert.deepEqual(
    suggestions.map((suggestion) => suggestion.badge),
    ["Module name", "Programme name", "Programme code", "Module code"],
  );
  assert.equal(suggestions[0].value, "Veterinary Anatomy");
});

test("course module filter UI uses live autocomplete suggestions", () => {
  const source = readSourceFile("src/components/course-module-filters.tsx");

  assert.match(source, /LiveSearchInput/);
  assert.match(source, /course-module-suggestions/);
  assert.match(source, /onSelectSuggestion/);
  assert.match(source, /md:grid-cols-2/);
  assert.match(source, /md:col-span-2 xl:col-span-1/);
  assert.match(source, /sm:flex-row/);
  assert.match(source, /sm:w-auto/);
});

test("resource faculty filtering keeps all resources for all faculties", () => {
  const facultyOptions = buildResourceFacultyOptions(resources);
  assert.deepEqual(facultyOptions.map((faculty) => faculty.code), ["EMS", "VET"]);

  const filtered = filterResourcesByFaculty(resources, "vet");
  assert.deepEqual(filtered.map((resource) => resource.title), ["Vet Guide"]);

  const all = filterResourcesByFaculty(resources, "all");
  assert.equal(all.length, 3);
});

test("course module filters do not render a Clear control", () => {
  const source = readSourceFile("src/components/course-module-filters.tsx");

  assert.doesNotMatch(source, />\s*Clear\s*</);
});

test("application source uses the Academic Success Coaches product name", () => {
  const sourceFiles = listSourceFiles(join(process.cwd(), "src"));
  const oldProductName = ["Project", "ASC"].join(" ");
  const matches = sourceFiles.filter((path) => readFileSync(path, "utf8").includes(oldProductName));

  assert.deepEqual(matches, []);
});
