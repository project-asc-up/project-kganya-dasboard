"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNavLink({
  href,
  children,
}: Readonly<{
  href: string;
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus-ring)] relative overflow-hidden group ${
        isActive
          ? "bg-white text-[color:var(--color-primary)] shadow-md"
          : "text-[color:var(--color-text-muted)] hover:bg-white/60 hover:text-[color:var(--color-primary)]"
      }`}
    >
      {isActive && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-transparent via-[color:var(--color-accent-ochre)] to-transparent rounded-full animate-fade-in"></div>
      )}
      <div className={`absolute inset-0 bg-gradient-to-r from-[color:var(--color-primary)]/0 via-[color:var(--color-primary)]/5 to-[color:var(--color-primary)]/0 opacity-0 ${isActive ? "opacity-100" : "group-hover:opacity-100"} transition-opacity duration-300 pointer-events-none`}></div>
      <span className="relative z-10">{children}</span>
    </Link>
  );
}
