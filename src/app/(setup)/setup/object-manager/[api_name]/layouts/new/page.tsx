'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getObjectByApiName, getFieldsForObject } from '@/actions/metadata';
import { saveLayout, LayoutSection } from '@/actions/layouts';
import { Save, Plus, GripVertical, Trash2, LayoutTemplate, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid'; // Standard node uuid generation

// HTML5 Drag and Drop Types
const DRAG_TYPE_FIELD = 'application/x-sf-field';

export default function LayoutBuilder({ params }: { params: { api_name: string } }) {
  const router = useRouter();
  const [apiName, setApiName] = useState('');
  
  const [objectData, setObjectData] = useState<any>(null);
  const [allFields, setAllFields] = useState<any[]>([]);
  const [layoutName, setLayoutName] = useState('Default Layout');
  const [sections, setSections] = useState<LayoutSection[]>([
    { id: uuidv4(), sectionName: 'Information', columns: 2, fields: [] }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  // Unwrap params
  useEffect(() => {
    params.then(p => setApiName(p.api_name));
  }, [params]);

  useEffect(() => {
    if (!apiName) return;
    async function init() {
      const obj = await getObjectByApiName(apiName);
      if (!obj) return router.push('/setup/object-manager');
      setObjectData(obj);
      
      const fields = await getFieldsForObject(obj.id);
      setAllFields(fields);
      
      // Auto-populate default section if empty? No, let the user map it
    }
    init();
  }, [apiName, router]);

  // Derived state: Available fields are those NOT currently mapped in any section
  const mappedFieldApiNames = new Set(sections.flatMap(s => s.fields));
  const availableFields = allFields.filter(f => !mappedFieldApiNames.has(f.field_api_name));

  // --- Handlers ---
  const handleAddSection = () => {
    setSections([...sections, { id: uuidv4(), sectionName: 'New Section', columns: 2, fields: [] }]);
  };

  const handleUpdateSection = (id: string, key: 'sectionName' | 'columns', val: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, [key]: val } : s));
  };

  const handleRemoveSection = (id: string) => {
    // any mapped fields return to available (implicitly via derived state when section vanishes)
    setSections(sections.filter(s => s.id !== id));
  };

  // --- Drag and Drop Logic ---
  const handleDragStart = (e: React.DragEvent, fieldApiName: string, sourceSectionId: string | null) => {
    e.dataTransfer.setData(DRAG_TYPE_FIELD, JSON.stringify({ fieldApiName, sourceSectionId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropSidebar = (e: React.DragEvent) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData(DRAG_TYPE_FIELD);
    if (!dataStr) return;
    
    try {
      const { fieldApiName, sourceSectionId } = JSON.parse(dataStr);
      if (!sourceSectionId) return; // already in sidebar

      // Remove from source section
      setSections(sections.map(s => {
        if (s.id === sourceSectionId) {
          return { ...s, fields: s.fields.filter(f => f !== fieldApiName) };
        }
        return s;
      }));
    } catch(err) {
      console.error(err);
    }
  };

  const handleDropSection = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData(DRAG_TYPE_FIELD);
    if (!dataStr) return;
    
    try {
      const { fieldApiName, sourceSectionId } = JSON.parse(dataStr);
      
      if (sourceSectionId === targetSectionId) return; // dropped in same section, could implement re-ordering but keeping simple append for now
      
      let newSections = [...sections];

      // Remove from source if it was in one
      if (sourceSectionId) {
        newSections = newSections.map(s => s.id === sourceSectionId 
          ? { ...s, fields: s.fields.filter(f => f !== fieldApiName) } 
          : s
        );
      }

      // Add to target
      newSections = newSections.map(s => s.id === targetSectionId 
        ? { ...s, fields: [...s.fields, fieldApiName] } 
        : s
      );

      setSections(newSections);
    } catch(err) {
      console.error(err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // --- Saving ---
  const handleSave = async () => {
    if (!objectData) return;
    setIsSaving(true);
    // Sanitize Payload (strip UI `id` local tracking if we wanted, but it's safe to push JSON)
    const res = await saveLayout(objectData.id, layoutName, sections);
    if (res.success) {
      router.push(`/setup/object-manager/${apiName}`);
    } else {
      alert('Failed to save layout: ' + res.error);
    }
    setIsSaving(false);
  };

  if (!objectData) return <div className="p-8">Loading builder...</div>;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 relative overflow-hidden">
      
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <Link href={`/setup/object-manager/${apiName}`} className="text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white shadow-sm">
            <LayoutTemplate size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">Page Layout Builder</h1>
            <p className="text-xs text-slate-500">{objectData.label} Object</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <input 
              type="text" 
              value={layoutName} 
              onChange={(e) => setLayoutName(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 w-48 shadow-inner"
              placeholder="Layout Name"
           />
           <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#0176D3] hover:bg-[#015ba7] text-white px-4 py-1.5 rounded text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
          >
             <Save size={16} />
             {isSaving ? 'Saving...' : 'Save Layout'}
           </button>
        </div>
      </div>

      {/* Main Builder Canvas */}
      <div className="pt-14 flex-1 flex">
        
        {/* Left Sidebar: Canvas */}
        <div className="flex-1 overflow-auto p-8 bg-[#f3f3f3] h-full no-scrollbar">
           <div className="max-w-4xl mx-auto space-y-6 pb-20">
             
             {sections.map((section) => (
               <div 
                 key={section.id} 
                 className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
                 onDrop={(e) => handleDropSection(e, section.id)}
                 onDragOver={handleDragOver}
               >
                 <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical size={16} className="text-slate-400" />
                      <input 
                        type="text" 
                        value={section.sectionName}
                        onChange={(e) => handleUpdateSection(section.id, 'sectionName', e.target.value)}
                        className="bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-slate-700 w-64 uppercase tracking-wider"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                       <select 
                         value={section.columns}
                         onChange={(e) => handleUpdateSection(section.id, 'columns', parseInt(e.target.value))}
                         className="text-xs border-slate-300 rounded shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                       >
                         <option value={1}>1 Column</option>
                         <option value={2}>2 Columns</option>
                       </select>
                       <button 
                         onClick={() => handleRemoveSection(section.id)}
                         className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                 </div>
                 
                 <div className={`p-4 min-h-[100px] grid gap-4 ${section.columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {section.fields.map(api_name => {
                       const fieldDef = allFields.find(f => f.field_api_name === api_name);
                       return (
                         <div 
                           key={api_name}
                           draggable
                           onDragStart={(e) => handleDragStart(e, api_name, section.id)}
                           className="bg-white border border-slate-200 px-4 py-3 rounded shadow-sm hover:border-indigo-300 hover:shadow flex items-center justify-between cursor-move group"
                         >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-700 leading-tight">
                                {fieldDef?.field_label || api_name}
                              </span>
                              <span className="text-xs text-slate-400 mt-0.5">{api_name}</span>
                            </div>
                            <GripVertical size={14} className="text-slate-300 group-hover:text-slate-500" />
                         </div>
                       )
                    })}
                    {section.fields.length === 0 && (
                      <div className={`col-span-${section.columns} border-2 border-dashed border-slate-200 rounded flex items-center justify-center p-8 text-slate-400 text-sm font-medium`}>
                        Drop fields here
                      </div>
                    )}
                 </div>
               </div>
             ))}

             <button 
               onClick={handleAddSection}
               className="w-full py-4 border-2 border-dashed border-indigo-200 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
             >
               <Plus size={20} />
               Add Section
             </button>

           </div>
        </div>

        {/* Right Sidebar: Available Fields Library */}
        <div 
           className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-inner"
           onDrop={handleDropSidebar}
           onDragOver={handleDragOver}
        >
          <div className="p-4 border-b border-slate-200 bg-slate-50 shadow-sm z-10">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Available Fields</h2>
            <p className="text-xs text-slate-500 mt-1">Drag onto canvas</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#f8f9fa]">
            {availableFields.map(field => (
              <div 
                key={field.field_api_name}
                draggable
                onDragStart={(e) => handleDragStart(e, field.field_api_name, null)}
                className="bg-white border border-slate-200 px-3 py-2 rounded shadow-sm hover:border-indigo-400 hover:shadow cursor-move flex items-center justify-between group transition-all"
              >
                 <div className="flex flex-col">
                   <span className="text-xs font-semibold text-slate-700">{field.field_label}</span>
                   <span className="text-[10px] text-slate-400 font-mono mt-0.5">{field.field_api_name}</span>
                 </div>
                 {field.is_required && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
              </div>
            ))}
            {availableFields.length === 0 && (
              <div className="text-center p-6 text-slate-400 text-sm italic border border-dashed border-slate-200 rounded">
                All fields mapped!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
