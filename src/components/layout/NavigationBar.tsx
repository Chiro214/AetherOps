'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Home', href: '/home' },
  { label: 'Leads', href: '/leads' },
  { label: 'Accounts', href: '/accounts' },
  { label: 'Contacts', href: '/contacts' },
  { label: 'Opportunities', href: '/opportunities' },
  { label: 'Cases', href: '/cases' },
  { label: 'Reports', href: '/reports' },
  { label: 'Dashboards', href: '/dashboards' },
];

export default function NavigationBar() {
  const pathname = usePathname();

  return (
    <nav className="h-10 bg-white border-b border-gray-200 flex items-center px-4 flex-shrink-0 z-40 relative shadow-sm">
      <ul className="flex items-center h-full">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
             <li key={item.href} className="h-full">
               <Link 
                 href={item.href}
                 className={`h-full flex items-center px-4 text-sm font-medium transition-colors border-b-2 ${
                   isActive 
                     ? 'text-[#0176D3] border-[#0176D3]' 
                     : 'text-gray-700 border-transparent hover:text-[#0176D3] hover:bg-gray-50'
                 }`}
               >
                 {item.label}
               </Link>
             </li>
          );
        })}
      </ul>
    </nav>
  );
}
