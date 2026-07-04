"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, HelpCircle, Link as LinkIcon, Settings, Users, BookMarked, Upload, Home, ShieldCheck } from "lucide-react";

import { isAdminNavItemActive, normalizeAdminPathname, type AdminNavItem } from "@/lib/admin-nav";

const navItems: Array<AdminNavItem & { icon?: ReactNode }> = [
  { label: "Overview", href: "/admin", icon: <Home size={18} /> },
  { label: "Faculties", href: "/admin/faculties", icon: <Settings size={18} /> },
  { label: "ASC Coaches", href: "/admin/coaches", icon: <Users size={18} /> },
  { label: "Programmes", href: "/admin/programmes", icon: <BookMarked size={18} /> },
  { label: "Course Modules", href: "/admin/course-modules", icon: <BookOpen size={18} /> },
  { label: "Resources", href: "/admin/resources", icon: <LinkIcon size={18} /> },
  { label: "FAQs", href: "/admin/faqs", icon: <HelpCircle size={18} /> },
  { label: "Analytics", href: "/admin/health", icon: <BarChart3 size={18} /> },
  { label: "Imports", href: "/admin/imports", icon: <Upload size={18} /> },
];

export function AdminSidebarNav({
  initialPathname = "/admin",
  canManageUsers = false,
  allowedTabs,
}: {
  initialPathname?: string;
  canManageUsers?: boolean;
  allowedTabs?: string[];
}) {
  const pathname = usePathname();
  const currentPathname = normalizeAdminPathname(pathname ?? initialPathname);

  const filteredNavItems = allowedTabs
    ? navItems.filter((item) => allowedTabs.includes(item.href))
    : navItems;

  const visibleNavItems = canManageUsers
    ? [...filteredNavItems, { label: "Admin", href: "/admin/users", icon: <ShieldCheck size={18} /> }]
    : filteredNavItems;

  return (
    <aside className="hidden w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-raised)] lg:flex lg:flex-col">
      <div className="border-b border-[var(--color-border)] px-5 py-5">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 rounded-[var(--radius-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-raised)]"
        >
          <Image
            src="/up-logo.png"
            alt="University of Pretoria logo"
            width={40}
            height={40}
            className="h-9 w-9 flex-shrink-0 rounded-[var(--radius-sm)] object-contain"
            priority
          />
          <div className="min-w-0 leading-tight">
            <p className="text-sm font-semibold tracking-tight text-[var(--color-text)]">
              Academic Success Coaches
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Content workspace
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-4" aria-label="Primary">
        <ul className="space-y-0.5">
          {visibleNavItems.map((item) => {
            const isActive = isAdminNavItemActive(item.href, currentPathname);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "group relative flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors duration-150 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-raised)]",
                    isActive
                      ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-soft-foreground)]"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text)]",
                  ].join(" ")}
                >
                  <span
                    aria-hidden="true"
                    className={[
                      "absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[var(--color-brand)] transition-opacity duration-150",
                      isActive ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                  />
                  {item.icon ? (
                    <span
                      aria-hidden="true"
                      className={[
                        "flex h-4 w-4 flex-shrink-0 items-center justify-center transition-colors",
                        isActive
                          ? "text-[var(--color-brand)]"
                          : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]",
                      ].join(" ")}
                    >
                      {item.icon}
                    </span>
                  ) : null}
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[var(--color-border)] px-4 py-3">
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
          Browser theme preference
        </div>
      </div>
    </aside>
  );
}
