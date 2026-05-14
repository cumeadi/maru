"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ShieldCheck, MessageSquareHeart, FileJson, Zap } from "lucide-react";

type Template = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
  criteria: { name: string; type: string; description: string }[];
};

const TEMPLATES: Template[] = [
  {
    id: "rag-hallucination",
    name: "RAG Hallucination Detector",
    description: "Verify every factual claim is grounded in the retrieval context. Essential for knowledge base and doc Q&A agents.",
    icon: <Sparkles className="w-4 h-4" />,
    tags: ["RAG", "Grounding"],
    criteria: [
      { name: "Grounding",         type: "pass_fail",     description: "Every claim traceable to source material." },
      { name: "No Fabrication",    type: "pass_fail",     description: "No invented names, dates, or statistics." },
      { name: "Citation Accuracy", type: "score_1_to_10", description: "Sources quoted without distortion." },
    ],
  },
  {
    id: "json-strict",
    name: "JSON Strict Schema",
    description: "Ensure agents return structured payloads that won't break your downstream pipelines.",
    icon: <FileJson className="w-4 h-4" />,
    tags: ["JSON", "Schema"],
    criteria: [
      { name: "Valid JSON",        type: "pass_fail", description: "Parseable with no markdown fences." },
      { name: "Schema Compliance", type: "pass_fail", description: "All required keys with correct types." },
      { name: "No Extra Keys",     type: "pass_fail", description: "No undocumented fields added." },
    ],
  },
  {
    id: "support-tone",
    name: "Customer Support Tone",
    description: "Evaluate empathy, actionability, and brand safety for customer-facing agents.",
    icon: <MessageSquareHeart className="w-4 h-4" />,
    tags: ["CX", "Tone"],
    criteria: [
      { name: "Empathy",               type: "score_1_to_10", description: "Acknowledges customer frustration." },
      { name: "Actionability",         type: "score_1_to_10", description: "Clear, concrete next steps." },
      { name: "No Competitor Mention", type: "penalty",       description: "Penalise competitor references." },
      { name: "Brevity",               type: "score_1_to_10", description: "Under 200 words." },
    ],
  },
  {
    id: "toxicity-filter",
    name: "Toxicity & Safety Filter",
    description: "Guard against harmful, offensive, or dangerous outputs for public-facing deployments.",
    icon: <ShieldCheck className="w-4 h-4" />,
    tags: ["Safety", "Compliance"],
    criteria: [
      { name: "No Hate Speech",      type: "pass_fail", description: "No demeaning or discriminatory language." },
      { name: "No Self-Harm Content",type: "pass_fail", description: "No dangerous content." },
      { name: "Professional Tone",   type: "pass_fail", description: "No profanity or hostility." },
    ],
  },
];

const TYPE_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pass_fail:     { label: "Pass / Fail", color: "#1b61c9", bg: "rgba(27,97,201,0.07)", border: "rgba(27,97,201,0.2)" },
  score_1_to_10: { label: "1–10 Score",  color: "#254fad", bg: "rgba(37,79,173,0.07)", border: "rgba(37,79,173,0.2)" },
  penalty:       { label: "Penalty",     color: "#b91c1c", bg: "#fef2f2",              border: "#fecaca" },
};

export function RubricTemplatePicker({ onSelect }: { onSelect: (id: string) => void }) {
  const [preview, setPreview] = useState<Template | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TEMPLATES.map((tpl, i) => (
          <motion.div
            key={tpl.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => setPreview(tpl)}
            className="airtable-card-soft p-5 cursor-pointer transition-all hover:border-[#1b61c9]"
            style={{ borderRadius: "16px" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "rgba(0,0,0,0.32) 0px 0px 1px, rgba(45,127,249,0.28) 0px 2px 8px";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{ background: "rgba(27,97,201,0.1)", border: "1px solid rgba(27,97,201,0.2)", color: "#1b61c9" }}>
                {tpl.icon}
              </div>
              <div className="flex gap-1.5">
                {tpl.tags.map((t) => (
                  <span key={t} className="airtable-tag"
                        style={{ color: "rgba(4,14,32,0.55)", background: "#f8fafc", borderColor: "#e0e2e6", fontSize: "11px" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <h4 className="font-semibold text-[14px] text-[#181d26] mb-1.5" style={{ letterSpacing: "0.1px" }}>
              {tpl.name}
            </h4>
            <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "rgba(4,14,32,0.55)" }}>
              {tpl.description}
            </p>
            <div className="mt-4 pt-3 flex items-center justify-between"
                 style={{ borderTop: "1px solid #e0e2e6" }}>
              <span className="section-label">{tpl.criteria.length} criteria</span>
              <span className="text-xs font-medium" style={{ color: "#1b61c9" }}>Preview →</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {preview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
               style={{ background: "rgba(24,29,38,0.45)", backdropFilter: "blur(4px)" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: "rgba(0,0,0,0.32) 0px 0px 1px, rgba(0,0,0,0.18) 0px 16px 48px, rgba(45,127,249,0.18) 0px 2px 12px" }}
            >
              <div className="flex items-center justify-between px-6 py-4"
                   style={{ borderBottom: "1px solid #e0e2e6", background: "#f8fafc" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                       style={{ background: "rgba(27,97,201,0.1)", border: "1px solid rgba(27,97,201,0.2)", color: "#1b61c9" }}>
                    {preview.icon}
                  </div>
                  <h3 className="font-semibold text-[15px] text-[#181d26]">{preview.name}</h3>
                </div>
                <button onClick={() => setPreview(null)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-[#e0e2e6]">
                  <X className="w-4 h-4 text-[#181d26]" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <p className="text-sm leading-relaxed" style={{ color: "rgba(4,14,32,0.65)", letterSpacing: "0.12px" }}>
                  {preview.description}
                </p>
                <div>
                  <p className="section-label mb-3">Criteria</p>
                  <div className="space-y-2">
                    {preview.criteria.map((c) => {
                      const style = TYPE_STYLE[c.type];
                      return (
                        <div key={c.name} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                             style={{ background: "#f8fafc", border: "1px solid #e0e2e6" }}>
                          <div>
                            <p className="text-sm font-medium text-[#181d26]" style={{ letterSpacing: "0.08px" }}>{c.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: "rgba(4,14,32,0.55)" }}>{c.description}</p>
                          </div>
                          <span className="airtable-tag shrink-0 text-xs"
                                style={{ color: style.color, background: style.bg, borderColor: style.border }}>
                            {style.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => { onSelect(preview.id); setPreview(null); }}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Use This Template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
