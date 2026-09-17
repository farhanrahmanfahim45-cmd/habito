import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useHabito } from "@/hooks/useHabito";
import { PageHeader } from "@/components/layout/PageHeader";
import { SpaceCard } from "@/components/space/SpaceCard";
import { SpaceCardSkeleton } from "@/components/ui/Skeleton";
import { AREAS } from "@/data/areas";
import { scoreAll } from "@/lib/matching";
import { daysSince } from "@/lib/format";
import type { SpaceListing } from "@/types/space";

/** Discovery rather than a results grid: each rail answers a different question. */
export default function Explore() {
  const { listings, ready, requirements, hasStatedNeeds, isSaved, toggleSaved, isComparing, toggleCompare } =
    useHabito();

  const matches = useMemo(() => scoreAll(listings, requirements), [listings, requirements]);

  const nearYou = useMemo(
    () => listings.filter((l) => l.property.area === requirements.area),
    [listings, requirements.area],
  );

  const topMatches = useMemo(
    () => [...listings].sort((a, b) => (matches.get(b.space.id)?.score ?? 0) - (matches.get(a.space.id)?.score ?? 0)).slice(0, 8),
    [listings, matches],
  );

  const newest = useMemo(
    () => [...listings].sort((a, b) => daysSince(a.space.lastUpdated) - daysSince(b.space.lastUpdated)).slice(0, 8),
    [listings],
  );

  const parking = useMemo(
    () => listings.filter((l) => l.space.category === "parking" || l.space.category === "storage"),
    [listings],
  );

  const forSale = useMemo(() => listings.filter((l) => l.space.transaction === "sale"), [listings]);

  const handlers = {
    isSaved,
    isComparing,
    onToggleSave: (id: string) => void toggleSaved(id),
    onToggleCompare: toggleCompare,
    matches: hasStatedNeeds ? matches : undefined,
    ready,
  };

  return (
    <>
      <PageHeader
        title="Explore"
        lead="Wander through what's on the platform — by area, by category, by what's just been added."
      />

      <div className="py-6">
        <AreaStrip listings={listings} />

        {hasStatedNeeds && (
          <Rail title="Closest to what you asked for" lead="Ranked by your stated needs." to="/search" items={topMatches} {...handlers} />
        )}

        <Rail
          title={`Around ${requirements.area}`}
          lead="Spaces in the area you last searched."
          to={`/search?area=${encodeURIComponent(requirements.area)}`}
          items={nearYou.slice(0, 8)}
          {...handlers}
        />

        <Rail title="Just added" lead="The freshest listings on Habito." to="/search" items={newest} {...handlers} />

        <Rail
          title="Park it or store it"
          lead="Garages, slots and godowns — the spaces nobody else lists properly."
          to="/search?category=parking"
          items={parking.slice(0, 8)}
          {...handlers}
        />

        {forSale.length > 0 && (
          <Rail title="For sale" lead="Homes, shops and land on the market." to="/search" items={forSale.slice(0, 8)} {...handlers} />
        )}
      </div>
    </>
  );
}

function AreaStrip({ listings }: { listings: SpaceListing[] }) {
  const counts = AREAS.map((a) => ({
    area: a,
    count: listings.filter((l) => l.property.area === a.name).length,
  }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <section className="container-page pb-4">
      <h2 className="font-display text-xl font-bold text-ink">Where people are looking</h2>
      <ul className="mt-4 flex gap-2.5 overflow-x-auto pb-2 hide-scrollbar">
        {counts.map(({ area, count }) => (
          <li key={area.id} className="shrink-0">
            <Link
              to={`/search?area=${encodeURIComponent(area.name)}`}
              className="flex min-w-40 flex-col gap-1 rounded-2xl bg-surface p-4 ring-1 ring-hairline transition-all hover:-translate-y-0.5 hover:ring-ink"
            >
              <span className="font-semibold text-ink">{area.name}</span>
              <span className="text-xs capitalize text-muted">{area.geography}</span>
              <span className="mt-1 text-sm font-semibold tnum text-aqua-700">{count} spaces</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Rail({
  title,
  lead,
  to,
  items,
  ready,
  matches,
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
  matches?: Map<string, { score: number }>;
  isSaved: (id: string) => boolean;
  isComparing: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  onToggleCompare: (id: string) => void;
}) {
  if (ready && items.length === 0) return null;

  return (
    <section className="py-6">
      <div className="container-page flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-muted">{lead}</p>
        </div>
        <Link to={to} className="inline-flex items-center gap-1.5 text-sm font-semibold text-aqua-700 hover:text-ink">
          See all
          <ArrowRight size={15} aria-hidden />
        </Link>
      </div>

      <div className="mt-5 flex gap-4 overflow-x-auto px-5 pb-2 hide-scrollbar md:px-8">
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
                  matchScore={matches?.get(l.space.id)?.score}
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
