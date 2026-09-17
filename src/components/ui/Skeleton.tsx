import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-ivory-deep", className)} aria-hidden />;
}

/** Matches SpaceCard's footprint so grids and rails don't jump while loading. */
export function SpaceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card bg-surface ring-1 ring-hairline">
      <Skeleton className="aspect-4/3 rounded-none" />
      <div className="space-y-2 p-3.5">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-7 w-full" />
      </div>
    </div>
  );
}
