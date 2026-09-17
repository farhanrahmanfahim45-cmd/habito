import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useHabito } from "@/hooks/useHabito";
import { Button } from "@/components/ui/Button";
import { CATEGORY_STYLE, TYPES_BY_CATEGORY, AMENITIES, AMENITIES_BY_CATEGORY } from "@/data/catalog";
import { AreaPicker } from "@/components/ui/AreaPicker";
import { SPACE_TYPE_LABEL } from "@/types/space";
import type { AmenityKey, SearchRequirements, SpaceCategory, SpaceType, TransactionType } from "@/types/space";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n";

const CATEGORIES = Object.keys(CATEGORY_STYLE) as SpaceCategory[];

/** Requirement intake. What you answer here drives every score you see after. */
export default function Find() {
  const navigate = useNavigate();
  const { requirements, setRequirements } = useHabito();
  const [draft, setDraft] = useState<SearchRequirements>(requirements);

  const set = <K extends keyof SearchRequirements>(k: K, v: SearchRequirements[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const amenityPool: AmenityKey[] =
    draft.category === "any"
      ? (Object.keys(AMENITIES) as AmenityKey[]).slice(0, 12)
      : AMENITIES_BY_CATEGORY[draft.category];

  const typePool: SpaceType[] = draft.category === "any" ? [] : TYPES_BY_CATEGORY[draft.category];
  const budgetInvalid = draft.budgetMax < draft.budgetMin;

  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <header>
        <h1 className="font-display text-3xl font-extrabold text-ink sm:text-5xl">
          Tell us what you need.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          A few answers, and every space afterwards arrives with a score and the reasons behind it.
        </p>
      </header>

      <div className="mt-9 space-y-5">
        <Card title="Are you renting or buying?">
          <div className="inline-flex rounded-full bg-ivory-deep p-0.5">
            {(["rent", "sale"] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={draft.transaction === t}
                onClick={() => set("transaction", t)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-bold transition-colors",
                  draft.transaction === t ? "bg-ink text-ivory" : "text-muted hover:text-ink",
                )}
              >
                {t === "rent" ? "Renting" : "Buying"}
              </button>
            ))}
          </div>
        </Card>

        <Card title="What kind of space?">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Chip active={draft.category === "any"} onClick={() => { set("category", "any"); set("spaceType", "any"); }}>
                Anything
              </Chip>
            </li>
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_STYLE[c].icon;
              return (
                <li key={c}>
                  <Chip active={draft.category === c} onClick={() => { set("category", c); set("spaceType", "any"); }}>
                    <Icon size={14} aria-hidden />
                    {CATEGORY_STYLE[c].label}
                  </Chip>
                </li>
              );
            })}
          </ul>

          {typePool.length > 1 && (
            <>
              <p className="mb-2 mt-5 text-sm font-medium text-ink-soft">Anything more specific?</p>
              <ul className="flex flex-wrap gap-2">
                <li>
                  <Chip small active={draft.spaceType === "any"} onClick={() => set("spaceType", "any")}>
                    Any {CATEGORY_STYLE[draft.category as SpaceCategory].label.toLowerCase()} space
                  </Chip>
                </li>
                {typePool.map((t) => (
                  <li key={t}>
                    <Chip small active={draft.spaceType === t} onClick={() => set("spaceType", t)}>
                      {SPACE_TYPE_LABEL[t]}
                    </Chip>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card title="Where?">
          <div className="sm:max-w-sm">
            <AreaPicker value={draft.area} onChange={(v) => set("area", v)} />
          </div>
          <p className="mt-2 text-xs text-muted">
            Spaces nearby still appear, ranked by how far they are from here.
          </p>
        </Card>

        <Card title={draft.transaction === "rent" ? "Monthly budget" : "Price range"}>
          <div className="grid max-w-md grid-cols-2 gap-3">
            <NumberField label="Minimum" value={draft.budgetMin} onChange={(v) => set("budgetMin", v)} />
            <NumberField label="Maximum" value={draft.budgetMax} onChange={(v) => set("budgetMax", v)} />
          </div>
          {budgetInvalid && (
            <p className="mt-2 text-sm font-medium text-danger-600">Your maximum is below your minimum.</p>
          )}
          {draft.transaction === "rent" && (
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Where an owner has listed every cost, we score against the full monthly figure — rent
              plus service charge and utilities — not rent alone.
            </p>
          )}
        </Card>

        <Card title="When do you need it?">
          <input
            type="date"
            aria-label="Move-in date"
            value={draft.moveInDate}
            onChange={(e) => set("moveInDate", e.target.value)}
            className="h-11 rounded-xl bg-ivory px-3 text-[0.9375rem] text-ink ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600"
          />
        </Card>

        <CapacityCard draft={draft} set={set} />

        <Card title="Anything you can't do without?" optional>
          <ul className="flex flex-wrap gap-2">
            {amenityPool.map((key) => {
              const { label, icon: Icon } = AMENITIES[key];
              const on = draft.amenities.includes(key);
              return (
                <li key={key}>
                  <Chip
                    small
                    active={on}
                    onClick={() =>
                      set("amenities", on ? draft.amenities.filter((a) => a !== key) : [...draft.amenities, key])
                    }
                  >
                    <Icon size={13} aria-hidden />
                    {label}
                  </Chip>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="sticky bottom-16 mt-8 rounded-full bg-surface/90 p-2 shadow-[0_16px_40px_-20px_rgb(16_24_40/0.5)] ring-1 ring-hairline backdrop-blur md:bottom-5">
        <Button
          size="lg"
          fullWidth
          disabled={budgetInvalid}
          onClick={() => {
            setRequirements(draft);
            navigate("/search");
          }}
        >
          Show my matches
          <ArrowRight size={17} aria-hidden />
        </Button>
      </div>
    </div>
  );
}

/**
 * "Big enough" means something different per category, so the question changes
 * with it: bedrooms for a home, floor area for a shop, headroom for a godown,
 * slots for parking, decimals for land.
 */
function CapacityCard({
  draft,
  set,
}: {
  draft: SearchRequirements;
  set: <K extends keyof SearchRequirements>(k: K, v: SearchRequirements[K]) => void;
}) {
  const { t } = useI18n();
  const cap = draft.capacity;
  const put = (patch: Partial<SearchRequirements["capacity"]>) => set("capacity", { ...cap, ...patch });

  // Until a category is chosen there is no sensible unit to ask in.
  if (draft.category === "any") return null;

  const CONFIG: Partial<
    Record<
      SpaceCategory,
      {
        label: string;
        key: keyof SearchRequirements["capacity"];
        choices: Array<{ v: number | null; label: string }>;
      }
    >
  > = {
    living: {
      label: t("find.minBedrooms"),
      key: "minBedrooms",
      choices: [
        { v: null, label: t("find.noMinimum") },
        { v: 1, label: "1+" },
        { v: 2, label: "2+" },
        { v: 3, label: "3+" },
        { v: 4, label: "4+" },
      ],
    },
    business: {
      label: t("find.minSize"),
      key: "minSizeSqft",
      choices: [
        { v: null, label: t("find.noMinimum") },
        { v: 200, label: "200+ sqft" },
        { v: 500, label: "500+ sqft" },
        { v: 1000, label: "1,000+ sqft" },
        { v: 2000, label: "2,000+ sqft" },
      ],
    },
    storage: {
      label: t("find.minStorage"),
      key: "minSizeSqft",
      choices: [
        { v: null, label: t("find.noMinimum") },
        { v: 500, label: "500+ sqft" },
        { v: 1000, label: "1,000+ sqft" },
        { v: 2000, label: "2,000+ sqft" },
        { v: 4000, label: "4,000+ sqft" },
      ],
    },
    parking: {
      label: t("find.slotsNeeded"),
      key: "carSlots",
      choices: [
        { v: null, label: t("find.noMinimum") },
        { v: 1, label: "1" },
        { v: 2, label: "2" },
        { v: 3, label: "3+" },
      ],
    },
    land: {
      label: t("find.minLand"),
      key: "minLandDecimal",
      choices: [
        { v: null, label: t("find.noMinimum") },
        { v: 10, label: "10+ decimal" },
        { v: 30, label: "30+ decimal" },
        { v: 60, label: "60+ decimal" },
        { v: 100, label: "100+ decimal" },
      ],
    },
  };

  const config = CONFIG[draft.category];
  if (!config) return null;

  const current = cap[config.key] ?? null;

  return (
    <Card title={config.label} optional>
      <div className="flex flex-wrap gap-2">
        {config.choices.map((choice) => (
          <Chip
            key={String(choice.v)}
            small
            active={current === choice.v}
            onClick={() => put({ [config.key]: choice.v })}
          >
            {choice.label}
          </Chip>
        ))}
      </div>

      {draft.category === "storage" && (
        <>
          <p className="mb-2 mt-5 text-sm font-medium text-ink-soft">{t("find.minCeiling")}</p>
          <div className="flex flex-wrap gap-2">
            {[null, 10, 14, 18].map((v) => (
              <Chip
                key={String(v)}
                small
                active={(cap.minCeilingFt ?? null) === v}
                onClick={() => put({ minCeilingFt: v })}
              >
                {v === null ? t("find.noMinimum") : `${v}+ ft`}
              </Chip>
            ))}
          </div>
        </>
      )}

      {draft.category === "parking" && (
        <>
          <p className="mb-2 mt-5 text-sm font-medium text-ink-soft">{t("find.motorcycleSlots")}</p>
          <div className="flex flex-wrap gap-2">
            {[null, 1, 2, 4].map((v) => (
              <Chip
                key={String(v)}
                small
                active={(cap.motorcycleSlots ?? null) === v}
                onClick={() => put({ motorcycleSlots: v })}
              >
                {v === null ? t("find.noMinimum") : String(v)}
              </Chip>
            ))}
          </div>
        </>
      )}

      <p className="mt-4 text-xs leading-relaxed text-muted">{t("find.capacityNote")}</p>
    </Card>
  );
}

function Card({ title, optional, children }: { title: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-card bg-surface p-5 ring-1 ring-hairline sm:p-6">
      <h2 className="mb-4 font-display text-lg font-bold text-ink">
        {title}
        {optional && <span className="ml-2 text-xs font-medium text-muted">optional</span>}
      </h2>
      {children}
    </section>
  );
}

function Chip({
  active,
  small,
  onClick,
  children,
}: {
  active: boolean;
  small?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold transition-all duration-150",
        small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
        active ? "bg-ink text-ivory" : "bg-ivory-deep text-ink-soft hover:bg-hairline",
      )}
    >
      {children}
    </button>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">৳</span>
        <input
          type="number"
          inputMode="numeric"
          step={500}
          min={0}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-11 w-full rounded-xl bg-ivory pl-7 pr-3 text-[0.9375rem] tnum text-ink ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600"
        />
      </div>
    </label>
  );
}
