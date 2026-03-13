import React from 'react';
import { notFound } from 'next/navigation';
import { Search } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function DynamicListView({ params }: { params: Promise<{ resource: string }> }) {
  const resolvedParams = await params;
  const resourceName = resolvedParams.resource;
  
  // Basic lookup: In a real app we might query sf_objects matching plural_label, 
  // but for now let's just assume the URL is lowercase plural (e.g. 'accounts')
  // and we try to map it to standard objects. Or we can import supabase admin here and query.
  // Actually we have a getObjectByApiName, maybe we need getObjectByPluralName? Let's add that to actions.
  // For now, let's write a quick temporary map or fetch all and find the match.
  const { getObjects, getFieldsForObject } = await import('@/actions/metadata');
  const { getRecordsForObject } = await import('@/actions/records');
  const allObjects = await getObjects();
  const obj = allObjects.find((o) => o.plural_label.toLowerCase() === resourceName.toLowerCase() || o.api_name.toLowerCase() === resourceName.toLowerCase());

  if (!obj) {
    notFound();
  }

  const fields = await getFieldsForObject(obj.id);
  const records = await getRecordsForObject(obj.api_name);
  // Show standard fields as default columns, maybe up to 5
  const columns = fields.filter(f => !f.is_custom).slice(0, 5);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#7F8DE1] rounded flex items-center justify-center text-white shrink-0">
            <span className="text-xl font-bold">{obj.label.charAt(0)}</span>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{obj.plural_label}</div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              All {obj.plural_label} <span className="text-[#0176D3] cursor-pointer text-sm">▼</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-2">
           <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors">Import</button>
           <Link href={`/${resourceName}/new`} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0176D3] text-white text-sm font-medium rounded hover:bg-[#014486] transition-colors">
             New {obj.label}
           </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-white text-sm">
         <span className="text-gray-500">{records.length} items • Sorted by Updated At</span>
         <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder={`Search this list...`} className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] w-64" />
         </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto bg-white">
         <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 border-b border-gray-200 shadow-sm">
               <tr>
                  <th className="p-2 pl-4 w-10">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  {columns.map(col => (
                    <th key={col.id} className="p-2 text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:underline">
                      {col.field_label}
                    </th>
                  ))}
               </tr>
            </thead>
            <tbody>
               {(!records || records.length === 0) ? (
                 <tr>
                    <td colSpan={columns.length + 1} className="p-12 text-center text-gray-500 text-sm">
                       <p className="mb-2 text-lg font-bold text-gray-700">No records found.</p>
                       <p>Click <Link href={`/${resourceName}/new`} className="text-[#0176D3] hover:underline font-medium">New</Link> to create one.</p>
                    </td>
                 </tr>
               ) : (
                 records.map((record: any) => (
                   <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                      <td className="p-2 pl-4 w-10">
                         <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      {columns.map((col: any, index: number) => {
                        const cellValue = record.record_data?.[col.field_api_name] || '';
                        
                        // The first mapped column gets the clickable Link treatment
                        if (index === 0) {
                           return (
                             <td key={col.id} className="p-2 text-sm font-medium text-[#0176D3] hover:underline cursor-pointer">
                                <Link href={`/${resourceName}/${record.id}`}>{cellValue || '—'}</Link>
                             </td>
                           );
                        }
                        
                        // All other columns render text normally
                        return (
                          <td key={col.id} className="p-2 text-sm text-gray-900 truncate max-w-xs cursor-pointer">
                            {typeof cellValue === 'boolean' ? (cellValue ? 'Yes' : 'No') : cellValue}
                          </td>
                        );
                      })}
                   </tr>
                 ))
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}
