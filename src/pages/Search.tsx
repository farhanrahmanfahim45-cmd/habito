import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Sparkles, Compass } from "lucide-react";
import { useHabito } from "@/hooks/useHabito";
import { PageHeader } from "@/components/layout/PageHeader";
import { SpaceCard } from "@/components/space/SpaceCard";
import { SpaceCardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { scoreAll, nearbyAlternatives } from "@/lib/matching";
import { money, isStale, moneyCompact } from "@/lib/format";
import { CATEGORY_STYLE, AMENITIES, AMENITY_KEYS } from "@/data/catalog";
import { AREAS } from "@/data/areas";
import { trustLevel } from "@/components/space/badges";
import { cn } from "@/lib/cn";
import type { AmenityKey, Geography, SpaceCategory } from "@/types/space";

type SortKey = "best-match" | "price-low" | "price-high" | "recent" | "size";

const SORTS: Array<{ value: SortKey; label: string }> = [
  { value: "best-match", label: "Best match" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "recent", label: "Recently updated" },
  { value: "size", label: "Largest first" },
];

interface Filters {
  area: string | "all";
  category: SpaceCategory | "all";
  geography: Geography | "all";
  priceMax: number;
  availableOnly: boolean;
  freshOnly: boolean;
  verifiedOnly: boolean;
  fullCostOnly: boolean;
  amenities: AmenityKey[];
}

const PRICE_CEILING = 150000;

const DEFAULTS: Filters = {
  area: "all",
  category: "all",
  geography: "all",
  priceMax: PRICE_CEILING,
  availableOnly: true,
  freshOnly: false,
  verifiedOnly: false,
  fullCostOnly: false,
  amenities: [],
};

export default function Search() {
  const [params] = useSearchParams();
  const { listings, ready, requirements, hasStatedNeeds, isSaved, toggleSaved, isComparing, toggleCompare } =
    useHabito();

  const [filters, setFilters] = useState<Filters>(DEFAULTS);
  const [sort, setSort] = useState<SortKey>("best-match");
  const [sheetOpen, setSheetOpen] = useState(false);

  // Deep links from the homepage rails and category cards.
  const categoryParam = params.get("category");
  const geoParam = params.get("geography");
  useEffect(() => {
    setFilters((f) => ({
      ...f,
      category: (categoryParam as SpaceCategory) ?? "all",
      geography: (geoParam as Geography) ?? "all",
    }));
  }, [categoryParam, geoParam]);

  const matches = useMemo(() => scoreAll(listings, requirements), [listings, requirements]);

  const results = useMemo(() => {
    const filtered = listings.filter((l) => {
      const { space, property } = l;
      if (filters.area !== "all" && property.area !== filters.area) return false;
      if (filters.category !== "all" && space.category !== filters.category) return false;
      if (filters.geography !== "all" && property.geography !== filters.geography) return false;
      if (space.transaction === "rent" && space.cost.price > filters.priceMax) return false;
      if (filters.availableOnly && (space.availability.status === "occupied" || space.availability.status === "maintenance"))
        return false;
      if (filters.freshOnly && isStale(space.lastUpdated)) return false;
      if (filters.verifiedOnly && trustLevel(space.verification) !== "verified") return false;
      if (filters.fullCostOnly && space.cost.estimatedMonthly === null) return false;
      if (filters.amenities.some((a) => !space.amenities.includes(a))) return false;
      return true;
    });

    const score = (id: string) => matches.get(id)?.score ?? 0;

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "price-low":
          return a.space.cost.price - b.space.cost.price;
        case "price-high":
          return b.space.cost.price - a.space.cost.price;
        case "recent":
          return new Date(b.space.lastUpdated).getTime() - new Date(a.space.lastUpdated).getTime();
        case "size":
          return (b.space.attributes.sizeSqft ?? 0) - (a.space.attributes.sizeSqft ?? 0);
        default:
          return score(b.space.id) - score(a.space.id);
      }
    });
  }, [listings, filters, sort, matches]);

  const thin = results.length < 4;
  const nearby = useMemo(
    () => (thin && ready ? nearbyAlternatives(listings, requirements, results.map((r) => r.space.id)) : []),
    [thin, ready, listings, requirements, results],
  );

  const activeCount = countActive(filters);

  return (
    <>
      <PageHeader
        title={filters.category === "all" ? "Find a space" : CATEGORY_STYLE[filters.category].label}
        lead={
          hasStatedNeeds
            ? `Scored against your needs: ${requirements.area}, ${money(requirements.budgetMin)}–${money(requirements.budgetMax)}.`
            : "Browse everything on the platform, or tell us what you need and each space gets a score."
        }
        actions={
          <Link to="/find">
            <Button variant={hasStatedNeeds ? "secondary" : "primary"}>
              <Sparkles size={16} aria-hidden />
              {hasStatedNeeds ? "Change needs" : "Tell us what you need"}
            </Button>
          </Link>
        }
      />

      <div className="container-page py-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-card bg-surface p-5 ring-1 ring-hairline">
              <FilterPanel filters={filters} onChange={setFilters} />
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <p className="text-sm tnum text-muted">
                {ready ? `${results.length} ${results.length === 1 ? "space" : "spaces"}` : "Loading…"}
              </p>

              <div className="ml-auto flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-muted">
                  <span className="hidden sm:inline">Sort</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="h-10 rounded-full bg-surface px-3 text-sm text-ink ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600"
                  >
                    {SORTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>

                <Button variant="secondary" className="lg:hidden" onClick={() => setSheetOpen(true)}>
                  <SlidersHorizontal size={16} aria-hidden />
                  Filters
                  {activeCount > 0 && (
                    <span className="rounded-full bg-aqua-400 px-1.5 text-[0.65rem] font-bold tnum text-ink">
                      {activeCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {!ready ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <SpaceCardSkeleton key={i} />
                ))}
              </div>
            ) : results.length === 0 ? (
              <NothingYet onReset={() => setFilters(DEFAULTS)} />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((l) => (
                  <SpaceCard
                    key={l.space.id}
                    listing={l}
                    matchScore={hasStatedNeeds ? matches.get(l.space.id)?.score : undefined}
                    saved={isSaved(l.space.id)}
                    comparing={isComparing(l.space.id)}
                    onToggleSave={(id) => void toggleSaved(id)}
                    onToggleCompare={toggleCompare}
                  />
                ))}
              </div>
            )}

            {nearby.length > 0 && (
              <section className="mt-10 rounded-card bg-surface p-6 ring-1 ring-hairline">
                <h2 className="font-display text-xl font-bold text-ink">
                  {results.length === 0 ? "Nothing perfect yet." : "Also worth a look."}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  These sit just outside what you asked for. Here's how each one differs.
                </p>

                <ul className="mt-5 space-y-2.5">
                  {nearby.map(({ listing, score, reason }) => (
                    <li key={listing.space.id}>
                      <Link
                        to={`/space/${listing.space.id}`}
                        className="flex items-center gap-3.5 rounded-2xl p-2 transition-colors hover:bg-ivory"
                      >
                        <img
                          src={listing.space.images[0].url}
                          alt=""
                          className="size-16 shrink-0 rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-ink">
                            {listing.space.name}
                            <span className="ml-2 font-normal text-muted">{listing.property.area}</span>
                          </p>
                          <p className="mt-0.5 truncate text-sm text-ink-soft">{reason}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-bold tnum text-ink">{moneyCompact(listing.space.cost.price)}</p>
                          <p className="text-xs tnum text-aqua-700">{score}% match</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setFilters(DEFAULTS)}>
              Reset
            </Button>
            <Button fullWidth onClick={() => setSheetOpen(false)}>
              Show {results.length}
            </Button>
          </div>
        }
      >
        <FilterPanel filters={filters} onChange={setFilters} />
      </Modal>
    </>
  );
}

function NothingYet({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-card bg-surface px-6 py-14 text-center ring-1 ring-hairline">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-aqua-100 text-aqua-700">
        <Compass size={22} aria-hidden />
      </span>
      <h2 className="font-display text-xl font-bold text-ink">Nothing matches those filters.</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Widen the price, open it to more categories, or include areas further out.
      </p>
      <Button variant="secondary" className="mt-5" onClick={onReset}>
        Clear all filters
      </Button>
    </div>
  );
}

function countActive(f: Filters): number {
  let n = 0;
  if (f.area !== "all") n++;
  if (f.category !== "all") n++;
  if (f.geography !== "all") n++;
  if (f.priceMax !== PRICE_CEILING) n++;
  if (!f.availableOnly) n++;
  if (f.freshOnly) n++;
  if (f.verifiedOnly) n++;
  if (f.fullCostOnly) n++;
  return n + f.amenities.length;
}

function FilterPanel({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onChange({ ...filters, [k]: v });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-ink">Filters</h2>
        <button
          type="button"
          onClick={() => onChange(DEFAULTS)}
          className="text-xs font-semibold text-muted hover:text-ink"
        >
          Reset
        </button>
      </div>

      <Group label="Category">
        <div className="flex flex-wrap gap-1.5">
          <Pill active={filters.category === "all"} onClick={() => set("category", "all")}>
            All
          </Pill>
          {(Object.keys(CATEGORY_STYLE) as SpaceCategory[]).map((c) => (
            <Pill key={c} active={filters.category === c} onClick={() => set("category", c)}>
              {CATEGORY_STYLE[c].label}
            </Pill>
          ))}
        </div>
      </Group>

      <Group label="Area">
        <select
          aria-label="Area"
          value={filters.area}
          onChange={(e) => set("area", e.target.value)}
          className="h-10 w-full rounded-xl bg-ivory px-3 text-sm ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600"
        >
          <option value="all">Everywhere</option>
          {AREAS.map((a) => (
            <option key={a.id} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
      </Group>

      <Group label="Setting">
        <div className="flex flex-wrap gap-1.5">
          {(["all", "urban", "suburban", "rural"] as const).map((g) => (
            <Pill key={g} active={filters.geography === g} onClick={() => set("geography", g)}>
              {g === "all" ? "Anywhere" : g}
            </Pill>
          ))}
        </div>
      </Group>

      <Group label={`Rent up to ${money(filters.priceMax)}`}>
        <input
          type="range"
          aria-label="Maximum monthly price"
          min={2000}
          max={PRICE_CEILING}
          step={1000}
          value={filters.priceMax}
          onChange={(e) => set("priceMax", Number(e.target.value))}
          className="w-full accent-aqua-600"
        />
        <p className="mt-1 text-xs text-muted">Sale listings aren't filtered by this.</p>
      </Group>

      <Group label="Show only">
        <div className="space-y-2">
          <Check label="Available spaces" checked={filters.availableOnly} onChange={(v) => set("availableOnly", v)} />
          <Check label="Updated in the last 3 weeks" checked={filters.freshOnly} onChange={(v) => set("freshOnly", v)} />
          <Check label="Full cost disclosed" checked={filters.fullCostOnly} onChange={(v) => set("fullCostOnly", v)} />
          <Check label="Verified (demo)" checked={filters.verifiedOnly} onChange={(v) => set("verifiedOnly", v)} />
        </div>
      </Group>

      <Group label="Amenities">
        <div className="flex flex-wrap gap-1.5">
          {AMENITY_KEYS.slice(0, 14).map((key) => (
            <Pill
              key={key}
              active={filters.amenities.includes(key)}
              onClick={() =>
                set(
                  "amenities",
                  filters.amenities.includes(key)
                    ? filters.amenities.filter((a) => a !== key)
                    : [...filters.amenities, key],
                )
              }
            >
              {AMENITIES[key].label}
            </Pill>
          ))}
        </div>
      </Group>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink-soft">{label}</p>
      {children}
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-1.5 text-xs font-semibold capitalize transition-colors",
        active ? "bg-ink text-ivory" : "bg-ivory-deep text-ink-soft hover:bg-hairline",
      )}
    >
      {children}
    </button>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-aqua-600"
      />
      {label}
    </label>
  );
}
