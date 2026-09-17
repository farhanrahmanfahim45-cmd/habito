import { NavLink, Link } from "react-router-dom";
import { Bookmark, Scale, UserRound, Compass, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { useHabito } from "@/hooks/useHabito";
import { useAuth } from "@/hooks/useAuth";
import { usingDatabase } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("inline-flex items-center gap-1.5", className)} aria-label="Habito — home">
      <span aria-hidden className="relative inline-block size-4 shrink-0">
        <span className="absolute inset-0 rounded-[5px] bg-ink" />
        <span className="absolute bottom-0.5 right-0.5 size-1.5 rounded-full bg-aqua-400" />
      </span>
      <span className="font-display text-[1.35em] font-extrabold tracking-tight text-ink">Habito</span>
    </Link>
  );
}

const SEEKER_NAV = [
  { to: "/explore", label: "Explore" },
  { to: "/search", label: "Search" },
  { to: "/find", label: "Find my space" },
];

const OWNER_NAV = [
  { to: "/portfolio", label: "My spaces" },
  { to: "/list", label: "List a space" },
  { to: "/requests", label: "Requests" },
];

function RoleSwitch() {
  const { role, setRole } = useHabito();
  if (usingDatabase) return null;
  return (
    <div
      role="group"
      aria-label="Demo mode — browse as a seeker or an owner"
      className="flex items-center gap-0.5 rounded-full bg-ivory-deep p-0.5 ring-1 ring-hairline"
    >
      <span className="px-2 text-[0.6rem] font-bold uppercase tracking-wider text-muted">Demo</span>
      {(["seeker", "owner"] as const).map((r) => (
        <button
          key={r}
          type="button"
          aria-pressed={role === r}
          onClick={() => setRole(r)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-bold capitalize transition-colors",
            role === r ? "bg-ink text-ivory" : "text-muted hover:text-ink",
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

export function Header() {
  const { savedIds, compareIds, role } = useHabito();
  const nav = role === "owner" ? OWNER_NAV : SEEKER_NAV;

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-ivory/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-7">
        <Wordmark className="text-base" />

        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
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
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {role === "seeker" && (
            <div className="hidden items-center gap-0.5 md:flex">
              <IconLink to="/saved" label="Saved" count={savedIds.length} icon={Bookmark} />
              <IconLink to="/compare" label="Compare" count={compareIds.length} icon={Scale} />
            </div>
          )}
          {role === "owner" && (
            <div className="hidden md:block">
              <IconLink to="/explore" label="Browse" icon={Compass} />
            </div>
          )}
          <AccountControls />
          <RoleSwitch />
        </div>
      </div>
    </header>
  );
}

function AccountControls() {
  const { configured, account, signOut } = useAuth();

  if (!configured) return <IconLink to="/account" label="Profile" icon={UserRound} />;

  if (!account) {
    return (
      <div className="flex items-center gap-1.5">
        <Link to="/signin" className="hidden sm:block">
          <Button size="sm" variant="ghost">
            Sign in
          </Button>
        </Link>
        <Link to="/signup">
          <Button size="sm">Get started</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      <IconLink to="/account" label={account.name.split(" ")[0]} icon={UserRound} />
      <button
        type="button"
        onClick={() => void signOut()}
        aria-label="Sign out"
        className="rounded-full p-2 text-muted transition-colors hover:bg-ivory-deep hover:text-ink"
      >
        <LogOut size={16} aria-hidden />
      </button>
    </div>
  );
}

function IconLink({
  to,
  label,
  count,
  icon: Icon,
}: {
  to: string;
  label: string;
  count?: number;
  icon: typeof Bookmark;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-medium transition-colors",
          isActive ? "bg-ivory-deep text-ink" : "text-muted hover:bg-ivory-deep hover:text-ink",
        )
      }
    >
      <Icon size={16} aria-hidden />
      <span className="sr-only lg:not-sr-only">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="rounded-full bg-aqua-400 px-1.5 text-[0.65rem] font-bold text-ink tnum">{count}</span>
      )}
    </NavLink>
  );
}
