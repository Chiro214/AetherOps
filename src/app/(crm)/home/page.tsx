import Dashboard from '@/components/crm/Dashboard';
import { getCoreMetrics, getRecentRecords } from '@/actions/dashboard';

export default async function HomePage() {
  const metrics = await getCoreMetrics();
  const recent = await getRecentRecords();

  return (
    <div className="bg-white rounded border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="text-sm font-semibold text-gray-500 uppercase">Dashboard</div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          Sales Pipeline Overview
        </h1>
      </div>
      <div className="p-8 flex-1 bg-[#f3f3f3] overflow-y-auto">
         <Dashboard metrics={metrics} recent={recent} />
      </div>
    </div>
  );
}
