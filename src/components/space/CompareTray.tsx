import { Link, useLocation } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import { useHabito } from "@/hooks/useHabito";
import { Button } from "@/components/ui/Button";
import { moneyCompact } from "@/lib/format";

/** Slides up once two or more spaces are selected. Hidden on the compare page itself. */
export function CompareTray() {
  const { compareIds, listings, toggleCompare, clearCompare } = useHabito();
  const { pathname } = useLocation();

  if (pathname.startsWith("/compare") || compareIds.length === 0) return null;

  const selected = listings.filter((l) => compareIds.includes(l.space.id));

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-14 z-40 px-4 pb-3 md:bottom-0 md:pb-5">
      <div className="pointer-events-auto mx-auto flex max-w-3xl items-center gap-3 rounded-2xl bg-ink/95 p-2.5 pl-4 text-ivory shadow-[0_20px_50px_-20px_rgb(16_24_40/0.7)] backdrop-blur rise">
        <p className="hidden text-sm font-semibold sm:block">
          Compare {selected.length}
        </p>

        <ul className="flex flex-1 gap-2 overflow-x-auto hide-scrollbar">
          {selected.map((l) => (
            <li key={l.space.id} className="flex shrink-0 items-center gap-2 rounded-xl bg-white/10 py-1 pl-1 pr-2">
              <img src={l.space.images[0].url} alt="" className="size-8 rounded-lg object-cover" />
              <span className="max-w-28 truncate text-xs font-medium">{l.space.name}</span>
              <span className="text-xs text-ivory/60 tnum">{moneyCompact(l.space.cost.price)}</span>
              <button
                type="button"
                onClick={() => toggleCompare(l.space.id)}
                aria-label={`Remove ${l.space.name} from compare`}
                className="rounded-full p-0.5 text-ivory/60 hover:bg-white/15 hover:text-ivory"
              >
                <X size={13} aria-hidden />
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={clearCompare}
          className="hidden shrink-0 px-2 text-xs font-medium text-ivory/60 hover:text-ivory sm:block"
        >
          Clear
        </button>

        <Link to="/compare" className="shrink-0">
          <Button size="sm" className="bg-aqua-400 text-ink hover:bg-aqua-200">
            Compare
            <ArrowRight size={15} aria-hidden />
          </Button>
        </Link>
      </div>
    </div>
  );
}
