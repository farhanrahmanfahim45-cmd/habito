import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";

/**
 * Language switch. Kept as two visible labels rather than a dropdown — for a
 * user who can't read the current language, a dropdown is a guess.
 */
export function LanguageToggle({ compact }: { compact?: boolean }) {
  const { language, setLanguage } = useI18n();

  return (
    <div
      role="group"
      aria-label="Language / ভাষা"
      className={cn(
        "inline-flex w-fit items-center rounded-full bg-ivory-deep p-0.5 ring-1 ring-hairline",
        compact ? "gap-0" : "gap-0.5",
      )}
    >
      {([
        { code: "en" as const, label: "EN", full: "English" },
        { code: "bn" as const, label: "বাং", full: "বাংলা" },
      ]).map((option) => (
        <button
          key={option.code}
          type="button"
          lang={option.code}
          aria-pressed={language === option.code}
          onClick={() => setLanguage(option.code)}
          title={option.full}
          className={cn(
            "rounded-full px-2.5 py-1.5 text-xs font-bold transition-colors",
            language === option.code ? "bg-ink text-ivory" : "text-muted hover:text-ink",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
