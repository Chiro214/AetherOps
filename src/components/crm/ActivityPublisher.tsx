'use client';

import React, { useState } from 'react';
import { logActivity } from '@/actions/activities';
import { Phone, Mail, FileText, Calendar } from 'lucide-react';

export default function ActivityPublisher({ recordId, resourceName }: { recordId: string, resourceName: string }) {
  const [activeTab, setActiveTab] = useState<'Call' | 'Note'>('Call');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!subject.trim()) {
      alert('Subject is required');
      return;
    }

    setIsSubmitting(true);
    const result = await logActivity(recordId, resourceName, {
      type: activeTab,
      subject,
      description
    });
    setIsSubmitting(false);

    if (result.success) {
      setSubject('');
      setDescription('');
    } else {
      alert(`Failed to log activity: ${result.error}`);
    }
  };

  return (
    <div className="bg-white rounded border border-gray-200 shadow-sm flex flex-col mb-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50">
        <button 
          onClick={() => setActiveTab('Call')}
          className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-2 border-r border-gray-100 transition-colors ${activeTab === 'Call' ? 'text-[#0176D3] bg-white border-b-2 border-b-[#0176D3]' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <Phone size={14} /> Log a Call
        </button>
        <button 
          onClick={() => setActiveTab('Note')}
          className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'Note' ? 'text-[#0176D3] bg-white border-b-2 border-b-[#0176D3]' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <FileText size={14} /> New Note
        </button>
      </div>

      {/* Publisher Body */}
      <div className="p-3">
        <div className="mb-3">
           <input 
             type="text" 
             placeholder="Subject" 
             className="w-full text-sm border border-gray-300 rounded p-1.5 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none"
             value={subject}
             onChange={(e) => setSubject(e.target.value)}
           />
        </div>
        <div className="mb-3">
           <textarea 
             placeholder="Comments..." 
             className="w-full text-sm border border-gray-300 rounded p-1.5 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none min-h-[80px] resize-y"
             value={description}
             onChange={(e) => setDescription(e.target.value)}
           />
        </div>
        <div className="flex justify-end">
           <button 
             onClick={handleSave}
             disabled={isSubmitting}
             className="px-4 py-1.5 bg-[#0176D3] text-white text-sm font-medium rounded hover:bg-[#014486] transition-colors disabled:opacity-50"
           >
             {isSubmitting ? 'Saving...' : 'Save'}
           </button>
        </div>
      </div>
    </div>
  );
}
