import { NavLink } from "react-router-dom";
import { Compass, Search, Bookmark, MessagesSquare, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/cn";
import { useHabito } from "@/hooks/useHabito";
import { useI18n } from "@/i18n";

/**
 * Five destinations, the same for everyone. My spaces is always here rather
 * than behind a mode, because listing a room is something a renter might do
 * next week without wanting to think about which kind of user they are.
 */
export function MobileNav() {
  const { savedIds, unreadMessages } = useHabito();
  const { t } = useI18n();

  const items = [
    { to: "/", key: "nav.home", icon: Compass, end: true },
    { to: "/search", key: "nav.search", icon: Search, end: false },
    { to: "/saved", key: "nav.saved", icon: Bookmark, end: false, count: savedIds.length },
    { to: "/messages", key: "nav.chats", icon: MessagesSquare, end: false, count: unreadMessages },
    { to: "/portfolio", key: "nav.portfolio", icon: LayoutGrid, end: false },
  ] as const;

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="flex">
        {items.map((item) => {
          const count = "count" in item ? item.count : undefined;
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex h-14 flex-col items-center justify-center gap-0.5 px-1 text-[0.62rem] font-semibold transition-colors",
                    isActive ? "text-ink" : "text-muted",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "relative rounded-full px-3 py-1 transition-colors",
                        isActive && "bg-aqua-100",
                      )}
                    >
                      <item.icon size={18} aria-hidden />
                      {count ? (
                        <span className="absolute -right-0 -top-0.5 min-w-4 rounded-full bg-aqua-600 px-1 text-[0.55rem] font-bold leading-4 tnum text-white">
                          {count}
                        </span>
                      ) : null}
                    </span>
                    <span className="max-w-full truncate">{t(item.key)}</span>
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
