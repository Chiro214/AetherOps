"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { FeedCard } from "./FeedCard";
import { supabase } from "@/lib/supabase";
import { type IntelligenceLog } from "@/lib/types";
import { Radio, Loader2 } from "lucide-react";

export function OmniFeed() {
  const [logs, setLogs] = useState<IntelligenceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial data
    async function fetchLogs() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("intelligence_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setLogs(data as IntelligenceLog[]);
      }
      setLoading(false);
    }

    fetchLogs();

    // Subscribe to realtime INSERTs
    if (!supabase) return;

    const channel = supabase
      .channel("intelligence_logs_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "intelligence_logs" },
        (payload) => {
          const newLog = payload.new as IntelligenceLog;
          setLogs((prev) => [newLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, []);

  return (
    <GlassPanel className="flex flex-col overflow-hidden p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <Radio className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold text-text-primary tracking-tight">
            Omni-Feed
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />
          <span className="text-[10px] text-text-muted font-[family-name:var(--font-mono)] uppercase tracking-wider">
            Live
          </span>
        </div>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-5 w-5 text-accent animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-xs text-text-muted">No intelligence logs yet</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <FeedCard log={log} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </GlassPanel>
  );
}
