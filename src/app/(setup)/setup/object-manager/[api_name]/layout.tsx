import React from 'react';
import Link from 'next/link';
import { getObjectByApiName } from '@/actions/metadata';
import { notFound } from 'next/navigation';

export default async function ObjectManagerDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ api_name: string }>;
}) {
  const resolvedParams = await params;
  const obj = await getObjectByApiName(resolvedParams.api_name);

  if (!obj) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full bg-white rounded border border-gray-200 overflow-hidden">
      {/* Detail Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
        <div className="w-10 h-10 bg-[#7F8DE1] rounded flex items-center justify-center text-white shrink-0">
          {/* Object icon placeholder */}
          <span className="text-xl font-bold">{obj.label.charAt(0)}</span>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Object Manager</div>
          <h1 className="text-xl font-bold text-gray-900">{obj.label}</h1>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Inner Left Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-white flex flex-col overflow-y-auto shrink-0">
          <nav className="p-2 space-y-0.5">
            <Link 
              href={`/setup/object-manager/${obj.api_name}`}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              Details
            </Link>
            <Link 
              href={`/setup/object-manager/${obj.api_name}/fields-relationships`}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              Fields &amp; Relationships
            </Link>
            <Link 
              href={`/setup/object-manager/${obj.api_name}/page-layouts`}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              Page Layouts
            </Link>
            <Link 
              href={`/setup/object-manager/${obj.api_name}/validation-rules`}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              Validation Rules
            </Link>
          </nav>
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 bg-white overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
