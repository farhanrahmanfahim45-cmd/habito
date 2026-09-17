import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  AvailabilityStatus,
  Owner,
  Property,
  Space,
  SpaceCategory,
  SpaceType,
  TransactionType,
  Verification,
} from "@/types/space";

/**
 * Habito talks to Supabase for auth, data and storage.
 *
 * If the environment isn't configured the client is null and the app falls
 * back to the local store, so a fresh clone still runs and a missing variable
 * on a deploy degrades instead of showing a white screen.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isRemote = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isRemote
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

/** Throws rather than returning null, so callers don't silently no-op. */
export function client(): SupabaseClient {
  if (!supabase) throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  return supabase;
}

/* ── Row shapes ──────────────────────────────────────────────────────────── */

export interface ProfileRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  avatar_tone: string;
  role: "renter" | "owner" | "admin";
  verification: "unverified" | "pending" | "verified";
  bio: string | null;
  preferred_areas: string[];
  budget_min: number | null;
  budget_max: number | null;
  response_rate: number;
  response_time_hours: number;
  is_seed: boolean;
  suspended: boolean;
  created_at: string;
}

export interface PropertyRow {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  area: string;
  neighborhood: string;
  address: string;
  district: string;
  geography: "urban" | "suburban" | "rural";
  latitude: number | null;
  longitude: number | null;
  nearby: Array<{ label: string; km: number }>;
  cover_image: string | null;
  verification: "unverified" | "pending" | "verified";
  is_seed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpaceRow {
  id: string;
  property_id: string;
  name: string;
  category: SpaceCategory;
  space_type: string;
  transaction: TransactionType;
  status: "draft" | "published" | "archived";
  price: number;
  service_charge: number | null;
  utilities: number | null;
  security_deposit: number | null;
  advance_months: number | null;
  attributes: Record<string, unknown>;
  amenities: string[];
  availability: AvailabilityStatus;
  available_from: string;
  availability_note: string | null;
  total_units: number | null;
  available_units: number | null;
  images: Array<{ url: string; label: string; alt: string; demo?: boolean }>;
  video_url: string | null;
  description: string | null;
  verification: "unverified" | "pending" | "verified";
  views: number;
  is_seed: boolean;
  created_at: string;
  updated_at: string;
}

/* ── Row → domain ────────────────────────────────────────────────────────── */

const OWNER_VERIFICATION = {
  verified: "verified",
  pending: "identity-submitted",
  unverified: "unverified",
} as const;

const SPACE_VERIFICATION = {
  verified: "verified",
  pending: "reviewed",
  unverified: "unverified",
} as const;

export function toOwner(row: ProfileRow): Owner {
  return {
    id: row.id,
    name: row.name,
    role: row.role === "owner" ? "owner" : "owner",
    avatarTone: row.avatar_tone,
    memberSince: row.created_at.slice(0, 10),
    responseRate: row.response_rate,
    responseTimeHours: row.response_time_hours,
    verification: OWNER_VERIFICATION[row.verification],
  };
}

export function toProperty(row: PropertyRow): Property {
  return {
    id: row.id,
    name: row.name,
    ownerId: row.owner_id,
    area: row.area,
    neighborhood: row.neighborhood,
    address: row.address,
    district: row.district,
    geography: row.geography,
    latitude: row.latitude ?? 0,
    longitude: row.longitude ?? 0,
    nearby: row.nearby ?? [],
    coverImage: row.cover_image ?? "/photos/living-1.svg",
    createdAt: row.created_at.slice(0, 10),
    synthetic: row.is_seed,
  };
}

export function toSpace(row: SpaceRow): Space {
  const rental = row.transaction === "rent";
  const disclosed = rental && row.service_charge !== null && row.utilities !== null;

  return {
    id: row.id,
    propertyId: row.property_id,
    name: row.name,
    category: row.category,
    spaceType: row.space_type as SpaceType,
    transaction: row.transaction,
    cost: {
      price: row.price,
      serviceCharge: row.service_charge,
      utilities: row.utilities,
      securityDeposit: row.security_deposit,
      advanceMonths: row.advance_months,
      // Mirrors space_estimated_monthly() in SQL: null unless fully disclosed.
      estimatedMonthly: disclosed ? row.price + row.service_charge! + row.utilities! : null,
    },
    attributes: row.attributes as Space["attributes"],
    amenities: row.amenities as Space["amenities"],
    availability: {
      status: row.availability,
      availableFrom: row.available_from,
      ...(row.availability_note ? { note: row.availability_note } : {}),
      ...(row.total_units !== null ? { totalUnits: row.total_units } : {}),
      ...(row.available_units !== null ? { availableUnits: row.available_units } : {}),
    },
    images: row.images.length
      ? row.images.map((i) => ({ ...i, demo: true as const }))
      : [{ url: "/photos/living-1.svg", label: "Placeholder", alt: "Placeholder image", demo: true as const }],
    description: row.description ?? "",
    verification: {
      demo: true,
      owner: "identity-submitted",
      space: SPACE_VERIFICATION[row.verification],
    } as Verification,
    lastUpdated: row.updated_at.slice(0, 10),
    views: row.views,
    inquiryCount: 0,
    synthetic: row.is_seed,
  };
}

/* ── Domain → row ────────────────────────────────────────────────────────── */

export function propertyInsert(input: Omit<Property, "id" | "createdAt" | "synthetic">) {
  return {
    owner_id: input.ownerId,
    name: input.name,
    area: input.area,
    neighborhood: input.neighborhood,
    address: input.address,
    district: input.district,
    geography: input.geography,
    latitude: input.latitude,
    longitude: input.longitude,
    nearby: input.nearby,
    cover_image: input.coverImage,
  };
}

export function spaceInsert(input: Omit<Space, "id" | "views" | "inquiryCount" | "synthetic">) {
  return {
    property_id: input.propertyId,
    name: input.name,
    category: input.category,
    space_type: input.spaceType,
    transaction: input.transaction,
    status: "published" as const,
    price: input.cost.price,
    service_charge: input.cost.serviceCharge,
    utilities: input.cost.utilities,
    security_deposit: input.cost.securityDeposit,
    advance_months: input.cost.advanceMonths,
    attributes: input.attributes,
    amenities: input.amenities,
    availability: input.availability.status,
    available_from: input.availability.availableFrom,
    availability_note: input.availability.note ?? null,
    images: input.images,
    description: input.description,
  };
}

export function spacePatch(patch: Partial<Space>) {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.amenities !== undefined) row.amenities = patch.amenities;
  if (patch.attributes !== undefined) row.attributes = patch.attributes;
  if (patch.images !== undefined) row.images = patch.images;
  if (patch.transaction !== undefined) row.transaction = patch.transaction;

  if (patch.cost) {
    row.price = patch.cost.price;
    row.service_charge = patch.cost.serviceCharge;
    row.utilities = patch.cost.utilities;
    row.security_deposit = patch.cost.securityDeposit;
    row.advance_months = patch.cost.advanceMonths;
  }

  if (patch.availability) {
    row.availability = patch.availability.status;
    row.available_from = patch.availability.availableFrom;
    row.availability_note = patch.availability.note ?? null;
  }

  return row;
}
