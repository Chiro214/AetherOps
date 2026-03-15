'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, ChevronDown, User, Shield, Box, Workflow, Home, Database } from 'lucide-react';

const MENU = [
  {
    category: 'Administration',
    items: [
      { label: 'Users', href: '/setup/users', icon: User },
      { label: 'Profiles', href: '/setup/profiles', icon: Shield },
    ]
  },
  {
    category: 'Platform Tools',
    items: [
      { label: 'Object Manager', href: '/setup/object-manager', icon: Box },
      { label: 'Flows', href: '/setup/flows', icon: Workflow },
      { label: 'Data Import', href: '/setup/data-import', icon: Database },
    ]
  }
];

export default function SetupSidebar() {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Administration': true,
    'Platform Tools': true
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col overflow-y-auto">
       <div className="p-4 border-b border-gray-100">
          <Link href="/setup/home" className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#0176D3] transition-colors">
             <Home size={16} /> Setup Home
          </Link>
       </div>

       <div className="flex-1 py-2">
         {MENU.map((section) => (
            <div key={section.category} className="mb-2">
               <button 
                 onClick={() => toggleCategory(section.category)}
                 className="w-full flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:bg-gray-50 transition-colors"
               >
                 {expandedCategories[section.category] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                 {section.category}
               </button>
               
               {expandedCategories[section.category] && (
                 <ul className="mt-1 flex flex-col">
                   {section.items.map((item) => {
                     const isActive = pathname.startsWith(item.href);
                     return (
                       <li key={item.href}>
                         <Link 
                           href={item.href}
                           className={`flex items-center gap-2 px-6 py-1.5 text-sm transition-colors border-l-2 ${
                             isActive 
                               ? 'border-[#0176D3] text-[#0176D3] font-medium bg-[#0176D3]/5' 
                               : 'border-transparent text-gray-700 hover:bg-gray-50'
                           }`}
                         >
                           <item.icon size={16} className={isActive ? 'text-[#0176D3]' : 'text-gray-400'} />
                           {item.label}
                         </Link>
                       </li>
                     );
                   })}
                 </ul>
               )}
            </div>
         ))}
       </div>
    </aside>
  );
}
