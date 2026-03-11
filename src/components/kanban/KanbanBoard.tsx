"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { KanbanColumn } from "./KanbanColumn";
import { DealCard } from "./DealCard";
import { supabase } from "@/lib/supabase";
import { columns, type Deal, type ColumnId } from "@/lib/types";
import { Columns3, Loader2 } from "lucide-react";

export function KanbanBoard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);

    // Fetch initial deals
    async function fetchDeals() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDeals(data as Deal[]);
      }
      setLoading(false);
    }

    fetchDeals();

    // Subscribe to realtime changes on deals
    if (!supabase) return;

    const channel = supabase
      .channel("deals_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "deals" },
        (payload) => {
          const newDeal = payload.new as Deal;
          setDeals((prev) => [newDeal, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "deals" },
        (payload) => {
          const updated = payload.new as Deal;
          setDeals((prev) =>
            prev.map((d) => (d.id === updated.id ? updated : d))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "deals" },
        (payload) => {
          const deleted = payload.old as { id: string };
          setDeals((prev) => prev.filter((d) => d.id !== deleted.id));
        }
      )
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const deal = deals.find((d) => d.id === event.active.id);
      if (deal) setActiveDeal(deal);
    },
    [deals]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const activeDeal = deals.find((d) => d.id === activeId);
      if (!activeDeal) return;

      const isOverColumn = columns.some((c) => c.id === overId);
      let targetColumn: ColumnId;

      if (isOverColumn) {
        targetColumn = overId as ColumnId;
      } else {
        const overDeal = deals.find((d) => d.id === overId);
        if (!overDeal) return;
        targetColumn = overDeal.column_name;
      }

      if (activeDeal.column_name !== targetColumn) {
        setDeals((prev) =>
          prev.map((d) =>
            d.id === activeId ? { ...d, column_name: targetColumn } : d
          )
        );
      }
    },
    [deals]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDeal(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const isOverColumn = columns.some((c) => c.id === overId);
      let targetColumn: ColumnId;

      if (isOverColumn) {
        targetColumn = overId as ColumnId;
      } else {
        const overDeal = deals.find((d) => d.id === overId);
        if (!overDeal) return;
        targetColumn = overDeal.column_name;
      }

      // Update local state
      setDeals((prev) =>
        prev.map((d) =>
          d.id === activeId ? { ...d, column_name: targetColumn } : d
        )
      );

      // Persist to Supabase
      if (supabase) {
        await supabase
          .from("deals")
          .update({ column_name: targetColumn })
          .eq("id", activeId);
      }
    },
    [deals]
  );

  return (
    <GlassPanel className="flex flex-col overflow-hidden p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <Columns3 className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold text-text-primary tracking-tight">
            Deal Pipeline
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-[family-name:var(--font-mono)] text-text-muted uppercase tracking-wider">
            {deals.length} deals
          </span>
        </div>
      </div>

      {/* Kanban Columns */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-5 w-5 text-accent animate-spin" />
        </div>
      ) : isMounted ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 grid grid-cols-4 gap-3 p-4 overflow-x-auto overflow-y-hidden">
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                deals={deals.filter((d) => d.column_name === col.id)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeDeal ? (
              <div className="opacity-80">
                <DealCard deal={activeDeal} isDragging={true} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="flex-1 grid grid-cols-4 gap-3 p-4 overflow-x-auto overflow-y-hidden">
          {columns.map((col) => (
            <div
              key={col.id}
              className="flex flex-col rounded-xl bg-white/[0.01] border border-transparent"
            >
              <div className="flex items-center justify-between px-3 py-3">
                <h3 className="text-xs font-medium text-text-secondary tracking-tight">
                  {col.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}
