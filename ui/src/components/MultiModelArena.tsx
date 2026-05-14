"use client";

import { motion } from "framer-motion";

const models = [
  { name: "GPT-4o",               score: 96.5, latency: "1.2s", cost: "$0.005", passRate: 98 },
  { name: "Claude 3.5 Sonnet",    score: 95.8, latency: "0.8s", cost: "$0.003", passRate: 97 },
  { name: "Gemini 1.5 Pro",       score: 92.4, latency: "1.5s", cost: "$0.004", passRate: 94 },
  { name: "Llama-3 8B (Local)",   score: 84.2, latency: "0.2s", cost: "Free",   passRate: 81 },
];

function scoreColor(score: number) {
  if (score >= 90) return "#006400";
  if (score >= 80) return "#b45309";
  return "#b91c1c";
}
function barColor(score: number) {
  if (score >= 90) return "#1b61c9";
  if (score >= 80) return "#b45309";
  return "#b91c1c";
}

export function MultiModelArena() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {models.map((m, i) => (
        <motion.div
          key={m.name}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="airtable-card p-6 flex flex-col gap-5 hover:border-[#1b61c9] transition-colors"
        >
          <div>
            <p className="section-label mb-1">Model</p>
            <h3 className="font-semibold text-[15px] text-[#181d26] leading-snug" style={{ letterSpacing: "0.12px" }}>
              {m.name}
            </h3>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium" style={{ color: "rgba(4,14,32,0.55)" }}>
                Alignment Score
              </span>
              <span className="text-sm font-semibold" style={{ color: scoreColor(m.score) }}>
                {m.score}%
              </span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: "#e0e2e6" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${m.score}%` }}
                transition={{ duration: 0.9, delay: i * 0.1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: barColor(m.score) }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3"
               style={{ borderTop: "1px solid #e0e2e6" }}>
            <div>
              <p className="section-label mb-1">Latency</p>
              <p className="text-sm font-mono font-medium text-[#181d26]">{m.latency}</p>
            </div>
            <div>
              <p className="section-label mb-1">Cost / Run</p>
              <p className="text-sm font-mono font-medium" style={{ color: "#1b61c9" }}>{m.cost}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
