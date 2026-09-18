import { useState } from "react";
import { FALLBACK_ART, PHOTO_MODE } from "@/data/photos";
import { useI18n } from "@/i18n";
import type { SpaceCategory } from "@/types/space";
import { cn } from "@/lib/cn";

/**
 * A listing photograph.
 *
 * Three things it handles that a bare <img> does not: a demo band that cannot
 * be scrolled away from, a graceful fall back to illustration when a remote
 * photo fails, and a tinted placeholder while it loads so a slow connection
 * doesn't show a page of white rectangles.
 */
export function SpacePhoto({
  src,
  alt,
  category,
  demo,
  className,
  imgClassName,
  priority,
  bandPosition = "bottom",
}: {
  src: string;
  alt: string;
  category: SpaceCategory;
  /** Seed listings are invented, and their photographs say so. */
  demo?: boolean;
  className?: string;
  imgClassName?: string;
  /** The first image on a page shouldn't wait for the lazy loader. */
  priority?: boolean;
  bandPosition?: "top" | "bottom";
}) {
  const { t } = useI18n();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const source = failed ? FALLBACK_ART[category] : src;

  return (
    <div className={cn("relative overflow-hidden bg-ivory-deep", className)}>
      {/* Holds the space and gives the eye something while the photo arrives. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-ivory-deep to-hairline transition-opacity duration-500",
          loaded ? "opacity-0" : "opacity-100 shimmer",
        )}
      />

      <img
        src={source}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setFailed(true);
          setLoaded(true);
        }}
        className={cn(
          "relative size-full object-cover transition-[opacity,transform] duration-700 ease-out",
          loaded ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
      />

      {/* Only over a photograph. An illustration already reads as one, and the
          card carries a DEMO chip, so a band here just covers the address. */}
      {demo && PHOTO_MODE === "photo" && !failed && (
        <span
          className={cn(
            "pointer-events-none absolute inset-x-0 z-20 bg-ink/65 px-2 py-0.5 text-center text-[0.55rem] font-semibold uppercase tracking-[0.08em] text-ivory/90 backdrop-blur-[2px]",
            bandPosition === "top" ? "top-0" : "bottom-0",
          )}
        >
          {t("photo.illustrative")}
        </span>
      )}
    </div>
  );
}
