import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { useHabito } from "@/hooks/useHabito";
import { PageHeader } from "@/components/layout/PageHeader";
import { SpaceCard } from "@/components/space/SpaceCard";
import { Button } from "@/components/ui/Button";
import { scoreAll } from "@/lib/matching";
import { useMemo } from "react";

export default function Saved() {
  const { listings, savedIds, toggleSaved, isComparing, toggleCompare, requirements, hasStatedNeeds } = useHabito();
  const saved = listings.filter((l) => savedIds.includes(l.space.id));
  const matches = useMemo(() => scoreAll(saved, requirements), [saved, requirements]);

  return (
    <>
      <PageHeader
        title="Saved spaces"
        lead="Kept on this device, so they're still here when you come back."
        actions={
          saved.length > 1 ? (
            <Link to="/compare">
              <Button>Compare these</Button>
            </Link>
          ) : undefined
        }
      />

      <div className="container-page py-8 md:py-10">
        {saved.length === 0 ? (
          <div className="flex flex-col items-center rounded-card bg-surface px-6 py-16 text-center ring-1 ring-hairline">
            <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-aqua-100 text-aqua-700">
              <Bookmark size={22} aria-hidden />
            </span>
            <h2 className="font-display text-xl font-bold text-ink">Nothing saved yet.</h2>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Tap the bookmark on any space while you browse and it waits for you here.
            </p>
            <Link to="/explore" className="mt-5">
              <Button>Start exploring</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {saved.map((l) => (
              <SpaceCard
                key={l.space.id}
                listing={l}
                matchScore={hasStatedNeeds ? matches.get(l.space.id)?.score : undefined}
                saved
                comparing={isComparing(l.space.id)}
                onToggleSave={(id) => void toggleSaved(id)}
                onToggleCompare={toggleCompare}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
