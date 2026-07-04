import { headers } from "next/headers";
import { AppBreadcrumbs, type Crumb } from "@/components/app-breadcrumbs";
import { AdminBackButton } from "@/components/admin-back-button";
import { AdminProfileMenu } from "@/components/admin-profile-menu";
import { AdminSidebarNav } from "@/components/admin-sidebar-nav";
import { SessionTimeoutGuard } from "@/components/session-timeout-guard";
import { SearchBar } from "@/components/search-bar";
import { normalizeAdminPathname } from "@/lib/admin-nav";
import { getCurrentAuthorization } from "@/lib/rbac";

/**
 * Resolves the segment path inside `/admin` to a list of breadcrumb
 * crumbs. We use a hand-curated label map rather than per-page
 * `usePathname` so this stays a server component (no client bundle
 * bloat from a 20-line shell).
 *
 * URLs that aren't matched explicitly fall back to the last segment
 * title-cased, which keeps unwired paths from rendering "[object]".
 */
function buildCrumbs(pathname: string): Crumb[] {
  const labels: Record<string, string> = {
    admin: "Admin",
    faculties: "Faculties",
    coaches: "ASC Coaches",
    programmes: "Programmes",
    "course-modules": "Course Modules",
    resources: "Resources",
    faqs: "FAQs",
    health: "Analytics",
    imports: "Imports",
    profile: "Profile",
    search: "Search",
    users: "User Access",
  };

  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "admin") return [];

  const crumbs: Crumb[] = [{ label: "Admin", href: "/admin" }];

  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    const label = labels[segment] ?? toTitle(segment);
    const href = `/${segments.slice(0, i + 1).join("/")}`;
    const isLast = i === segments.length - 1;
    crumbs.push({ label, href, current: isLast });
  }

  return crumbs;
}

function toTitle(segment: string) {
  // Replace dashes/camelCase with spaces, then title-case first letter.
  const spaced = segment.replace(/[-_]/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export async function AdminShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // `next/headers` lets us read the current pathname from a server
  // component without forcing a client-side `usePathname`. We pull the
  // value from the `x-pathname` header (set by the proxy middleware) or
  // fall back to the canonical /admin if it's unavailable.
  const headerStore = await headers();
  const pathname = normalizeAdminPathname(
    headerStore.get("x-pathname") || headerStore.get("x-invoke-path") || "/admin",
  );
  const crumbs = buildCrumbs(pathname);
  const authz = await getCurrentAuthorization();

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text)]">
      <SessionTimeoutGuard />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--color-surface-raised)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--color-brand)] focus:shadow-lg"
      >
        Skip to main content
      </a>

      <div className="flex min-h-screen w-full">
        <AdminSidebarNav
          initialPathname={pathname}
          canManageUsers={authz?.isSuperAdmin ?? false}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex min-h-16 items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-5 py-3 backdrop-blur-sm sm:px-8">
            <div className="min-w-0 flex-1">
              <AppBreadcrumbs crumbs={crumbs} />
            </div>
            <div className="flex items-center gap-3">
              <AdminBackButton />
              <SearchBar />
              <AdminProfileMenu />
            </div>
          </header>

          <main
            id="main-content"
            className="flex-1 px-5 py-6 sm:px-8 lg:px-10"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
