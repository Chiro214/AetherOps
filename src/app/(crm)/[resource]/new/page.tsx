import React from 'react';
import { notFound } from 'next/navigation';
import DynamicFormClient from '@/components/crm/DynamicFormClient';

export const revalidate = 0;

export default async function NewRecordPage({ params }: { params: Promise<{ resource: string }> }) {
  const resolvedParams = await params;
  const resourceName = resolvedParams.resource;
  
  const { getObjects, getFieldsForObject } = await import('@/actions/metadata');
  const allObjects = await getObjects();
  const obj = allObjects.find((o) => o.plural_label.toLowerCase() === resourceName.toLowerCase() || o.api_name.toLowerCase() === resourceName.toLowerCase());

  if (!obj) {
    notFound();
  }

  const fields = await getFieldsForObject(obj.id);

  return (
    <div className="p-8 h-full bg-[#f3f3f3] flex items-center justify-center overflow-auto">
      {/* SLDS Modal-style wrapper */}
      <div className="bg-white rounded shadow-lg max-w-4xl w-full flex flex-col border border-gray-200 min-h-[50vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3 rounded-t">
            <div className="w-8 h-8 bg-[#7F8DE1] rounded flex items-center justify-center text-white shrink-0">
               <span className="text-lg font-bold">{obj.label.charAt(0)}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">New {obj.label}</h2>
        </div>

        {/* Modal Body / Client component injected here */}
        <div className="p-6 flex-1 overflow-y-auto bg-white">
          <DynamicFormClient objectId={obj.id} objectLabel={obj.label} fields={fields} resourceName={resourceName} />
        </div>
      </div>
    </div>
  );
}
