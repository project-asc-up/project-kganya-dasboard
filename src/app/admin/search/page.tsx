import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader, Section } from "@/components/admin-form";
import { AdminSearchForm } from "@/components/admin-search-form";
import { MetricCard, MetricGrid } from "@/components/metric-card";
import {
  searchCoachRows,
  searchCourseModuleRows,
  searchFaqRows,
  searchFacultyRows,
  searchProgrammeRows,
  searchResourceRows,
} from "@/lib/admin-queries";
import { coachMatchesQuery } from "@/lib/coach-search";
import { displayFacultyName } from "@/lib/faculty-display";

export const dynamic = "force-dynamic";

type ResultItem = {
  key: string;
  href: string;
  title: string;
  subtitle: string;
  badge: string;
  meta: string[];
};

const exampleSearches = [
  "engineering",
  "study tips",
  "maths coach",
  "undergraduate",
  "course code",
];

function normalizeQuery(value: string | undefined) {
  return value?.trim() ?? "";
}

function includesText(value: string | null | undefined, query: string) {
  return value ? value.toLowerCase().includes(query) : false;
}

function ResultGroup({
  title,
  description,
  items,
  emptyMessage,
}: {
  title: string;
  description: string;
  items: ResultItem[];
  emptyMessage: string;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-[color:var(--color-primary-dark)]">{title}</h3>
          <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">{description}</p>
        </div>
        <span className="rounded-full border border-[color:var(--color-border)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
          {items.length} result{items.length === 1 ? "" : "s"}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] p-6 text-sm text-[color:var(--color-text-muted)]">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-[0_12px_40px_rgba(0,32,80,0.04)] transition hover:-translate-y-0.5 hover:border-[color:var(--color-primary)] hover:shadow-[0_16px_50px_rgba(0,32,80,0.08)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[color:var(--color-bg-light)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-primary-dark)]">
                      {item.badge}
                    </span>
                  </div>
                  <h4 className="mt-3 text-lg font-semibold tracking-tight text-[color:var(--color-primary-dark)]">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">{item.subtitle}</p>
                </div>
                <ArrowRight className="mt-1 text-[color:var(--color-text-muted)]" size={18} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-[color:var(--color-text-muted)]">
                {item.meta.map((meta) => (
                  <span key={meta} className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] px-3 py-1">
                    {meta}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = normalizeQuery(q);
  const lowerQuery = query.toLowerCase();

  if (!query) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Admin Search"
          title="Search across the admin knowledge base"
          description="Find faculties, coaches, programmes, course modules, resources, and FAQs from one place."
        />

        <Section title="Search editor" description="Use the form below to search the live admin index.">
          <AdminSearchForm initialQuery={query} />

          <div className="mt-6 flex flex-wrap gap-3">
            {exampleSearches.map((term) => (
              <Link
                key={term}
                href={`/admin/search?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] px-4 py-2 text-sm font-semibold text-[color:var(--color-primary-dark)] transition hover:border-[color:var(--color-primary)] hover:bg-white"
              >
                {term}
              </Link>
            ))}
          </div>
        </Section>

        <Section
          title="Search guidance"
          description="This route now searches the real admin datasets instead of fake placeholder rows."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] p-5">
              <p className="text-sm font-semibold text-[color:var(--color-primary-dark)]">Best searches</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">
                Use faculty names, coach names, programme codes, resource titles, FAQ keywords, or module codes.
              </p>
            </div>
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] p-5">
              <p className="text-sm font-semibold text-[color:var(--color-primary-dark)]">Fast flow</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">
                Search here first, then open the matching detail page for edits or verification.
              </p>
            </div>
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] p-5">
              <p className="text-sm font-semibold text-[color:var(--color-primary-dark)]">Editing loop</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">
                Use the search result, then jump to the relevant admin page to update the source record.
              </p>
            </div>
          </div>
        </Section>
      </div>
    );
  }

  const [faculties, coaches, programmes, resources, faqs, modules] = await Promise.all([
    searchFacultyRows(query),
    searchCoachRows(query),
    searchProgrammeRows(query),
    searchResourceRows(query),
    searchFaqRows(query),
    searchCourseModuleRows(query),
  ]);

  const facultyResults: ResultItem[] = faculties
    .filter((faculty) => {
      const aliases = faculty.aliases
        ? Array.isArray(faculty.aliases)
          ? faculty.aliases
          : [faculty.aliases]
        : [];

      return (
        includesText(faculty.name, lowerQuery) ||
        includesText(faculty.code, lowerQuery) ||
        aliases.some((alias) => includesText(alias, lowerQuery)) ||
        includesText(faculty.codeStatus, lowerQuery)
      );
    })
    .map((faculty) => ({
      key: faculty.id,
      href: `/admin/faculties/${faculty.id}`,
      title: displayFacultyName(faculty.name),
      subtitle: `${faculty.code} - ${faculty.codeStatus}`,
      badge: "Faculty",
      meta: [
        `${faculty._count.ascCoaches} coaches`,
        `${faculty._count.programmes} programmes`,
        `${faculty._count.resources} resources`,
      ],
    }));

  const coachResults: ResultItem[] = coaches
    .filter((coach) =>
      coachMatchesQuery(
        {
          id: coach.id,
          name: coach.name,
          email: coach.email,
          titleRole: coach.titleRole,
          cluster: coach.cluster,
          isActive: coach.isActive,
          faculty: coach.faculty,
        },
        query,
      ),
    )
    .map((coach) => ({
      key: coach.id,
      href: `/admin/coaches/${coach.id}`,
      title: coach.name,
      subtitle: coach.titleRole ?? coach.level ?? displayFacultyName(coach.faculty.name),
      badge: "Coach",
      meta: [coach.faculty.code, displayFacultyName(coach.faculty.name), coach.isActive ? "Active" : "Inactive"],
    }));

  const programmeResults: ResultItem[] = programmes
    .filter((programme) => {
      return [
        programme.programmeCode,
        programme.programmeName,
        programme.degreeName,
        programme.academicLevel,
        programme.qualificationType,
        programme.faculty.name,
        programme.faculty.code,
      ].some((value) => includesText(value, lowerQuery));
    })
    .map((programme) => ({
      key: programme.id,
      href: `/admin/programmes/${programme.id}`,
      title: `${programme.programmeCode} - ${programme.programmeName}`,
      subtitle: programme.degreeName ?? programme.qualificationType ?? "Programme record",
      badge: "Programme",
      meta: [
        programme.faculty.code,
        displayFacultyName(programme.faculty.name),
        programme.durationYears ? `${programme.durationYears} years` : "No duration",
      ],
    }));

  const resourceResults: ResultItem[] = resources
    .filter((resource) => {
      return [
        resource.title,
        resource.description,
        resource.category,
        resource.url,
        resource.faculty?.name,
        resource.faculty?.code,
      ].some((value) => includesText(value, lowerQuery));
    })
    .map((resource) => ({
      key: resource.id,
      href: `/admin/resources/${resource.id}`,
      title: resource.title,
      subtitle: resource.description ?? resource.url,
      badge: "Resource",
      meta: [resource.category, resource.faculty ? displayFacultyName(resource.faculty.name) : "General", resource.lastVerified ? "Verified" : "Needs review"],
    }));

  const faqResults: ResultItem[] = faqs
    .filter((faq) => {
      return [faq.question, faq.answer, faq.category, faq.faculty?.name, faq.faculty?.code].some((value) =>
        includesText(value, lowerQuery),
      );
    })
    .map((faq) => ({
      key: faq.id,
      href: `/admin/faqs/${faq.id}`,
      title: faq.question,
      subtitle: faq.answer,
      badge: "FAQ",
      meta: [faq.category, faq.faculty ? displayFacultyName(faq.faculty.name) : "General", `Priority ${faq.priority}`],
    }));

  const moduleResults: ResultItem[] = modules
    .filter((module) => {
      return [
        module.moduleCode,
        module.moduleName,
        module.yearLevelRaw,
        module.moduleType,
        module.programmeCode,
        module.programmeName,
        module.programme.faculty.name,
        module.programme.faculty.code,
      ].some((value) => includesText(value, lowerQuery));
    })
    .map((module) => ({
      key: module.id,
      href: `/admin/course-modules/${module.id}`,
      title: `${module.moduleCode} - ${module.moduleName ?? "Not set"}`,
      subtitle: `${module.programmeCode} - ${module.programmeName}`,
      badge: "Module",
      meta: [module.programme.faculty.code, displayFacultyName(module.programme.faculty.name), `Year ${module.yearLevelRaw}`],
    }));

  const totalMatches =
    facultyResults.length +
    coachResults.length +
    programmeResults.length +
    resourceResults.length +
    faqResults.length +
    moduleResults.length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin Search"
        title={`Search: ${query}`}
        description="Find faculties, coaches, programmes, course modules, resources, and FAQs from one place."
      />

      <Section title="Search editor" description="Use the form below to search the live admin index.">
        <AdminSearchForm initialQuery={query} />
      </Section>

      <MetricGrid className="md:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Matches" value={totalMatches} detail="All result groups combined." />
        <MetricCard label="Faculties" value={facultyResults.length} detail="Faculty records in scope." />
        <MetricCard label="Coaches" value={coachResults.length} detail="ASC contacts in scope." />
        <MetricCard label="Programmes" value={programmeResults.length} detail="Programme records in scope." />
        <MetricCard label="Resources" value={resourceResults.length} detail="Support resources in scope." />
        <MetricCard label="Modules" value={moduleResults.length} detail="Course modules in scope." />
      </MetricGrid>

      <Section title="Search results" description="Grouped by content type for fast scanning and editing.">
        <div className="space-y-8">
          <ResultGroup
            title="Faculties"
            description="Institution-level records, codes, and data quality signals."
            items={facultyResults}
            emptyMessage="No faculty records matched this search."
          />
          <ResultGroup
            title="Coaches"
            description="ASC contacts grouped by faculty, title, and activity state."
            items={coachResults}
            emptyMessage="No coaches matched this search."
          />
          <ResultGroup
            title="Programmes"
            description="Programme master data with faculty context and duration."
            items={programmeResults}
            emptyMessage="No programmes matched this search."
          />
          <ResultGroup
            title="Resources"
            description="Support links and reference material."
            items={resourceResults}
            emptyMessage="No resources matched this search."
          />
          <ResultGroup
            title="FAQs"
            description="Knowledge-base answers surfaced for quick editing."
            items={faqResults}
            emptyMessage="No FAQs matched this search."
          />
          <ResultGroup
            title="Course modules"
            description="Curriculum rows found in the current module slice."
            items={moduleResults}
            emptyMessage="No course modules matched this search."
          />
        </div>
      </Section>
    </div>
  );
}
