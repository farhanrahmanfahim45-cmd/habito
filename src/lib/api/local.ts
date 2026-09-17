import seed from "@/data/seed.json";
import type { Repository } from "./types";
import type {
  Inquiry,
  InquiryStatus,
  Owner,
  Property,
  Space,
  SpaceListing,
  SpaceRequest,
} from "@/types/space";

/**
 * Local repository — the offline fallback.
 *
 * Used when Supabase credentials aren't configured, so a fresh clone runs with
 * no setup and a missing environment variable degrades instead of breaking.
 * Data lives in this browser only and is never shared between accounts.
 */

const KEY = "habito.db.v2";

/**
 * Changes with the seed file. When a new build ships fresh seed data, returning
 * visitors would otherwise keep the old dataset forever — so we re-seed, while
 * preserving anything the person created themselves.
 */
const SEED_STAMP = `${seed.generatedOn}:${seed.spaces.length}:${seed.properties.length}`;
const LATENCY_MS = 0;

interface Database {
  version: 1;
  seedStamp: string;
  owners: Owner[];
  properties: Property[];
  spaces: Space[];
  inquiries: Inquiry[];
  requests: SpaceRequest[];
  savedIds: string[];
}

/** The signed-in owner in demo mode — the portfolio you can actually edit. */
export const DEMO_OWNER_ID = "OW-001";

function freshDatabase(): Database {
  return {
    version: 1,
    seedStamp: SEED_STAMP,
    owners: seed.owners as unknown as Owner[],
    properties: seed.properties as unknown as Property[],
    spaces: seed.spaces as unknown as Space[],
    inquiries: [],
    requests: [],
    savedIds: [],
  };
}

function read(): Database {
  if (typeof window === "undefined") return freshDatabase();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const fresh = freshDatabase();
      write(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw) as Database;
    if (parsed.version !== 1) throw new Error("schema changed");

    if (parsed.seedStamp !== SEED_STAMP) {
      const merged = freshDatabase();
      // Keep the person's own work; replace the synthetic seed underneath it.
      merged.properties = [...parsed.properties.filter((p) => !p.synthetic), ...merged.properties];
      merged.spaces = [...parsed.spaces.filter((s) => !s.synthetic), ...merged.spaces];
      merged.inquiries = parsed.inquiries ?? [];
      merged.requests = parsed.requests ?? [];
      merged.savedIds = (parsed.savedIds ?? []).filter((id) => merged.spaces.some((s) => s.id === id));
      write(merged);
      return merged;
    }

    return parsed;
  } catch {
    // Corrupt or outdated payload — start clean rather than crash the app.
    const fresh = freshDatabase();
    write(fresh);
    return fresh;
  }
}

function write(db: Database): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    // Quota or private-mode failure: the session keeps working in memory.
    console.warn("Habito: could not persist changes to local storage.");
  }
}

const settle = <T,>(value: T): Promise<T> =>
  LATENCY_MS ? new Promise((r) => setTimeout(() => r(value), LATENCY_MS)) : Promise.resolve(value);

function join(db: Database, space: Space): SpaceListing | null {
  const property = db.properties.find((p) => p.id === space.propertyId);
  if (!property) return null;
  const owner = db.owners.find((o) => o.id === property.ownerId);
  if (!owner) return null;
  return { space, property, owner };
}

