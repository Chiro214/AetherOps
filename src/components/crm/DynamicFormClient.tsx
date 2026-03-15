'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveRecord, updateRecord } from '@/actions/records';
import LookupSearch from '@/components/crm/LookupSearch';
import { ObjectLayoutConfig, LayoutSection } from '@/actions/layouts';

interface SFField {
  id: string;
  field_label: string;
  field_api_name: string;
  data_type: string;
  target_object_id?: string | null;
  is_required: boolean;
  is_custom: boolean;
}

export default function DynamicFormClient({
  objectId,
  objectLabel,
  fields,
  resourceName,
  initialData = {},
  recordId,
  layoutConfig,
}: {
  objectId: string;
  objectLabel: string;
  fields: SFField[];
  resourceName: string;
  initialData?: Record<string, any>;
  recordId?: string;
  layoutConfig?: ObjectLayoutConfig | null;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group fields into two columns for the SLDS layout (simplified split)
  const leftColumnFields = fields.filter((_, i) => i % 2 === 0);
  const rightColumnFields = fields.filter((_, i) => i % 2 !== 0);

  const handleInputChange = (fieldApiName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldApiName]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Dispatch the server action to save or update the generic JSONB record payload
    let result;
    if (recordId) {
      result = await updateRecord(recordId, formData, resourceName);
    } else {
      result = await saveRecord(objectId, formData, resourceName);
    }
    
    setIsSubmitting(false);

    if (result.success) {
      // Redirect back to list view or detail view
      if (recordId) {
        router.push(`/${resourceName}/${recordId}`);
      } else {
        router.push(`/${resourceName}`);
      }
    } else {
      console.error('Failed to save record:', result.error);
      alert(`Failed to save record: ${result.error}`);
    }
  };

  const renderField = (field: SFField) => {
    return (
      <div key={field.id} className="flex relative items-center py-2">
        {field.is_required && (
          <div className="absolute left-0 top-3 bottom-2 w-1 bg-red-600 rounded-l" />
        )}
        <div className={`w-1/3 text-right pr-4 text-xs font-semibold text-gray-700 ${field.is_required ? 'pl-2' : ''}`}>
          {field.field_label}
          {field.is_required && <span className="text-red-600 ml-1">*</span>}
        </div>
        <div className="w-2/3">
          {field.data_type === 'Picklist' ? (
             <select 
               className="w-full text-sm border border-gray-300 rounded p-1.5 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none bg-white"
               value={formData[field.field_api_name] || ''}
               onChange={(e) => handleInputChange(field.field_api_name, e.target.value)}
             >
                <option value="">--None--</option>
                <option value="Option1">Option 1</option>
                <option value="Option2">Option 2</option>
             </select>
          ) : field.data_type === 'Lookup' ? (
             <LookupSearch 
               targetObjectId={field.target_object_id || ''}
               value={formData[field.field_api_name] || ''}
               onChange={(val) => handleInputChange(field.field_api_name, val)}
             />
          ) : field.data_type === 'Checkbox' ? (
             <input 
               type="checkbox" 
               className="w-4 h-4 rounded border-gray-300 text-[#0176D3] focus:ring-[#0176D3]"
               checked={!!formData[field.field_api_name]}
               onChange={(e) => handleInputChange(field.field_api_name, e.target.checked)}
             />
          ) : (
             <input 
               type="text" 
               className="w-full text-sm border border-gray-300 rounded p-1.5 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none"
               value={formData[field.field_api_name] || ''}
               onChange={(e) => handleInputChange(field.field_api_name, e.target.value)}
             />
          )}
        </div>
      </div>
    );
  };

  const renderLayoutDrivenForm = () => {
    if (!layoutConfig || layoutConfig.length === 0) return renderGenericFallback();

    return (
      <div className="flex flex-col w-full gap-6">
        {layoutConfig.map((section: LayoutSection) => (
           <div key={section.id} className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden pb-4">
             <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 mb-4">
               <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{section.sectionName}</h3>
             </div>
             <div className={`grid gap-x-8 gap-y-4 px-6 ${section.columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
               {section.fields.map(apiName => {
                 const originalField = fields.find(f => f.field_api_name === apiName);
                 if (!originalField) return null; // Fault tolerant: quietly ignore missing fields
                 return (
                   <div key={apiName} className="flex flex-col">
                     {/* We wrap the field to act like standard stacked labels for the specific CSS grid */}
                     <div key={originalField.id} className="flex flex-col relative py-1">
                        {originalField.is_required && (
                          <div className="absolute left-0 top-3 bottom-0 w-1 bg-red-600 rounded-l h-5" />
                        )}
                        <div className={`text-xs font-semibold text-gray-700 mb-1 ${originalField.is_required ? 'pl-2' : ''}`}>
                          {originalField.field_label}
                          {originalField.is_required && <span className="text-red-600 ml-1">*</span>}
                        </div>
                        <div className="w-full">
                          {originalField.data_type === 'Picklist' ? (
                             <select 
                               className="w-full text-sm border border-gray-300 rounded p-1.5 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none bg-white"
                               value={formData[originalField.field_api_name] || ''}
                               onChange={(e) => handleInputChange(originalField.field_api_name, e.target.value)}
                             >
                                <option value="">--None--</option>
                                <option value="Option1">Option 1</option>
                                <option value="Option2">Option 2</option>
                             </select>
                          ) : originalField.data_type === 'Lookup' ? (
                             <LookupSearch 
                               targetObjectId={originalField.target_object_id || ''}
                               value={formData[originalField.field_api_name] || ''}
                               onChange={(val) => handleInputChange(originalField.field_api_name, val)}
                             />
                          ) : originalField.data_type === 'Checkbox' ? (
                             <div className="py-1.5">
                               <input 
                                 type="checkbox" 
                                 className="w-4 h-4 rounded border-gray-300 text-[#0176D3] focus:ring-[#0176D3]"
                                 checked={!!formData[originalField.field_api_name]}
                                 onChange={(e) => handleInputChange(originalField.field_api_name, e.target.checked)}
                               />
                             </div>
                          ) : (
                             <input 
                               type="text" 
                               className="w-full text-sm border border-gray-300 rounded p-1.5 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none"
                               value={formData[originalField.field_api_name] || ''}
                               onChange={(e) => handleInputChange(originalField.field_api_name, e.target.value)}
                             />
                          )}
                        </div>
                      </div>
                   </div>
                 );
               })}
             </div>
           </div>
        ))}
      </div>
    );
  };

  const renderGenericFallback = () => {
     return (
        <div className="flex bg-white flex-1 min-h-[40vh] border border-gray-200 rounded shadow-sm">
           {/* Left Column */}
           <div className="flex-1 p-4 border-r border-gray-100">
              {leftColumnFields.map(renderField)}
           </div>

           {/* Right Column */}
           <div className="flex-1 p-4">
              {rightColumnFields.map(renderField)}
           </div>
        </div>
     )
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex flex-col flex-1">
        {renderLayoutDrivenForm()}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 p-4 bg-gray-50 border-t border-gray-200 flex justify-center gap-2 rounded-b">
         <button 
           onClick={() => router.push(`/${resourceName}`)}
           className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-100 transition-colors"
         >
           Cancel
         </button>
         <button 
           className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-100 transition-colors"
         >
           Save &amp; New
         </button>
         <button 
           onClick={handleSubmit}
           disabled={isSubmitting}
           className="px-4 py-1.5 bg-[#0176D3] text-white text-sm font-medium rounded hover:bg-[#014486] transition-colors disabled:opacity-50"
         >
           {isSubmitting ? 'Saving...' : 'Save'}
         </button>
      </div>
    </div>
  );
}
