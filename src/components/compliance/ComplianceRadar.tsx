"use client";

import { useState, useEffect } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { supabase } from "@/lib/supabase";
import { type ContractVulnerability } from "@/lib/types";
import { ShieldAlert, AlertTriangle, Info, Loader2 } from "lucide-react";

const severityConfig: Record<
  ContractVulnerability["severity"],
  {
    icon: React.ComponentType<{ className?: string }>;
    badge: string;
    badgeBg: string;
  }
> = {
  CRITICAL: {
    icon: ShieldAlert,
    badge: "text-red-300 font-bold",
    badgeBg: "bg-red-950/60 border border-red-900/40",
  },
  HIGH: {
    icon: AlertTriangle,
    badge: "text-red-400 font-semibold",
    badgeBg: "bg-red-950/40 border border-red-900/30",
  },
  MEDIUM: {
    icon: Info,
    badge: "text-orange-400 font-medium",
    badgeBg: "bg-orange-950/40 border border-orange-900/30",
  },
};

export function ComplianceRadar() {
  const [vulnerabilities, setVulnerabilities] = useState<ContractVulnerability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVulnerabilities() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("contract_vulnerabilities")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setVulnerabilities(data as ContractVulnerability[]);
      }
      setLoading(false);
    }

    fetchVulnerabilities();

    // Subscribe to realtime INSERTs
    if (!supabase) return;

    const channel = supabase
      .channel("vulnerabilities_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contract_vulnerabilities" },
        (payload) => {
          const newVuln = payload.new as ContractVulnerability;
          setVulnerabilities((prev) => [newVuln, ...prev]);
        }
      )
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, []);

  return (
    <GlassPanel className="flex flex-col overflow-hidden p-0 flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-4 w-4 text-crimson-light" />
          <h2 className="text-sm font-semibold text-text-primary tracking-tight">
            Compliance Radar
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-crimson-light pulse-dot" />
          <span className="text-[10px] text-crimson-light font-[family-name:var(--font-mono)] uppercase tracking-wider font-medium">
            {vulnerabilities.length} Active
          </span>
        </div>
      </div>

      {/* Vulnerability Cards */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-5 w-5 text-crimson-light animate-spin" />
          </div>
        ) : vulnerabilities.length === 0 ? (
          <div className="flex items-center justify-center h-24">
            <span className="text-xs text-text-muted">No vulnerabilities detected</span>
          </div>
        ) : (
          vulnerabilities.map((vuln) => {
            const config = severityConfig[vuln.severity];
            const Icon = config.icon;

            return (
              <div
                key={vuln.id}
                className="rounded-lg bg-red-950/20 border border-red-900/20 p-3.5
                  transition-all duration-200 hover:bg-red-950/30 hover:border-red-900/30 cursor-default"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-950/40">
                    <Icon className="h-3 w-3 text-crimson-light" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${config.badge} ${config.badgeBg}`}
                      >
                        {vuln.severity}
                      </span>
                      <span className="text-[10px] text-text-muted font-[family-name:var(--font-mono)] truncate">
                        {vuln.contract_name}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-red-300/80 mb-1 font-[family-name:var(--font-mono)]">
                      {vuln.clause}
                    </p>
                    <p className="text-[11px] leading-relaxed text-text-secondary line-clamp-2">
                      {vuln.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </GlassPanel>
  );
}
