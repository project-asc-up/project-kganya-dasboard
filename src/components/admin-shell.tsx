import Image from "next/image";
import { AdminNavLink } from "@/components/admin-nav-link";

type NavItem = {
  label: string;
  href: string;
  meta?: string;
};

const navItems: NavItem[] = [
  { label: "Overview", href: "/admin", meta: "Phase 2" },
  { label: "Faculties", href: "/admin/faculties", meta: "Phase 2" },
  { label: "ASC Coaches", href: "/admin/coaches", meta: "Phase 2" },
  { label: "Programmes", href: "/admin/programmes", meta: "Phase 2" },
  { label: "Course Modules", href: "/admin/course-modules", meta: "Phase 3" },
  { label: "Resources", href: "/admin/resources", meta: "Phase 3" },
  { label: "FAQs", href: "/admin/faqs", meta: "Phase 3" },
  { label: "Health", href: "/admin/health", meta: "Phase 4" },
  { label: "Imports", href: "/admin/imports", meta: "Phase 4" },
];

export function AdminShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(0,59,122,0.12),_transparent_36%),linear-gradient(180deg,#f4f4f4_0%,#ffffff_20%,#ffffff_100%)] text-[color:var(--color-text)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[color:var(--color-primary)] focus:shadow-lg"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-[color:var(--color-border)] bg-[color:var(--color-primary-dark)] text-white lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-6 py-6">
            <div className="inline-flex rounded-2xl bg-white px-3 py-2 shadow-sm">
              <Image
                src="/up-logo.png"
                alt="University of Pretoria logo"
                width={180}
                height={180}
                className="h-16 w-auto object-contain"
                priority
              />
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">Project ASC</h1>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Admin UI foundation for UP faculty, coach, programme, resource, and FAQ management.
            </p>
          </div>

          <nav className="flex-1 px-4 py-6" aria-label="Primary">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.label}>
                  <AdminNavLink href={item.href}>
                    <span>{item.label}</span>
                    {item.meta ? (
                      <span className="rounded-full border border-white/15 px-2 py-0.5 text-[11px] uppercase tracking-[0.18em] text-white/60">
                        {item.meta}
                      </span>
                    ) : null}
                  </AdminNavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-white/10 px-6 py-5 text-sm text-white/75">
            <p className="font-semibold text-white">Phase-driven rollout</p>
            <p className="mt-1 leading-6">
              Build the shell first, then add CRUD screens on top of the same layout and form patterns.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-[color:var(--color-border)] bg-white/85 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-white p-2 shadow-sm">
                  <Image
                    src="/up-logo.png"
                    alt="University of Pretoria logo"
                    width={132}
                    height={132}
                    className="h-10 w-auto object-contain"
                    priority
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-text-muted)]">
                    Make today matter
                  </p>
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    Admin shell and design foundation
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="hidden rounded-full border border-[color:var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[color:var(--color-primary)] transition hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary-dark)] sm:inline-flex"
                >
                  Search
                </button>
                <button
                  type="button"
                  className="rounded-full bg-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--color-hover)]"
                >
                  Phase 5 Live
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
