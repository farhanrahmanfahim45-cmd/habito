import { NavLink, Link } from "react-router-dom";
import { Bookmark, MessagesSquare, Settings, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { useHabito } from "@/hooks/useHabito";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/Button";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("inline-flex items-center gap-1.5", className)} aria-label="Habito">
      <span aria-hidden className="relative inline-block size-4 shrink-0">
        <span className="absolute inset-0 rounded-[5px] bg-ink" />
        <span className="absolute bottom-0.5 right-0.5 size-1.5 rounded-full bg-aqua-400" />
      </span>
      <span className="font-display text-[1.35em] font-extrabold tracking-tight text-ink">Habito</span>
    </Link>
  );
}

/**
 * One navigation for everybody.
 *
 * There used to be a renter/owner switch. It asked people to understand a mode
 * before they could act, and it broke quietly whenever the account state was
 * stale. Plenty of people here are both — a renter who sublets a room, a
 * shopkeeper renting a flat — so both sides are simply always present. Someone
 * who never lists anything just never opens My spaces.
 */
const NAV = [
  { to: "/explore", key: "nav.explore" },
  { to: "/search", key: "nav.search" },
  { to: "/portfolio", key: "nav.portfolio" },
] as const;

export function Header() {
  const { savedIds, unreadMessages } = useHabito();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-ivory/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-7">
        <Wordmark className="text-base" />

        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "relative py-1 text-sm font-semibold transition-colors",
                  isActive ? "text-ink" : "text-muted hover:text-ink",
                  isActive &&
                    "after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-aqua-400",
                )
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="hidden items-center gap-0.5 md:flex">
            <IconLink to="/saved" label={t("nav.saved")} count={savedIds.length} icon={Bookmark} />
            <IconLink
              to="/messages"
              label={t("nav.messages")}
              count={unreadMessages}
              icon={MessagesSquare}
            />
          </div>

          <div className="hidden lg:block">
            <LanguageToggle />
          </div>

          <AccountControls />
        </div>
      </div>
    </header>
  );
}

function AccountControls() {
  const { configured, account } = useAuth();
  const { t } = useI18n();

  if (configured && !account) {
    return (
      <div className="flex items-center gap-1.5">
        <Link to="/signin" className="hidden sm:block">
          <Button size="sm" variant="ghost">
            {t("action.signIn")}
          </Button>
        </Link>
        <Link to="/signup">
          <Button size="sm">{t("action.getStarted")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      <IconLink
        to="/account"
        label={account ? account.name.split(" ")[0] : t("nav.profile")}
        icon={UserRound}
      />
      <IconLink to="/settings" label={t("nav.settings")} icon={Settings} hideLabel />
    </div>
  );
}

function IconLink({
  to,
  label,
  count,
  icon: Icon,
  hideLabel,
}: {
  to: string;
  label: string;
  count?: number;
  icon: typeof Bookmark;
  hideLabel?: boolean;
}) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      className={({ isActive }) =>
        cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-medium transition-colors",
          isActive ? "bg-ivory-deep text-ink" : "text-muted hover:bg-ivory-deep hover:text-ink",
        )
      }
    >
      <Icon size={16} aria-hidden />
      <span className={cn(hideLabel ? "sr-only" : "sr-only lg:not-sr-only")}>{label}</span>
      {count !== undefined && count > 0 && (
        <span className="rounded-full bg-aqua-400 px-1.5 text-[0.65rem] font-bold tnum text-ink">
          {count}
        </span>
      )}
    </NavLink>
  );
}
