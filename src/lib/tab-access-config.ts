export type ConfigurableTab = {
  label: string;
  href: string;
};

export const CONFIGURABLE_TABS: ConfigurableTab[] = [
  { label: "Overview", href: "/admin" },
  { label: "Faculties", href: "/admin/faculties" },
  { label: "ASC Coaches", href: "/admin/coaches" },
  { label: "Programmes", href: "/admin/programmes" },
  { label: "Course Modules", href: "/admin/course-modules" },
  { label: "Resources", href: "/admin/resources" },
  { label: "FAQs", href: "/admin/faqs" },
  { label: "Analytics", href: "/admin/health" },
  { label: "Imports", href: "/admin/imports" },
];
