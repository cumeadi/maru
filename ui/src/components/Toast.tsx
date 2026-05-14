"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type ToastProps = {
  message: string;
  type: "success" | "error";
  onClose: () => void;
};

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      className="flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg max-w-sm w-full"
      style={{
        background: "#ffffff",
        border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`,
        boxShadow: "rgba(0,0,0,0.12) 0px 8px 24px, rgba(0,0,0,0.04) 0px 0px 1px",
      }}
    >
      {isSuccess
        ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#006400" }} />
        : <AlertCircle  className="w-5 h-5 shrink-0 mt-0.5 text-[#b91c1c]" />
      }
      <p className="text-sm flex-1 leading-relaxed" style={{ color: "#181d26", letterSpacing: "0.1px" }}>
        {message}
      </p>
      <button onClick={onClose} className="p-0.5 rounded hover:bg-[#f8fafc] transition-colors shrink-0">
        <X className="w-4 h-4" style={{ color: "rgba(4,14,32,0.4)" }} />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
      <AnimatePresence>{children}</AnimatePresence>
    </div>
  );
}
