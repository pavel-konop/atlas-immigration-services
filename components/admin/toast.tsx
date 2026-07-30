"use client";

import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from "react";
import { cn } from "@/lib/utils/cn";

export type ToastTone = "success" | "error" | "info";
type Toast = { id: number; tone: ToastTone; message: string };

type ToastContextValue = { push: (tone: ToastTone, message: string) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within AdminToastProvider");
  return ctx;
}

const toneStyles: Record<ToastTone, string> = {
  success: "border-emerald-200 bg-white text-emerald-800",
  error: "border-red-200 bg-white text-red-700",
  info: "border-atlas-line bg-white text-atlas-navy"
};

const toneIcon = { success: CheckCircle2, error: TriangleAlert, info: Info };

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((tone: ToastTone, message: string) => {
    const id = (nextId.current += 1);
    setToasts((prev) => [...prev, { id, tone, message }]);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <ToastRow key={toast.id} toast={toast} onDismiss={() => remove(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastRow({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = toneIcon[toast.tone];
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-soft",
        toneStyles[toast.tone]
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="flex-1">{toast.message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss" className="shrink-0 text-slate-400 hover:text-slate-600">
        <X aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Inline, non-transient feedback for form-level errors/success within a page. */
export function FeedbackBanner({ tone, children }: { tone: ToastTone; children: ReactNode }) {
  const Icon = toneIcon[tone];
  return (
    <div className={cn("flex items-start gap-2 rounded-md border px-3 py-2 text-sm", toneStyles[tone])}>
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
