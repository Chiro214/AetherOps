"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity, DollarSign, Users, Target } from "lucide-react";

interface Metric {
  label: string;
  value: number;
}

interface StatusCount {
  status: string;
  count: number;
}

export default function AnalyticsDashboardPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Dynamic Metric Aggregation: Find 'Number' sf_fields
        const { data: numericFields } = await supabase
          .from("sf_fields")
          .select("id, field_api_name, field_label, object_id")
          .eq("data_type", "Number");

        const numericAggregations: Record<string, number> = {};

        if (numericFields && numericFields.length > 0) {
          // Fetch records for these specific objects to aggregate
          const objectIds = Array.from(new Set(numericFields.map((f: any) => f.object_id)));
          const { data: records } = await supabase
            .from("sf_records")
            .select("object_id, record_data")
            .in("object_id", objectIds);

          if (records) {
            records.forEach(record => {
              // For each record, check if it has a value corresponding to any numeric field of its object
              const relevantFields = numericFields.filter((f: any) => f.object_id === (record as any).object_id);
              relevantFields.forEach((field: any) => {
                const rawVal = (record as any).record_data[field.field_api_name];
                
                // Fallback attempt: if they stored "estimated_value" like "$2k", strip it and sum it
                // e.g., "$2000" -> 2000. For strict Number fields, this is safer anyway.
                let numVal = 0;
                if (typeof rawVal === 'number') numVal = rawVal;
                else if (typeof rawVal === 'string') {
                  const cleaned = rawVal.replace(/[^0-9.-]+/g, "");
                  numVal = parseFloat(cleaned) || 0;
                }

                if (!numericAggregations[field.field_label]) {
                  numericAggregations[field.field_label] = 0;
                }
                numericAggregations[field.field_label] += numVal;
              });
            });
          }
        }

        // Specifically look for 'estimated_value' string inside 'Lead' for our MVP since it wasn't typed as 'Number' in Feature 0
        // We do this precisely to handle the webhook test cases where estimated_value was a string like "$2k"
        if (!numericAggregations['Estimated Value']) {
            const { data: leadObj } = await supabase.from('sf_objects').select('id').eq('api_name','Lead').single();
            if (leadObj) {
              const { data: leadRecords } = await supabase.from('sf_records').select('record_data').eq('object_id', (leadObj as any).id);
              const totalValue = (leadRecords || []).reduce((acc: number, r: any) => {
                 const v = r.record_data?.estimated_value;
                 if (v === null || v === undefined) return acc + 0;
                 if (typeof v === 'number' && !isNaN(v)) return acc + v;
                 if (typeof v === 'string') return acc + (parseFloat(v.replace(/[^0-9.-]+/g, "")) || 0);
                 return acc + 0;
              }, 0);
              if (totalValue > 0) numericAggregations['Total Pipeline Value'] = totalValue;
            }
        }

        // Format to array
        const finalMetrics = Object.entries(numericAggregations).map(([label, value]) => ({
          label,
          value,
        }));
        setMetrics(finalMetrics);

        // 2. Lead Status Grouping for Bar Chart
        const { data: leadObj } = await supabase.from('sf_objects').select('id').eq('api_name','Lead').single();
        if (leadObj) {
          const { data: leadRecords } = await supabase.from('sf_records').select('record_data').eq('object_id', (leadObj as any).id);
          
          const counts: Record<string, number> = {};
          leadRecords?.forEach((r: any) => {
             const status = r.record_data.status || "New";
             counts[status] = (counts[status] || 0) + 1;
          });

          const formattedCounts = Object.entries(counts).map(([status, count]) => ({
             status, count
          }));
          setStatusCounts(formattedCounts);
        }

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Use a custom darker glassmorphism tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900 border border-white/10 p-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <p className="text-white/80 font-medium mb-1">{label}</p>
          <p className="text-blue-400 font-bold text-lg">{payload[0].value} Leads</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[0%] left-[0%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col">
        <div className="mb-10">
          <h1 className="text-4xl font-light tracking-tight text-white/90 mb-2">
            Dynamic <span className="font-semibold text-white">Analytics</span>
          </h1>
          <p className="text-neutral-400">Autonomous metadata-driven reporting.</p>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[500px]">
            <div className="w-8 h-8 border-4 border-white/10 border-t-white/60 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-neutral-400 text-sm font-medium tracking-wide uppercase mb-3 relative z-10">{metric.label}</p>
                  <p className="text-4xl font-semibold text-white tracking-tight relative z-10">
                    {/* Add simple formatting based on label cues */}
                    {metric.label.toLowerCase().includes('spend') || metric.label.toLowerCase().includes('value') ? '$' : ''}
                    {metric.value.toLocaleString()}
                  </p>
                </motion.div>
              ))}
              
              {metrics.length === 0 && (
                <div className="col-span-full py-10 text-center border-2 border-dashed border-white/5 rounded-2xl">
                   <p className="text-neutral-500">No numeric metadata fields found to aggregate yet.</p>
                </div>
              )}
            </div>

            {/* Recharts Chart Area */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8"
            >
              <h2 className="text-xl font-semibold text-white/90 mb-8 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Lead Volume by Status
              </h2>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStatus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="status" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 13 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 13 }}
                    />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                    <Bar 
                      dataKey="count" 
                      fill="url(#colorStatus)" 
                      radius={[6, 6, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
