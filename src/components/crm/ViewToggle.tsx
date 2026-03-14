'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { LayoutList, KanbanSquare } from 'lucide-react';

export default function ViewToggle() {
   const searchParams = useSearchParams();
   const pathname = usePathname();
   const currentView = searchParams.get('view') === 'kanban' ? 'kanban' : 'table';

   return (
     <div className="flex border border-gray-300 rounded bg-white overflow-hidden shadow-sm">
        <Link 
          href={pathname + '?view=table'}
          className={`px-3 py-1 flex items-center justify-center transition-colors ${currentView === 'table' ? 'bg-[#0176D3] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          title="Display as Table"
        >
          <LayoutList size={16} />
        </Link>
        <div className="w-px bg-gray-300"></div>
        <Link 
          href={pathname + '?view=kanban'}
          className={`px-3 py-1 flex items-center justify-center transition-colors ${currentView === 'kanban' ? 'bg-[#0176D3] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          title="Display as Kanban Board"
        >
          <KanbanSquare size={16} />
        </Link>
     </div>
   );
}
