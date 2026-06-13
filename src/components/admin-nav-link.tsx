"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNavLink({
  href,
  children,
  icon,
}: Readonly<{
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus-ring)] ${
        isActive
          ? "bg-[color:var(--color-primary)] text-white"
          : "text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-bg-light)] hover:text-[color:var(--color-primary)]"
      }`}
    >
      {icon && <span className="flex-shrink-0 text-base">{icon}</span>}
      <span>{children}</span>
    </Link>
  );
}
