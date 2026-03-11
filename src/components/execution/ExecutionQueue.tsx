"use client";

import { useState, useEffect } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { supabase } from "@/lib/supabase";
import { type PendingAction } from "@/lib/types";
import {
  Mail,
  FileSignature,
  MessageSquare,
  CheckCircle2,
  Rocket,
  Loader2,
} from "lucide-react";

const typeIcons: Record<
  PendingAction["type"],
  React.ComponentType<{ className?: string }>
> = {
  email: Mail,
  contract: FileSignature,
  message: MessageSquare,
};

const statusConfig: Record<
  PendingAction["status"],
  { label: string; color: string; bg: string }
> = {
  drafted: {
    label: "Drafted",
    color: "text-warning",
    bg: "bg-warning/10 border border-warning/20",
  },
  reviewed: {
    label: "Reviewed",
    color: "text-success",
    bg: "bg-success/10 border border-success/20",
  },
  sent: {
    label: "Sent",
    color: "text-text-muted",
    bg: "bg-white/[0.04] border border-white/[0.06]",
  },
  Executed: {
    label: "Executed",
    color: "text-accent",
    bg: "bg-accent/10 border border-accent/20",
  },
};

export function ExecutionQueue() {
  const [actions, setActions] = useState<PendingAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    async function fetchActions() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("pending_actions")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setActions(data as PendingAction[]);
      }
      setLoading(false);
    }

    fetchActions();

    // Subscribe to realtime INSERT and UPDATE
    if (!supabase) return;

    const channel = supabase
      .channel("pending_actions_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pending_actions" },
        (payload) => {
          const newAction = payload.new as PendingAction;
          setActions((prev) => [newAction, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pending_actions" },
        (payload) => {
          const updated = payload.new as PendingAction;
          setActions((prev) =>
            prev.map((a) => (a.id === updated.id ? updated : a))
          );
        }
      )
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, []);

  const handleVerifyAndExecute = async () => {
    if (!supabase || executing) return;

    setExecuting(true);
    try {
      // Update all drafted/reviewed actions to Executed
      const { error } = await supabase
        .from("pending_actions")
        .update({ status: "Executed" })
        .in("status", ["drafted", "reviewed"]);

      if (!error) {
        // Optimistic update
        setActions((prev) =>
          prev.map((a) =>
            a.status === "drafted" || a.status === "reviewed"
              ? { ...a, status: "Executed" as const }
              : a
          )
        );
      }
    } finally {
      setExecuting(false);
    }
  };

  return (
    <GlassPanel className="flex flex-col overflow-hidden p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <Rocket className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold text-text-primary tracking-tight">
            Execution Queue
          </h2>
        </div>
        <span className="text-[10px] font-[family-name:var(--font-mono)] text-text-muted uppercase tracking-wider">
          {actions.length} pending
        </span>
      </div>

      {/* Action Items */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-5 w-5 text-accent animate-spin" />
          </div>
        ) : actions.length === 0 ? (
          <div className="flex items-center justify-center h-24">
            <span className="text-xs text-text-muted">No pending actions</span>
          </div>
        ) : (
          actions.map((action) => {
            const Icon = typeIcons[action.type];
            const status = statusConfig[action.status] || statusConfig.drafted;

            return (
              <div
                key={action.id}
                className="glass-panel-elevated p-3.5 transition-all duration-200 hover:bg-glass-bg-hover cursor-default"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.05]">
                    <Icon className="h-3 w-3 text-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-text-primary truncate">
                        {action.subject}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-text-muted font-[family-name:var(--font-mono)] truncate">
                        → {action.recipient}
                      </span>
                      <span
                        className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${status.color} ${status.bg}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-white/[0.05]">
        <button
          onClick={handleVerifyAndExecute}
          disabled={executing}
          className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg
            bg-accent text-void font-medium text-xs
            transition-all duration-200 hover:bg-accent/90 hover:shadow-lg
            accent-glow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {executing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          {executing ? "Executing..." : "Verify & Execute"}
        </button>
        <button
          className="flex items-center justify-center h-9 w-9 rounded-lg
            border border-white/[0.08] bg-white/[0.03]
            text-text-secondary transition-all duration-200
            hover:bg-white/[0.06] hover:text-text-primary cursor-pointer"
          title="Push to Slack"
        >
          <MessageSquare className="h-3.5 w-3.5" />
        </button>
      </div>
    </GlassPanel>
  );
}
