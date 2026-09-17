import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { en } from "./en";
import { bn } from "./bn";

export type Language = "en" | "bn";

/** Every key must exist in both dictionaries — the type enforces it. */
export type TranslationKey = keyof typeof en;

const DICTIONARIES: Record<Language, Record<TranslationKey, string>> = { en, bn };

const STORAGE_KEY = "habito.language";

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  /** Translate. Values in {braces} are substituted. */
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
  /** Format a number in the active script: 12,000 or ১২,০০০. */
  num: (value: number) => string;
  /** Money in the active script, e.g. ৳12,000 or ৳১২,০০০. */
  money: (value: number) => string;
}

const Ctx = createContext<I18nState | null>(null);

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Bengali uses the Indian grouping (1,20,000), which en-IN already applies. */
function formatNumber(value: number, language: Language): string {
  const grouped = value.toLocaleString("en-IN");
  if (language === "en") return grouped;
  return grouped.replace(/\d/g, (d) => BENGALI_DIGITS[Number(d)]);
}

function detectInitial(): Language {
  if (typeof window === "undefined") return "en";

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "bn") return stored;

  // A Bangladeshi browser should not have to go looking for the toggle.
  return navigator.language?.toLowerCase().startsWith("bn") ? "bn" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectInitial);

  useEffect(() => {
    document.documentElement.lang = language;
    // Lets CSS pick the right typeface: Bricolage has no Bengali glyphs.
    document.documentElement.dataset.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Private mode. The choice still applies for this session.
    }

    // Remember it on the account too, so it follows the person to a new device.
    const client = supabase;
    if (client) {
      void client.auth.getUser().then(({ data }) => {
        if (data.user) void client.from("profiles").update({ language: lang }).eq("id", data.user.id);
      });
    }
  }, []);

  const t = useCallback<I18nState["t"]>(
    (key, values) => {
      const dict = DICTIONARIES[language];
      // Falling back to English is better than showing a raw key to a user.
      let text: string = dict[key] ?? en[key] ?? String(key);

      if (values) {
        for (const [name, value] of Object.entries(values)) {
          const rendered = typeof value === "number" ? formatNumber(value, language) : value;
          text = text.split(`{${name}}`).join(String(rendered));
        }
      }

      return text;
    },
    [language],
  );

  const value = useMemo<I18nState>(
    () => ({
      language,
      setLanguage,
      t,
      num: (v) => formatNumber(v, language),
      money: (v) => `\u09F3${formatNumber(v, language)}`,
    }),
    [language, setLanguage, t],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
