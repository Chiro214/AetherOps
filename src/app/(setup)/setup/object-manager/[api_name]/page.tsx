import React from 'react';
import { getObjectByApiName } from '@/actions/metadata';
import { notFound } from 'next/navigation';

export default async function ObjectDetailsHome({ params }: { params: Promise<{ api_name: string }> }) {
  const resolvedParams = await params;
  const obj = await getObjectByApiName(resolvedParams.api_name);
  if (!obj) notFound();

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Object Details</h2>
      <div className="bg-white border text-sm border-gray-200 rounded shadow-sm max-w-3xl">
         <div className="flex border-b border-gray-100">
            <div className="w-1/3 p-3 bg-gray-50 text-gray-600 font-medium border-r border-gray-100">Label</div>
            <div className="w-2/3 p-3 text-gray-900">{obj.label}</div>
         </div>
         <div className="flex border-b border-gray-100">
            <div className="w-1/3 p-3 bg-gray-50 text-gray-600 font-medium border-r border-gray-100">Plural Label</div>
            <div className="w-2/3 p-3 text-gray-900">{obj.plural_label}</div>
         </div>
         <div className="flex border-b border-gray-100">
            <div className="w-1/3 p-3 bg-gray-50 text-gray-600 font-medium border-r border-gray-100">API Name</div>
            <div className="w-2/3 p-3 text-gray-900">{obj.api_name}</div>
         </div>
         <div className="flex border-b border-gray-100">
            <div className="w-1/3 p-3 bg-gray-50 text-gray-600 font-medium border-r border-gray-100">Custom Object</div>
            <div className="w-2/3 p-3 text-gray-900">
               {obj.is_custom ? (
                 <div className="w-4 h-4 bg-[#0176D3] rounded-sm inline-block"></div>
               ) : (
                 <div className="w-4 h-4 border border-gray-300 rounded-sm inline-block"></div>
               )}
            </div>
         </div>
         <div className="flex">
            <div className="w-1/3 p-3 bg-gray-50 text-gray-600 font-medium border-r border-gray-100">Description</div>
            <div className="w-2/3 p-3 text-gray-900">{obj.description || 'No description provided.'}</div>
         </div>
      </div>
    </div>
  );
}
