import { useEffect, useState } from "react";
import { Lightbulb, X } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";
import type { TranslationKey } from "@/i18n";

/**
 * A one-time explanation, shown where the thing being explained actually is.
 *
 * Deliberately not part of a walkthrough: an explanation of the match score
 * means nothing until you are looking at one. Dismissed once, gone for good.
 */
export function Coachmark({
  id,
  titleKey,
  bodyKey,
  className,
}: {
  /** Stable key — dismissal is remembered against it. */
  id: string;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  className?: string;
}) {
  const { t } = useI18n();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    try {
      setShown(window.localStorage.getItem(`habito.coach.${id}`) !== "seen");
    } catch {
      setShown(false);
    }
  }, [id]);

  if (!shown) return null;

  const dismiss = () => {
    setShown(false);
    try {
      window.localStorage.setItem(`habito.coach.${id}`, "seen");
    } catch {
      // Nothing to do; it reappears next visit, which is harmless.
    }
  };

  return (
    <aside
      className={cn(
        "flex gap-3 rounded-card bg-aqua-50 p-4 text-sm ring-1 ring-aqua-200 rise",
        className,
      )}
    >
      <Lightbulb size={17} className="mt-0.5 shrink-0 text-aqua-700" aria-hidden />

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-aqua-700">{t(titleKey)}</p>
        <p className="mt-1 leading-relaxed text-ink-soft">{t(bodyKey)}</p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-2 text-xs font-bold text-aqua-700 hover:underline"
        >
          {t("coach.gotIt")}
        </button>
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label={t("coach.gotIt")}
        className="shrink-0 rounded-full p-1 text-aqua-700/60 hover:bg-aqua-100 hover:text-aqua-700"
      >
        <X size={14} aria-hidden />
      </button>
    </aside>
  );
}
