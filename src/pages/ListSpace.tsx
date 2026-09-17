import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Plus } from "lucide-react";
import { useHabito } from "@/hooks/useHabito";
import { db } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { CATEGORY_STYLE, TYPES_BY_CATEGORY, AMENITIES, AMENITIES_BY_CATEGORY } from "@/data/catalog";
import { AREAS } from "@/data/areas";
import { SPACE_TYPE_LABEL, CATEGORY_OF_TYPE } from "@/types/space";
import type {
  AmenityKey, AvailabilityStatus, Property, SpaceAttributes, SpaceCategory, SpaceType, TransactionType,
} from "@/types/space";
import { money } from "@/lib/format";
import { cn } from "@/lib/cn";

const CATEGORIES = Object.keys(CATEGORY_STYLE) as SpaceCategory[];
const STEPS = ["What", "Where", "Details", "Included", "Price", "Review"];

/**
 * Guided listing flow. The Details step asks different questions per category —
 * a garage is never asked how many bedrooms it has.
 */
export default function ListSpace() {
  const navigate = useNavigate();
  const { refresh, setRole, ownerId } = useHabito();

  const [step, setStep] = useState(0);
  const [properties, setProperties] = useState<Property[]>([]);
  const [saving, setSaving] = useState(false);

  const [spaceType, setSpaceType] = useState<SpaceType>("apartment");
  const [transaction, setTransaction] = useState<TransactionType>("rent");
  const [propertyId, setPropertyId] = useState<string>("");
  const [newPropertyName, setNewPropertyName] = useState("");
  const [area, setArea] = useState("Mirpur");
  const [neighborhood, setNeighborhood] = useState("");
  const [name, setName] = useState("");
  const [attrs, setAttrs] = useState<SpaceAttributes>({});
  const [amenities, setAmenities] = useState<AmenityKey[]>([]);
  const [price, setPrice] = useState(12000);
  const [serviceCharge, setServiceCharge] = useState<number | "">("");
  const [utilities, setUtilities] = useState<number | "">("");
  const [status, setStatus] = useState<AvailabilityStatus>("available");
  const [availableFrom, setAvailableFrom] = useState(new Date().toISOString().slice(0, 10));

  const category = CATEGORY_OF_TYPE[spaceType];

  useEffect(() => {
    void db.properties(ownerId).then((p) => {
      setProperties(p);
      if (p.length && !propertyId) setPropertyId(p[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  useEffect(() => {
    setAttrs({});
    setAmenities([]);
  }, [category]);

  const setAttr = <K extends keyof SpaceAttributes>(k: K, v: SpaceAttributes[K]) =>
    setAttrs((a) => ({ ...a, [k]: v }));

  const publish = async () => {
    setSaving(true);
    const areaMeta = AREAS.find((a) => a.name === area)!;

    let targetId = propertyId;
    if (propertyId === "__new") {
      const created = await db.createProperty({
        name: newPropertyName.trim() || `${area} property`,
        ownerId,
        area,
        neighborhood: neighborhood.trim() || area,
        address: `${neighborhood.trim() || area}, ${area}`,
        district: areaMeta.district,
        geography: areaMeta.geography,
        latitude: areaMeta.latitude,
        longitude: areaMeta.longitude,
        nearby: [],
        coverImage: `/photos/${category === "land" ? "land-1" : "living-1"}.svg`,
      });
      targetId = created.id;
    }

    const disclosed = serviceCharge !== "" && utilities !== "";
    const label = ["Exterior", "Interior", "Detail"];

    const created = await db.createSpace({
      propertyId: targetId,
      name: name.trim() || SPACE_TYPE_LABEL[spaceType],
      category,
      spaceType,
      transaction,
      cost: {
        price,
        serviceCharge: serviceCharge === "" ? null : Number(serviceCharge),
        utilities: utilities === "" ? null : Number(utilities),
        securityDeposit: null,
        advanceMonths: transaction === "rent" ? 2 : null,
        estimatedMonthly: disclosed ? price + Number(serviceCharge) + Number(utilities) : null,
      },
      attributes: attrs,
      amenities,
      availability: { status, availableFrom },
      images: [0, 1].map((i) => ({
        url: `/photos/${category}-${(i % 2) + 1}.svg`,
        label: label[i],
        alt: `Illustrative placeholder image for ${name || SPACE_TYPE_LABEL[spaceType]}`,
        demo: true as const,
      })),
      description:
        `${SPACE_TYPE_LABEL[spaceType]} in ${neighborhood.trim() || area}. Added through the Habito listing flow.`,
      verification: { demo: true, owner: "identity-submitted", space: "documents-submitted" },
      lastUpdated: new Date().toISOString().slice(0, 10),
    });

    await refresh();
    setRole("owner");
    setSaving(false);
    navigate(`/space/${created.id}`);
  };

  const canAdvance = () => {
    if (step === 1) return propertyId !== "" && (propertyId !== "__new" || newPropertyName.trim().length > 1);
    if (step === 4) return price > 0;
    return true;
  };

  return (
    <>
      <PageHeader
        title="List a space"
        lead="Six steps. What you're asked changes with the kind of space you're listing."
      />

      <div className="container-page max-w-3xl py-8 md:py-10">
        {/* Progress */}
        <ol className="mb-8 flex items-center gap-1.5" aria-label="Progress">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-1.5">
              <div className="flex-1">
                <div
                  className={cn(
                    "h-1 rounded-full transition-colors",
                    i < step ? "bg-ink" : i === step ? "bg-aqua-400" : "bg-hairline",
                  )}
                />
                <span
                  className={cn(
                    "mt-1.5 hidden text-xs font-semibold sm:block",
                    i === step ? "text-ink" : "text-muted",
                  )}
                >
                  {label}
                </span>
              </div>
            </li>
          ))}
        </ol>

        <div className="rounded-card bg-surface p-5 ring-1 ring-hairline sm:p-7">
          {step === 0 && (
            <Step title="What are you offering?">
              <ul className="flex flex-wrap gap-2">
                {CATEGORIES.flatMap((c) => TYPES_BY_CATEGORY[c]).map((t) => (
                  <li key={t}>
                    <Chip active={spaceType === t} onClick={() => setSpaceType(t)}>
                      {SPACE_TYPE_LABEL[t]}
                    </Chip>
                  </li>
                ))}
              </ul>

              <p className="mb-2 mt-6 text-sm font-medium text-ink-soft">Renting it out, or selling?</p>
              <div className="inline-flex rounded-full bg-ivory-deep p-0.5">
                {(["rent", "sale"] as TransactionType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={transaction === t}
                    onClick={() => setTransaction(t)}
                    className={cn(
                      "rounded-full px-5 py-2 text-sm font-bold transition-colors",
                      transaction === t ? "bg-ink text-ivory" : "text-muted hover:text-ink",
                    )}
                  >
                    {t === "rent" ? "Renting" : "Selling"}
                  </button>
                ))}
              </div>
            </Step>
          )}

          {step === 1 && (
            <Step title="Where is it?">
              <p className="mb-2 text-sm font-medium text-ink-soft">Which property is this space in?</p>
              <div className="space-y-2">
                {properties.map((p) => (
                  <label
                    key={p.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-2xl p-3 ring-1 transition-colors",
                      propertyId === p.id ? "bg-aqua-50 ring-aqua-600" : "bg-ivory ring-hairline hover:ring-hairline-strong",
                    )}
                  >
                    <input
                      type="radio"
                      name="property"
                      checked={propertyId === p.id}
                      onChange={() => setPropertyId(p.id)}
                      className="accent-aqua-600"
                    />
                    <img src={p.coverImage} alt="" className="size-10 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{p.name}</p>
                      <p className="truncate text-xs text-muted">
                        {p.neighborhood}, {p.area}
                      </p>
                    </div>
                  </label>
                ))}

                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl p-3 ring-1 transition-colors",
                    propertyId === "__new" ? "bg-aqua-50 ring-aqua-600" : "bg-ivory ring-hairline hover:ring-hairline-strong",
                  )}
                >
                  <input
                    type="radio"
                    name="property"
                    checked={propertyId === "__new"}
                    onChange={() => setPropertyId("__new")}
                    className="accent-aqua-600"
                  />
                  <span className="flex size-10 items-center justify-center rounded-lg bg-ivory-deep text-muted">
                    <Plus size={17} aria-hidden />
                  </span>
                  <span className="font-semibold text-ink">A new property</span>
                </label>
              </div>

              {propertyId === "__new" && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Property name">
                    <input
                      value={newPropertyName}
                      onChange={(e) => setNewPropertyName(e.target.value)}
                      placeholder="e.g. Rahman Villa"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Area">
                    <select value={area} onChange={(e) => setArea(e.target.value)} className={inputClass}>
                      {AREAS.map((a) => (
                        <option key={a.id} value={a.name}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Neighbourhood">
                    <input
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="e.g. Mirpur 10"
                      className={inputClass}
                    />
                  </Field>
                </div>
              )}
            </Step>
          )}

          {step === 2 && (
            <Step title={`About this ${SPACE_TYPE_LABEL[spaceType].toLowerCase()}`}>
              <Field label="Name it">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={placeholderName(spaceType)}
                  className={inputClass}
                />
              </Field>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {fieldsFor(category).map((f) => (
                  <Field key={f.key} label={f.label}>
                    {f.kind === "bool" ? (
                      <label className="flex h-11 items-center gap-2.5 rounded-xl bg-ivory px-3 text-sm ring-1 ring-hairline-strong">
                        <input
                          type="checkbox"
                          checked={Boolean(attrs[f.key])}
                          onChange={(e) => setAttr(f.key, e.target.checked as never)}
                          className="size-4 accent-aqua-600"
                        />
                        Yes
                      </label>
                    ) : f.kind === "text" ? (
                      <input
                        value={(attrs[f.key] as string) ?? ""}
                        onChange={(e) => setAttr(f.key, e.target.value as never)}
                        placeholder={f.placeholder}
                        className={inputClass}
                      />
                    ) : (
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={(attrs[f.key] as number) ?? ""}
                        onChange={(e) => setAttr(f.key, (e.target.value === "" ? undefined : Number(e.target.value)) as never)}
                        placeholder={f.placeholder}
                        className={cn(inputClass, "tnum")}
                      />
                    )}
                  </Field>
                ))}
              </div>
            </Step>
          )}

          {step === 3 && (
            <Step title="What does it include?">
              <ul className="flex flex-wrap gap-2">
                {AMENITIES_BY_CATEGORY[category].map((key) => {
                  const { label, icon: Icon } = AMENITIES[key];
                  const on = amenities.includes(key);
                  return (
                    <li key={key}>
                      <Chip
                        active={on}
                        onClick={() =>
                          setAmenities(on ? amenities.filter((a) => a !== key) : [...amenities, key])
                        }
                      >
                        <Icon size={14} aria-hidden />
                        {label}
                      </Chip>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-xs text-muted">
                Only the options that make sense for a {SPACE_TYPE_LABEL[spaceType].toLowerCase()} are shown.
              </p>
            </Step>
          )}

          {step === 4 && (
            <Step title="Price and availability">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={transaction === "rent" ? "Monthly rent" : "Asking price"}>
                  <MoneyInput value={price} onChange={setPrice} />
                </Field>
                {transaction === "rent" && (
                  <>
                    <Field label="Service charge">
                      <MoneyInput value={serviceCharge} onChange={setServiceCharge} allowEmpty />
                    </Field>
                    <Field label="Utilities">
                      <MoneyInput value={utilities} onChange={setUtilities} allowEmpty />
                    </Field>
                  </>
                )}
                <Field label="Status">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AvailabilityStatus)}
                    className={inputClass}
                  >
                    <option value="available">Available</option>
                    <option value="partially-available">Partly available</option>
                    <option value="available-soon">Available soon</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </Field>
                <Field label="Available from">
                  <input
                    type="date"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              {transaction === "rent" && (
                <p className="mt-4 rounded-xl bg-aqua-50 p-3 text-xs leading-relaxed text-aqua-700">
                  Listing every cost gets your space a total-cost figure on the card and lets it pass
                  the "full cost disclosed" filter. Leaving them blank does the opposite.
                </p>
              )}
            </Step>
          )}

          {step === 5 && (
            <Step title="Review and publish">
              <dl className="divide-y divide-hairline rounded-2xl bg-ivory ring-1 ring-hairline">
                <Review label="Space" value={`${name || SPACE_TYPE_LABEL[spaceType]} · ${SPACE_TYPE_LABEL[spaceType]}`} />
                <Review
                  label="Property"
                  value={
                    propertyId === "__new"
                      ? `${newPropertyName || "New property"} (new) · ${area}`
                      : properties.find((p) => p.id === propertyId)?.name ?? "—"
                  }
                />
                <Review
                  label={transaction === "rent" ? "Rent" : "Price"}
                  value={
                    money(price) +
                    (transaction === "rent" && serviceCharge !== "" && utilities !== ""
                      ? ` · about ${money(price + Number(serviceCharge) + Number(utilities))} all in`
                      : "")
                  }
                />
                <Review label="Availability" value={status.replace("-", " ")} />
                <Review label="Included" value={amenities.length ? amenities.map((a) => AMENITIES[a].label).join(", ") : "Nothing listed"} />
              </dl>

              <p className="mt-4 text-xs leading-relaxed text-muted">
                Placeholder images are attached automatically in this prototype. The space is saved
                on this device and appears immediately in search and in your portfolio.
              </p>
            </Step>
          )}

          {/* Controls */}
          <div className="mt-8 flex items-center gap-3 border-t border-hairline pt-5">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft size={16} aria-hidden />
                Back
              </Button>
            )}
            <span className="ml-auto text-xs tnum text-muted">
              Step {step + 1} of {STEPS.length}
            </span>
            {step < STEPS.length - 1 ? (
              <Button disabled={!canAdvance()} onClick={() => setStep((s) => s + 1)}>
                Continue
                <ArrowRight size={16} aria-hidden />
              </Button>
            ) : (
              <Button disabled={saving} onClick={() => void publish()}>
                <Check size={16} aria-hidden />
                {saving ? "Publishing…" : "Publish space"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Adaptive field sets ──────────────────────────────────────────── */

interface FieldSpec {
  key: keyof SpaceAttributes;
  label: string;
  kind: "number" | "bool" | "text";
  placeholder?: string;
}

function fieldsFor(category: SpaceCategory): FieldSpec[] {
  switch (category) {
    case "living":
      return [
        { key: "bedrooms", label: "Bedrooms", kind: "number", placeholder: "2" },
        { key: "bathrooms", label: "Bathrooms", kind: "number", placeholder: "2" },
        { key: "sizeSqft", label: "Size (sqft)", kind: "number", placeholder: "950" },
        { key: "floor", label: "Floor", kind: "number", placeholder: "3" },
        { key: "balcony", label: "Balcony", kind: "bool" },
        { key: "kitchen", label: "Kitchen", kind: "bool" },
      ];
    case "business":
      return [
        { key: "sizeSqft", label: "Size (sqft)", kind: "number", placeholder: "400" },
        { key: "floor", label: "Floor", kind: "number", placeholder: "0 for ground" },
        { key: "frontageFt", label: "Frontage (ft)", kind: "number", placeholder: "14" },
        { key: "workstations", label: "Workstations", kind: "number", placeholder: "12" },
        { key: "meetingRoom", label: "Meeting room", kind: "bool" },
        { key: "suitableFor", label: "Suits which business", kind: "text", placeholder: "Pharmacy" },
      ];
    case "storage":
      return [
        { key: "sizeSqft", label: "Storage area (sqft)", kind: "number", placeholder: "1200" },
        { key: "ceilingHeightFt", label: "Ceiling height (ft)", kind: "number", placeholder: "14" },
        { key: "loadingAccess", label: "Loading access", kind: "bool" },
        { key: "vehicleAccess", label: "Truck access", kind: "bool" },
        { key: "suitableFor", label: "Suitable goods", kind: "text", placeholder: "Dry goods" },
      ];
    case "parking":
      return [
        { key: "carSlots", label: "Car slots", kind: "number", placeholder: "2" },
        { key: "motorcycleSlots", label: "Motorcycle slots", kind: "number", placeholder: "4" },
        { key: "covered", label: "Covered", kind: "bool" },
        { key: "accessHours", label: "Access hours", kind: "text", placeholder: "24 hours" },
      ];
    case "land":
      return [
        { key: "landAreaDecimal", label: "Land area (decimal)", kind: "number", placeholder: "35" },
        { key: "landUse", label: "Land use", kind: "text", placeholder: "Paddy" },
        { key: "roadAccess", label: "Road access", kind: "bool" },
        { key: "waterSource", label: "Water source", kind: "bool" },
        { key: "leaseYears", label: "Lease length (years)", kind: "number", placeholder: "3" },
      ];
  }
}

function placeholderName(type: SpaceType): string {
  switch (type) {
    case "apartment": return "Flat 3A";
    case "shop": return "Shop 01";
    case "godown": return "Godown 01";
    case "garage": return "Garage";
    case "office": return "Second floor office";
    case "farmland": return "North plot";
    default: return SPACE_TYPE_LABEL[type];
  }
}

/* ── Small pieces ─────────────────────────────────────────────────── */

const inputClass =
  "h-11 w-full rounded-xl bg-ivory px-3 text-[0.9375rem] text-ink ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600";

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-5 font-display text-xl font-bold text-ink">{title}</h2>
      {children}
    </div>
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

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
        active ? "bg-ink text-ivory" : "bg-ivory-deep text-ink-soft hover:bg-hairline",
      )}
    >
      {children}
    </button>
  );
}

function MoneyInput({
  value,
  onChange,
  allowEmpty,
}: {
  value: number | "";
  onChange: (v: never) => void;
  allowEmpty?: boolean;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">৳</span>
      <input
        type="number"
        inputMode="numeric"
        step={500}
        min={0}
        value={value}
        placeholder={allowEmpty ? "Not listed" : undefined}
        onChange={(e) => onChange((e.target.value === "" ? "" : Number(e.target.value)) as never)}
        className={cn(inputClass, "pl-7 tnum")}
      />
    </div>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}
