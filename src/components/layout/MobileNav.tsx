import { NavLink } from "react-router-dom";
import { Compass, Search, Bookmark, LayoutGrid, Plus, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { useHabito } from "@/hooks/useHabito";

/** Thumb-reachable, and it changes with the role — owners don't need a shortlist. */
export function MobileNav() {
  const { savedIds, role } = useHabito();

  const items =
    role === "owner"
      ? [
          { to: "/portfolio", label: "Spaces", icon: LayoutGrid, end: false },
          { to: "/list", label: "List", icon: Plus, end: false },
          { to: "/requests", label: "Requests", icon: Search, end: false },
          { to: "/account", label: "Profile", icon: UserRound, end: false },
        ]
      : [
          { to: "/", label: "Home", icon: Compass, end: true },
          { to: "/explore", label: "Explore", icon: LayoutGrid, end: false },
          { to: "/search", label: "Search", icon: Search, end: false },
          { to: "/saved", label: "Saved", icon: Bookmark, end: false, count: savedIds.length },
          { to: "/account", label: "Profile", icon: UserRound, end: false },
        ];

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="flex">
        {items.map(({ to, label, icon: Icon, end, ...rest }) => {
          const count = (rest as { count?: number }).count;
          return (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex h-14 flex-col items-center justify-center gap-0.5 text-[0.65rem] font-semibold transition-colors",
                    isActive ? "text-ink" : "text-muted",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cn("relative rounded-full px-3 py-1 transition-colors", isActive && "bg-aqua-100")}>
                      <Icon size={18} aria-hidden />
                      {count ? (
                        <span className="absolute -right-0 -top-0.5 min-w-4 rounded-full bg-aqua-600 px-1 text-[0.55rem] font-bold leading-4 text-white tnum">
                          {count}
                        </span>
                      ) : null}
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
