import { PHOTO_MODE } from "@/data/photos";
import type { Space } from "@/types/space";

/**
 * The name and description to show for a space.
 *
 * Seed listings are generated, so they carry a translation. A listing an owner
 * wrote is shown exactly as they wrote it — machine-translating a person's own
 * words on their behalf would be worse than leaving them in place, and an
 * owner writing in Bangla is the case this product should expect.
 */
export function spaceName(space: Pick<Space, "name" | "nameBn">, language: string): string {
  return language === "bn" && space.nameBn ? space.nameBn : space.name;
}

export function spaceDescription(
  space: Pick<Space, "description" | "descriptionBn">,
  language: string,
): string {
  return language === "bn" && space.descriptionBn ? space.descriptionBn : space.description;
}

/**
 * Which image to show for a listing.
 *
 * Seed listings carry both a photograph and an illustration; which one is used
 * is a single switch in src/data/photos.ts. Anything an owner uploaded is
 * theirs and is shown as-is.
 */
export function displayImage(image: { url: string; fallback?: string | null; demo?: boolean }): string {
  if (!image.demo || !image.fallback) return image.url;
  return PHOTO_MODE === "photo" ? image.url : image.fallback;
}
