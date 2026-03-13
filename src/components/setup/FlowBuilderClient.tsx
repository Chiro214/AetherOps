'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFlow } from '@/actions/flows';

export default function FlowBuilderClient({ objects, fieldsByObject }: { objects: any[], fieldsByObject: Record<string, any[]> }) {
   const router = useRouter();
   const [isSubmitting, setIsSubmitting] = useState(false);

   const [name, setName] = useState('');
   const [objectId, setObjectId] = useState('');
   const [triggerType, setTriggerType] = useState<'onCreate' | 'onUpdate' | 'onSave'>('onSave');

   const [conditionField, setConditionField] = useState('');
   const [conditionOperator, setConditionOperator] = useState('equals');
   const [conditionValue, setConditionValue] = useState('');

   const [actionSubject, setActionSubject] = useState('');

   const availableFields = objectId ? fieldsByObject[objectId] || [] : [];

   const handleSave = async () => {
      if (!name || !objectId || !conditionField || !conditionValue || !actionSubject) {
         alert('Please fill out all required fields.');
         return;
      }

      setIsSubmitting(true);
      const res = await createFlow({
         name: name.trim(),
         object_id: objectId,
         trigger_type: triggerType,
         conditions: {
            field: conditionField,
            operator: conditionOperator,
            value: conditionValue
         },
         actions: {
            type: 'create_activity',
            payload: {
               subject: actionSubject,
               type: 'Task'
            }
         }
      });
      setIsSubmitting(false);

      if (res.success) {
         router.push('/setup/home'); // Or /setup/flows
      } else {
         alert('Failed to save flow: ' + res.error);
      }
   };

   return (
      <div className="bg-white rounded shadow-sm border border-gray-200">
         <div className="bg-gray-50 border-b border-gray-200 p-4 rounded-t">
            <h2 className="text-sm font-bold text-gray-800 tracking-wide uppercase">Flow Properties</h2>
         </div>

         <div className="p-6 space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Flow Name <span className="text-red-500">*</span></label>
                  <input 
                     value={name} onChange={e => setName(e.target.value)}
                     className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-[#0176D3] focus:border-[#0176D3]"
                     placeholder="e.g. Route Tech Leads"
                  />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Object <span className="text-red-500">*</span></label>
                  <select 
                     value={objectId} onChange={e => { setObjectId(e.target.value); setConditionField(''); }}
                     className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-[#0176D3] focus:border-[#0176D3]"
                  >
                     <option value="">-- Select Object --</option>
                     {objects.map(obj => (
                        <option key={obj.id} value={obj.id}>{obj.label} ({obj.api_name})</option>
                     ))}
                  </select>
               </div>
            </div>

            <div>
               <label className="block text-xs font-semibold text-gray-700 mb-1">Trigger Execution <span className="text-red-500">*</span></label>
               <select 
                  value={triggerType} onChange={e => setTriggerType(e.target.value as any)}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-[#0176D3] focus:border-[#0176D3] max-w-sm"
               >
                  <option value="onSave">Whenever a record is Created or Edited (onSave)</option>
                  <option value="onCreate">Only when a record is Created (onCreate)</option>
                  <option value="onUpdate">Only when a record is Edited (onUpdate)</option>
               </select>
            </div>

            <hr className="border-gray-100" />

            {/* Condition Logic */}
            <div>
               <h3 className="text-sm font-bold text-gray-800 mb-4 tracking-wide uppercase">Condition Logic</h3>
               <div className="flex gap-4">
                  <div className="flex-1">
                     <label className="block text-xs font-semibold text-gray-700 mb-1">Field API Name</label>
                     <select 
                        value={conditionField} onChange={e => setConditionField(e.target.value)}
                        className="w-full border border-gray-300 rounded p-2 text-sm"
                        disabled={!objectId}
                     >
                        <option value="">-- Select Field --</option>
                        {availableFields.map(f => (
                           <option key={f.id} value={f.field_api_name}>{f.field_label} ({f.field_api_name})</option>
                        ))}
                     </select>
                  </div>
                  <div className="flex-1">
                     <label className="block text-xs font-semibold text-gray-700 mb-1">Operator</label>
                     <select 
                        value={conditionOperator} onChange={e => setConditionOperator(e.target.value)}
                        className="w-full border border-gray-300 rounded p-2 text-sm"
                     >
                        <option value="equals">Equals</option>
                        <option value="not_equals">Does Not Equal</option>
                        <option value="contains">Contains</option>
                     </select>
                  </div>
                  <div className="flex-1">
                     <label className="block text-xs font-semibold text-gray-700 mb-1">Value String</label>
                     <input 
                        value={conditionValue} onChange={e => setConditionValue(e.target.value)}
                        className="w-full border border-gray-300 rounded p-2 text-sm"
                        placeholder="e.g. Technology"
                     />
                  </div>
               </div>
            </div>

            <hr className="border-gray-100" />

            {/* Actions */}
            <div>
               <h3 className="text-sm font-bold text-gray-800 mb-4 tracking-wide uppercase">Automated Action</h3>
               <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                  <div className="font-semibold text-sm text-[#0176D3] mb-2">Create Activity (Log a Task)</div>
                  <div>
                     <label className="block text-xs font-semibold text-gray-700 mb-1">Task Subject <span className="text-red-500">*</span></label>
                     <input 
                        value={actionSubject} onChange={e => setActionSubject(e.target.value)}
                        className="w-full border border-gray-300 rounded p-2 text-sm max-w-lg"
                        placeholder="e.g. Follow up with Tech Lead immediately"
                     />
                  </div>
               </div>
            </div>
         </div>

         {/* Footer */}
         <div className="bg-gray-50 border-t border-gray-200 p-4 rounded-b flex justify-end gap-3">
            <button 
               onClick={() => router.back()}
               className="px-4 py-2 border border-gray-300 text-gray-700 rounded shadow-sm text-sm font-semibold hover:bg-gray-100 transition-colors"
               disabled={isSubmitting}
            >
               Cancel
            </button>
            <button 
               onClick={handleSave}
               className="px-4 py-2 bg-[#0176D3] text-white rounded shadow-sm text-sm font-semibold hover:bg-blue-800 transition-colors"
               disabled={isSubmitting}
            >
               {isSubmitting ? 'Saving...' : 'Save & Activate'}
            </button>
         </div>
      </div>
   );
}
