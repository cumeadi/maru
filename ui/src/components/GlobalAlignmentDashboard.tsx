"use client";

import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Activity } from "lucide-react";

const stats = [
  {
    label: "Global Alignment",
    value: "94.2%",
    sub: "Rolling 24-hour average",
    trend: "+1.4%",
    trendUp: true,
    accent: "#1b61c9",
    icon: <Activity className="w-5 h-5" style={{ color: "#1b61c9" }} />,
  },
  {
    label: "Active Alerts",
    value: "1",
    sub: "Support Agent — Tone Drift Detected",
    badge: "Critical",
    badgeColor: "#b91c1c",
    accent: "#b91c1c",
    icon: <AlertTriangle className="w-5 h-5 text-[#b91c1c]" />,
  },
  {
    label: "Total Evals (24h)",
    value: "14.2k",
    sub: "Cost: $42.50 · Avg Latency: 840ms",
    accent: "#254fad",
    icon: <Activity className="w-5 h-5 text-[#254fad]" />,
  },
];

export function GlobalAlignmentDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="airtable-card p-6 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <span className="section-label">{s.label}</span>
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
                 style={{ background: `${s.accent}12`, border: `1px solid ${s.accent}22` }}>
              {s.icon}
            </div>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-4xl font-semibold tracking-tight text-[#181d26]"
                  style={{ fontFamily: "var(--font-sans)" }}>
              {s.value}
            </span>
            {s.trend && (
              <span className="flex items-center gap-1 text-sm font-medium mb-1"
                    style={{ color: s.trendUp ? "#006400" : "#b91c1c" }}>
                <TrendingUp className="w-4 h-4" />
                {s.trend}
              </span>
            )}
            {s.badge && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full mb-1"
                    style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>
                {s.badge}
              </span>
            )}
          </div>

          <p className="text-sm" style={{ color: "rgba(4,14,32,0.55)", letterSpacing: "0.12px" }}>
            {s.sub}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
