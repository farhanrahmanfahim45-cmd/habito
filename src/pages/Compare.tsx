import { Link } from "react-router-dom";
import { Scale, Check, X, Trash2 } from "lucide-react";
import { useHabito } from "@/hooks/useHabito";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { scoreListing, distanceFromArea } from "@/lib/matching";
import { money, longDate, lastUpdatedShort } from "@/lib/format";
import { AMENITIES } from "@/data/catalog";
import { trustLevel } from "@/components/space/badges";
import { SPACE_TYPE_LABEL, AVAILABILITY_LABEL } from "@/types/space";
import type { AmenityKey } from "@/types/space";
import { cn } from "@/lib/cn";

/** Rows adapt to what's being compared — no empty "bedrooms" row for a garage. */
export default function Compare() {
  const { compareIds, listings, clearCompare, toggleCompare, requirements, hasStatedNeeds } = useHabito();
  const selected = listings.filter((l) => compareIds.includes(l.space.id));

  if (selected.length === 0) {
    return (
      <>
        <PageHeader title="Compare" lead="Put up to four spaces side by side and let the differences show." />
        <div className="container-page py-10">
          <div className="flex flex-col items-center rounded-card bg-surface px-6 py-16 text-center ring-1 ring-hairline">
            <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-aqua-100 text-aqua-700">
              <Scale size={22} aria-hidden />
            </span>
            <h2 className="font-display text-xl font-bold text-ink">Nothing to compare yet.</h2>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Tap the scales icon on any space and it lands in the tray at the bottom of the screen.
            </p>
            <Link to="/search" className="mt-5">
              <Button>Browse spaces</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const scores = new Map(selected.map((l) => [l.space.id, scoreListing(l, requirements).score]));
  const bestScore = Math.max(...selected.map((l) => scores.get(l.space.id) ?? 0));
  const cheapest = Math.min(...selected.map((l) => l.space.cost.price));

  const disclosedTotals = selected
    .map((l) => l.space.cost.estimatedMonthly)
    .filter((t): t is number => t !== null);
  const bestTotal = disclosedTotals.length ? Math.min(...disclosedTotals) : null;

  const sizes = selected.map((l) => l.space.attributes.sizeSqft ?? 0);
  const biggest = Math.max(...sizes);

  const distances = selected.map((l) => distanceFromArea(l, requirements.area) ?? Infinity);
  const nearest = Math.min(...distances);

  const showBedrooms = selected.some((l) => l.space.attributes.bedrooms !== undefined);
  const showSize = selected.some((l) => l.space.attributes.sizeSqft !== undefined);
  const showSlots = selected.some((l) => l.space.attributes.carSlots !== undefined);
  const showLand = selected.some((l) => l.space.attributes.landAreaDecimal !== undefined);

  // Only compare amenities at least one space actually has.
  const amenityRows = (Object.keys(AMENITIES) as AmenityKey[]).filter((key) =>
    selected.some((l) => l.space.amenities.includes(key)),
  );

  return (
    <>
      <PageHeader
        title="Compare"
        lead={`${selected.length} space${selected.length > 1 ? "s" : ""} side by side. The strongest figure in each row is highlighted.`}
        actions={
          <Button variant="secondary" onClick={clearCompare}>
            <Trash2 size={16} aria-hidden />
            Clear
          </Button>
        }
      />

      <div className="container-page py-8 md:py-10">
        <div className="overflow-x-auto rounded-card bg-surface ring-1 ring-hairline">
          <table className="w-full min-w-160 text-sm">
            <caption className="sr-only">Side-by-side comparison of the spaces you selected</caption>
            <thead>
              <tr className="border-b border-hairline">
                <th scope="col" className="w-36 px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  Feature
                </th>
                {selected.map((l) => (
                  <th key={l.space.id} scope="col" className="min-w-48 px-3 py-4 text-left align-top">
                    <Link to={`/space/${l.space.id}`} className="block">
                      <img src={l.space.images[0].url} alt="" className="mb-2 h-24 w-full rounded-xl object-cover" />
                      <span className="font-display font-bold text-ink hover:text-aqua-700">{l.space.name}</span>
                    </Link>
                    <p className="mt-0.5 text-xs font-normal text-muted">
                      {SPACE_TYPE_LABEL[l.space.spaceType]} · {l.property.area}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleCompare(l.space.id)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-danger-600"
                    >
                      <X size={12} aria-hidden />
                      Remove
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hasStatedNeeds && (
                <Row label="Match">
                  {selected.map((l) => (
                    <Cell key={l.space.id} best={scores.get(l.space.id) === bestScore}>
                      <span className="font-display text-base font-bold">{scores.get(l.space.id)}%</span>
                    </Cell>
                  ))}
                </Row>
              )}

              <Row label="Price">
                {selected.map((l) => (
                  <Cell key={l.space.id} best={l.space.cost.price === cheapest}>
                    {money(l.space.cost.price)}
                    {l.space.transaction === "rent" && <span className="text-xs font-medium text-muted">/mo</span>}
                  </Cell>
                ))}
              </Row>

              <Row label="Total monthly">
                {selected.map((l) => (
                  <Cell key={l.space.id} best={bestTotal !== null && l.space.cost.estimatedMonthly === bestTotal}>
                    {l.space.cost.estimatedMonthly ? (
                      money(l.space.cost.estimatedMonthly)
                    ) : (
                      <span className="text-xs font-medium text-warn-700">Not disclosed</span>
                    )}
                  </Cell>
                ))}
              </Row>

              <Row label="Transaction">
                {selected.map((l) => (
                  <Cell key={l.space.id}>
                    <span className="capitalize">{l.space.transaction === "rent" ? "Rent" : "Sale"}</span>
                  </Cell>
                ))}
              </Row>

              {showBedrooms && (
                <Row label="Bedrooms">
                  {selected.map((l) => (
                    <Cell key={l.space.id}>{l.space.attributes.bedrooms ?? "—"}</Cell>
                  ))}
                </Row>
              )}

              {showSize && (
                <Row label="Size">
                  {selected.map((l) => (
                    <Cell key={l.space.id} best={(l.space.attributes.sizeSqft ?? 0) === biggest && biggest > 0}>
                      {l.space.attributes.sizeSqft ? `${l.space.attributes.sizeSqft} sqft` : "—"}
                    </Cell>
                  ))}
                </Row>
              )}

              {showSlots && (
                <Row label="Slots">
                  {selected.map((l) => {
                    const a = l.space.attributes;
                    return (
                      <Cell key={l.space.id}>
                        {a.carSlots !== undefined ? `${a.carSlots} car · ${a.motorcycleSlots ?? 0} bike` : "—"}
                      </Cell>
                    );
                  })}
                </Row>
              )}

              {showLand && (
                <Row label="Land area">
                  {selected.map((l) => (
                    <Cell key={l.space.id}>
                      {l.space.attributes.landAreaDecimal ? `${l.space.attributes.landAreaDecimal} decimal` : "—"}
                    </Cell>
                  ))}
                </Row>
              )}

              <Row label={`From ${requirements.area}`}>
                {selected.map((l, i) => (
                  <Cell key={l.space.id} best={distances[i] === nearest && nearest !== Infinity}>
                    {distances[i] === Infinity ? "—" : `${distances[i].toFixed(1)} km`}
                  </Cell>
                ))}
              </Row>

              {amenityRows.map((key) => (
                <Row key={key} label={AMENITIES[key].label}>
                  {selected.map((l) => (
                    <Cell key={l.space.id}>
                      {l.space.amenities.includes(key) ? (
                        <>
                          <Check size={16} className="text-ok-600" aria-hidden />
                          <span className="sr-only">Yes</span>
                        </>
                      ) : (
                        <>
                          <X size={16} className="text-hairline-strong" aria-hidden />
                          <span className="sr-only">No</span>
                        </>
                      )}
                    </Cell>
                  ))}
                </Row>
              ))}

              <Row label="Availability">
                {selected.map((l) => (
                  <Cell key={l.space.id}>
                    <span className="text-xs">{AVAILABILITY_LABEL[l.space.availability.status]}</span>
                  </Cell>
                ))}
              </Row>

              <Row label="Free from">
                {selected.map((l) => (
                  <Cell key={l.space.id}>
                    <span className="text-xs">{longDate(l.space.availability.availableFrom)}</span>
                  </Cell>
                ))}
              </Row>

              <Row label="Trust">
                {selected.map((l) => {
                  const level = trustLevel(l.space.verification);
                  return (
                    <Cell key={l.space.id}>
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          level === "verified" ? "text-ok-600" : level === "in-review" ? "text-warn-700" : "text-muted",
                        )}
                      >
                        {level === "verified" ? "Verified (demo)" : level === "in-review" ? "In review" : "Not verified"}
                      </span>
                    </Cell>
                  );
                })}
              </Row>

              <Row label="Updated">
                {selected.map((l) => (
                  <Cell key={l.space.id}>
                    <span className="text-xs text-muted">{lastUpdatedShort(l.space.lastUpdated)}</span>
                  </Cell>
                ))}
              </Row>

              <Row label="">
                {selected.map((l) => (
                  <Cell key={l.space.id}>
                    <Link to={`/space/${l.space.id}`}>
                      <Button size="sm" variant="secondary">
                        Open
                      </Button>
                    </Link>
                  </Cell>
                ))}
              </Row>
            </tbody>
          </table>
        </div>

        {selected.length === 1 && (
          <p className="mt-5 rounded-card bg-surface/70 p-4 text-sm text-ink-soft ring-1 ring-hairline-strong">
            Add one or two more and the differences become much easier to read.
          </p>
        )}
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-b border-hairline last:border-0">
      <th scope="row" className="px-4 py-3 text-left align-middle text-xs font-semibold text-muted">
        {label}
      </th>
      {children}
    </tr>
  );
}

function Cell({ children, best }: { children: React.ReactNode; best?: boolean }) {
  return (
    <td className={cn("px-3 py-3 align-middle font-semibold tnum", best ? "bg-aqua-50 text-aqua-700" : "text-ink")}>
      <span className="inline-flex items-center gap-1.5">{children}</span>
    </td>
  );
}
