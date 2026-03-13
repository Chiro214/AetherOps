'use client';

import React, { useState, useEffect, useRef } from 'react';
import { searchRecords } from '@/actions/records';
import { Search, X } from 'lucide-react';

export default function LookupSearch({
  targetObjectId,
  value,
  onChange,
}: {
  targetObjectId: string;
  value: string; // The UUID of the selected record
  onChange: (val: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRecordLabel, setSelectedRecordLabel] = useState<string | null>(null);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hydrate initial label if `value` exists but no label yet (Could be passed in or fetched)
  useEffect(() => {
    if (value && !selectedRecordLabel) {
       // Ideally, fetch the label for the specific `value` (ID). For now, as a placeholder until we fetch it:
       setSelectedRecordLabel('Selected Record');
    }
  }, [value, selectedRecordLabel]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        const data = await searchRecords(targetObjectId, searchTerm);
        setResults(data);
        setIsSearching(false);
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, targetObjectId]);

  const handleSelect = (rec: any) => {
     // Naive extraction: usually standard Name or first text field is the identifier
     const label = rec.record_data?.Name || rec.record_data?.Title || 'Unknown';
     setSelectedRecordLabel(label);
     onChange(rec.id);
     setShowDropdown(false);
     setSearchTerm('');
  };

  const handleClear = () => {
     setSelectedRecordLabel(null);
     onChange('');
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
       {selectedRecordLabel && value ? (
          <div className="flex items-center justify-between border border-gray-300 rounded p-1.5 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] bg-blue-50">
             <div className="flex items-center gap-2">
                <span className="text-sm text-[#0176D3] font-medium ml-1">{selectedRecordLabel}</span>
             </div>
             <button onClick={handleClear} className="text-gray-500 hover:text-gray-800 pr-1">
                <X size={14} />
             </button>
          </div>
       ) : (
          <div className="relative">
             <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               className="w-full text-sm border border-gray-300 rounded py-1.5 pl-7 pr-3 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none placeholder-gray-400"
               placeholder="Search related object..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
             />
          </div>
       )}

       {showDropdown && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto z-50">
             {isSearching ? (
                <div className="p-3 text-sm text-gray-500 text-center">Searching...</div>
             ) : (
                <ul className="py-1">
                   {results.map((rec) => {
                      const label = rec.record_data?.Name || rec.record_data?.Title || 'Unknown';
                      return (
                         <li 
                            key={rec.id} 
                            className="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer border-b border-gray-50 last:border-none"
                            onClick={() => handleSelect(rec)}
                         >
                            <div className="font-semibold text-[#0176D3]">{label}</div>
                            {/* Option to show secondary snippet */}
                         </li>
                      );
                   })}
                </ul>
             )}
          </div>
       )}

       {showDropdown && searchTerm.length >= 2 && results.length === 0 && !isSearching && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 p-3 text-sm text-center text-gray-500">
             No matching records found.
          </div>
       )}
    </div>
  );
}
