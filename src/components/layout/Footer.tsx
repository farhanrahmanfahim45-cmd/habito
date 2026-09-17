import { Link } from "react-router-dom";
import { Wordmark } from "./Header";

const COLUMNS = [
  {
    heading: "Find a space",
    links: [
      { to: "/explore", label: "Explore" },
      { to: "/search", label: "Search" },
      { to: "/find", label: "Find my space" },
      { to: "/saved", label: "Saved" },
    ],
  },
  {
    heading: "For owners",
    links: [
      { to: "/list", label: "List a space" },
      { to: "/portfolio", label: "My spaces" },
      { to: "/signup", label: "Create an account" },
      { to: "/requests", label: "Space requests" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-hairline bg-ivory-deep">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Wordmark className="text-base" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Habito makes every kind of usable space discoverable — homes, rooms, shops, offices,
            storage, parking and land, across Bangladesh.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <h2 className="mb-3 font-display text-sm font-bold text-ink">{col.heading}</h2>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-muted transition-colors hover:text-ink">
                    {l.label}
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
