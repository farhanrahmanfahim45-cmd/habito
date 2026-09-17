import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus, ChevronDown, Building2, Inbox, CircleCheck, Wrench, CircleDot, TrendingUp, Eye,
} from "lucide-react";
import { useHabito } from "@/hooks/useHabito";
import { db, usingDatabase } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { AvailabilityBadge, TrustBadge } from "@/components/space/badges";
import { CATEGORY_STYLE } from "@/data/catalog";
import { money, moneyCompact, lastUpdatedShort, isStale, longDate } from "@/lib/format";
import { SPACE_TYPE_LABEL, AVAILABILITY_LABEL } from "@/types/space";
import type { AvailabilityStatus, Inquiry, Property, Space } from "@/types/space";
import { cn } from "@/lib/cn";

/**
 * The portfolio is the centre of the owner story: one owner, several
 * properties, many kinds of space inside each — all visible at once.
 */
export default function Portfolio() {
  const { role, setRole, ownerId, inquiries, refresh, listings } = useHabito();
  const [properties, setProperties] = useState<Property[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [open, setOpen] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const props = await db.properties(ownerId);
    const all = await Promise.all(props.map((p) => db.spacesOfProperty(p.id)));
    setProperties(props);
    setSpaces(all.flat());
    setOpen((prev) => (prev.length ? prev : props.slice(0, 2).map((p) => p.id)));
  }, [ownerId]);

  useEffect(() => {
    void load();
  }, [load, listings]);

  const stats = useMemo(() => {
    const available = spaces.filter((s) => s.availability.status === "available" || s.availability.status === "partially-available");
    const occupied = spaces.filter((s) => s.availability.status === "occupied");
    const maintenance = spaces.filter((s) => s.availability.status === "maintenance");
    const potential = spaces
      .filter((s) => s.transaction === "rent")
      .reduce((sum, s) => sum + s.cost.price, 0);
    const needsUpdate = spaces.filter((s) => isStale(s.lastUpdated)).length;
    return {
      available: available.length,
      occupied: occupied.length,
      maintenance: maintenance.length,
      potential,
      needsUpdate,
      views: spaces.reduce((s, x) => s + x.views, 0),
    };
  }, [spaces]);

  const ownInquiries = useMemo(() => {
    const ids = new Set(spaces.map((s) => s.id));
    return inquiries.filter((i) => ids.has(i.spaceId));
  }, [inquiries, spaces]);

  const setStatus = async (spaceId: string, status: AvailabilityStatus) => {
    setBusy(spaceId);
    const space = spaces.find((s) => s.id === spaceId);
    if (space) {
      await db.updateSpace(spaceId, { availability: { ...space.availability, status } });
      await load();
      await refresh();
    }
    setBusy(null);
  };

  return (
    <>
      <PageHeader
        title="My spaces"
        lead="Every property you hold and every space inside it, in one view."
        actions={
          <Link to="/list">
            <Button>
              <Plus size={16} aria-hidden />
              Add a space
            </Button>
          </Link>
        }
      />

      <div className="container-page py-8 md:py-10">
        {role !== "owner" && !usingDatabase && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-card bg-aqua-50 p-4 text-sm text-aqua-700 ring-1 ring-aqua-200">
            <span>You're browsing as a seeker. Switch to owner mode to follow the supply side.</span>
            <Button size="sm" onClick={() => setRole("owner")}>
              Switch to owner
            </Button>
          </div>
        )}

        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Stat icon={Building2} label="Properties" value={String(properties.length)} />
          <Stat icon={CircleCheck} label="Available" value={String(stats.available)} tone="ok" />
          <Stat icon={CircleDot} label="Occupied" value={String(stats.occupied)} />
          <Stat icon={Wrench} label="Maintenance" value={String(stats.maintenance)} tone="warn" />
          <Stat
            icon={TrendingUp}
            label="Potential monthly"
            value={moneyCompact(stats.potential)}
            hint="If every rentable space were let at its listed price"
          />
        </dl>

        {stats.needsUpdate > 0 && (
          <p className="mt-4 rounded-card bg-warn-100 p-4 text-sm text-warn-700">
            <strong className="font-semibold">{stats.needsUpdate} space{stats.needsUpdate > 1 ? "s" : ""}</strong>{" "}
            {stats.needsUpdate === 1 ? "hasn't" : "haven't"} been updated in over three weeks. Confirming availability keeps them ranking in search.
          </p>
        )}

        {/* Hierarchy */}
        <h2 className="mt-10 font-display text-xl font-bold text-ink">Properties</h2>

        <ul className="mt-3 space-y-3">
          {properties.map((property) => {
            const own = spaces.filter((s) => s.propertyId === property.id);
            const expanded = open.includes(property.id);
            const free = own.filter((s) => s.availability.status === "available" || s.availability.status === "partially-available").length;

            return (
              <li key={property.id} className="overflow-hidden rounded-card bg-surface ring-1 ring-hairline">
                <button
                  type="button"
                  onClick={() => setOpen((o) => (expanded ? o.filter((x) => x !== property.id) : [...o, property.id]))}
                  aria-expanded={expanded}
                  className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-ivory"
                >
                  <img src={property.coverImage} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-bold text-ink">{property.name}</p>
                    <p className="truncate text-sm text-muted">
                      {property.neighborhood}, {property.area}
                      {!property.synthetic && <span className="ml-2 font-semibold text-aqua-700">· added by you</span>}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-sm font-semibold tnum text-ink">{own.length} {own.length === 1 ? "space" : "spaces"}</p>
                    <p className="text-xs tnum text-ok-600">{free} available</p>
                  </div>
                  <ChevronDown
                    size={18}
                    aria-hidden
                    className={cn("shrink-0 text-muted transition-transform", expanded && "rotate-180")}
                  />
                </button>

                {expanded && (
                  <ul className="border-t border-hairline">
                    {own.length === 0 && (
                      <li className="px-4 py-6 text-center text-sm text-muted">
                        No spaces here yet.{" "}
                        <Link to="/list" className="font-semibold text-aqua-700 hover:underline">
                          Add one
                        </Link>
                        .
                      </li>
                    )}
                    {own.map((s) => {
                      const cat = CATEGORY_STYLE[s.category];
                      return (
                        <li
                          key={s.id}
                          className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-hairline px-4 py-3 last:border-0"
                        >
                          <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", cat.chip)}>
                            <cat.icon size={15} aria-hidden />
                          </span>

                          <div className="min-w-0 flex-1">
                            <Link to={`/space/${s.id}`} className="font-semibold text-ink hover:text-aqua-700">
                              {s.name}
                            </Link>
                            <p className="text-xs text-muted">
                              {SPACE_TYPE_LABEL[s.spaceType]} · {money(s.cost.price)}
                              {s.transaction === "rent" ? "/mo" : " sale"}
                              {s.availability.note && ` · ${s.availability.note}`}
                            </p>
                          </div>

                          <span className="inline-flex items-center gap-1 text-xs tnum text-muted">
                            <Eye size={13} aria-hidden />
                            {s.views}
                          </span>

                          <AvailabilityBadge availability={s.availability} />
                          <TrustBadge verification={s.verification} compact />

                          <span
                            className={cn(
                              "w-16 text-right text-xs",
                              isStale(s.lastUpdated) ? "font-semibold text-warn-700" : "text-muted",
                            )}
                          >
                            {lastUpdatedShort(s.lastUpdated)}
                          </span>

                          <label className="shrink-0">
                            <span className="sr-only">Availability for {s.name}</span>
                            <select
                              value={s.availability.status}
                              disabled={busy === s.id}
                              onChange={(e) => void setStatus(s.id, e.target.value as AvailabilityStatus)}
                              className="h-9 rounded-full bg-ivory px-3 text-xs font-semibold text-ink ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600"
                            >
                              {(Object.keys(AVAILABILITY_LABEL) as AvailabilityStatus[]).map((st) => (
                                <option key={st} value={st}>
                                  {AVAILABILITY_LABEL[st]}
                                </option>
                              ))}
                            </select>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        {/* Inquiries */}
        <h2 className="mt-10 font-display text-xl font-bold text-ink">Inquiries</h2>
        <p className="mt-1 text-sm text-muted">Each one arrives with the sender's budget and move-in date.</p>

        <div className="mt-3">
          {ownInquiries.length === 0 ? (
            <div className="flex flex-col items-center rounded-card bg-surface px-6 py-12 text-center ring-1 ring-hairline">
              <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-aqua-100 text-aqua-700">
                <Inbox size={20} aria-hidden />
              </span>
              <h3 className="font-display font-bold text-ink">No inquiries yet.</h3>
              <p className="mt-1.5 max-w-xs text-sm text-muted">
                Switch to seeker mode, open one of your spaces and send an inquiry — it lands here.
              </p>
              <Link to="/search" className="mt-4">
                <Button variant="secondary" size="sm">
                  Browse as a seeker
                </Button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {ownInquiries.map((inq) => (
                <InquiryRow key={inq.id} inquiry={inq} spaces={spaces} onChanged={refresh} />
              ))}
            </ul>
          )}
        </div>

        <p className="mt-8 rounded-card bg-surface/70 p-4 text-sm leading-relaxed text-ink-soft ring-1 ring-hairline-strong">
          Everything you change here is stored on this device and survives a refresh. Seed
          properties are synthetic; anything you add is marked as yours.
        </p>
      </div>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  hint?: string;
  tone?: "ok" | "warn";
}) {
  return (
    <div className="rounded-card bg-surface p-5 ring-1 ring-hairline">
      <dt className="flex items-center gap-2 text-sm text-muted">
        <Icon
          size={15}
          aria-hidden
          className={tone === "ok" ? "text-ok-600" : tone === "warn" ? "text-warn-700" : "text-aqua-600"}
        />
        {label}
      </dt>
      <dd className="mt-2 font-display text-2xl font-bold tnum text-ink">{value}</dd>
      {hint && <p className="mt-1 text-xs leading-snug text-muted">{hint}</p>}
    </div>
  );
}

const STATUS_FLOW: Inquiry["status"][] = ["new", "contacted", "interested", "closed"];

function InquiryRow({
  inquiry,
  spaces,
  onChanged,
}: {
  inquiry: Inquiry;
  spaces: Space[];
  onChanged: () => Promise<void>;
}) {
  const space = spaces.find((s) => s.id === inquiry.spaceId);

  return (
    <li className="rounded-card bg-surface p-4 ring-1 ring-hairline">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-ink">
            {inquiry.name}
            <span className="ml-2 font-normal text-muted">on {space?.name ?? inquiry.spaceId}</span>
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{inquiry.message}</p>
        </div>

        <label className="shrink-0">
          <span className="sr-only">Status for this inquiry</span>
          <select
            value={inquiry.status}
            onChange={async (e) => {
              await db.setInquiryStatus(inquiry.id, e.target.value as Inquiry["status"]);
              await onChanged();
            }}
            className="h-9 rounded-full bg-ivory px-3 text-xs font-semibold capitalize text-ink ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600"
          >
            {STATUS_FLOW.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5 text-xs">
        <li className="rounded-full bg-ivory-deep px-2.5 py-1 font-semibold text-ink-soft">
          Budget {money(inquiry.budgetMin)}–{money(inquiry.budgetMax)}
        </li>
        <li className="rounded-full bg-ivory-deep px-2.5 py-1 font-semibold text-ink-soft">
          Moving {longDate(inquiry.moveInDate)}
        </li>
      </ul>
    </li>
  );
}
