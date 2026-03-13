'use client';

import React, { useState } from 'react';

export default function RecordTabs({
  detailsContent,
  relatedContent,
}: {
  detailsContent: React.ReactNode;
  relatedContent: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<'details' | 'related'>('details');

  return (
    <div className="w-full md:w-[70%] bg-white rounded shadow-sm border border-gray-200 flex flex-col">
       <div className="p-4 border-b border-gray-100 flex gap-4">
          <button 
             onClick={() => setActiveTab('details')}
             className={`text-sm font-semibold pb-1 ${activeTab === 'details' ? 'text-[#0176D3] border-b-2 border-[#0176D3]' : 'text-gray-500 hover:text-gray-800'}`}
          >
             Details
          </button>
          <button 
             onClick={() => setActiveTab('related')}
             className={`text-sm font-semibold pb-1 ${activeTab === 'related' ? 'text-[#0176D3] border-b-2 border-[#0176D3]' : 'text-gray-500 hover:text-gray-800'}`}
          >
             Related
          </button>
       </div>
       <div className="p-6">
          {activeTab === 'details' ? detailsContent : relatedContent}
       </div>
    </div>
  );
}
