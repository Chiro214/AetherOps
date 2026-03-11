"use client";

import { type IntelligenceLog } from "@/lib/types";
import {
  Mail,
  Phone,
  ShieldAlert,
  TrendingUp,
  Calendar,
  FileText,
} from "lucide-react";

const iconMap: Record<
  IntelligenceLog["type"],
  { icon: React.ComponentType<{ className?: string }>; color: string; borderColor: string }
> = {
  email: { icon: Mail, color: "text-accent", borderColor: "border-accent/30" },
  call: { icon: Phone, color: "text-success", borderColor: "border-success/30" },
  compliance: {
    icon: ShieldAlert,
    color: "text-crimson-light",
    borderColor: "border-crimson/30",
  },
  deal: {
    icon: TrendingUp,
    color: "text-warning",
    borderColor: "border-warning/30",
  },
  calendar: {
    icon: Calendar,
    color: "text-violet-400",
    borderColor: "border-violet-400/30",
  },
  document: {
    icon: FileText,
    color: "text-sky-400",
    borderColor: "border-sky-400/30",
  },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface FeedCardProps {
  log: IntelligenceLog;
}

export function FeedCard({ log }: FeedCardProps) {
  const config = iconMap[log.type];
  const Icon = config.icon;

  return (
    <div
      className={`glass-panel-elevated p-3.5 border-l-2 ${config.borderColor} cursor-default
        transition-all duration-200 hover:bg-glass-bg-hover group`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.04] ${config.color}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-medium text-text-primary truncate">
              {log.title}
            </h3>
            <span className="text-[10px] text-text-muted font-[family-name:var(--font-mono)] shrink-0">
              {timeAgo(log.created_at)}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-text-secondary line-clamp-2">
            {log.summary}
          </p>
        </div>
      </div>
    </div>
  );
}
