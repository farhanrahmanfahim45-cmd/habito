import { useState } from "react";
import { Link } from "react-router-dom";
import { Languages, Bell, UserRound, Info, LogOut, FlaskConical, ShieldQuestion } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import { usingDatabase } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

/**
 * Settings.
 *
 * On a phone this is where people look for language, notifications and the way
 * out. It also carries the two honest statements about what Habito's data and
 * badges actually mean — findable rather than buried in a footer.
 */
export default function Settings() {
  const { t } = useI18n();
  const { account, configured, signOut } = useAuth();
  const { notify } = useToast();

  // Notification channels don't exist yet, so these are stored preferences
  // rather than switches that pretend to do something.
  const [prefs, setPrefs] = useState({ messages: true, inquiries: true, availability: true });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    notify(t("account.updated"));
  };

  return (
    <>
      <PageHeader title={t("settings.title")} lead={t("settings.lead")} />

      <div className="container-page max-w-2xl space-y-4 py-8 md:py-10">
        {/* Language */}
        <Section icon={Languages} title={t("account.language")}>
          <p className="mb-4 text-sm leading-relaxed text-muted">{t("account.languageBody")}</p>
          <LanguageToggle />
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title={t("settings.notifications")}>
          <ul className="divide-y divide-hairline">
            {([
              { key: "messages" as const, label: t("settings.notifyMessages") },
              { key: "inquiries" as const, label: t("settings.notifyInquiries") },
              { key: "availability" as const, label: t("settings.notifyAvailability") },
            ]).map((row) => (
              <li key={row.key} className="flex items-center justify-between gap-4 py-3 first:pt-0">
                <span className="text-sm text-ink">{row.label}</span>
                <Switch on={prefs[row.key]} onClick={() => toggle(row.key)} label={row.label} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-muted">{t("settings.notifyNote")}</p>
        </Section>

        {/* Account */}
        <Section icon={UserRound} title={t("settings.account")}>
          {account ? (
            <>
              <dl className="space-y-2 text-sm">
                <Row label={t("account.name")} value={account.name} />
                <Row label={t("auth.email")} value={account.email ?? "—"} />
                {account.phone && <Row label={t("auth.phone")} value={account.phone} />}
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/account">
                  <Button size="sm" variant="secondary">
                    {t("account.profile")}
                  </Button>
                </Link>
                <Button size="sm" variant="secondary" onClick={() => void signOut()}>
                  <LogOut size={14} aria-hidden />
                  {t("settings.signOut")}
                </Button>
              </div>
            </>
          ) : configured ? (
            <div className="flex flex-wrap gap-2">
              <Link to="/signin">
                <Button size="sm" variant="secondary">
                  {t("action.signIn")}
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">{t("action.getStarted")}</Button>
              </Link>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-muted">{t("auth.noDatabase")}</p>
          )}
        </Section>

        {/* Honest statements */}
        <Section icon={Info} title={t("settings.about")}>
          <ul className="space-y-3">
            <li className="flex gap-2.5">
              <FlaskConical size={15} className="mt-0.5 shrink-0 text-aqua-600" aria-hidden />
              <p className="text-sm leading-relaxed text-ink-soft">{t("settings.aboutData")}</p>
            </li>
            <li className="flex gap-2.5">
              <ShieldQuestion size={15} className="mt-0.5 shrink-0 text-warn-700" aria-hidden />
              <p className="text-sm leading-relaxed text-ink-soft">{t("settings.aboutVerification")}</p>
            </li>
          </ul>

          <p className="mt-4 border-t border-hairline pt-3 text-xs text-muted">
            {usingDatabase ? t("account.yourData") : t("account.thisDevice")}
          </p>
        </Section>
      </div>
    </>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Bell;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card bg-surface p-5 ring-1 ring-hairline sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink">
        <Icon size={17} className="text-muted" aria-hidden />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="truncate font-semibold text-ink">{value}</dd>
    </div>
  );
}

/** Large enough to hit with a thumb. */
function Switch({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors",
        on ? "bg-aqua-600" : "bg-hairline-strong",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform duration-150",
          on ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}
