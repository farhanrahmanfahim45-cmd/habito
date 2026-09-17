import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Bookmark, Scale, MapPin, Check, Minus, X, Building2, Flag, ChevronRight,
} from "lucide-react";
import { useHabito } from "@/hooks/useHabito";
import { db } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MatchRing } from "@/components/space/MatchRing";
import { TrustBadge, AvailabilityBadge } from "@/components/space/badges";
import { keySpec } from "@/components/space/SpaceCard";
import { scoreListing } from "@/lib/matching";
import { AMENITIES, CATEGORY_STYLE } from "@/data/catalog";
import { money, longDate, lastUpdatedLabel, isStale, availabilityLine } from "@/lib/format";
import { SPACE_TYPE_LABEL } from "@/types/space";
import type { MatchFactor, Space, SpaceListing } from "@/types/space";
import { cn } from "@/lib/cn";

export default function SpaceDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { listings, ready, requirements, hasStatedNeeds, isSaved, toggleSaved, isComparing, toggleCompare, sendInquiry } =
    useHabito();

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [siblings, setSiblings] = useState<Space[]>([]);

  const listing = useMemo(() => listings.find((l) => l.space.id === id) ?? null, [listings, id]);

  useEffect(() => {
    setActive(0);
    if (!listing) return;
    void db.spacesOfProperty(listing.property.id).then((all) => setSiblings(all.filter((s) => s.id !== id)));
  }, [listing, id]);

  if (!ready) {
    return <div className="container-page py-20 text-sm text-muted">Loading space…</div>;
  }

  if (!listing) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">That space isn't here.</h1>
        <p className="mt-2 text-sm text-muted">It may have been removed, or the link is out of date.</p>
        <Button className="mt-5" onClick={() => navigate("/search")}>
          Back to search
        </Button>
      </div>
    );
  }

  const { space, property, owner } = listing;
  const match = hasStatedNeeds ? scoreListing(listing, requirements) : null;
  const saved = isSaved(space.id);
  const comparing = isComparing(space.id);
  const isSale = space.transaction === "sale";
  const cat = CATEGORY_STYLE[space.category];

  return (
    <div className="pb-24 md:pb-0">
      {/* Gallery */}
      <div className="container-page pt-4 md:pt-6">
        <Link
          to="/search"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={15} aria-hidden />
          Back to results
        </Link>

        <div className="grid gap-2 md:grid-cols-[1.9fr_1fr] md:gap-3">
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="group relative overflow-hidden rounded-card bg-ivory-deep"
          >
            <img
              src={space.images[active].url}
              alt={space.images[active].alt}
              className="aspect-4/3 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] md:aspect-16/10"
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
              {space.images[active].label} · view all
            </span>
          </button>

          <div className="grid grid-cols-4 gap-2 md:grid-cols-1 md:grid-rows-3">
            {space.images.slice(0, 3).map((img, i) => (
              <button
                key={img.url + i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show ${img.label}`}
                aria-current={i === active}
                className={cn(
                  "overflow-hidden rounded-2xl bg-ivory-deep ring-2 transition-all",
                  i === active ? "ring-ink" : "ring-transparent hover:ring-hairline-strong",
                )}
              >
                <img src={img.url} alt="" className="aspect-4/3 size-full object-cover md:aspect-auto md:h-full" />
              </button>
            ))}
          </div>
        </div>

        <p className="mt-2 text-xs text-muted">
          Illustrative demo images. These are not photographs of a real space.
        </p>
      </div>

      {/* Body */}
      <div className="container-page grid gap-10 py-8 lg:grid-cols-[1fr_22rem] lg:gap-14">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", cat.chip)}>
              {SPACE_TYPE_LABEL[space.spaceType]}
            </span>
            {isSale && <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-ivory">For sale</span>}
            <AvailabilityBadge availability={space.availability} />
            <TrustBadge verification={space.verification} />
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold text-ink sm:text-4xl">{space.name}</h1>

          <Link
            to={`/property/${property.id}`}
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
          >
            <Building2 size={15} aria-hidden />
            {property.name}
            <span className="text-muted">· {property.address}</span>
          </Link>

          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
            <MapPin size={14} aria-hidden />
            {property.area}, {property.district} · {property.geography}
          </p>

          <p className="mt-6 leading-relaxed text-ink-soft">{space.description}</p>

          {/* Adaptive specs — only fields that apply to this category */}
          <Section title="The space">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card bg-hairline ring-1 ring-hairline sm:grid-cols-3">
              {specRows(listing).map((row) => (
                <div key={row.label} className="bg-surface px-4 py-3">
                  <dt className="text-xs text-muted">{row.label}</dt>
                  <dd className="mt-0.5 font-bold tnum text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Section>

          {space.amenities.length > 0 && (
            <Section title="What's included">
              <ul className="flex flex-wrap gap-2">
                {space.amenities.map((key) => {
                  const { label, icon: Icon } = AMENITIES[key];
                  return (
                    <li
                      key={key}
                      className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm text-ink-soft ring-1 ring-hairline"
                    >
                      <Icon size={14} className="text-muted" aria-hidden />
                      {label}
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}

          {property.nearby.length > 0 && (
            <Section title="Getting around">
              <ul className="grid gap-px overflow-hidden rounded-card bg-hairline ring-1 ring-hairline sm:grid-cols-2">
                {property.nearby.map((n) => (
                  <li key={n.label} className="flex items-center justify-between bg-surface px-4 py-3 text-sm">
                    <span className="text-ink-soft">{n.label}</span>
                    <span className="font-semibold tnum text-ink">{n.km} km</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {siblings.length > 0 && (
            <Section title={`More at ${property.name}`}>
              <ul className="space-y-2">
                {siblings.slice(0, 5).map((s) => (
                  <li key={s.id}>
                    <Link
                      to={`/space/${s.id}`}
                      className="flex items-center gap-3 rounded-2xl bg-surface p-2.5 ring-1 ring-hairline transition-colors hover:ring-ink"
                    >
                      <img src={s.images[0].url} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-ink">{s.name}</p>
                        <p className="truncate text-xs text-muted">{SPACE_TYPE_LABEL[s.spaceType]}</p>
                      </div>
                      <span className="shrink-0 font-bold tnum text-ink">{money(s.cost.price)}</span>
                      <ChevronRight size={16} className="shrink-0 text-muted" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="Owner">
            <div className="flex items-start gap-4 rounded-card bg-surface p-5 ring-1 ring-hairline">
              <span
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold",
                  owner.avatarTone === "mint" && "bg-mint text-mint-ink",
                  owner.avatarTone === "sun" && "bg-sun text-sun-ink",
                  owner.avatarTone === "lilac" && "bg-lilac text-lilac-ink",
                  owner.avatarTone === "coral" && "bg-coral/60 text-coral-ink",
                  owner.avatarTone === "aqua" && "bg-aqua-200 text-aqua-700",
                )}
              >
                {owner.name.charAt(0)}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-ink">{owner.name}</p>
                <p className="text-sm capitalize text-muted">{owner.role}</p>
                <p className="mt-2 text-sm tnum text-ink-soft">
                  Replies to {owner.responseRate}% of inquiries · usually within {owner.responseTimeHours}h
                </p>
                <p className="mt-3 text-xs leading-relaxed text-muted">
                  Owner state: {owner.verification.replace("-", " ")} (demo). Habito has not carried out
                  a real identity or ownership check.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-danger-600"
              onClick={() => alert("Reporting is part of the trust workflow and is not wired up in this prototype.")}
            >
              <Flag size={12} aria-hidden />
              Report this listing
            </button>
          </Section>
        </div>

        {/* Sticky rail */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {match && (
            <div className="mb-4 rounded-card bg-surface p-5 ring-1 ring-hairline">
              <MatchRing score={match.score} />
              <h2 className="mt-5 text-sm font-bold text-ink">Why this scores as it does</h2>
              <ul className="mt-2.5 space-y-2">
                {match.factors.map((f) => (
                  <FactorRow key={f.key} factor={f} />
                ))}
              </ul>
              <p className="mt-4 border-t border-hairline pt-3 text-xs leading-relaxed text-muted">
                Weighted arithmetic over what you told us — budget 30, location 24, type 20,
                availability 12, size 7, amenities 7. No machine learning involved.
              </p>
            </div>
          )}

          <div className="rounded-card bg-surface p-5 ring-1 ring-hairline">
            <p className="font-display text-3xl font-extrabold tnum text-ink">
              {money(space.cost.price)}
              {!isSale && <span className="text-base font-medium text-muted">/month</span>}
            </p>
            <p className="mt-1 text-sm text-muted">{availabilityLine(space.availability.availableFrom)}</p>
            {space.availability.note && (
              <p className="mt-1 text-sm font-semibold text-aqua-700">{space.availability.note}</p>
            )}

            {!isSale && (
              <>
                <h2 className="mt-5 text-sm font-bold text-ink">Monthly cost</h2>
                <dl className="mt-2 space-y-1.5 text-sm">
                  <CostRow label="Rent" value={money(space.cost.price)} />
                  <CostRow
                    label="Service charge"
                    value={space.cost.serviceCharge !== null ? money(space.cost.serviceCharge) : "Not listed"}
                    muted={space.cost.serviceCharge === null}
                  />
                  <CostRow
                    label="Utilities"
                    value={space.cost.utilities !== null ? money(space.cost.utilities) : "Not listed"}
                    muted={space.cost.utilities === null}
                  />
                </dl>

                <div className="mt-3 border-t border-hairline pt-3">
                  {space.cost.estimatedMonthly ? (
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-semibold text-ink">Estimated total</span>
                      <span className="font-display text-lg font-bold tnum text-aqua-700">
                        {money(space.cost.estimatedMonthly)}
                      </span>
                    </div>
                  ) : (
                    <p className="rounded-xl bg-warn-100 px-3 py-2 text-xs leading-relaxed text-warn-700">
                      This owner hasn't listed every cost, so a monthly total can't be shown.
                    </p>
                  )}
                </div>

                <dl className="mt-4 space-y-1.5 border-t border-hairline pt-3 text-sm">
                  {space.cost.advanceMonths !== null && (
                    <CostRow
                      label="Advance"
                      value={`${space.cost.advanceMonths} month${space.cost.advanceMonths > 1 ? "s" : ""}`}
                    />
                  )}
                  <CostRow
                    label="Deposit"
                    value={space.cost.securityDeposit !== null ? money(space.cost.securityDeposit) : "Not listed"}
                    muted={space.cost.securityDeposit === null}
                  />
                </dl>
              </>
            )}

            <div className="mt-5 hidden gap-2 md:flex md:flex-col">
              <Button fullWidth onClick={() => setInquiryOpen(true)}>
                Send inquiry
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => void toggleSaved(space.id)}>
                  <Bookmark size={15} className={cn(saved && "fill-aqua-600 text-aqua-600")} aria-hidden />
                  {saved ? "Saved" : "Save"}
                </Button>
                <Button variant="secondary" onClick={() => toggleCompare(space.id)}>
                  <Scale size={15} aria-hidden />
                  {comparing ? "Added" : "Compare"}
                </Button>
              </div>
            </div>

            <p className={cn("mt-4 text-xs", isStale(space.lastUpdated) ? "font-medium text-warn-700" : "text-muted")}>
              {lastUpdatedLabel(space.lastUpdated)} · {space.views} views · {space.inquiryCount} inquiries
            </p>
          </div>
        </aside>
      </div>

      {/* Mobile sticky actions */}
      <div className="fixed inset-x-0 bottom-14 z-30 border-t border-hairline bg-surface/95 p-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-bold tnum text-ink">
              {money(space.cost.price)}
              {!isSale && <span className="text-xs font-medium text-muted">/mo</span>}
            </p>
            {match && <p className="text-xs tnum text-aqua-700">{match.score}% match</p>}
          </div>
          <Button variant="secondary" size="sm" onClick={() => void toggleSaved(space.id)} aria-label="Save">
            <Bookmark size={16} className={cn(saved && "fill-aqua-600 text-aqua-600")} aria-hidden />
          </Button>
          <Button size="sm" onClick={() => setInquiryOpen(true)}>
            Send inquiry
          </Button>
        </div>
      </div>

      <Lightbox
        open={lightbox}
        onClose={() => setLightbox(false)}
        listing={listing}
        active={active}
        setActive={setActive}
      />

      <InquiryModal
        open={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        listing={listing}
        onSend={sendInquiry}
        requirements={requirements}
      />
    </div>
  );
}

/* ── Pieces ───────────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-9">
      <h2 className="mb-3 font-display text-xl font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function specRows(listing: SpaceListing): Array<{ label: string; value: string }> {
  const a = listing.space.attributes;
  const rows: Array<{ label: string; value: string }> = [];
  const add = (label: string, value: string | number | undefined | boolean) => {
    if (value === undefined || value === null || value === false) return;
    rows.push({ label, value: typeof value === "boolean" ? "Yes" : String(value) });
  };

  switch (listing.space.category) {
    case "living":
      add("Bedrooms", a.bedrooms);
      add("Bathrooms", a.bathrooms);
      add("Size", a.sizeSqft ? `${a.sizeSqft} sqft` : undefined);
      add("Floor", a.floor);
      add("Furnishing", a.furnishing?.replace("-", " "));
      add("Balcony", a.balcony);
      break;
    case "business":
      add("Size", a.sizeSqft ? `${a.sizeSqft} sqft` : undefined);
      add("Floor", a.floor === 0 ? "Ground" : a.floor);
      add("Frontage", a.frontageFt ? `${a.frontageFt} ft` : undefined);
      add("Workstations", a.workstations);
      add("Meeting room", a.meetingRoom);
      add("Suits", a.suitableFor);
      break;
    case "storage":
      add("Storage area", a.sizeSqft ? `${a.sizeSqft} sqft` : undefined);
      add("Ceiling", a.ceilingHeightFt ? `${a.ceilingHeightFt} ft` : undefined);
      add("Loading access", a.loadingAccess);
      add("Vehicle access", a.vehicleAccess);
      add("Suits", a.suitableFor);
      break;
    case "parking":
      add("Car slots", a.carSlots);
      add("Motorcycle slots", a.motorcycleSlots);
      add("Cover", a.covered ? "Covered" : "Open");
      add("Access", a.accessHours);
      break;
    case "land":
      add("Land area", a.landAreaDecimal ? `${a.landAreaDecimal} decimal` : undefined);
      add("Use", a.landUse);
      add("Road access", a.roadAccess);
      add("Water source", a.waterSource);
      add("Lease", a.leaseYears ? `${a.leaseYears} years` : undefined);
      break;
  }

  if (rows.length === 0) rows.push({ label: "Summary", value: keySpec(listing) });
  return rows;
}

const VERDICT = {
  met: { Icon: Check, className: "text-ok-600" },
  partial: { Icon: Minus, className: "text-warn-700" },
  missed: { Icon: X, className: "text-danger-600" },
} as const;

function FactorRow({ factor }: { factor: MatchFactor }) {
  const { Icon, className } = VERDICT[factor.verdict];
  const points = factor.score * factor.weight;
  const label = Math.abs(points - Math.round(points)) < 0.05 ? String(Math.round(points)) : points.toFixed(1);

  return (
    <li className="flex gap-2.5 text-sm">
      <Icon size={15} className={cn("mt-0.5 shrink-0", className)} aria-hidden />
      <span className="flex-1 leading-snug text-ink-soft">
        <span className="font-semibold text-ink">{factor.label}</span>
        <span className="mx-1.5 text-hairline-strong" aria-hidden>·</span>
        {factor.detail}
      </span>
      <span className="shrink-0 text-xs font-semibold tnum text-muted">
        {label}/{factor.weight}
      </span>
    </li>
  );
}

function CostRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={cn("font-semibold tnum", muted ? "text-muted" : "text-ink")}>{value}</dd>
    </div>
  );
}

function Lightbox({
  open,
  onClose,
  listing,
  active,
  setActive,
}: {
  open: boolean;
  onClose: () => void;
  listing: SpaceListing;
  active: number;
  setActive: (i: number) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setActive((active + 1) % listing.space.images.length);
      if (e.key === "ArrowLeft") setActive((active - 1 + listing.space.images.length) % listing.space.images.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, active, setActive, listing.space.images.length]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/95 p-4" role="dialog" aria-modal="true" aria-label="Images">
      <div className="flex items-center justify-between text-ivory">
        <p className="text-sm font-semibold">
          {listing.space.images[active].label}
          <span className="ml-2 font-normal text-ivory/60 tnum">
            {active + 1} / {listing.space.images.length}
          </span>
        </p>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-white/10">
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center py-4">
        <img
          src={listing.space.images[active].url}
          alt={listing.space.images[active].alt}
          className="max-h-full max-w-4xl rounded-card object-contain"
        />
      </div>

      <div className="flex justify-center gap-2">
        {listing.space.images.map((img, i) => (
          <button
            key={img.url + i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show ${img.label}`}
            className={cn(
              "overflow-hidden rounded-xl ring-2 transition-all",
              i === active ? "ring-aqua-400" : "ring-transparent opacity-60 hover:opacity-100",
            )}
          >
            <img src={img.url} alt="" className="size-16 object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function InquiryModal({
  open,
  onClose,
  listing,
  onSend,
  requirements,
}: {
  open: boolean;
  onClose: () => void;
  listing: SpaceListing;
  onSend: ReturnType<typeof useHabito>["sendInquiry"];
  requirements: ReturnType<typeof useHabito>["requirements"];
}) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("Hi, I'm interested in this space. Is it still available?");
  const [moveIn, setMoveIn] = useState(requirements.moveInDate);
  const [sent, setSent] = useState(false);

  const send = async () => {
    await onSend({
      spaceId: listing.space.id,
      name: name.trim() || "Habito user",
      message,
      moveInDate: moveIn,
      budgetMin: requirements.budgetMin,
      budgetMax: requirements.budgetMax,
    });
    setSent(true);
  };

  const close = () => {
    onClose();
    window.setTimeout(() => setSent(false), 250);
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={sent ? "Inquiry sent" : "Send an inquiry"}
      footer={
        sent ? (
          <Button fullWidth onClick={close}>
            Done
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={close}>
              Cancel
            </Button>
            <Button fullWidth onClick={() => void send()} disabled={message.trim().length === 0}>
              Send
            </Button>
          </div>
        )
      }
    >
      {sent ? (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-ink-soft">
            {listing.owner.name} now has your message, budget and move-in date. Switch to owner mode
            and open My spaces to watch it arrive in the inbox.
          </p>
          <p className="rounded-xl bg-ivory-deep p-3 text-xs leading-relaxed text-muted">
            Nothing is delivered to a real person. This is a prototype interaction stored on your
            own device.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl bg-ivory-deep p-3">
            <img src={listing.space.images[0].url} alt="" className="size-12 rounded-xl object-cover" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{listing.space.name}</p>
              <p className="truncate text-sm text-muted">
                {listing.property.area} · {money(listing.space.cost.price)}
                {listing.space.transaction === "rent" && "/month"}
              </p>
            </div>
          </div>

          <Field label="Your name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="So the owner knows who's asking"
              className="h-11 w-full rounded-xl bg-ivory px-3 text-[0.9375rem] ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600"
            />
          </Field>

          <Field label="Message">
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl bg-ivory p-3 text-[0.9375rem] ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600"
            />
          </Field>

          <Field label="When you'd move in">
            <input
              type="date"
              value={moveIn}
              onChange={(e) => setMoveIn(e.target.value)}
              className="h-11 w-full rounded-xl bg-ivory px-3 text-[0.9375rem] ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600"
            />
          </Field>

          <div>
            <p className="mb-2 text-sm font-medium text-ink-soft">Sent with your inquiry</p>
            <ul className="flex flex-wrap gap-1.5 text-xs">
              <li className="rounded-full bg-aqua-100 px-2.5 py-1 font-semibold text-aqua-700">
                Budget {money(requirements.budgetMin)}–{money(requirements.budgetMax)}
              </li>
              <li className="rounded-full bg-aqua-100 px-2.5 py-1 font-semibold text-aqua-700">
                Moving {longDate(moveIn)}
              </li>
            </ul>
            <p className="mt-2 text-xs text-muted">Your phone number isn't shared until you choose to.</p>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}
