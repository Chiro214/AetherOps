import React from 'react';
import { getObjectByApiName } from '@/actions/metadata';
import { getLayoutForObject } from '@/actions/layouts';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { LayoutTemplate, Plus } from 'lucide-react';

export default async function PageLayoutsHome({ params }: { params: Promise<{ api_name: string }> }) {
  const resolvedParams = await params;
  const obj = await getObjectByApiName(resolvedParams.api_name);
  if (!obj) notFound();

  const layout = await getLayoutForObject(obj.id);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Page Layouts</h2>
        
        {/* Only allow 1 layout per object for this scaffolding, edit it if it exists */}
        <Link 
            href={`/setup/object-manager/${obj.api_name}/layouts/new`}
            className="flex items-center gap-2 bg-[#0176D3] hover:bg-[#015ba7] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
        >
            <Plus size={16} />
            {layout ? 'Edit Layout' : 'New Layout'}
        </Link>
      </div>

      <div className="bg-white border text-sm border-gray-200 rounded shadow-sm max-w-3xl overflow-hidden">
        {layout ? (
            <div className="flex flex-col">
                <div className="flex bg-gray-50 border-b border-gray-200 uppercase text-xs font-semibold text-gray-500 tracking-wide">
                    <div className="w-1/2 p-3 border-r border-gray-200">Layout Name</div>
                    <div className="w-1/2 p-3">Sections</div>
                </div>
                <div className="flex hover:bg-gray-50 transition-colors cursor-pointer group">
                     {/* For a more robust app, we'd store the layout name in the sf_layouts table record, but we infer it here from config length */}
                    <div className="w-1/2 p-3 border-r border-gray-200 text-[#0176D3] group-hover:underline flex items-center gap-2">
                        <LayoutTemplate size={16} /> Custom Layout
                    </div>
                    <div className="w-1/2 p-3 text-gray-700">{layout.length} Section(s) defined</div>
                </div>
            </div>
        ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center bg-gray-50">
                <LayoutTemplate size={48} className="text-gray-300 mb-4" />
                <h3 className="text-gray-600 font-medium mb-1">No Custom Layouts</h3>
                <p className="text-gray-500 text-xs max-w-sm mb-4">This object is using the standard, auto-generated system layout. Create a custom layout to organize fields into sections and columns.</p>
                <Link 
                    href={`/setup/object-manager/${obj.api_name}/layouts/new`}
                    className="text-[#0176D3] hover:underline text-sm font-medium"
                >
                    Create Custom Layout
                </Link>
            </div>
        )}
      </div>
    </div>
  );
}
