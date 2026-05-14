"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Code, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

import { DiagnosticHeatmap }        from "@/components/DiagnosticHeatmap";
import { MultiModelArena }          from "@/components/MultiModelArena";
import { GoldenDatasetManager }     from "@/components/GoldenDatasetManager";
import { GlobalAlignmentDashboard } from "@/components/GlobalAlignmentDashboard";
import { ExportSnippetModal }       from "@/components/ExportSnippetModal";
import { RubricTemplatePicker }     from "@/components/RubricTemplatePicker";
import { Toast, ToastContainer }    from "@/components/Toast";
import { ModelCardSkeleton }        from "@/components/Skeletons";

// ── Config ────────────────────────────────────────────────────────────────────
// Point to the running engine. Falls back gracefully if ENGINE_URL isn't set.
const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL ?? "http://localhost:8000";

type ToastEntry = { id: number; message: string; type: "success" | "error" };

function SectionHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-5 sm:mb-6">
      <h2 className="text-[18px] sm:text-[20px] lg:text-[22px] font-semibold text-[#181d26]"
          style={{ letterSpacing: "0.1px" }}>
        {title}
      </h2>
      <p className="text-[13px] sm:text-sm mt-1"
         style={{ color: "rgba(4,14,32,0.55)", letterSpacing: "0.12px" }}>{sub}</p>
    </div>
  );
}

