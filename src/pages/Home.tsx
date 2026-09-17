import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, MapPin } from "lucide-react";
import { useHabito } from "@/hooks/useHabito";
import { Button } from "@/components/ui/Button";
import { SpaceCard } from "@/components/space/SpaceCard";
import { CATEGORY_STYLE } from "@/data/catalog";
import { AREAS } from "@/data/areas";
import { SPACE_TYPE_LABEL } from "@/types/space";
import type { SpaceCategory, SpaceListing, TransactionType } from "@/types/space";
import { moneyCompact, daysSince } from "@/lib/format";
import { cn } from "@/lib/cn";
import { SpaceCardSkeleton } from "@/components/ui/Skeleton";

const CATEGORIES = Object.keys(CATEGORY_STYLE) as SpaceCategory[];

export default function Home() {
  const { listings, ready, isSaved, toggleSaved, isComparing, toggleCompare, requirements, setRequirements } =
    useHabito();

  const fresh = useMemo(
    () =>
      [...listings]
        .filter((l) => l.space.availability.status !== "occupied")
        .sort((a, b) => daysSince(a.space.lastUpdated) - daysSince(b.space.lastUpdated)),
    [listings],
  );

  const budget = useMemo(
    () =>
      [...listings]
        .filter((l) => l.space.transaction === "rent" && l.space.category === "living")
        .sort((a, b) => a.space.cost.price - b.space.cost.price),
    [listings],
  );

  const commercial = useMemo(
    () => listings.filter((l) => l.space.category === "business" || l.space.category === "storage"),
    [listings],
  );

  const rural = useMemo(() => listings.filter((l) => l.property.geography === "rural"), [listings]);

  const rail = {
    ready,
    isSaved,
    isComparing,
    onToggleSave: (id: string) => void toggleSaved(id),
    onToggleCompare: (id: string) => toggleCompare(id),
  };

  return (
    <>
      <Hero requirements={requirements} setRequirements={setRequirements} />

      <CategoryStrip listings={listings} />

      <Rail
        title="New this week"
        lead="The most recently updated spaces across the platform."
        to="/search"
        items={fresh.slice(0, 8)}
        {...rail}
      />

      <BeyondTheCity listings={rural} />

      <Rail
        title="Room to work"
        lead="Shops, offices and storage for people running something."
        to="/search?category=business"
        items={commercial.slice(0, 8)}
        {...rail}
      />

      <Rail
        title="Easiest on a budget"
        lead="Living spaces at the lower end, cheapest first."
        to="/search?category=living"
        items={budget.slice(0, 8)}
        {...rail}
      />

      <HowItWorks />
    </>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────── */

function Hero({
  requirements,
  setRequirements,
}: {
  requirements: ReturnType<typeof useHabito>["requirements"];
  setRequirements: ReturnType<typeof useHabito>["setRequirements"];
}) {
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<TransactionType>(requirements.transaction);
  const [category, setCategory] = useState<SpaceCategory | "any">(requirements.category);
  const [area, setArea] = useState(requirements.area);
  const [budgetMax, setBudgetMax] = useState(String(requirements.budgetMax));

  const submit = () => {
    setRequirements({
      ...requirements,
      transaction,
      category,
      spaceType: "any",
      area,
      budgetMax: Number(budgetMax) || requirements.budgetMax,
    });
    navigate("/search");
  };

  return (
    <section className="relative overflow-hidden border-b border-hairline">
      <div className="atmosphere absolute inset-0" aria-hidden />

      <div className="container-page relative grid gap-12 py-14 md:py-20 lg:grid-cols-[1.05fr_26rem] lg:items-center lg:gap-16">
        <div className="rise">
          <p className="inline-flex items-center gap-2 rounded-full bg-surface/80 px-3 py-1.5 text-xs font-semibold text-ink-soft ring-1 ring-hairline backdrop-blur">
            <span className="size-1.5 rounded-full bg-coral" aria-hidden />
            Homes · Shops · Offices · Storage · Parking · Land
          </p>

          <h1 className="mt-5 font-display text-[2.75rem] font-extrabold leading-[0.98] text-ink sm:text-6xl lg:text-[4.25rem]">
            Find the space
            <br />
            that fits.
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">
            Not only flats. Habito makes every kind of usable space discoverable — and helps owners
            put the ones sitting empty to work.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/find">
              <Button size="lg">
                Find a space
                <ArrowRight size={17} aria-hidden />
              </Button>
            </Link>
            <Link to="/list">
              <Button size="lg" variant="secondary">
                List your space
              </Button>
            </Link>
          </div>
        </div>

        {/* The search is part of the product, not a bar dropped on a banner. */}
        <div className="rise rounded-card bg-surface/95 p-5 shadow-[0_30px_70px_-40px_rgb(16_24_40/0.55)] ring-1 ring-hairline backdrop-blur sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink">What are you looking for?</h2>

          <div className="mt-4 inline-flex rounded-full bg-ivory-deep p-0.5">
            {(["rent", "sale"] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={transaction === t}
                onClick={() => setTransaction(t)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-bold transition-colors",
                  transaction === t ? "bg-ink text-ivory" : "text-muted hover:text-ink",
                )}
              >
                {t === "rent" ? "Rent" : "Buy"}
              </button>
            ))}
          </div>

          <ul className="mt-4 flex flex-wrap gap-1.5">
            <li>
              <CategoryChip active={category === "any"} onClick={() => setCategory("any")}>
                Anything
              </CategoryChip>
            </li>
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_STYLE[c].icon;
              return (
                <li key={c}>
                  <CategoryChip active={category === c} onClick={() => setCategory(c)}>
                    <Icon size={13} aria-hidden />
                    {CATEGORY_STYLE[c].label}
                  </CategoryChip>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-soft">Where</span>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="h-11 w-full rounded-xl bg-ivory px-3 text-[0.9375rem] text-ink ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600"
              >
                {AREAS.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-soft">Up to</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">৳</span>
                <input
                  type="number"
                  inputMode="numeric"
                  step={500}
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className="h-11 w-full rounded-xl bg-ivory pl-7 pr-3 text-[0.9375rem] tnum text-ink ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600"
                />
              </div>
            </label>
          </div>

          <Button size="lg" fullWidth className="mt-4" onClick={submit}>
            <Search size={17} aria-hidden />
            Explore spaces
          </Button>

          <p className="mt-3 text-center text-xs text-muted">
            Want scored matches?{" "}
            <Link to="/find" className="font-semibold text-aqua-700 hover:underline">
              Tell us what you need
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-all duration-150",
        active ? "bg-ink text-ivory" : "bg-ivory-deep text-ink-soft hover:bg-hairline",
      )}
    >
      {children}
    </button>
  );
}

