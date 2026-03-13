import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRecordById } from '@/actions/records';
import ActivityPublisher from '@/components/crm/ActivityPublisher';
import ActivityTimeline from '@/components/crm/ActivityTimeline';

export const revalidate = 0;

export default async function RecordDetailView({ params }: { params: Promise<{ resource: string, id: string }> }) {
  const resolvedParams = await params;
  const { resource: resourceName, id: recordId } = resolvedParams;

  const { getObjects, getFieldsForObject } = await import('@/actions/metadata');
  
  // 1. Fetch metadata to understand the object
  const allObjects = await getObjects();
  const obj = allObjects.find((o) => o.plural_label.toLowerCase() === resourceName.toLowerCase() || o.api_name.toLowerCase() === resourceName.toLowerCase());

  if (!obj) {
    notFound();
  }

  // 2. Fetch the specific record
  const record = await getRecordById(recordId);

  // Ensure record exists and belongs to this object
  if (!record || record.object_id !== obj.id) {
    notFound();
  }

  // 3. Fetch fields to define the layout
  const fields = await getFieldsForObject(obj.id);

  // Derive the primary label (usually the first text field, or just "Name" fallback)
  const primaryLabelField = fields.find((f: any) => f.field_api_name.toLowerCase() === 'name') || fields[0];
  const recordName = primaryLabelField 
      ? record.record_data?.[primaryLabelField.field_api_name] 
      : 'Record';

  // 4. Resolve lookup names
  const lookupMap: Record<string, { label: string, resourceName: string }> = {};
  const lookupFields = fields.filter((f: any) => f.data_type === 'Lookup' && record.record_data?.[f.field_api_name]);
  
  if (lookupFields.length > 0) {
     await Promise.all(lookupFields.map(async (f: any) => {
        const val = record.record_data[f.field_api_name];
        const targetObj = allObjects.find(o => o.id === f.target_object_id);
        if (targetObj && val) {
           const targetRec = await getRecordById(val);
           if (targetRec) {
              const targetFields = await getFieldsForObject(targetObj.id);
              const nameField = targetFields.find((tf: any) => tf.field_api_name.toLowerCase() === 'name') || targetFields[0];
              const resolvedName = nameField ? targetRec.record_data?.[nameField.field_api_name] : 'Record';
              lookupMap[f.field_api_name] = { 
                 label: resolvedName || 'Record',
                 resourceName: targetObj.plural_label.toLowerCase() || targetObj.api_name.toLowerCase()
              };
           }
        }
     }));
  }

  return (
    <div className="flex flex-col h-full bg-[#f3f3f3] p-4 overflow-y-auto space-y-4">
      {/* Highlights Panel */}
      <div className="bg-white rounded shadow-sm border border-gray-200 p-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7F8DE1] rounded flex items-center justify-center text-white shrink-0">
               <span className="text-xl font-bold">{obj.label.charAt(0)}</span>
            </div>
            <div>
               <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{obj.label}</div>
               <h1 className="text-xl font-bold text-gray-900">{recordName || 'Untitled'}</h1>
            </div>
         </div>
         <div className="flex gap-2">
            <Link 
               href={`/${resourceName}/${recordId}/edit`}
               className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors pointer-cursor"
            >
               Edit
            </Link>
            <button className="px-3 py-1.5 bg-white border border-gray-300 text-red-600 text-sm font-medium rounded hover:bg-gray-50 transition-colors">
               Delete
            </button>
         </div>
      </div>

      {/* Main Canvas Grid */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
         
         {/* Left Column: Details Tab (70%) */}
         <div className="w-full md:w-[70%] bg-white rounded shadow-sm border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-100 flex gap-4">
               <button className="text-sm font-semibold text-[#0176D3] border-b-2 border-[#0176D3] pb-1">Details</button>
               <button className="text-sm font-semibold text-gray-500 hover:text-gray-800 pb-1">Related</button>
            </div>
            <div className="p-6">
               <h2 className="text-base font-bold text-gray-800 mb-6">Information</h2>
               <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  {fields.map((field: any) => {
                     const value = record.record_data?.[field.field_api_name];
                     const isLookup = field.data_type === 'Lookup' && !!value;
                     const lookupInfo = isLookup ? lookupMap[field.field_api_name] : null;

                     return (
                        <div key={field.id} className="flex flex-col border-b border-gray-100 pb-2">
                           <span className="text-xs text-gray-500 font-medium mb-1">{field.field_label}</span>
                           <span className="text-sm text-gray-900">
                              {isLookup && lookupInfo ? (
                                 <Link href={`/${lookupInfo.resourceName}/${value}`} className="text-[#0176D3] hover:underline">
                                    {lookupInfo.label}
                                 </Link>
                              ) : value !== undefined && value !== null && value !== '' 
                                 ? (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value))
                                 : '—'}
                           </span>
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>

         {/* Right Column: Activity / Related Sidebar (30%) */}
         <div className="w-full md:w-[30%] flex flex-col gap-4 min-h-[400px]">
            <ActivityPublisher recordId={recordId} resourceName={resourceName} />
            <ActivityTimeline recordId={recordId} />
         </div>

      </div>
    </div>
  );
}