export default function Home() {
  const [isEvaluating, setIsEvaluating]   = useState(false);
  const [hasEvaluated, setHasEvaluated]   = useState(false);
  const [engineError, setEngineError]     = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen]   = useState(false);
  const [selectedTemplate, setSelected]   = useState<string | null>(null);
  const [toasts, setToasts]               = useState<ToastEntry[]>([]);
  const [toastId, setToastId]             = useState(0);

  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = toastId + 1;
    setToastId(id);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, [toastId]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const runEvaluation = async () => {
    setIsEvaluating(true);
    setEngineError(null);

    try {
      // Health-check the engine first
      const health = await fetch(`${ENGINE_URL}/health`);
      if (!health.ok) throw new Error("Engine returned a non-OK status.");

      // Demo evaluation — in a real integration, this comes from
      // the selected Golden Dataset entries + chosen rubric template.
      const payload = {
        prompt: "How do I reset my password?",
        output:  "Go to Settings › Security › Reset Password and follow the link sent to your email.",
        rubric: {
          id:       selectedTemplate ?? "support-tone",
          name:     "Demo Rubric",
          criteria: [
            { name: "Helpfulness", description: "Is the answer actionable?", criterion_type: "score_1_to_10", weight: 1.0 },
            { name: "Tone",        description: "Is the tone professional?",  criterion_type: "pass_fail",     weight: 1.0 },
          ],
        },
        judge_model: "gpt-4o",
      };

      const res = await fetch(`${ENGINE_URL}/api/v1/evaluate`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_MARU_API_KEY ?? "change-me-in-production"}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail ?? `Engine responded with ${res.status}`);
      }

      setHasEvaluated(true);
      addToast("Evaluation complete — results loaded below.", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setEngineError(msg);
      addToast(`Evaluation failed: ${msg}`, "error");
      // Still show demo results in sandbox mode so the UI is usable offline
      setHasEvaluated(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#ffffff" }}>

      {/* ── Top Nav ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 bg-white"
           style={{ borderBottom: "1px solid #e0e2e6",
                    boxShadow: "rgba(15,48,106,0.05) 0px 0px 20px" }}>
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                 style={{ background: "#1b61c9" }}>M</div>
            <span className="font-semibold text-[16px] sm:text-[17px] text-[#181d26]"
                  style={{ letterSpacing: "0.1px" }}>Maru</span>
            <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: "rgba(27,97,201,0.1)", color: "#1b61c9",
                           border: "1px solid rgba(27,97,201,0.2)" }}>Sandbox</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setIsExportOpen(true)}
                    className="btn-secondary text-sm py-2 px-3 sm:px-4 flex items-center gap-1.5">
              <Code className="w-4 h-4" style={{ color: "#1b61c9" }} />
              <span className="hidden sm:inline">Export Config</span>
              <span className="sm:hidden">Export</span>
            </button>
            <button onClick={runEvaluation} disabled={isEvaluating}
                    className="btn-primary flex items-center gap-2 text-sm py-2 px-4 sm:py-2.5 sm:px-5">
              {isEvaluating
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : hasEvaluated
                ? <RefreshCw className="w-4 h-4" />
                : null}
              <span className="hidden sm:inline">
                {isEvaluating ? "Running Pipeline…" : hasEvaluated ? "Re-run Evaluation" : "Run Evaluation"}
              </span>
              <span className="sm:hidden">
                {isEvaluating ? "Running…" : "Run"}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Engine Error Banner ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {engineError && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="max-w-[1320px] mx-auto px-4 sm:px-8 py-3">
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
                   style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c" }}>
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Engine offline or misconfigured — </span>
                  {engineError}
                  <span className="ml-2 opacity-70">
                    Demo results are shown below. Start the engine with{" "}
                    <code className="font-mono bg-red-100 px-1 rounded">docker-compose up</code>.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page body ────────────────────────────────────────────────────────── */}
      <main className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 sm:space-y-14">

        <div>
          <h1 className="text-[28px] sm:text-[36px] lg:text-[40px] font-semibold text-[#181d26] leading-tight">
            Evaluation Dashboard
          </h1>
          <p className="text-[15px] sm:text-[17px] lg:text-[18px] mt-2"
             style={{ color: "rgba(4,14,32,0.55)", letterSpacing: "0.18px", lineHeight: "1.45" }}>
            Behavioral telemetry for your AI agents — powered by the ParallelScore Cognitive Stack.
          </p>
        </div>

        {/* ── Alignment Metrics ─────────────────────────────────────────────── */}
        <section>
          <SectionHeading title="Alignment Metrics" sub="Rolling 24-hour performance across all production agents" />
          <GlobalAlignmentDashboard />
        </section>

        {/* ── Rubric Templates ──────────────────────────────────────────────── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5 sm:mb-6">
            <div>
              <h2 className="text-[18px] sm:text-[20px] lg:text-[22px] font-semibold text-[#181d26]"
                  style={{ letterSpacing: "0.1px" }}>Evaluation Rubric</h2>
              <p className="text-[13px] sm:text-sm mt-1"
                 style={{ color: "rgba(4,14,32,0.55)", letterSpacing: "0.12px" }}>
                Select a pre-built template or define custom criteria
              </p>
            </div>
            <AnimatePresence>
              {selectedTemplate && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium self-start sm:self-auto"
                  style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#006400" }}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-mono text-xs">{selectedTemplate}</span>
                  <button onClick={() => setSelected(null)}
                          className="text-xs ml-1 opacity-60 hover:opacity-100 transition-opacity">×</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <RubricTemplatePicker onSelect={setSelected} />
        </section>

        {/* ── Golden Dataset ────────────────────────────────────────────────── */}
        <section>
          <SectionHeading title="Golden Dataset" sub="Ground-truth input/output pairs for behavioral evaluation" />
          <GoldenDatasetManager />
        </section>

        {/* ── Post-evaluation Results ───────────────────────────────────────── */}
        {hasEvaluated && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      className="space-y-10 sm:space-y-14">
            <section>
              <SectionHeading
                title="Multi-Model Arena"
                sub="Comparative alignment scores, latency, and cost across providers" />
              {isEvaluating
                ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[...Array(4)].map((_, i) => <ModelCardSkeleton key={i} />)}
                  </div>
                : <MultiModelArena />}
            </section>

            <section className="relative">
              <SectionHeading
                title="Diagnostic Heatmap"
                sub="Click any failing cell to view the Chain-of-Thought explanation" />
              <DiagnosticHeatmap />
            </section>
          </motion.div>
        )}
      </main>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      <ExportSnippetModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />

      {/* ── Toast Notifications ──────────────────────────────────────────────── */}
      <ToastContainer>
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </ToastContainer>
    </div>
  );
}