/* ── Category strip ───────────────────────────────────────────────── */

function CategoryStrip({ listings }: { listings: SpaceListing[] }) {
  return (
    <section aria-labelledby="cats" className="container-page py-14 md:py-16">
      <h2 id="cats" className="font-display text-2xl font-bold text-ink sm:text-3xl">
        Every kind of space
      </h2>
      <p className="mt-2 max-w-lg text-sm text-muted">
        One platform for the places people live, work, store, park and farm.
      </p>

      <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {CATEGORIES.map((c) => {
          const style = CATEGORY_STYLE[c];
          const inCategory = listings.filter((l) => l.space.category === c);
          const rentals = inCategory.filter((l) => l.space.transaction === "rent");
          const from = rentals.length ? Math.min(...rentals.map((l) => l.space.cost.price)) : null;

          return (
            <li key={c}>
              <Link
                to={`/search?category=${c}`}
                className="flex h-full flex-col gap-3 rounded-card bg-surface p-5 ring-1 ring-hairline transition-all duration-200 hover:-translate-y-0.5 hover:ring-ink"
              >
                <span className={cn("flex size-10 items-center justify-center rounded-xl", style.chip)}>
                  <style.icon size={19} aria-hidden />
                </span>
                <span className="font-display font-bold text-ink">{style.label}</span>
                <span className="text-xs leading-snug text-muted">{style.blurb}</span>
                <span className="mt-auto pt-2 text-sm font-semibold tnum text-ink">
                  {inCategory.length} spaces
                  {from !== null && <span className="font-medium text-muted"> · from {moneyCompact(from)}</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ── Horizontal rail ──────────────────────────────────────────────── */

function Rail({
  title,
  lead,
  to,
  items,
  ready,
  isSaved,
  isComparing,
  onToggleSave,
  onToggleCompare,
}: {
  title: string;
  lead: string;
  to: string;
  items: SpaceListing[];
  ready: boolean;
  isSaved: (id: string) => boolean;
  isComparing: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  onToggleCompare: (id: string) => void;
}) {
  if (ready && items.length === 0) return null;

  return (
    <section className="py-6 md:py-8">
      <div className="container-page flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
          <p className="mt-1.5 text-sm text-muted">{lead}</p>
        </div>
        <Link to={to} className="inline-flex items-center gap-1.5 text-sm font-semibold text-aqua-700 hover:text-ink">
          See all
          <ArrowRight size={15} aria-hidden />
        </Link>
      </div>

      <div className="mt-6 flex gap-4 overflow-x-auto px-5 pb-2 hide-scrollbar md:px-8">
        {!ready
          ? Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="w-68 shrink-0 sm:w-76">
                <SpaceCardSkeleton />
              </div>
            ))
          : items.map((l) => (
              <div key={l.space.id} className="w-68 shrink-0 sm:w-76">
                <SpaceCard
                  listing={l}
                  saved={isSaved(l.space.id)}
                  comparing={isComparing(l.space.id)}
                  onToggleSave={onToggleSave}
                  onToggleCompare={onToggleCompare}
                />
              </div>
            ))}
      </div>
    </section>
  );
}

/* ── Beyond the city ──────────────────────────────────────────────── */

function BeyondTheCity({ listings }: { listings: SpaceListing[] }) {
  if (listings.length === 0) return null;
  const featured = listings.slice(0, 3);

  return (
    <section aria-labelledby="rural" className="my-10 md:my-14">
      <div className="container-page">
        <div className="overflow-hidden rounded-card bg-ink text-ivory">
          <div className="grid gap-8 p-7 md:grid-cols-[1fr_1.15fr] md:items-center md:p-10">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                <MapPin size={12} aria-hidden />
                Outside the city
              </p>
              <h2 id="rural" className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
                There's more to property than city apartments.
              </h2>
              <p className="mt-4 max-w-sm leading-relaxed text-ivory/70">
                Tin-shed homes, homesteads, farmland and ponds — the spaces mainstream property
                sites in Bangladesh barely list at all.
              </p>
              <Link to="/search?geography=rural" className="mt-6 inline-block">
                <Button size="lg" className="bg-aqua-400 text-ink hover:bg-aqua-200">
                  Explore beyond the city
                  <ArrowRight size={16} aria-hidden />
                </Button>
              </Link>
            </div>

            <ul className="grid gap-3 sm:grid-cols-3">
              {featured.map((l) => (
                <li key={l.space.id}>
                  <Link
                    to={`/space/${l.space.id}`}
                    className="group block overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 transition-colors hover:bg-white/10"
                  >
                    <div className="aspect-4/3 overflow-hidden">
                      <img
                        src={l.space.images[0].url}
                        alt={l.space.images[0].alt}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-semibold">{SPACE_TYPE_LABEL[l.space.spaceType]}</p>
                      <p className="truncate text-xs text-ivory/60">{l.property.area}</p>
                      <p className="mt-1 text-sm font-bold tnum">
                        {moneyCompact(l.space.cost.price)}
                        {l.space.transaction === "rent" && (
                          <span className="text-xs font-medium text-ivory/60">/mo</span>
                        )}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── How it works ─────────────────────────────────────────────────── */

const SEEKER_STEPS = [
  { title: "Tell us what you need", body: "Category, area, budget and when you need it." },
  { title: "See scored matches", body: "Every listing carries a score and the reasons behind it." },
  { title: "Compare what's close", body: "Up to four spaces side by side, differences highlighted." },
  { title: "Send one clear inquiry", body: "The owner gets your budget and date up front." },
];

const OWNER_STEPS = [
  { title: "Add your property", body: "The building, house or plot you hold." },
  { title: "Add the spaces in it", body: "Flats, a shop, a godown, the garage — all under one roof." },
  { title: "Keep availability true", body: "Confirm what's still free so stale listings drop away." },
  { title: "Receive matched inquiries", body: "From people whose budget and timing already fit." },
];

function HowItWorks() {
  return (
    <section aria-labelledby="how" className="border-t border-hairline bg-ivory-deep">
      <div className="container-page py-14 md:py-20">
        <h2 id="how" className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Two sides, one platform
        </h2>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {[
            { heading: "If you're looking", steps: SEEKER_STEPS, accent: "bg-aqua-400" },
            { heading: "If you own", steps: OWNER_STEPS, accent: "bg-coral" },
          ].map((col) => (
            <div key={col.heading} className="rounded-card bg-surface p-6 ring-1 ring-hairline">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                <span className={cn("size-2 rounded-full", col.accent)} aria-hidden />
                {col.heading}
              </h3>
              <ol className="mt-5 space-y-4">
                {col.steps.map((s, i) => (
                  <li key={s.title} className="flex gap-3.5">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ivory-deep text-xs font-bold tnum text-ink">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{s.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <p className="mt-6 rounded-card bg-surface/70 p-5 text-sm leading-relaxed text-ink-soft ring-1 ring-hairline-strong">
          <strong className="font-semibold text-ink">About verification.</strong> Habito does not
          yet perform real identity or ownership checks. Trust states in this build demonstrate the
          intended workflow over synthetic data and are labelled as demo throughout. Match scores
          are arithmetic over your stated requirements — no machine learning is involved.
        </p>
      </div>
    </section>
  );
}
