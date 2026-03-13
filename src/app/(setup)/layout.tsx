import SetupHeader from '@/components/layout/SetupHeader';
import SetupSidebar from '@/components/layout/SetupSidebar';

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen w-full bg-[#f3f3f3] text-gray-900 font-sans overflow-hidden antialiased">
      <SetupHeader />
      
      <div className="flex flex-1 overflow-hidden">
        <SetupSidebar />
        
        {/* Main Workspace Area */}
        <main className="flex-1 overflow-auto p-4 flex flex-col items-center">
          <div className="w-full max-w-6xl h-full">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
