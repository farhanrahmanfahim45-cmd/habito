/**
 * HABITO — domain model.
 *
 * The central change from the previous version: a listing is no longer a flat
 * "property". A PROPERTY is a physical asset an owner holds. A SPACE is a
 * rentable or sellable unit inside it. One building can hold flats, a shop,
 * a godown and a garage, and the owner manages all of them in one portfolio.
 */

export type TransactionType = "rent" | "sale";

/** Top-level grouping used for discovery. */
export type SpaceCategory = "living" | "business" | "storage" | "parking" | "land";

/** The concrete kind of space. Drives which attributes and form fields apply. */
export type SpaceType =
  | "apartment"
  | "room"
  | "shared-room"
  | "sublet"
  | "house"
  | "tin-shed"
  | "shop"
  | "office"
  | "godown"
  | "garage"
  | "parking-slot"
  | "farmland"
  | "pond"
  | "homestead";

export type Geography = "urban" | "suburban" | "rural";

export type AvailabilityStatus =
  | "available"
  | "partially-available"
  | "available-soon"
  | "occupied"
  | "maintenance";

export type Furnishing = "furnished" | "semi-furnished" | "unfurnished";

export type AmenityKey =
  | "lift"
  | "wifi"
  | "gas"
  | "generator"
  | "parking"
  | "balcony"
  | "attached-bathroom"
  | "furnished"
  | "water-reserve"
  | "security"
  | "cctv"
  | "rooftop"
  | "ac"
  | "shutter"
  | "loading-access"
  | "road-access"
  | "electricity"
  | "water-source"
  | "covered"
  | "ev-charging";

/* ── Trust ────────────────────────────────────────────────────────── */

export type OwnerVerificationState = "unverified" | "identity-submitted" | "verified";
export type SpaceVerificationState =
  | "unverified"
  | "documents-submitted"
  | "reviewed"
  | "verified";

/**
 * Every verification record carries `demo: true`. Habito does not perform real
 * identity or ownership checks; the prototype demonstrates the workflow only.
 */
export interface Verification {
  demo: true;
  owner: OwnerVerificationState;
  space: SpaceVerificationState;
  checkedOn?: string;
}

export interface Owner {
  id: string;
  name: string;
  role: "owner" | "caretaker" | "agent";
  avatarTone: string;
  memberSince: string;
  responseRate: number;
  responseTimeHours: number;
  verification: OwnerVerificationState;
}

export interface SpaceImage {
  url: string;
  label: string;
  alt: string;
  demo: true;
}

export interface CostBreakdown {
  /** Monthly rent, or the asking price when transaction is "sale". */
  price: number;
  serviceCharge: number | null;
  utilities: number | null;
  securityDeposit: number | null;
  advanceMonths: number | null;
  /** null when the owner has not disclosed every component. */
  estimatedMonthly: number | null;
}

/**
 * Category-specific detail. Only the block matching the space's category is
 * populated, so the UI never renders an empty "bedrooms" row for a garage.
 */
export interface SpaceAttributes {
  sizeSqft?: number;
  floor?: number;

  // living
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: Furnishing;
  kitchen?: boolean;
  balcony?: boolean;

  // business — shop / office
  frontageFt?: number;
  workstations?: number;
  meetingRoom?: boolean;
  suitableFor?: string;

  // storage — godown
  ceilingHeightFt?: number;
  loadingAccess?: boolean;
  vehicleAccess?: boolean;

  // parking
  carSlots?: number;
  motorcycleSlots?: number;
  covered?: boolean;
  accessHours?: string;

  // land / rural
  landAreaDecimal?: number;
  landUse?: string;
  roadAccess?: boolean;
  waterSource?: boolean;
  leaseYears?: number;
}

/** How much of a space is free — a garage is rarely simply "available". */
export interface AvailabilityDetail {
  status: AvailabilityStatus;
  availableFrom: string;
  /** Human-readable specifics, e.g. "1 car slot · 2 motorcycle slots free". */
  note?: string;
  totalUnits?: number;
  availableUnits?: number;
}

