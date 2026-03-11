"use client";

import { useState, useEffect } from "react";
import { type Deal } from "@/lib/types";
import { Building2 } from "lucide-react";

interface DealCardProps {
  deal: Deal;
  isDragging: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return "#34D399";
  if (confidence >= 60) return "#22D3EE";
  if (confidence >= 40) return "#FBBF24";
  return "#DC2626";
}

export function DealCard({ deal, isDragging }: DealCardProps) {
  const confidenceColor = getConfidenceColor(deal.confidence);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate the SVG ring values
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = (deal.confidence / 100) * circumference;
  const dashOffset = circumference - progress;

  return (
    <div
      className={`glass-panel-elevated p-3.5 cursor-grab active:cursor-grabbing
        transition-all duration-200
        ${isDragging ? "shadow-2xl scale-[1.02] rotate-1 opacity-90" : "hover:-translate-y-1"}
        ${deal.has_compliance_flag ? "compliance-glow border-crimson!" : ""}
      `}
    >
      {/* Company + Compliance */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.05]">
          <Building2 className="h-3 w-3 text-text-secondary" />
        </div>
        <span className="text-xs font-medium text-text-primary truncate flex-1">
          {deal.company}
        </span>
        {deal.has_compliance_flag && (
          <span className="text-[9px] font-semibold uppercase tracking-wider text-crimson-light bg-crimson/20 px-1.5 py-0.5 rounded">
            Flag
          </span>
        )}
      </div>

      {/* Value + Confidence Ring */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary font-[family-name:var(--font-mono)]">
            {formatCurrency(deal.value)}
          </p>
          <p className="text-[10px] text-text-muted mt-0.5">Deal Value</p>
        </div>

        {/* SVG Confidence Ring — no Recharts, no hydration issues */}
        {mounted && (
          <div className="relative flex items-center justify-center w-12 h-12">
            <svg width="48" height="48" viewBox="0 0 48 48">
              {/* Background ring */}
              <circle
                cx="24"
                cy="24"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="4"
              />
              {/* Progress ring */}
              <circle
                cx="24"
                cy="24"
                r={radius}
                fill="none"
                stroke={confidenceColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 24 24)"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <span
              className="absolute text-[9px] font-bold font-[family-name:var(--font-mono)]"
              style={{ color: confidenceColor }}
            >
              {deal.confidence}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
