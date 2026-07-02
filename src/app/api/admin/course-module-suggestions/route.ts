import { NextResponse } from "next/server";

import { getCourseModulePage } from "@/lib/admin-queries";
import { buildCourseModuleSearchSuggestions } from "@/lib/course-module-filters";
import type { SearchSuggestion } from "@/lib/search-suggestions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ suggestions: [] satisfies SearchSuggestion[] });
  }

  const page = await getCourseModulePage({
    query,
    page: 1,
    pageSize: 12,
    facultyId: searchParams.get("facultyId") ?? undefined,
    programmeId: searchParams.get("programmeId") ?? undefined,
  });

  return NextResponse.json({
    suggestions: buildCourseModuleSearchSuggestions(page.rows, query),
  });
}