export interface Space {
  id: string;
  propertyId: string;
  name: string;
  category: SpaceCategory;
  spaceType: SpaceType;
  transaction: TransactionType;

  cost: CostBreakdown;
  attributes: SpaceAttributes;
  amenities: AmenityKey[];
  availability: AvailabilityDetail;

  images: SpaceImage[];
  description: string;

  verification: Verification;
  lastUpdated: string;
  views: number;
  inquiryCount: number;

  /** Seed records are synthetic. Owner-created records are not. */
  synthetic: boolean;
}

export interface Property {
  id: string;
  name: string;
  ownerId: string;
  area: string;
  neighborhood: string;
  address: string;
  district: string;
  geography: Geography;
  latitude: number;
  longitude: number;
  nearby: Array<{ label: string; km: number }>;
  coverImage: string;
  createdAt: string;
  synthetic: boolean;
}

/** A space joined to its property and owner — what the UI actually renders. */
export interface SpaceListing {
  space: Space;
  property: Property;
  owner: Owner;
}

/* ── Matching ─────────────────────────────────────────────────────── */

export type MatchFactorKey =
  | "budget"
  | "location"
  | "spaceType"
  | "availability"
  | "size"
  | "amenities";

export interface MatchFactor {
  key: MatchFactorKey;
  label: string;
  weight: number;
  score: number;
  verdict: "met" | "partial" | "missed";
  detail: string;
}

export interface MatchResult {
  spaceId: string;
  score: number;
  factors: MatchFactor[];
}

export interface SearchRequirements {
  transaction: TransactionType;
  category: SpaceCategory | "any";
  spaceType: SpaceType | "any";
  area: string;
  budgetMin: number;
  budgetMax: number;
  minSizeSqft: number | null;
  moveInDate: string;
  amenities: AmenityKey[];
}

/* ── Demand side ──────────────────────────────────────────────────── */

export interface SpaceRequest {
  id: string;
  category: SpaceCategory | "any";
  spaceType: SpaceType | "any";
  transaction: TransactionType;
  area: string;
  budgetMin: number;
  budgetMax: number;
  neededBy: string;
  note: string;
  createdAt: string;
}

export type InquiryStatus = "new" | "contacted" | "interested" | "closed";

export interface Inquiry {
  id: string;
  spaceId: string;
  name: string;
  message: string;
  moveInDate: string;
  budgetMin: number;
  budgetMax: number;
  sentAt: string;
  status: InquiryStatus;
}

export type DemoRole = "seeker" | "owner";

/* ── Labels ───────────────────────────────────────────────────────── */

export const CATEGORY_LABEL: Record<SpaceCategory, string> = {
  living: "Living",
  business: "Business",
  storage: "Storage",
  parking: "Parking",
  land: "Land & rural",
};

export const SPACE_TYPE_LABEL: Record<SpaceType, string> = {
  apartment: "Apartment",
  room: "Room",
  "shared-room": "Shared room",
  sublet: "Sublet",
  house: "House",
  "tin-shed": "Tin-shed house",
  shop: "Shop",
  office: "Office",
  godown: "Godown",
  garage: "Garage",
  "parking-slot": "Parking slot",
  farmland: "Farmland",
  pond: "Pond / fishery",
  homestead: "Homestead",
};

export const CATEGORY_OF_TYPE: Record<SpaceType, SpaceCategory> = {
  apartment: "living",
  room: "living",
  "shared-room": "living",
  sublet: "living",
  house: "living",
  "tin-shed": "living",
  shop: "business",
  office: "business",
  godown: "storage",
  garage: "parking",
  "parking-slot": "parking",
  farmland: "land",
  pond: "land",
  homestead: "land",
};

export const AVAILABILITY_LABEL: Record<AvailabilityStatus, string> = {
  available: "Available",
  "partially-available": "Partly available",
  "available-soon": "Available soon",
  occupied: "Occupied",
  maintenance: "Maintenance",
};
