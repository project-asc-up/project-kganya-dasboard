'use client';

import { useState, useMemo } from 'react';
import { TextInput } from '@/components/admin-form';

interface SearchableTableProps {
  children: React.ReactNode;
  data: any[];
  searchFields: string[];
  placeholder?: string;
  onSearchChange?: (query: string, filteredData: any[]) => void;
}

export function SearchableTable({
  children,
  data,
  searchFields,
  placeholder = "Search...",
  onSearchChange,
}: SearchableTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    
    const query = searchQuery.toLowerCase();
    return data.filter(item => {
      return searchFields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return value?.toString().toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchFields]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    onSearchChange?.(newQuery, filteredData);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="w-full sm:w-64">
          <TextInput
            name="search"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      {children}
      {filteredData.length === 0 && (
        <div className="text-center py-8 text-[color:var(--color-text-muted)]">
          No results found for "{searchQuery}"
        </div>
      )}
    </div>
  );
}
