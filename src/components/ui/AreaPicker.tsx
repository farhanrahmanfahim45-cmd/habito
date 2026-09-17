import { useMemo, useState } from "react";
import { MapPin, Search, X, Check } from "lucide-react";
import { AREAS, areaByName, areasByRegion, searchAreas } from "@/data/areas";
import { useI18n } from "@/i18n";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";

/**
 * Choosing an area.
 *
 * Dhaka alone has 50 thanas, which is far too many for a dropdown — so this
 * opens a searchable sheet grouped by region. It matches on neighbourhoods as
 * well as area names, because people search for Kazipara or Banasree, not for
 * the thana those sit inside.
 */
export function AreaPicker({
  value,
  onChange,
  label,
  allowAnywhere = false,
  className,
}: {
  value: string;
  onChange: (areaName: string) => void;
  label?: string;
  /** Adds an "everywhere" option, for filters rather than forms. */
  allowAnywhere?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = areaByName(value);
  const anywhere = value === "all";

  const results = useMemo(() => {
    if (!query.trim()) return null;
    return searchAreas(query);
  }, [query]);

  const choose = (name: string) => {
    onChange(name);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-11 w-full items-center gap-2 rounded-xl bg-ivory px-3 text-left text-[0.9375rem] text-ink ring-1 ring-hairline-strong transition-shadow hover:ring-ink focus:outline-none focus:ring-2 focus:ring-aqua-600",
          className,
        )}
      >
        <MapPin size={15} className="shrink-0 text-muted" aria-hidden />
        <span className="min-w-0 flex-1 truncate">
          {anywhere ? t("filter.everywhere") : selected?.name ?? value}
        </span>
        {selected?.district && selected.district !== selected.name && !anywhere && (
          <span className="shrink-0 text-xs text-muted">{selected.district}</span>
        )}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={label ?? t("find.where")}>
        <div className="sticky -top-1 z-10 -mx-1 bg-surface pb-3 pt-1">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("area.searchPlaceholder")}
              className="h-11 w-full rounded-xl bg-ivory pl-9 pr-9 text-[0.9375rem] ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={t("action.clear")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:text-ink"
              >
                <X size={14} aria-hidden />
              </button>
            )}
          </div>
        </div>

        {allowAnywhere && !query && (
          <button
            type="button"
            onClick={() => choose("all")}
            className={cn(
              "mb-3 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors",
              anywhere ? "bg-aqua-50 text-aqua-700" : "bg-ivory text-ink hover:bg-ivory-deep",
            )}
          >
            {t("filter.everywhere")}
            {anywhere && <Check size={15} aria-hidden />}
          </button>
        )}

        {results ? (
          results.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">{t("area.noMatch", { query })}</p>
          ) : (
            <ul className="space-y-1">
              {results.map((area) => (
                <li key={area.id}>
                  <AreaRow area={area} selected={area.name === value} query={query} onClick={() => choose(area.name)} />
                </li>
              ))}
            </ul>
          )
        ) : (
          <div className="space-y-5">
            {areasByRegion().map((group) => (
              <section key={group.region}>
                <h3 className="mb-1.5 px-1 text-xs font-bold uppercase tracking-wide text-muted">
                  {group.region}
                </h3>
                <ul className="space-y-1">
                  {group.areas.map((area) => (
                    <li key={area.id}>
                      <AreaRow area={area} selected={area.name === value} onClick={() => choose(area.name)} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}

function AreaRow({
  area,
  selected,
  query,
  onClick,
}: {
  area: (typeof AREAS)[number];
  selected: boolean;
  query?: string;
  onClick: () => void;
}) {
  // When the match came from a neighbourhood rather than the area name, show
  // which one — otherwise the result looks arbitrary.
  const matchedHood =
    query && area.neighborhoods?.find((n) => n.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
        selected ? "bg-aqua-50" : "hover:bg-ivory",
      )}
    >
      <span className="min-w-0">
        <span className={cn("block truncate text-sm font-semibold", selected ? "text-aqua-700" : "text-ink")}>
          {area.name}
        </span>
        <span className="block truncate text-xs text-muted">
          {matchedHood ? `${matchedHood} · ${area.district}` : area.district}
        </span>
      </span>
      {selected && <Check size={15} className="shrink-0 text-aqua-700" aria-hidden />}
    </button>
  );
}
