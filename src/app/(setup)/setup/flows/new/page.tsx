import React from 'react';
import { getObjects, getFieldsForObject } from '@/actions/metadata';
import FlowBuilderClient from '@/components/setup/FlowBuilderClient';

export default async function NewFlowPage() {
   const objects = await getObjects();
   // Fetch fields for all objects to pass down (for a small schema MVP this is fine)
   const fieldsByObject: Record<string, any[]> = {};
   for (const obj of objects) {
      const fields = await getFieldsForObject(obj.id);
      fieldsByObject[obj.id] = fields;
   }

   return (
      <div className="max-w-4xl mx-auto py-8">
         <h1 className="text-2xl font-bold text-gray-900 mb-6 font-sans">New Record-Triggered Flow</h1>
         <FlowBuilderClient objects={objects} fieldsByObject={fieldsByObject} />
      </div>
   );
}
