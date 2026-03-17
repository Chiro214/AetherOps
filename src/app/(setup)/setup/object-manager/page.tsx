import React from 'react';
import Link from 'next/link';
import { getObjects } from '@/actions/metadata';
import { Search } from 'lucide-react';

export const revalidate = 0;

export default async function ObjectManagerPage() {
  const objects = await getObjects();

  return (
    <div className="bg-white rounded border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Setup &gt; Object Manager</div>
          <h1 className="text-xl font-bold flex items-center gap-2 mt-1">
            Object Manager
          </h1>
        </div>
        <div className="flex gap-2">
           <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors">Schema Builder</button>
           <Link 
             href="/setup/object-manager/new"
             className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0176D3] text-white text-sm font-medium rounded hover:bg-[#014486] transition-colors shadow-sm active:scale-95"
           >
             Create
           </Link>
        </div>
      </div>

      {/* List Toolbar */}
      <div className="p-3 border-b border-gray-200 flex items-center gap-4 bg-white">
         <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Quick Find in Object Manager..." className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] w-80" />
         </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto bg-white">
         <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 border-b border-gray-200 shadow-sm">
               <tr>
                  <th className="p-2 pl-4 text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:underline">Label</th>
                  <th className="p-2 text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:underline">API Name</th>
                  <th className="p-2 text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:underline">Type</th>
                  <th className="p-2 text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:underline">Description</th>
                  <th className="p-2 text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:underline">Last Modified</th>
               </tr>
            </thead>
            <tbody>
               {(!objects || objects.length === 0) ? (
                 <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">
                       No objects found.
                    </td>
                 </tr>
               ) : (
                 objects.map((obj: { id: string, api_name: string, label: string, is_custom: boolean, description: string | null, updated_at: string }) => (
                   <tr key={obj.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                      <td className="p-2 pl-4 text-sm text-[#0176D3] font-medium hover:underline cursor-pointer">
                         <Link href={`/setup/object-manager/${obj.api_name}`}>{obj.label}</Link>
                      </td>
                      <td className="p-2 text-sm text-gray-900">{obj.api_name}</td>
                      <td className="p-2 text-sm text-gray-900">{obj.is_custom ? 'Custom Object' : 'Standard Object'}</td>
                      <td className="p-2 text-sm text-gray-900">{obj.description || ''}</td>
                      <td className="p-2 text-sm text-gray-900">{new Date(obj.updated_at).toLocaleDateString()}</td>
                   </tr>
                 ))
               )}
            </tbody>
         </table>
      </div>
      
      {/* Footer */}
      <div className="p-2 border-t border-gray-200 text-xs text-gray-500 flex justify-between bg-gray-50">
         <span>{objects?.length || 0} items</span>
         <span>Sorted by Label</span>
      </div>
    </div>
  );
}
