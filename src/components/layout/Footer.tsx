import { Link } from "react-router-dom";
import { Wordmark } from "./Header";
import { useI18n } from "@/i18n";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

const COLUMNS = [
  {
    heading: "footer.findHeading" as const,
    links: [
      { to: "/explore", key: "nav.explore" as const },
      { to: "/search", key: "nav.search" as const },
      { to: "/find", key: "nav.find" as const },
      { to: "/saved", key: "nav.saved" as const },
      { to: "/messages", key: "nav.messages" as const },
    ],
  },
  {
    heading: "footer.ownerHeading" as const,
    links: [
      { to: "/list", key: "nav.list" as const },
      { to: "/portfolio", key: "nav.portfolio" as const },
      { to: "/signup", key: "auth.createAccount" as const },
      { to: "/requests", key: "nav.requests" as const },
    ],
  },
];

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-20 border-t border-hairline bg-ivory-deep">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Wordmark className="text-base" />
          <div className="mt-4 sm:hidden">
            <LanguageToggle />
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{t("footer.blurb")}</p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.heading} aria-label={t(col.heading)}>
            <h2 className="mb-3 font-display text-sm font-bold text-ink">{t(col.heading)}</h2>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-muted transition-colors hover:text-ink">
                    {t(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-hairline">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Prototype built for the Innovation to Impact initiative, Independent University, Bangladesh.</p>
          <p>All seed data is synthetic. No real identity or ownership verification is performed.</p>
        </div>
      </div>
    </footer>
  );
}
