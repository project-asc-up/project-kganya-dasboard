"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, HelpCircle, Link as LinkIcon, Settings, Users, BookMarked, Upload, Home, ShieldCheck, Menu, X } from "lucide-react";

import { isAdminNavItemActive, normalizeAdminPathname, type AdminNavItem } from "@/lib/admin-nav";
import { IconButton } from "@/components/ui/icon-button";

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

type AdminNavProps = {
  initialPathname?: string;
  canManageUsers?: boolean;
  allowedTabs?: string[];
};

function useVisibleAdminNavItems({
  allowedTabs,
  canManageUsers,
}: Pick<AdminNavProps, "allowedTabs" | "canManageUsers">) {
  const filteredNavItems = allowedTabs
    ? navItems.filter((item) => allowedTabs.includes(item.href))
    : navItems;

  return canManageUsers
    ? [...filteredNavItems, { label: "Admin", href: "/admin/users", icon: <ShieldCheck size={18} /> }]
    : filteredNavItems;
}

function useCurrentAdminPathname(initialPathname: string) {
  const pathname = usePathname();
  return normalizeAdminPathname(pathname ?? initialPathname);
}

function AdminBrandLink({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/admin"
      onClick={onClick}
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
  );
}

function AdminNavLinks({
  currentPathname,
  items,
  onNavigate,
}: {
  currentPathname: string;
  items: Array<AdminNavItem & { icon?: ReactNode }>;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const isActive = isAdminNavItemActive(item.href, currentPathname);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              onClick={onNavigate}
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
  );
}

export function AdminSidebarNav({
  initialPathname = "/admin",
  canManageUsers = false,
  allowedTabs,
}: AdminNavProps) {
  const currentPathname = useCurrentAdminPathname(initialPathname);
  const visibleNavItems = useVisibleAdminNavItems({ allowedTabs, canManageUsers });

  return (
    <aside className="hidden w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-raised)] lg:flex lg:flex-col">
      <div className="border-b border-[var(--color-border)] px-5 py-5">
        <AdminBrandLink />
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-4" aria-label="Primary">
        <AdminNavLinks currentPathname={currentPathname} items={visibleNavItems} />
      </nav>

      <div className="border-t border-[var(--color-border)] px-4 py-3">
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
          Browser theme preference
        </div>
      </div>
    </aside>
  );
}

export function AdminMobileNav({
  initialPathname = "/admin",
  canManageUsers = false,
  allowedTabs,
}: AdminNavProps) {
  const drawerId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const currentPathname = useCurrentAdminPathname(initialPathname);
  const visibleNavItems = useVisibleAdminNavItems({ allowedTabs, canManageUsers });

  const closeDrawer = useCallback((restoreFocus = true) => {
    setIsOpen(false);
    if (restoreFocus) {
      window.setTimeout(() => openButtonRef.current?.focus(), 0);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeDrawer, isOpen]);

  return (
    <div className="lg:hidden">
      <IconButton
        ref={openButtonRef}
        type="button"
        variant="ghost"
        aria-label="Open navigation menu"
        aria-controls={drawerId}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="shrink-0"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </IconButton>

      <div
        className={[
          "fixed inset-0 z-50 transition",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => closeDrawer()}
          className={[
            "absolute inset-0 bg-slate-950/45 transition-opacity duration-200",
            isOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        <aside
          id={drawerId}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className={[
            "absolute inset-y-0 left-0 flex w-[min(20rem,calc(100vw-2.5rem))] flex-col",
            "border-r border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-xl)]",
            "transition-transform duration-200 ease-out",
            isOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
            <AdminBrandLink onClick={() => setIsOpen(false)} />
            <IconButton
              ref={closeButtonRef}
              type="button"
              variant="ghost"
              aria-label="Close navigation menu"
              onClick={() => closeDrawer()}
              className="shrink-0"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </IconButton>
          </div>

          <nav className="flex-1 overflow-y-auto px-2.5 py-4" aria-label="Mobile primary">
            <AdminNavLinks
              currentPathname={currentPathname}
              items={visibleNavItems}
              onNavigate={() => closeDrawer(false)}
            />
          </nav>

          <div className="border-t border-[var(--color-border)] px-4 py-3">
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
              Browser theme preference
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
