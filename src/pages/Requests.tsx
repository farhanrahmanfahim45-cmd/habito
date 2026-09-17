import { useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import { useHabito } from "@/hooks/useHabito";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CATEGORY_STYLE } from "@/data/catalog";
import { AREAS } from "@/data/areas";
import { money, longDate } from "@/lib/format";
import { CATEGORY_LABEL } from "@/types/space";
import type { SpaceCategory, TransactionType } from "@/types/space";
import { cn } from "@/lib/cn";

const inputClass =
  "h-11 w-full rounded-xl bg-ivory px-3 text-[0.9375rem] text-ink ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600";

/**
 * The demand side. Supply is listings; this is people saying what they need,
 * which owners can then answer.
 */
export default function Requests() {
  const { requests, addRequest, requirements, role } = useHabito();
  const [open, setOpen] = useState(false);

  const [category, setCategory] = useState<SpaceCategory | "any">(requirements.category);
  const [transaction, setTransaction] = useState<TransactionType>("rent");
  const [area, setArea] = useState(requirements.area);
  const [budgetMin, setBudgetMin] = useState(requirements.budgetMin);
  const [budgetMax, setBudgetMax] = useState(requirements.budgetMax);
  const [neededBy, setNeededBy] = useState(requirements.moveInDate);
  const [note, setNote] = useState("");

  const submit = async () => {
    await addRequest({
      category,
      spaceType: "any",
      transaction,
      area,
      budgetMin,
      budgetMax,
      neededBy,
      note: note.trim(),
    });
    setOpen(false);
    setNote("");
  };

  return (
    <>
      <PageHeader
        title={role === "owner" ? "What people are asking for" : "Request a space"}
        lead={
          role === "owner"
            ? "Open requests from people who haven't found what they need. If you have something close, you already know their budget."
            : "Can't find it? Post what you need and let owners come to you."
        }
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} aria-hidden />
            Post a request
          </Button>
        }
      />

      <div className="container-page py-8 md:py-10">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center rounded-card bg-surface px-6 py-16 text-center ring-1 ring-hairline">
            <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-lilac/50 text-lilac-ink">
              <Megaphone size={22} aria-hidden />
            </span>
            <h2 className="font-display text-xl font-bold text-ink">No open requests.</h2>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Post one and it appears here for owners to answer. Requests are stored on this device.
            </p>
            <Button className="mt-5" onClick={() => setOpen(true)}>
              Post a request
            </Button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {requests.map((r) => {
              const style = r.category === "any" ? null : CATEGORY_STYLE[r.category];
              return (
                <li key={r.id} className="rounded-card bg-surface p-5 ring-1 ring-hairline">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        style ? style.chip : "bg-ivory-deep text-ink-soft",
                      )}
                    >
                      {r.category === "any" ? "Any space" : CATEGORY_LABEL[r.category]}
                    </span>
                    <span className="rounded-full bg-ivory-deep px-2.5 py-1 text-xs font-semibold capitalize text-ink-soft">
                      {r.transaction === "rent" ? "Renting" : "Buying"}
                    </span>
                  </div>

                  <p className="mt-3 font-display text-lg font-bold text-ink">{r.area}</p>
                  <p className="text-sm tnum text-ink-soft">
                    {money(r.budgetMin)} – {money(r.budgetMax)}
                  </p>
                  <p className="mt-1 text-sm text-muted">Needed by {longDate(r.neededBy)}</p>

                  {r.note && <p className="mt-3 text-sm leading-relaxed text-ink-soft">{r.note}</p>}

                  {role === "owner" && (
                    <Button size="sm" variant="secondary" className="mt-4" onClick={() => alert("Replying to requests is part of the next build.")}>
                      I have something
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Post a request"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button fullWidth onClick={() => void submit()}>
              Post
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">What kind of space</span>
            <select value={category} onChange={(e) => setCategory(e.target.value as SpaceCategory | "any")} className={inputClass}>
              <option value="any">Anything</option>
              {(Object.keys(CATEGORY_STYLE) as SpaceCategory[]).map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Renting or buying</span>
            <select value={transaction} onChange={(e) => setTransaction(e.target.value as TransactionType)} className={inputClass}>
              <option value="rent">Renting</option>
              <option value="sale">Buying</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Where</span>
            <select value={area} onChange={(e) => setArea(e.target.value)} className={inputClass}>
              {AREAS.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-soft">Budget from</span>
              <input type="number" step={500} value={budgetMin} onChange={(e) => setBudgetMin(Number(e.target.value))} className={cn(inputClass, "tnum")} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-soft">Up to</span>
              <input type="number" step={500} value={budgetMax} onChange={(e) => setBudgetMax(Number(e.target.value))} className={cn(inputClass, "tnum")} />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Needed by</span>
            <input type="date" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} className={inputClass} />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Anything else</span>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. ground floor preferred, near the main road"
              className="w-full rounded-xl bg-ivory p-3 text-[0.9375rem] ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600"
            />
          </label>
        </div>
      </Modal>
    </>
  );
}
