import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRecordById, getRelatedRecords } from '@/actions/records';
import { getLayoutForObject, ObjectLayoutConfig, LayoutSection } from '@/actions/layouts';
import ActivityPublisher from '@/components/crm/ActivityPublisher';
import ActivityTimeline from '@/components/crm/ActivityTimeline';
import RecordTabs from '@/components/crm/RecordTabs';
import RelatedLists from '@/components/crm/RelatedLists';

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
  const layoutConfig = await getLayoutForObject(obj.id);

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

  // 5. Fetch reverse related records
  const relatedGroups = await getRelatedRecords(obj.id, recordId);

  return (
    <div className="flex flex-col h-full bg-[#f3f3f3] dark:bg-void p-6 overflow-y-auto space-y-6 transition-colors duration-300 scrollbar-thin">
      {/* Highlights Panel */}
      <div className="bg-white dark:bg-void-light rounded-xl shadow-sm border border-gray-200 dark:border-void-lighter p-6 flex items-center justify-between transition-all">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg transform active:scale-95 transition-transform">
               <span className="text-2xl font-black">{obj.label.charAt(0)}</span>
            </div>
            <div>
               <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{obj.label}</div>
               <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{recordName || 'Untitled'}</h1>
            </div>
         </div>
         <div className="flex gap-3">
            <Link 
               href={`/${resourceName}/${recordId}/edit`}
               className="px-4 py-2 bg-white dark:bg-void border border-gray-200 dark:border-void-lighter text-gray-700 dark:text-gray-200 text-sm font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-void-lighter shadow-sm transition-all transform active:scale-95"
            >
               Edit
            </Link>
            <button className="px-4 py-2 bg-white dark:bg-void border border-gray-200 dark:border-void-lighter text-red-600 dark:text-red-400 text-sm font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-void-lighter shadow-sm transition-all transform active:scale-95">
               Delete
            </button>
         </div>
      </div>

      {/* Main Canvas Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
         
         {/* Left Column: Details Tab (70%) */}
         <RecordTabs 
            detailsContent={
               <div className="flex flex-col gap-8">
                  {layoutConfig && layoutConfig.length > 0 ? (
                     layoutConfig.map((section: LayoutSection) => (
                        <div key={section.id} className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
                           <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-void-lighter pb-3 mb-6">
                              {section.sectionName}
                           </h3>
                           <div className={`grid gap-x-12 gap-y-6 ${section.columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                              {section.fields.map((apiName: string) => {
                                 const field = fields.find((f: any) => f.field_api_name === apiName);
                                 if (!field) return null;

                                 const value = record.record_data?.[field.field_api_name];
                                 const isLookup = field.data_type === 'Lookup' && !!value;
                                 const lookupInfo = isLookup ? lookupMap[field.field_api_name] : null;

                                 return (
                                    <div key={field.id} className="flex flex-col group border-b border-transparent hover:border-gray-100 dark:hover:border-void-lighter pb-2 transition-all">
                                       <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1 group-hover:text-aether-blue transition-colors">{field.field_label}</span>
                                       <span className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
                                          {isLookup && lookupInfo ? (
                                             <Link href={`/${lookupInfo.resourceName}/${value}`} className="text-aether-blue dark:text-blue-400 hover:underline underline-offset-4">
                                                {lookupInfo.label}
                                             </Link>
                                          ) : value !== undefined && value !== null && value !== '' 
                                             ? (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value))
                                             : <span className="text-gray-300 dark:text-gray-700 font-normal italic">—</span>}
                                       </span>
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-void-lighter pb-3 mb-6">Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                           {fields.map((field: any) => {
                              const value = record.record_data?.[field.field_api_name];
                              const isLookup = field.data_type === 'Lookup' && !!value;
                              const lookupInfo = isLookup ? lookupMap[field.field_api_name] : null;

                              return (
                                 <div key={field.id} className="flex flex-col group border-b border-transparent hover:border-gray-100 dark:hover:border-void-lighter pb-2 transition-all">
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1 group-hover:text-aether-blue transition-colors">{field.field_label}</span>
                                    <span className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
                                       {isLookup && lookupInfo ? (
                                          <Link href={`/${lookupInfo.resourceName}/${value}`} className="text-aether-blue dark:text-blue-400 hover:underline underline-offset-4">
                                             {lookupInfo.label}
                                          </Link>
                                       ) : value !== undefined && value !== null && value !== '' 
                                          ? (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value))
                                          : <span className="text-gray-300 dark:text-gray-700 font-normal italic">—</span>}
                                    </span>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  )}
               </div>
            }
            relatedContent={
               <RelatedLists relatedGroups={relatedGroups} />
            }
         />

         {/* Right Column: Activity / Related Sidebar (30%) */}
         <div className="w-full lg:w-[30%] flex flex-col gap-6 min-h-[400px]">
            <ActivityPublisher recordId={recordId} resourceName={resourceName} />
            <ActivityTimeline recordId={recordId} />
         </div>

      </div>
    </div>
  );
}
