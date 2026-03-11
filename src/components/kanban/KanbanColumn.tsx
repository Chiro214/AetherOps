"use client";

import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { DealCard } from "./DealCard";
import { type Deal, type KanbanColumn as KanbanColumnType } from "@/lib/types";

interface KanbanColumnProps {
  column: KanbanColumnType;
  deals: Deal[];
}

function DraggableDealCard({ deal }: { deal: Deal }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: deal.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0.3 : 1 }}
    >
      <DealCard deal={deal} isDragging={isDragging} />
    </div>
  );
}

export function KanbanColumn({ column, deals }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl transition-colors duration-200 ${
        isOver
          ? "bg-accent/[0.04] border border-accent/10"
          : "bg-white/[0.01] border border-transparent"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <h3 className="text-xs font-medium text-text-secondary tracking-tight">
          {column.title}
        </h3>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/[0.06] px-1.5 text-[10px] font-medium text-text-muted font-[family-name:var(--font-mono)]">
          {deals.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 px-2 pb-2 overflow-y-auto">
        {deals.map((deal) => (
          <DraggableDealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}
