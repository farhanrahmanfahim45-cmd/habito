import { Link } from "react-router-dom";
import { Bookmark, Scale } from "lucide-react";
import type { SpaceListing } from "@/types/space";
import { SPACE_TYPE_LABEL } from "@/types/space";
import { money, moneyCompact, lastUpdatedShort, isStale } from "@/lib/format";
import { CATEGORY_STYLE } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { MatchPill } from "./MatchRing";
import { TrustBadge, AvailabilityBadge } from "./badges";

/**
 * The key specification line changes per category. A garage has no bedrooms
 * and a pond has no bathrooms, so nothing renders a blank or a dash.
 */
export function keySpec(listing: SpaceListing): string {
  const { attributes: a, category, availability } = listing.space;

  switch (category) {
    case "living": {
      const parts: string[] = [];
      if (a.bedrooms) parts.push(`${a.bedrooms} bed`);
      if (a.bathrooms) parts.push(`${a.bathrooms} bath`);
      if (a.sizeSqft) parts.push(`${a.sizeSqft} sqft`);
      return parts.join(" · ");
    }
    case "business": {
      const parts: string[] = [];
      if (a.sizeSqft) parts.push(`${a.sizeSqft} sqft`);
      if (a.frontageFt) parts.push(`${a.frontageFt} ft frontage`);
      if (a.workstations) parts.push(`${a.workstations} desks`);
      return parts.join(" · ");
    }
    case "storage": {
      const parts: string[] = [];
      if (a.sizeSqft) parts.push(`${a.sizeSqft} sqft`);
      if (a.ceilingHeightFt) parts.push(`${a.ceilingHeightFt} ft ceiling`);
      if (a.loadingAccess) parts.push("loading access");
      return parts.join(" · ");
    }
    case "parking": {
      if (availability.note) return availability.note;
      const parts: string[] = [];
      if (a.carSlots) parts.push(`${a.carSlots} car`);
      if (a.motorcycleSlots) parts.push(`${a.motorcycleSlots} motorcycle`);
      parts.push(a.covered ? "covered" : "open");
      return parts.join(" · ");
    }
    case "land": {
      const parts: string[] = [];
      if (a.landAreaDecimal) parts.push(`${a.landAreaDecimal} decimal`);
      if (a.landUse) parts.push(a.landUse.toLowerCase());
      if (a.roadAccess) parts.push("road access");
      return parts.join(" · ");
    }
  }
}

export function SpaceCard({
  listing,
  matchScore,
  saved = false,
  comparing = false,
  onToggleSave,
  onToggleCompare,
  size = "default",
}: {
  listing: SpaceListing;
  matchScore?: number;
  saved?: boolean;
  comparing?: boolean;
  onToggleSave?: (id: string) => void;
  onToggleCompare?: (id: string) => void;
  size?: "default" | "large" | "compact";
}) {
  const { space, property } = listing;
  const cat = CATEGORY_STYLE[space.category];
  const cover = space.images[0];
  const occupied = space.availability.status === "occupied";
  const isSale = space.transaction === "sale";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card bg-surface",
        "ring-1 ring-hairline transition duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgb(16_24_40/0.5)] hover:ring-hairline-strong",
        "focus-within:ring-2 focus-within:ring-aqua-600",
        occupied && "opacity-75",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-ivory-deep",
          size === "large" ? "aspect-16/10" : size === "compact" ? "aspect-3/2" : "aspect-4/3",
        )}
      >
        <img
          src={cover.url}
          alt={cover.alt}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 img-scrim" aria-hidden />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {matchScore !== undefined ? (
            <MatchPill score={matchScore} />
          ) : (
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", cat.chip)}>{cat.label}</span>
          )}

          <div className="flex gap-1.5">
            {onToggleCompare && (
              <button
                type="button"
                aria-label={comparing ? `Remove ${space.name} from compare` : `Add ${space.name} to compare`}
                aria-pressed={comparing}
                onClick={() => onToggleCompare(space.id)}
                className={cn(
                  "rounded-full p-2 backdrop-blur-sm transition-colors",
                  comparing ? "bg-aqua-600 text-white" : "bg-surface/90 text-ink-soft hover:bg-surface",
                )}
              >
                <Scale size={15} aria-hidden />
              </button>
            )}
            {onToggleSave && (
              <button
                type="button"
                aria-label={saved ? `Remove ${space.name} from saved` : `Save ${space.name}`}
                aria-pressed={saved}
                onClick={() => onToggleSave(space.id)}
                className="rounded-full bg-surface/90 p-2 text-ink-soft backdrop-blur-sm transition-colors hover:bg-surface hover:text-aqua-700"
              >
                <Bookmark size={15} className={cn(saved && "fill-aqua-600 text-aqua-600")} aria-hidden />
              </button>
            )}
          </div>
        </div>

        <div className="absolute inset-x-3.5 bottom-3">
          <p className="font-display text-xl font-bold leading-none text-white tnum">
            {isSale ? money(space.cost.price) : moneyCompact(space.cost.price)}
            <span className="ml-1 text-sm font-medium text-white/75">{isSale ? "" : "/month"}</span>
          </p>
          <h3 className="mt-1 truncate font-semibold text-white">
            <Link to={`/space/${space.id}`} className="after:absolute after:inset-0 focus:outline-none">
              {space.name}
            </Link>
          </h3>
          <p className="truncate text-sm text-white/75">
            {property.neighborhood}, {property.area}
          </p>
        </div>

        <span className="pointer-events-none absolute bottom-3 right-3.5 rounded bg-ink/55 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-white/90">
          Demo
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cn("rounded px-1.5 py-0.5 text-xs font-semibold", cat.chip)}>
            {SPACE_TYPE_LABEL[space.spaceType]}
          </span>
          {isSale && <span className="rounded bg-ink px-1.5 py-0.5 text-xs font-semibold text-ivory">For sale</span>}
          <AvailabilityBadge availability={space.availability} />
        </div>

        <p className="text-sm text-ink-soft">{keySpec(listing)}</p>

        {space.transaction === "rent" &&
          (space.cost.estimatedMonthly ? (
            <p className="text-[0.8125rem] text-muted tnum">
              About {money(space.cost.estimatedMonthly)} a month all in
            </p>
          ) : (
            <p className="text-[0.8125rem] font-medium text-warn-700">Full cost not listed</p>
          ))}

        <div className="mt-auto flex items-center gap-2 border-t border-hairline pt-2.5">
          <TrustBadge verification={space.verification} compact />
          <span
            className={cn(
              "ml-auto text-xs",
              isStale(space.lastUpdated) ? "font-medium text-warn-700" : "text-muted",
            )}
          >
            {lastUpdatedShort(space.lastUpdated)}
          </span>
        </div>
      </div>
    </article>
  );
}
