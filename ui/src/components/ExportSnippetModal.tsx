"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Copy, Check, X } from "lucide-react";

const snippet = `import { MaruClient, TEMPLATES } from "@maru/sdk";

const maru = new MaruClient(process.env.MARU_API_KEY);

// Load a pre-built rubric template
const templates = await maru.getTemplates();
const rubric = templates[TEMPLATES.SUPPORT_TONE];

// CI/CD assertion — blocks deployment below 90% alignment
const passed = await maru.test(prompt, output, rubric, 90.0);

if (!passed) {
  console.error("Maru: behavioral regression detected. Blocking deploy.");
  process.exit(1);
}

// Shadow Mode — evaluate live traffic with zero latency
maru.shadowTest(prompt, liveOutput, rubric);

// Implicit feedback loop
await maru.logFeedback(runId, "rejected");`;

export function ExportSnippetModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
             style={{ background: "rgba(24,29,38,0.45)", backdropFilter: "blur(4px)" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="w-full sm:max-w-2xl bg-white sm:rounded-2xl rounded-t-2xl overflow-hidden"
            style={{ boxShadow: "rgba(0,0,0,0.32) 0px 0px 1px, rgba(0,0,0,0.18) 0px 16px 48px, rgba(45,127,249,0.18) 0px 2px 12px",
                     maxHeight: "90vh", display: "flex", flexDirection: "column" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4"
                 style={{ borderBottom: "1px solid #e0e2e6", background: "#f8fafc" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{ background: "rgba(27,97,201,0.1)", border: "1px solid rgba(27,97,201,0.2)" }}>
                  <Code className="w-4 h-4" style={{ color: "#1b61c9" }} />
                </div>
                <h3 className="font-semibold text-[15px] text-[#181d26]">Export Evaluation Config</h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-[#e0e2e6]">
                <X className="w-4 h-4 text-[#181d26]" />
              </button>
            </div>

              {/* Body */}
              <div className="p-4 sm:p-6 overflow-y-auto">
              <p className="text-sm mb-5 leading-relaxed" style={{ color: "rgba(4,14,32,0.65)", letterSpacing: "0.12px" }}>
                Paste this snippet into your GitHub Actions or GitLab CI pipeline to run{" "}
                <code className="px-1.5 py-0.5 rounded text-[13px] font-mono"
                      style={{ background: "#f8fafc", border: "1px solid #e0e2e6", color: "#1b61c9" }}>
                  maru.test()
                </code>{" "}
                assertions on every deployment and block behavioral regressions.
              </p>

              <div className="relative rounded-xl overflow-hidden"
                   style={{ border: "1px solid #e0e2e6" }}>
                <div className="flex items-center justify-between px-4 py-2.5"
                     style={{ background: "#f8fafc", borderBottom: "1px solid #e0e2e6" }}>
                  <span className="section-label">TypeScript</span>
                  <button onClick={copy}
                          className="flex items-center gap-1.5 text-xs font-medium transition-colors px-3 py-1.5 rounded-lg"
                          style={{ color: copied ? "#006400" : "#1b61c9",
                                   background: copied ? "#f0fdf4" : "rgba(27,97,201,0.08)",
                                   border: `1px solid ${copied ? "#bbf7d0" : "rgba(27,97,201,0.2)"}` }}>
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="p-5 overflow-x-auto text-[13px] font-mono leading-relaxed"
                     style={{ background: "#181d26", color: "#e2e8f0" }}>
                  <code>{snippet}</code>
                </pre>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
