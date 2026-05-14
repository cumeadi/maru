"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, Edit3, Trash2, Plus, Database } from "lucide-react";

type DatasetEntry = { id: string; input: string; expectedOutput: string };

const SAMPLE: DatasetEntry[] = [
  { id: "1", input: "How do I reset my password?", expectedOutput: "Go to Settings › Security › Reset Password. You will receive an email with a secure link." },
  { id: "2", input: "Is the API free?",            expectedOutput: "The API is free up to 10,000 requests per month. Check our pricing page for enterprise tiers." },
  { id: "3", input: "Write a polite rejection to a customer feature request.", expectedOutput: "Thank you for the feedback! While we aren't planning this right now, I've shared your insights with our product team." },
];

export function GoldenDatasetManager() {
  const [entries] = useState<DatasetEntry[]>(SAMPLE);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="airtable-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4"
           style={{ borderBottom: "1px solid #e0e2e6", background: "#f8fafc" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: "rgba(27,97,201,0.1)", border: "1px solid rgba(27,97,201,0.2)" }}>
            <Database className="w-4 h-4" style={{ color: "#1b61c9" }} />
          </div>
          <div>
            <h3 className="font-semibold text-[15px] text-[#181d26]" style={{ letterSpacing: "0.1px" }}>
              Golden Dataset
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "rgba(4,14,32,0.55)" }}>
              {entries.length} ground-truth pairs
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 btn-secondary text-sm py-2 px-4">
          <Plus className="w-4 h-4" /> Add Row
        </button>
      </div>

      <div className="p-6">
        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
          className="rounded-xl p-8 text-center flex flex-col items-center justify-center mb-6 transition-all"
          style={{
            border: `2px dashed ${isDragging ? "#1b61c9" : "#e0e2e6"}`,
            background: isDragging ? "rgba(27,97,201,0.04)" : "#f8fafc",
          }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
               style={{ background: isDragging ? "rgba(27,97,201,0.1)" : "#ffffff", border: "1px solid #e0e2e6" }}>
            <UploadCloud className="w-5 h-5" style={{ color: isDragging ? "#1b61c9" : "rgba(4,14,32,0.38)" }} />
          </div>
          <p className="font-medium text-[15px] text-[#181d26] mb-1">Drag &amp; drop JSON or CSV</p>
          <p className="text-sm" style={{ color: "rgba(4,14,32,0.55)" }}>
            or{" "}
            <span className="cursor-pointer font-medium" style={{ color: "#1b61c9" }}>
              browse your files
            </span>
          </p>
        </div>

        {/* Table — horizontally scrollable on mobile */}
        <div className="rounded-xl overflow-x-auto" style={{ border: "1px solid #e0e2e6" }}>
          <table className="w-full text-left border-collapse min-w-[520px]">
            <thead>
              <tr style={{ borderBottom: "1px solid #e0e2e6", background: "#f8fafc" }}>
                {["Input Prompt", "Expected Output", ""].map((h) => (
                  <th key={h} className="py-3 px-5 section-label font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className="group transition-colors"
                  style={{ borderBottom: "1px solid #e0e2e6" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <td className="py-4 px-5 align-top w-2/5">
                    <span className="text-sm text-[#181d26] leading-relaxed" style={{ letterSpacing: "0.12px" }}>
                      {entry.input}
                    </span>
                  </td>
                  <td className="py-4 px-5 align-top w-2/5">
                    <span className="text-sm leading-relaxed font-mono"
                          style={{ color: "rgba(4,14,32,0.65)", letterSpacing: "0.08px", fontSize: "13px" }}>
                      {entry.expectedOutput}
                    </span>
                  </td>
                  <td className="py-4 px-5 align-top text-right">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg transition-colors hover:bg-[#f0f4ff]"
                              style={{ border: "1px solid transparent" }}>
                        <Edit3 className="w-4 h-4" style={{ color: "#1b61c9" }} />
                      </button>
                      <button className="p-1.5 rounded-lg transition-colors hover:bg-[#fef2f2]"
                              style={{ border: "1px solid transparent" }}>
                        <Trash2 className="w-4 h-4 text-[#b91c1c]" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
