'use client';

import React from 'react';
import Link from 'next/link';

export default function Dashboard({ 
  metrics, 
  recent 
}: { 
  metrics: { label: string; count: number }[],
  recent: { id: string; name: string; objectLabel: string; apiName: string; createdAt: string }[]
}) {
  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Top Row: Metric Cards */}
      <h2 className="text-lg text-gray-800 font-bold mb-[-12px]">System Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {metrics.length === 0 ? (
            <div className="text-sm text-gray-500 italic p-4 bg-white rounded border border-gray-200">No data found in system.</div>
         ) : (
            metrics.map((m) => (
              <div key={m.label} className="bg-white border text-center border-gray-200 rounded p-4 shadow-sm flex flex-col items-center justify-center h-28 hover:shadow-md transition-shadow">
                 <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">{m.label}</div>
                 <div className="text-4xl font-black text-[#0176D3]">{m.count}</div>
              </div>
            ))
         )}
      </div>

      {/* Bottom Row: Recent Activity Table */}
      <h2 className="text-lg text-gray-800 font-bold mt-4 mb-[-12px]">Recent Global Activity</h2>
      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
         {recent.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No recent activity found.</div>
         ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#f3f3f3] border-b border-gray-300">
                 <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Record Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Object Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Created At</th>
                 </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                 {recent.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link 
                            href={`/${record.apiName}/${record.id}`}
                            className="text-[#0176D3] hover:underline"
                          >
                            {record.name}
                          </Link>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                            {record.objectLabel}
                          </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.createdAt).toLocaleString(undefined, { 
                             month: 'short', day: 'numeric', year: 'numeric', 
                             hour: 'numeric', minute: '2-digit' 
                          })}
                       </td>
                    </tr>
                 ))}
              </tbody>
            </table>
         )}
      </div>

    </div>
  );
}
