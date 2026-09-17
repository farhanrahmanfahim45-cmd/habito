import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Check, Info } from "lucide-react";

interface ToastItem {
  id: number;
  message: string;
  tone: "ok" | "info";
}

const ToastContext = createContext<{ notify: (message: string, tone?: "ok" | "info") => void }>({
  notify: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const notify = useCallback((message: string, tone: "ok" | "info" = "ok") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-60 flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2 rounded-md bg-ink px-3.5 py-2.5 text-sm font-medium text-ivory shadow-lg"
          >
            {t.tone === "ok" ? <Check size={15} aria-hidden /> : <Info size={15} aria-hidden />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