function nextId(prefix: string, existing: Array<{ id: string }>): string {
  const max = existing.reduce((m, x) => {
    const n = Number(x.id.split("-")[1]);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(4, "0")}`;
}

export const localRepository: Repository = {
  kind: "local",

  /* ── Reads ──────────────────────────────────────────────────────── */

  async listings(): Promise<SpaceListing[]> {
    const data = read();
    return settle(data.spaces.map((s) => join(data, s)).filter((x): x is SpaceListing => x !== null));
  },

  async listing(spaceId: string): Promise<SpaceListing | null> {
    const data = read();
    const space = data.spaces.find((s) => s.id === spaceId);
    return settle(space ? join(data, space) : null);
  },

  async properties(ownerId?: string): Promise<Property[]> {
    const data = read();
    return settle(ownerId ? data.properties.filter((p) => p.ownerId === ownerId) : data.properties);
  },

  async spacesOfProperty(propertyId: string): Promise<Space[]> {
    const data = read();
    return settle(data.spaces.filter((s) => s.propertyId === propertyId));
  },

  async owner(ownerId: string): Promise<Owner | null> {
    const data = read();
    return settle(data.owners.find((o) => o.id === ownerId) ?? null);
  },

  /* ── Owner writes ───────────────────────────────────────────────── */

  async createProperty(input: Omit<Property, "id" | "createdAt" | "synthetic">): Promise<Property> {
    const data = read();
    const property: Property = {
      ...input,
      id: nextId("PR", data.properties),
      createdAt: new Date().toISOString().slice(0, 10),
      synthetic: false,
    };
    data.properties = [property, ...data.properties];
    write(data);
    return settle(property);
  },

  async createSpace(input: Omit<Space, "id" | "views" | "inquiryCount" | "synthetic">): Promise<Space> {
    const data = read();
    const space: Space = { ...input, id: nextId("SP", data.spaces), views: 0, inquiryCount: 0, synthetic: false };
    data.spaces = [space, ...data.spaces];
    write(data);
    return settle(space);
  },

  async updateSpace(spaceId: string, patch: Partial<Space>): Promise<Space | null> {
    const data = read();
    const index = data.spaces.findIndex((s) => s.id === spaceId);
    if (index === -1) return settle(null);
    const updated: Space = {
      ...data.spaces[index],
      ...patch,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
    data.spaces[index] = updated;
    write(data);
    return settle(updated);
  },

  async deleteSpace(spaceId: string): Promise<void> {
    const data = read();
    data.spaces = data.spaces.filter((s) => s.id !== spaceId);
    write(data);
    return settle(undefined);
  },

  /* ── Seeker writes ──────────────────────────────────────────────── */

  async saved(): Promise<string[]> {
    return settle(read().savedIds);
  },

  async toggleSaved(spaceId: string): Promise<boolean> {
    const data = read();
    const has = data.savedIds.includes(spaceId);
    data.savedIds = has ? data.savedIds.filter((x) => x !== spaceId) : [...data.savedIds, spaceId];
    write(data);
    return settle(!has);
  },

  async inquiries(): Promise<Inquiry[]> {
    return settle(read().inquiries);
  },

  async createInquiry(input: Omit<Inquiry, "id" | "sentAt" | "status">): Promise<Inquiry> {
    const data = read();
    const inquiry: Inquiry = {
      ...input,
      id: nextId("INQ", data.inquiries),
      sentAt: new Date().toISOString(),
      status: "new",
    };
    data.inquiries = [inquiry, ...data.inquiries];

    const index = data.spaces.findIndex((s) => s.id === input.spaceId);
    if (index !== -1) {
      data.spaces[index] = { ...data.spaces[index], inquiryCount: data.spaces[index].inquiryCount + 1 };
    }

    write(data);
    return settle(inquiry);
  },

  async setInquiryStatus(inquiryId: string, status: InquiryStatus): Promise<void> {
    const data = read();
    const index = data.inquiries.findIndex((i) => i.id === inquiryId);
    if (index !== -1) {
      data.inquiries[index] = { ...data.inquiries[index], status };
      write(data);
    }
    return settle(undefined);
  },

  async requests(): Promise<SpaceRequest[]> {
    return settle(read().requests);
  },

  async createRequest(input: Omit<SpaceRequest, "id" | "createdAt">): Promise<SpaceRequest> {
    const data = read();
    const request: SpaceRequest = {
      ...input,
      id: nextId("REQ", data.requests),
      createdAt: new Date().toISOString(),
    };
    data.requests = [request, ...data.requests];
    write(data);
    return settle(request);
  },

  /* ── Maintenance ────────────────────────────────────────────────── */

  async reset(): Promise<void> {
    if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
    read();
    return settle(undefined);
  },
};

export const DATASET_NOTICE = seed._notice;
