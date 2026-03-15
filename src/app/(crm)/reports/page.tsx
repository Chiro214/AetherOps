import React from 'react';
import { getSavedReports } from '@/actions/reports';
import { FileBarChart, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function ReportsList() {
  const reports = await getSavedReports();

  return (
    <div className="flex-1 w-full bg-[#f3f3f3] p-6 h-full font-sans">
      <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded shadow-sm text-white">
               <FileBarChart size={24} />
            </div>
            Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage and execute your saved analytical queries.</p>
        </div>
        <Link 
            href="/reports/new"
            className="bg-[#0176D3] hover:bg-[#015ba7] text-white px-4 py-2 rounded shadow-sm flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          New Report
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden max-w-7xl mx-auto">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Saved Reports</h2>
            <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{reports.length} Items</span>
        </div>
        
        {reports.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center bg-white border-dashed border border-slate-200 m-4 rounded">
            <FileBarChart size={48} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-1">No reports found</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md">You haven't created any custom reports yet. Build a new report to query your Salesforce objects dynamically.</p>
            <Link 
              href="/reports/new"
              className="px-4 py-2 border border-[#0176D3] text-[#0176D3] hover:bg-blue-50 font-medium rounded text-sm transition-colors"
            >
              Build your first Report
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {reports.map((report: any) => (
              <li key={report.id} className="hover:bg-blue-50 transition-colors group">
                <Link href={`/reports/${report.id}`} className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="text-sm font-medium text-[#0176D3] group-hover:underline">{report.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Object: <span className="font-semibold">{report.sf_objects?.label || 'Unknown'}</span></p>
                  </div>
                  <ArrowRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
