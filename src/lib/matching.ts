import type {
  MatchFactor,
  MatchResult,
  SearchRequirements,
  SpaceListing,
} from "@/types/space";
import { SPACE_TYPE_LABEL, CATEGORY_OF_TYPE } from "@/types/space";
import type { SpaceCategory } from "@/types/space";
import { AMENITIES } from "@/data/catalog";
import { AREAS, haversineKm } from "@/data/areas";
import { money, longDate } from "./format";

/**
 * Habito Match — transparent and rule-based.
 *
 * Arithmetic over stated requirements, not a learned model, and never
 * described as AI. Each factor returns the sentence a person needs to
 * understand the number, so the UI never shows a score without its reasons.
 */
export interface Weights {
  budget: number;
  location: number;
  spaceType: number;
  availability: number;
  capacity: number;
  amenities: number;
}

/**
 * What matters depends on what you are looking for.
 *
 * A single weight set across every category was always a compromise: it scored
 * a garage on floor area it does not have, and gave a shop's location the same
 * importance as a godown's, when for a shop location is close to the whole
 * decision. These profiles each total 100.
 */
export const WEIGHT_PROFILES: Record<SpaceCategory, Weights> = {
  // Home: budget dominates, and the extras people list as essential matter.
  living: { budget: 30, location: 24, spaceType: 18, availability: 12, capacity: 6, amenities: 10 },

  // Shop or office: footfall is the business, so location outweighs price.
  business: { budget: 24, location: 30, spaceType: 16, availability: 10, capacity: 12, amenities: 8 },

  // Godown: capacity is the point of renting one. Access and power matter more
  // than being central.
  storage: { budget: 26, location: 18, spaceType: 14, availability: 10, capacity: 20, amenities: 12 },

  // Parking: entirely about being near where you leave the car, and whether a
  // slot is actually free. Floor area is meaningless.
  parking: { budget: 22, location: 34, spaceType: 12, availability: 20, capacity: 0, amenities: 12 },

  // Land: plot size and road access decide it; nobody rents farmland for the
  // month it becomes free.
  land: { budget: 28, location: 18, spaceType: 16, availability: 8, capacity: 22, amenities: 8 },
};

