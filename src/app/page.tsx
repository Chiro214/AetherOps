import { OmniFeed } from "@/components/omni-feed/OmniFeed";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { ComplianceRadar } from "@/components/compliance/ComplianceRadar";
import { ExecutionQueue } from "@/components/execution/ExecutionQueue";
import { TopBar } from "@/components/layout/TopBar";

export default function Home() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-void">
      <TopBar />
      <div className="flex-1 grid grid-cols-[340px_1fr_380px] gap-4 p-4 pt-0 overflow-hidden">
        {/* Left Column — Omni-Feed */}
        <OmniFeed />

        {/* Center Column — Kanban */}
        <KanbanBoard />

        {/* Right Column — Compliance + Execution */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <ComplianceRadar />
          <ExecutionQueue />
        </div>
      </div>
    </div>
  );
}
