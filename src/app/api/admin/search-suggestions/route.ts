import { NextResponse } from "next/server";

import { displayFacultyName } from "@/lib/faculty-display";
import {
  searchCoachRows,
  searchFaqRows,
  searchFacultyRows,
  searchResourceRows,
} from "@/lib/admin-queries";
import type { SearchSuggestion } from "@/lib/search-suggestions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ suggestions: [] satisfies SearchSuggestion[] });
  }

  const [faculties, coaches, resources, faqs] = await Promise.all([
    searchFacultyRows(query, 4),
    searchCoachRows(query, 4),
    searchResourceRows(query, 3),
    searchFaqRows(query, 3),
  ]);

  const suggestions: SearchSuggestion[] = [
    ...faculties.map((faculty) => ({
      id: `faculty:${faculty.id}`,
      title: displayFacultyName(faculty.name),
      value: faculty.name,
      detail: `${faculty.code} · ${faculty.codeStatus}`,
      badge: "Faculty",
      href: `/admin/faculties/${faculty.id}`,
    })),
    ...coaches.map((coach) => ({
      id: `coach:${coach.id}`,
      title: coach.name,
      value: coach.name,
      detail: `${coach.email} · ${displayFacultyName(coach.faculty.name)}`,
      badge: coach.faculty.code,
      href: `/admin/coaches/${coach.id}`,
    })),
    ...resources.map((resource) => ({
      id: `resource:${resource.id}`,
      title: resource.title,
      value: resource.title,
      detail: `${resource.category} · ${resource.faculty ? displayFacultyName(resource.faculty.name) : "General"}`,
      badge: "Resource",
      href: `/admin/resources/${resource.id}`,
    })),
    ...faqs.map((faq) => ({
      id: `faq:${faq.id}`,
      title: faq.question,
      value: faq.question,
      detail: `${faq.category} · ${faq.faculty ? displayFacultyName(faq.faculty.name) : "General"}`,
      badge: "FAQ",
      href: `/admin/faqs/${faq.id}`,
    })),
  ];

  return NextResponse.json({ suggestions: suggestions.slice(0, 12) });
}
