import Image from "next/image";
import { AdminNavLink } from "@/components/admin-nav-link";

type NavItem = {
  label: string;
  href: string;
  icon?: string;
};

const navItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: "📊" },
  { label: "Faculties", href: "/admin/faculties", icon: "🏫" },
  { label: "ASC Coaches", href: "/admin/coaches", icon: "👥" },
  { label: "Programmes", href: "/admin/programmes", icon: "📚" },
  { label: "Course Modules", href: "/admin/course-modules", icon: "📖" },
  { label: "Resources", href: "/admin/resources", icon: "🔗" },
  { label: "FAQs", href: "/admin/faqs", icon: "❓" },
  { label: "Analytics", href: "/admin/health", icon: "📈" },
  { label: "Imports", href: "/admin/imports", icon: "📤" },
];

export function AdminShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-white text-[color:var(--color-text)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[color:var(--color-primary)] focus:shadow-lg"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-[color:var(--color-border)] bg-white lg:flex lg:flex-col">
          <div className="border-b border-[color:var(--color-border)] px-6 py-6 bg-white">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 flex-shrink-0 rounded-lg bg-white border border-[color:var(--color-border)] flex items-center justify-center overflow-hidden">
                <Image
                  src="/up-logo.png"
                  alt="University of Pretoria logo"
                  width={180}
                  height={180}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold tracking-tight text-[color:var(--color-primary)]">
                  Project ASC
                </h1>
                <p className="text-xs text-[color:var(--color-text-muted)] leading-tight mt-0.5">University of Pretoria Bot Knowledge Portal</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-0.5" aria-label="Primary">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.label}>
                  <AdminNavLink href={item.href} icon={item.icon}>
                    {item.label}
                  </AdminNavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-[color:var(--color-border)] bg-white sticky top-0 z-40">
            <div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-accent-ochre)]">
                  Make today matter
                </p>
                <h2 className="mt-1.5 text-lg font-semibold text-[color:var(--color-primary-dark)] tracking-tight">
                  Admin Management System
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="hidden rounded-full border border-[color:var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[color:var(--color-primary)] transition-smooth hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-bg-light)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus-ring)] sm:inline-flex"
                >
                  Search
                </button>
              </div>
            </div>
          </header>

          <main id="main-content" className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
