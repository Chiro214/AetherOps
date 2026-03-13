import React from 'react';
import { getObjectByApiName, getFieldsForObject } from '@/actions/metadata';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';

export const revalidate = 0;

export default async function FieldsAndRelationshipsPage({ params }: { params: Promise<{ api_name: string }> }) {
  const resolvedParams = await params;
  const obj = await getObjectByApiName(resolvedParams.api_name);
  if (!obj) notFound();

  const fields = await getFieldsForObject(obj.id);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Bar */}
      <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
         <h2 className="text-md font-bold text-gray-900">Fields &amp; Relationships</h2>
         
         <div className="flex gap-2">
           <button className="px-3 py-1 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors">Field Dependencies</button>
           <Link href={`/setup/object-manager/${resolvedParams.api_name}/fields-relationships/new`} className="flex items-center gap-1.5 px-3 py-1 bg-[#0176D3] text-white text-sm font-medium rounded hover:bg-[#014486] transition-colors pointer-cursor">
             New Field
           </Link>
         </div>
      </div>
      
      {/* Toolbar */}
      <div className="p-2 border-b border-gray-200 flex items-center justify-between">
         <div className="text-sm text-gray-500">{fields.length} Items, Sorted by Field Label</div>
         <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Quick Find" className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] w-64" />
         </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto">
         <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 border-b border-gray-200 shadow-sm">
               <tr>
                  <th className="p-2 pl-4 text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:underline">Field Label</th>
                  <th className="p-2 text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:underline">Field Name</th>
                  <th className="p-2 text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:underline">Data Type</th>
                  <th className="p-2 text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:underline">Custom</th>
                  <th className="p-2 text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:underline">Required</th>
               </tr>
            </thead>
            <tbody>
               {(!fields || fields.length === 0) ? (
                 <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">
                       No fields found for this object.
                    </td>
                 </tr>
               ) : (
                 fields.map((field: { id: string, field_label: string, field_api_name: string, data_type: string, is_custom: boolean, is_required: boolean }) => (
                   <tr key={field.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2 pl-4 text-sm font-medium text-[#0176D3] hover:underline cursor-pointer">
                         {field.field_label}
                      </td>
                      <td className="p-2 text-sm text-gray-900">{field.field_api_name}</td>
                      <td className="p-2 text-sm text-gray-900">{field.data_type}</td>
                      <td className="p-2 text-sm">
                         {field.is_custom ? (
                            <span className="text-green-600">✓</span>
                         ) : null}
                      </td>
                      <td className="p-2 text-sm">
                         {field.is_required ? (
                            <span className="text-red-500">Yes</span>
                         ) : null}
                      </td>
                   </tr>
                 ))
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}
