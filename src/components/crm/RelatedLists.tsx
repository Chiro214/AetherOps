import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function RelatedLists({ relatedGroups }: { relatedGroups: any[] }) {
  if (!relatedGroups || relatedGroups.length === 0) {
    return (
       <div className="text-center p-8 text-gray-500 text-sm">
          No related records found.
       </div>
    );
  }

  return (
    <div className="space-y-6">
       {relatedGroups.map((group, idx) => (
          <div key={idx} className="border border-gray-200 rounded shadow-sm bg-white">
             {/* Card Header */}
             <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center rounded-t">
                <div className="flex items-center gap-2">
                   <h3 className="text-sm font-bold text-gray-800">{group.objectLabel}</h3>
                   <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full">{group.records.length}</span>
                </div>
                {/* Note: New record pre-filling is achieved optionally via URL queries */}
                <Link 
                   href={`/${group.objectApiName.toLowerCase()}/new?${group.fieldApiName}=true`} 
                   className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 text-sm font-medium rounded hover:bg-gray-100 transition-colors text-gray-700"
                >
                   <Plus size={14} /> New
                </Link>
             </div>

             {/* Card Body - Minified Data Table */}
             <div className="overflow-x-auto p-2">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-gray-100">
                         <th className="p-2 pl-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Record Name</th>
                      </tr>
                   </thead>
                   <tbody>
                      {group.records.slice(0, 5).map((rec: any) => {
                         const rawLabel = rec.record_data?.Name || rec.record_data?.Title || rec.record_data?.LastName || 'Unknown Record';
                         return (
                            <tr key={rec.id} className="border-b border-gray-50 hover:bg-gray-50 last:border-none">
                               <td className="p-2 pl-2 text-sm font-medium">
                                  <Link href={`/${group.objectApiName.toLowerCase()}/${rec.id}`} className="text-[#0176D3] hover:underline">
                                     {rawLabel}
                                  </Link>
                               </td>
                            </tr>
                         );
                      })}
                   </tbody>
                </table>
             </div>
             {group.records.length > 5 && (
                <div className="p-2 text-center border-t border-gray-100 bg-gray-50 rounded-b">
                   <Link href={`/${group.objectApiName.toLowerCase()}`} className="text-sm text-[#0176D3] hover:underline font-medium">
                      View All
                   </Link>
                </div>
             )}
          </div>
       ))}
    </div>
  );
}
