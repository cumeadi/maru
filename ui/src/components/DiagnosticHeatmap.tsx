"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

type RunStatus = "pass" | "warn" | "fail";
type EvaluationRun = {
  id: number;
  status: RunStatus;
  prompt: string;
  output: string;
  failedCriterion?: string;
  reasoning?: string;
};

const STATUS = {
  pass: { bg: "#dcfce7", border: "#86efac", dot: "#006400" },
  warn: { bg: "#fef9c3", border: "#fde047", dot: "#b45309" },
  fail: { bg: "#fee2e2", border: "#fca5a5", dot: "#b91c1c" },
};

export function DiagnosticHeatmap() {
  const [selected, setSelected] = useState<EvaluationRun | null>(null);

  const runs: EvaluationRun[] = Array.from({ length: 48 }).map((_, i) => {
    const r = Math.random();
    let status: RunStatus = "pass";
    if (r > 0.85) status = "fail";
    else if (r > 0.70) status = "warn";
    return {
      id: i + 1, status,
      prompt: "How do I reset my password?",
      output: status === "fail" ? "I don't know how to do that." : "Go to Settings › Security › Reset Password.",
      failedCriterion: status === "fail" ? "Helpfulness & Accuracy" : status === "warn" ? "Brevity" : undefined,
      reasoning: status === "fail"
        ? "The model failed to provide the steps present in the golden dataset."
        : status === "warn"
        ? "The model was correct but included unnecessary filler text."
        : undefined,
    };
  });

  return (
    <div className="airtable-card p-6">
      {/* Legend */}
      <div className="flex items-center gap-6 mb-5">
        {(["pass", "warn", "fail"] as RunStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm inline-block"
                  style={{ background: STATUS[s].bg, border: `1.5px solid ${STATUS[s].border}` }} />
            <span className="text-xs font-medium" style={{ color: "rgba(4,14,32,0.55)", letterSpacing: "0.12px" }}>
              {s === "pass" ? "Pass (>90%)" : s === "warn" ? "Borderline" : "Fail (<80%)"}
            </span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-12 gap-1.5 relative">
        {runs.map((run, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.012 }}
            onClick={() => run.status !== "pass" && setSelected(run)}
            title={`Run ${run.id} — ${run.status}`}
            className="aspect-square rounded-md transition-transform hover:scale-110"
            style={{
              background: STATUS[run.status].bg,
              border: `1.5px solid ${STATUS[run.status].border}`,
              cursor: run.status !== "pass" ? "pointer" : "default",
            }}
          />
        ))}
      </div>

      {/* CoT Drill-down Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed sm:absolute inset-0 bg-white z-20 flex flex-col sm:rounded-2xl overflow-hidden"
            style={{ border: "1px solid #e0e2e6" }}
          >
            <div className="flex items-center justify-between px-6 py-4"
                 style={{ borderBottom: "1px solid #e0e2e6" }}>
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5"
                  style={{ color: selected.status === "fail" ? "#b91c1c" : "#b45309" }} />
                <h3 className="font-semibold text-[#181d26]" style={{ letterSpacing: "0.1px" }}>
                  Run {selected.id} — Evaluation Details
                </h3>
              </div>
              <button onClick={() => setSelected(null)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-[#f8fafc]"
                      style={{ border: "1px solid transparent" }}>
                <X className="w-4 h-4 text-[#181d26]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div>
                <p className="section-label mb-2">Failed Criterion</p>
                <span className="airtable-tag text-sm"
                      style={{
                        color: selected.status === "fail" ? "#b91c1c" : "#b45309",
                        background: selected.status === "fail" ? "#fef2f2" : "#fefce8",
                        borderColor: selected.status === "fail" ? "#fecaca" : "#fef08a",
                      }}>
                  {selected.failedCriterion}
                </span>
              </div>
              <div>
                <p className="section-label mb-2">Chain-of-Thought Reasoning</p>
                <div className="p-3 sm:p-4 rounded-xl text-sm leading-relaxed text-[#181d26]"
                     style={{ background: "#f8fafc", border: "1px solid #e0e2e6", letterSpacing: "0.12px" }}>
                  {selected.reasoning}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[{ label: "Original Prompt", content: selected.prompt },
                  { label: "Model Output",    content: selected.output }].map(({ label, content }) => (
                  <div key={label}>
                    <p className="section-label mb-2">{label}</p>
                    <div className="p-3 sm:p-4 rounded-xl text-sm text-[#181d26] leading-relaxed"
                         style={{ background: "#f8fafc", border: "1px solid #e0e2e6", letterSpacing: "0.12px" }}>
                      {content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