/** Weights for whatever the listing actually is. */
export function weightsFor(category: SpaceCategory): Weights {
  return WEIGHT_PROFILES[category];
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function distanceFromArea(listing: SpaceListing, areaName: string): number | null {
  const area = AREAS.find((a) => a.name === areaName);
  if (!area) return null;
  return haversineKm(area.latitude, area.longitude, listing.property.latitude, listing.property.longitude);
}

function budgetFactor(l: SpaceListing, r: SearchRequirements, w: Weights): MatchFactor {
  const base = { key: "budget" as const, label: "Budget", weight: w.budget };
  const { cost } = l.space;

  // Judge on what someone actually pays each month where that's known —
  // rent alone is the figure that misleads people.
  const usingTotal = cost.estimatedMonthly !== null && l.space.transaction === "rent";
  const amount = usingTotal ? cost.estimatedMonthly! : cost.price;

  if (amount >= r.budgetMin && amount <= r.budgetMax) {
    return {
      ...base,
      score: 1,
      verdict: "met",
      detail: usingTotal
        ? `${money(amount)} a month all in, inside your range`
        : `${money(amount)} sits inside your range`,
    };
  }

  if (amount < r.budgetMin) {
    const gap = (r.budgetMin - amount) / Math.max(r.budgetMin, 1);
    return { ...base, score: clamp01(1 - gap * 0.3), verdict: "met", detail: `${money(amount)} — below the range you set` };
  }

  const overshoot = (amount - r.budgetMax) / Math.max(r.budgetMax, 1);
  return {
    ...base,
    score: clamp01(1 - overshoot * 2.2),
    verdict: overshoot <= 0.12 ? "partial" : "missed",
    detail: `${money(amount - r.budgetMax)} over your maximum${usingTotal ? " once charges are counted" : ""}`,
  };
}

function locationFactor(l: SpaceListing, r: SearchRequirements, w: Weights): MatchFactor {
  const base = { key: "location" as const, label: "Location", weight: w.location };

  if (l.property.area === r.area) {
    return { ...base, score: 1, verdict: "met", detail: `In ${l.property.neighborhood}, the area you chose` };
  }

  const km = distanceFromArea(l, r.area);
  if (km === null) {
    return { ...base, score: 0.5, verdict: "partial", detail: `In ${l.property.area}` };
  }

  return {
    ...base,
    score: clamp01(1 - km / 14),
    verdict: km <= 4 ? "partial" : "missed",
    detail: `${km.toFixed(1)} km from ${r.area}, in ${l.property.area}`,
  };
}

const NEIGHBOURING: Partial<Record<string, string[]>> = {
  room: ["shared-room", "sublet"],
  "shared-room": ["room", "sublet"],
  sublet: ["room", "shared-room", "apartment"],
  apartment: ["sublet", "house"],
  house: ["apartment", "tin-shed", "homestead"],
  "tin-shed": ["house", "homestead"],
  shop: ["office"],
  office: ["shop"],
  godown: ["shop"],
  garage: ["parking-slot"],
  "parking-slot": ["garage"],
  farmland: ["pond", "homestead"],
};

function typeFactor(l: SpaceListing, r: SearchRequirements, w: Weights): MatchFactor {
  const base = { key: "spaceType" as const, label: "Space type", weight: w.spaceType };
  const type = l.space.spaceType;

  if (r.spaceType !== "any") {
    if (type === r.spaceType) {
      return { ...base, score: 1, verdict: "met", detail: "Exactly the kind of space you asked for" };
    }
    if (NEIGHBOURING[r.spaceType]?.includes(type)) {
      return {
        ...base,
        score: 0.55,
        verdict: "partial",
        detail: `A ${SPACE_TYPE_LABEL[type].toLowerCase()} rather than a ${SPACE_TYPE_LABEL[r.spaceType].toLowerCase()}`,
      };
    }
    return { ...base, score: 0, verdict: "missed", detail: `A ${SPACE_TYPE_LABEL[type].toLowerCase()}, not what you asked for` };
  }

  if (r.category !== "any") {
    const inCategory = CATEGORY_OF_TYPE[type] === r.category;
    return {
      ...base,
      score: inCategory ? 0.95 : 0,
      verdict: inCategory ? "met" : "missed",
      detail: inCategory ? `A ${SPACE_TYPE_LABEL[type].toLowerCase()} in the category you chose` : `Outside the category you chose`,
    };
  }

  return { ...base, score: 0.9, verdict: "met", detail: "You're open to any kind of space" };
}

function availabilityFactor(l: SpaceListing, r: SearchRequirements, w: Weights): MatchFactor {
  const base = { key: "availability" as const, label: "Availability", weight: w.availability };
  const { status, availableFrom, note } = l.space.availability;

  if (status === "occupied") return { ...base, score: 0, verdict: "missed", detail: "Currently occupied" };
  if (status === "maintenance") return { ...base, score: 0.15, verdict: "missed", detail: "Under maintenance" };

  const daysLate = Math.round((new Date(availableFrom).getTime() - new Date(r.moveInDate).getTime()) / 86400000);

  if (daysLate <= 0) {
    // For parking, "how many are free" is the whole question, so the note
    // about free slots is the answer rather than a footnote.
    if (l.space.category === "parking") {
      const wanted = (r.capacity.carSlots ?? 0) + (r.capacity.motorcycleSlots ?? 0);
      const free = l.space.availability.availableUnits ?? 1;

      if (wanted > 0 && free < wanted) {
        return {
          ...base,
          score: clamp01(free / wanted),
          verdict: free > 0 ? "partial" : "missed",
          detail: note ? note : `${free} free, you need ${wanted}`,
        };
      }
      return { ...base, score: 1, verdict: "met", detail: note ?? "Free now" };
    }

    return {
      ...base,
      score: status === "partially-available" ? 0.8 : 1,
      verdict: status === "partially-available" ? "partial" : "met",
      detail: status === "partially-available" && note ? `Partly free — ${note}` : `Free from ${longDate(availableFrom)}, before you need it`,
    };
  }

  return {
    ...base,
    score: clamp01(1 - daysLate / 45),
    verdict: daysLate <= 14 ? "partial" : "missed",
    detail: `Free from ${longDate(availableFrom)}, ${daysLate} day${daysLate > 1 ? "s" : ""} after you wanted it`,
  };
}

/**
 * Whether the space is big enough — measured in whatever unit the category
 * actually uses. Square feet for a flat, slots for a garage, decimals for land.
 */
function capacityFactor(l: SpaceListing, r: SearchRequirements, w: Weights): MatchFactor {
  const base = { key: "size" as const, label: capacityLabel(l.space.category), weight: w.capacity };
  const a = l.space.attributes;
  const need = r.capacity;

  // Parking is scored on availability instead, so capacity carries no weight.
  if (w.capacity === 0) {
    return { ...base, score: 1, verdict: "met", detail: "Not scored for this kind of space" };
  }

  const shortfall = (have: number | undefined, want: number, unit: string, tolerance = 0.85) => {
    if (have === undefined) {
      return { ...base, score: 0.6, verdict: "partial" as const, detail: `Not stated by the owner` };
    }
    if (have >= want) {
      return { ...base, score: 1, verdict: "met" as const, detail: `${have} ${unit}, at or above what you need` };
    }
    return {
      ...base,
      score: clamp01(have / want),
      verdict: have >= want * tolerance ? ("partial" as const) : ("missed" as const),
      detail: `${have} ${unit}, short of the ${want} you wanted`,
    };
  };

  switch (l.space.category) {
    case "living": {
      if (need.minBedrooms) return shortfall(a.bedrooms, need.minBedrooms, "bedrooms");
      if (need.minSizeSqft) return shortfall(a.sizeSqft, need.minSizeSqft, "sqft");
      break;
    }
    case "business": {
      if (need.minWorkstations) return shortfall(a.workstations, need.minWorkstations, "workstations");
      if (need.minSizeSqft) return shortfall(a.sizeSqft, need.minSizeSqft, "sqft");
      break;
    }
    case "storage": {
      if (need.minSizeSqft) {
        const area = shortfall(a.sizeSqft, need.minSizeSqft, "sqft");
        // Headroom decides how much you can actually stack into that floor.
        if (need.minCeilingFt && a.ceilingHeightFt !== undefined && a.ceilingHeightFt < need.minCeilingFt) {
          return {
            ...area,
            score: area.score * 0.7,
            verdict: "partial",
            detail: `${a.sizeSqft ?? "?"} sqft but only ${a.ceilingHeightFt} ft of headroom`,
          };
        }
        return area;
      }
      break;
    }
    case "land": {
      if (need.minLandDecimal) return shortfall(a.landAreaDecimal, need.minLandDecimal, "decimal");
      break;
    }
    case "parking":
      break;
  }

  return { ...base, score: 0.9, verdict: "met", detail: "You didn't set a minimum" };
}

function capacityLabel(category: SpaceCategory): string {
  switch (category) {
    case "living": return "Size";
    case "business": return "Space";
    case "storage": return "Capacity";
    case "parking": return "Slots";
    case "land": return "Plot size";
  }
}


function amenitiesFactor(l: SpaceListing, r: SearchRequirements, w: Weights): MatchFactor {
  const base = { key: "amenities" as const, label: "Amenities", weight: w.amenities };

  if (r.amenities.length === 0) {
    return { ...base, score: 0.9, verdict: "met", detail: "You didn't name anything essential" };
  }

  const missing = r.amenities.filter((a) => !l.space.amenities.includes(a));
  if (missing.length === 0) {
    return { ...base, score: 1, verdict: "met", detail: "Has everything you asked for" };
  }

  const score = (r.amenities.length - missing.length) / r.amenities.length;
  return {
    ...base,
    score,
    verdict: score >= 0.5 ? "partial" : "missed",
    detail: `No ${missing.map((m) => AMENITIES[m].label.toLowerCase()).join(", ")}`,
  };
}

export function scoreListing(l: SpaceListing, r: SearchRequirements): MatchResult {
  // Weights come from what the listing is, not from what the searcher asked
  // for, so a garage is never judged on floor area it does not have.
  const w = weightsFor(l.space.category);

  const factors = [
    budgetFactor(l, r, w),
    locationFactor(l, r, w),
    typeFactor(l, r, w),
    availabilityFactor(l, r, w),
    capacityFactor(l, r, w),
    amenitiesFactor(l, r, w),
  ].filter((f) => f.weight > 0);

  const weighted = factors.reduce((s, f) => s + f.score * f.weight, 0);
  const total = factors.reduce((s, f) => s + f.weight, 0);
  const pct = (weighted / total) * 100;

  // Only a genuinely perfect fit reads 100. Rounding 99.6 up while a factor is
  // still flagged partial would contradict the reasons shown beside it.
  const score = pct >= 99.995 ? 100 : Math.min(99, Math.round(pct));

  return { spaceId: l.space.id, score, factors };
}

export function scoreAll(listings: SpaceListing[], r: SearchRequirements): Map<string, MatchResult> {
  const map = new Map<string, MatchResult>();
  for (const l of listings) map.set(l.space.id, scoreListing(l, r));
  return map;
}

export function matchLabel(score: number): string {
  if (score >= 90) return "Excellent match";
  if (score >= 78) return "Strong match";
  if (score >= 62) return "Worth a look";
  return "Loose match";
}

/**
 * When the exact search comes up short, suggest what's actually near it and
 * say why — rather than a bare "no results".
 */
export interface NearbySuggestion {
  listing: SpaceListing;
  score: number;
  distanceKm: number | null;
  reason: string;
}

export function nearbyAlternatives(
  listings: SpaceListing[],
  r: SearchRequirements,
  excludeIds: string[],
  limit = 6,
): NearbySuggestion[] {
  return listings
    .filter((l) => !excludeIds.includes(l.space.id) && l.space.availability.status !== "occupied")
    .map((l) => {
      const match = scoreListing(l, r);
      const km = distanceFromArea(l, r.area);
      const amount = l.space.cost.estimatedMonthly ?? l.space.cost.price;

      let reason: string;
      if (l.property.area !== r.area && km !== null && km <= 6) {
        reason = `${km.toFixed(1)} km from ${r.area}, in ${l.property.area}`;
      } else if (amount < r.budgetMin) {
        reason = `Cheaper than your range at ${money(amount)}`;
      } else if (r.spaceType !== "any" && l.space.spaceType !== r.spaceType) {
        reason = `A ${SPACE_TYPE_LABEL[l.space.spaceType].toLowerCase()} instead`;
      } else if (amount > r.budgetMax) {
        reason = `${money(amount - r.budgetMax)} above your maximum`;
      } else {
        reason = "Close on everything else";
      }

      return { listing: l, score: match.score, distanceKm: km, reason };
    })
    .filter((s) => s.score >= 45)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export const DEFAULT_REQUIREMENTS: SearchRequirements = {
  transaction: "rent",
  category: "any",
  spaceType: "any",
  area: "Badda",
  budgetMin: 6000,
  budgetMax: 14000,
  capacity: {},
  moveInDate: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
  amenities: [],
  occupancy: "any",
};

/**
 * Whether a listing will accept this household at all.
 *
 * Deliberately not part of the score: being told a place is a 78% match when
 * the owner won't take bachelors wastes a viewing and a phone call. Listings
 * that exclude you are filtered out instead.
 */
export function acceptsOccupancy(l: SpaceListing, occupancy: SearchRequirements["occupancy"]): boolean {
  if (occupancy === "any") return true;
  if (l.space.category !== "living") return true;

  const rules = l.space.rules;
  if (!rules) return true;

  switch (occupancy) {
    case "family":
      return rules.familyAllowed;
    case "bachelor":
      return rules.bachelorAllowed;
    case "student":
      return rules.studentFriendly || rules.bachelorAllowed;
    default:
      return true;
  }
}
