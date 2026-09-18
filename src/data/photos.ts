import type { SpaceCategory } from "@/types/space";

/**
 * Photographs for the demo listings.
 *
 * Why these are here and not baked into the seed generator: swapping in a
 * curated set should be editing one file, not regenerating a dataset.
 *
 * ## Replacing these with your own
 *
 * Pick photographs on Unsplash, open each one, and take the id from the
 * address bar — the `photo-1234567890123-abcdef` part. Then:
 *
 *   `https://images.unsplash.com/photo-<id>?w=1200&q=70&fit=crop&auto=format`
 *
 * Paste those in below. Unsplash asks that you hotlink their URLs rather than
 * re-hosting the files, which is what this does.
 *
 * The placeholders below are Lorem Picsum, which always resolves — so nothing
 * is ever a broken image while you choose real ones. They are generic photos
 * rather than property photos, which is exactly why every one of them carries
 * the "not this property" band.
 *
 * ## The band is not decoration
 *
 * These listings are invented. A photograph of a real building on an invented
 * listing is the thing an evaluator would rightly call misleading, so every
 * seed photo is labelled, permanently, in both languages. Do not remove it
 * while the listings are synthetic.
 */

/**
 * Which source the demo listings use.
 *
 * "illustration" is the default and the right answer until real photographs
 * are curated. A random stock photo — the placeholder service returns
 * landscapes and objects, not rooms — reads worse than a clean illustration
 * and makes a property app look careless.
 *
 * Switch to "photo" once the URLs below are real property photographs. The
 * "not this property" band applies either way while the listings are
 * synthetic.
 */
export const PHOTO_MODE: "illustration" | "photo" = "illustration";

const picsum = (seed: string) => `https://picsum.photos/seed/${seed}/1200/800`;

/** Four photographs per category, so a page of results isn't four of the same. */
export const SEED_PHOTOS: Record<SpaceCategory, string[]> = {
  living: [
    picsum("habito-living-a"),
    picsum("habito-living-b"),
    picsum("habito-living-c"),
    picsum("habito-living-d"),
  ],
  business: [
    picsum("habito-business-a"),
    picsum("habito-business-b"),
    picsum("habito-business-c"),
    picsum("habito-business-d"),
  ],
  storage: [
    picsum("habito-storage-a"),
    picsum("habito-storage-b"),
    picsum("habito-storage-c"),
    picsum("habito-storage-d"),
  ],
  parking: [
    picsum("habito-parking-a"),
    picsum("habito-parking-b"),
    picsum("habito-parking-c"),
    picsum("habito-parking-d"),
  ],
  land: [
    picsum("habito-land-a"),
    picsum("habito-land-b"),
    picsum("habito-land-c"),
    picsum("habito-land-d"),
  ],
};

/** Stable choice per space, so a listing keeps the same photo between visits. */
export function seedPhotos(category: SpaceCategory, spaceId: string, count = 3): string[] {
  const pool = SEED_PHOTOS[category];
  let hash = 0;
  for (let i = 0; i < spaceId.length; i++) hash = (hash * 31 + spaceId.charCodeAt(i)) >>> 0;

  return Array.from({ length: Math.min(count, pool.length) }, (_, i) => pool[(hash + i) % pool.length]);
}

/** The illustration each category falls back to when a photo won't load. */
export const FALLBACK_ART: Record<SpaceCategory, string> = {
  living: "/photos/living-1.svg",
  business: "/photos/business-1.svg",
  storage: "/photos/storage-1.svg",
  parking: "/photos/parking-1.svg",
  land: "/photos/land-1.svg",
};
