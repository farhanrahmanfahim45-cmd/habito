import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Home, Store, Compass, Check } from "lucide-react";
import { useI18n } from "@/i18n";
import { useHabito } from "@/hooks/useHabito";
import { Button } from "@/components/ui/Button";
import { AREAS } from "@/data/areas";
import { cn } from "@/lib/cn";
import type { Language } from "@/i18n";

const SEEN_KEY = "habito.onboarded";

export type Intent = "renting" | "listing" | "looking";

export function hasOnboarded(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) === "true";
  } catch {
    return true;
  }
}

function markOnboarded() {
  try {
    window.localStorage.setItem(SEEN_KEY, "true");
  } catch {
    // Private mode. They'll see it again, which is survivable.
  }
}

/**
 * First run.
 *
 * Three questions, each skippable, then straight into results — not a tutorial.
 * Habito's users are often meeting a product like this for the first time, and
 * people who are unsure of themselves tap through walkthroughs without reading
 * and arrive more confused than they started. Short beats thorough, and the
 * real explaining happens in context later.
 */
export function Onboarding({ onDone }: { onDone: () => void }) {
  const { t, language, setLanguage } = useI18n();
  const { requirements, setRequirements } = useHabito();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState<Intent | null>(null);

  const finish = (area?: string) => {
    markOnboarded();

    if (area) {
      setRequirements({ ...requirements, area });
    }

    onDone();

    // Land them where their answer pointed, rather than back at a homepage
    // they have already read.
    if (intent === "listing") navigate("/list");
    else if (intent === "renting") navigate("/search");
  };

  const skip = () => {
    markOnboarded();
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ivory">
      {/* Progress — three dots, so the end is visible from the start */}
      <div className="container-page flex items-center justify-between py-5">
        <div className="flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-6 bg-ink" : i < step ? "w-1.5 bg-ink" : "w-1.5 bg-hairline",
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={skip}
          className="text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          {t("onboarding.skip")}
        </button>
      </div>

      <div className="container-page flex flex-1 flex-col justify-center pb-16 sm:max-w-lg">
        {step === 0 && (
          <Step
            title={t("onboarding.languageTitle")}
            body={t("onboarding.languageBody")}
          >
            <div className="grid gap-3">
              {([
                { code: "en" as Language, label: "English", sample: "Find the space that fits." },
                { code: "bn" as Language, label: "বাংলা", sample: "আপনার উপযুক্ত জায়গা খুঁজে নিন।" },
              ]).map((option) => (
                <button
                  key={option.code}
                  type="button"
                  lang={option.code}
                  onClick={() => {
                    setLanguage(option.code);
                    setStep(1);
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-card p-5 text-left ring-1 transition-all",
                    language === option.code
                      ? "bg-surface ring-2 ring-aqua-600"
                      : "bg-surface ring-hairline hover:ring-hairline-strong",
                  )}
                >
                  <span>
                    <span className="block font-display text-lg font-bold text-ink">{option.label}</span>
                    <span className="mt-0.5 block text-sm text-muted">{option.sample}</span>
                  </span>
                  {language === option.code && (
                    <Check size={18} className="shrink-0 text-aqua-600" aria-hidden />
                  )}
                </button>
              ))}
            </div>
          </Step>
        )}

        {step === 1 && (
          <Step title={t("onboarding.intentTitle")} body={t("onboarding.intentBody")}>
            <div className="grid gap-3">
              <IntentCard
                icon={Home}
                title={t("onboarding.intentRenting")}
                body={t("onboarding.intentRentingBody")}
                onClick={() => {
                  setIntent("renting");
                  setStep(2);
                }}
              />
              <IntentCard
                icon={Store}
                title={t("onboarding.intentListing")}
                body={t("onboarding.intentListingBody")}
                onClick={() => {
                  setIntent("listing");
                  setStep(2);
                }}
              />
              <IntentCard
                icon={Compass}
                title={t("onboarding.intentLooking")}
                body={t("onboarding.intentLookingBody")}
                onClick={() => {
                  setIntent("looking");
                  finish();
                }}
              />
            </div>

            <p className="mt-5 text-center text-xs leading-relaxed text-muted">
              {t("onboarding.intentNote")}
            </p>
          </Step>
        )}

        {step === 2 && (
          <Step title={t("onboarding.areaTitle")} body={t("onboarding.areaBody")}>
            <ul className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pb-2">
              {AREAS.map((area) => (
                <li key={area.id}>
                  <button
                    type="button"
                    onClick={() => finish(area.name)}
                    className="w-full rounded-2xl bg-surface p-3.5 text-left ring-1 ring-hairline transition-all hover:ring-ink"
                  >
                    <span className="block font-semibold text-ink">{area.name}</span>
                    <span className="block text-xs capitalize text-muted">{area.geography}</span>
                  </button>
                </li>
              ))}
            </ul>

            <Button variant="secondary" fullWidth className="mt-4" onClick={() => finish()}>
              {t("onboarding.areaSkip")}
              <ArrowRight size={16} aria-hidden />
            </Button>
          </Step>
        )}
      </div>
    </div>
  );
}

function Step({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="rise">
      <h1 className="font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">{title}</h1>
      <p className="mt-2.5 text-base leading-relaxed text-ink-soft">{body}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function IntentCard({
  icon: Icon,
  title,
  body,
  onClick,
}: {
  icon: typeof Home;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-4 rounded-card bg-surface p-5 text-left ring-1 ring-hairline transition-all hover:-translate-y-0.5 hover:ring-ink"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-aqua-100 text-aqua-700">
        <Icon size={19} aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block font-display font-bold text-ink">{title}</span>
        <span className="mt-0.5 block text-sm leading-snug text-muted">{body}</span>
      </span>
      <ArrowRight size={17} className="ml-auto mt-2.5 shrink-0 text-muted" aria-hidden />
    </button>
  );
}
