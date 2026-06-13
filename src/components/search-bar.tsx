"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="hidden sm:flex">
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="Search across all tables..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-full border border-[color:var(--color-border)] bg-white px-4 py-2 pl-10 text-sm font-medium text-[color:var(--color-text)] placeholder-[color:var(--color-text-muted)] transition-smooth hover:border-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus-ring)]"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-[color:var(--color-text-muted)]" size={16} />
      </div>
    </form>
  );
}
