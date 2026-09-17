import {
  ArrowUpDown, Wifi, Flame, Zap, Car, Trees, ShowerHead, Sofa, Droplets,
  ShieldCheck, Cctv, Building2, Snowflake, PanelTop, Forklift, Route,
  Plug, Waves, Umbrella, BatteryCharging, Home, Store, Warehouse, Sprout,
  type LucideIcon,
} from "lucide-react";
import type { AmenityKey, SpaceCategory, SpaceType } from "@/types/space";

export const AMENITIES: Record<AmenityKey, { label: string; icon: LucideIcon }> = {
  lift: { label: "Lift", icon: ArrowUpDown },
  wifi: { label: "Wi-Fi ready", icon: Wifi },
  gas: { label: "Gas line", icon: Flame },
  generator: { label: "Generator", icon: Zap },
  parking: { label: "Parking", icon: Car },
  balcony: { label: "Balcony", icon: Trees },
  "attached-bathroom": { label: "Attached bathroom", icon: ShowerHead },
  furnished: { label: "Furnished", icon: Sofa },
  "water-reserve": { label: "Water reserve", icon: Droplets },
  security: { label: "Security guard", icon: ShieldCheck },
  cctv: { label: "CCTV", icon: Cctv },
  rooftop: { label: "Rooftop access", icon: Building2 },
  ac: { label: "Air conditioning", icon: Snowflake },
  shutter: { label: "Roller shutter", icon: PanelTop },
  "loading-access": { label: "Loading access", icon: Forklift },
  "road-access": { label: "Road access", icon: Route },
  electricity: { label: "Electricity", icon: Plug },
  "water-source": { label: "Water source", icon: Waves },
  covered: { label: "Covered", icon: Umbrella },
  "ev-charging": { label: "EV charging", icon: BatteryCharging },
};

export const AMENITY_KEYS = Object.keys(AMENITIES) as AmenityKey[];

/** Which amenities make sense to offer for each category's listing form. */
export const AMENITIES_BY_CATEGORY: Record<SpaceCategory, AmenityKey[]> = {
  living: ["lift", "gas", "generator", "parking", "balcony", "attached-bathroom", "water-reserve", "security", "wifi", "cctv", "rooftop", "furnished"],
  business: ["ac", "shutter", "generator", "parking", "security", "cctv", "lift", "wifi", "electricity"],
  storage: ["loading-access", "electricity", "security", "cctv", "generator", "road-access"],
  parking: ["covered", "security", "cctv", "ev-charging", "electricity"],
  land: ["road-access", "electricity", "water-source", "security"],
};

/** Category presentation. One accent each, used small — chips, dots, icons. */
export const CATEGORY_STYLE: Record<
  SpaceCategory,
  { label: string; blurb: string; icon: LucideIcon; chip: string; dot: string }
> = {
  living: { label: "Living", blurb: "Flats, rooms, sublets and homes", icon: Home, chip: "bg-mint/45 text-mint-ink", dot: "bg-mint-ink" },
  business: { label: "Business", blurb: "Shops and offices", icon: Store, chip: "bg-lilac/45 text-lilac-ink", dot: "bg-lilac-ink" },
  storage: { label: "Storage", blurb: "Godowns and warehouses", icon: Warehouse, chip: "bg-sun/45 text-sun-ink", dot: "bg-sun-ink" },
  parking: { label: "Parking", blurb: "Garages and single slots", icon: Car, chip: "bg-aqua-100 text-aqua-700", dot: "bg-aqua-700" },
  land: { label: "Land & rural", blurb: "Farmland, ponds and homesteads", icon: Sprout, chip: "bg-coral/35 text-coral-ink", dot: "bg-coral-ink" },
};

export const TYPES_BY_CATEGORY: Record<SpaceCategory, SpaceType[]> = {
  living: ["apartment", "room", "shared-room", "sublet", "house", "tin-shed"],
  business: ["shop", "office"],
  storage: ["godown"],
  parking: ["garage", "parking-slot"],
  land: ["farmland", "pond", "homestead"],
};
