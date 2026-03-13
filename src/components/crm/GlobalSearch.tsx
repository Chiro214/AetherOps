'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { globalSearch } from '@/actions/search';

export default function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Record<string, any>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setIsSearching(true);
        const data = await globalSearch(searchTerm);
        setResults(data);
        setIsSearching(false);
        setShowDropdown(true);
      } else {
        setResults({});
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const hasResults = Object.keys(results).length > 0;

  return (
    <div className="flex-1 max-w-2xl mx-8 relative" ref={wrapperRef}>
      <div className="relative group">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#0176D3] transition-colors z-10" />
        <input 
          type="text" 
          placeholder="Search Setup, Apps, and Items..." 
          className="w-full h-8 pl-9 pr-3 bg-gray-100 border border-transparent rounded-md text-sm text-gray-900 focus:bg-white focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none transition-all placeholder:text-gray-500 relative z-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => { if (searchTerm.length >= 2) setShowDropdown(true); }}
        />
        
        {/* Dropdown Results */}
        {showDropdown && (
          <div className="absolute top-0 pt-10 pb-2 left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-0 max-h-[80vh] overflow-y-auto">
             {isSearching ? (
                 <div className="p-4 text-center text-sm text-gray-500">Searching all records...</div>
             ) : hasResults ? (
                 Object.values(results).map((group: any) => (
                    <div key={group.api_name} className="mb-2 last:mb-0">
                       <h3 className="px-3 py-1 bg-gray-50 border-y border-gray-100 text-xs font-bold text-gray-700 uppercase tracking-wide">
                          {group.label}
                       </h3>
                       <ul>
                          {group.items.map((rec: any) => {
                             const label = rec.record_data?.Name || rec.record_data?.Title || rec.record_data?.LastName || 'Unknown Record';
                             // Show a secondary snippet if possible, e.g. company or email
                             const secondary = rec.record_data?.Email || rec.record_data?.Company || rec.record_data?.Phone || '';
                             
                             return (
                                <li key={rec.id}>
                                   <Link 
                                      href={`/${group.api_name.toLowerCase()}/${rec.id}`}
                                      onClick={() => setShowDropdown(false)}
                                      className="block px-4 py-2 hover:bg-[#f3f3f3] transition-colors"
                                   >
                                      <div className="text-sm font-medium text-[#0176D3]">{label}</div>
                                      {secondary && <div className="text-xs text-gray-500 truncate">{secondary}</div>}
                                   </Link>
                                </li>
                             );
                          })}
                       </ul>
                    </div>
                 ))
             ) : (
                 <div className="p-4 text-center text-sm text-gray-500">No results found for "{searchTerm}"</div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
