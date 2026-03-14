'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MainNavClient({ navItems }: { navItems: { label: string, href: string }[] }) {
  const pathname = usePathname();

  return (
    <ul className="flex items-center h-full">
      {navItems.map((item) => {
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
  );
}
