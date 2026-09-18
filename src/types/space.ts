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
  /** Illustration used when the photograph is unavailable or switched off. */
  fallback?: string | null;
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

export type GenderPreference = "any" | "male" | "female";

/**
 * Who a living space is open to. "Bachelor allowed" is the single most-used
 * filter in Dhaka to-let posts, so it belongs in the model rather than buried
 * in a description. Ignored for business, storage, parking and land.
 */
export interface OccupancyRules {
  familyAllowed: boolean;
  bachelorAllowed: boolean;
  studentFriendly: boolean;
  genderPreference: GenderPreference;
  maxOccupants: number | null;
}

export type ListingStatus = "draft" | "published" | "archived";

export interface Space {
  id: string;
  propertyId: string;
  name: string;
  /** Bangla name, where one exists. Seed listings have it; owner-written ones don't. */
  nameBn?: string | null;
  descriptionBn?: string | null;
  /** Archived spaces leave search but keep their conversations. */
  status: ListingStatus;
  category: SpaceCategory;
  spaceType: SpaceType;
  transaction: TransactionType;

  cost: CostBreakdown;
  attributes: SpaceAttributes;
  amenities: AmenityKey[];
  rules: OccupancyRules;
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

/** The one dimension that decides whether a space is big enough for you. */
export interface CapacityNeed {
  /** Living and business: floor area. */
  minSizeSqft?: number | null;
  /** Living: how many bedrooms. */
  minBedrooms?: number | null;
  /** Business: desks an office must seat. */
  minWorkstations?: number | null;
  /** Storage: usable floor area, and headroom for stacking. */
  minCeilingFt?: number | null;
  /** Parking: vehicles to be kept. */
  carSlots?: number | null;
  motorcycleSlots?: number | null;
  /** Land: plot size in decimals. */
  minLandDecimal?: number | null;
}

export interface SearchRequirements {
  transaction: TransactionType;
  category: SpaceCategory | "any";
  spaceType: SpaceType | "any";
  area: string;
  budgetMin: number;
  budgetMax: number;
  /**
   * What "big enough" means, which differs by category. A garage has no square
   * footage worth asking about and a pond has no bedrooms; only the field that
   * applies is ever set.
   */
  capacity: CapacityNeed;
  moveInDate: string;
  amenities: AmenityKey[];
  /** Who is moving in, so listings that exclude them can be filtered out. */
  occupancy: "any" | "family" | "bachelor" | "student";
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

/* ── Bookings ─────────────────────────────────────────────────────── */

export type BookingStatus =
  | "requested"
  | "accepted"
  | "payment-pending"
  | "confirmed"
  | "completed"
  | "rejected"
  | "cancelled"
  | "payment-failed";

export interface Booking {
  id: string;
  spaceId: string;
  spaceName: string;
  spaceImage: string | null;
  area: string | null;
  renterId: string;
  renterName: string;
  ownerId: string;
  ownerName: string;
  status: BookingStatus;
  moveInDate: string;
  months: number;
  amount: number;
  message: string | null;
  /** Only populated once the owner accepts. */
  phoneShared: boolean;
  renterPhone: string | null;
  ownerPhone: string | null;
  declineReason: string | null;
  createdAt: string;
  decidedAt: string | null;
  /** True when the signed-in account is the owner side of this booking. */
  youAreOwner: boolean;
}

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

/* ── Moderation ───────────────────────────────────────────────────── */

export type TrustTier = "unverified" | "phone-verified" | "reviewed" | "id-verified";

/** A listing waiting on a decision, with the reason it surfaced. */
export interface ReviewItem {
  spaceId: string;
  spaceName: string;
  area: string | null;
  ownerId: string;
  ownerName: string;
  ownerTrust: TrustTier;
  completeness: number;
  flaggedDuplicate: boolean;
  hiddenAt: string | null;
  hiddenReason: string | null;
  reportCount: number;
  openReports: number;
  priority: number;
}

/* ── Rent and payments ────────────────────────────────────────────── */

export type InvoiceStatus = "due" | "paid" | "overdue" | "waived" | "cancelled";

export interface RentInvoice {
  id: string;
  bookingId: string;
  spaceId: string;
  spaceName: string;
  area: string | null;
  counterpartName: string;
  youAreOwner: boolean;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  paidAt: string | null;
  receiptNo: string | null;
  /** True when the payment behind it was made in the sandbox, not a gateway. */
  simulated: boolean;
}

/* ── Messaging ────────────────────────────────────────────────────── */

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  sentAt: string;
  readAt: string | null;
  /** True when the signed-in account sent it. */
  mine: boolean;
}

/** A thread, summarised for the conversation list. */
export interface Conversation {
  id: string;
  spaceId: string | null;
  spaceName: string;
  spaceImage: string | null;
  propertyArea: string | null;
  /** The person on the other end, whichever side you're on. */
  counterpartId: string;
  counterpartName: string;
  counterpartTone: string;
  /** Whether you are the owner in this thread. */
  youAreOwner: boolean;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
}

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
