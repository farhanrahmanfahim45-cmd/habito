import seed from "@/data/seed.json";
import type { Repository } from "./types";

/** Listeners for in-tab changes, so the thread view updates as you send. */
const localListeners = new Set<() => void>();
const notifyLocalChange = () => localListeners.forEach((fn) => fn());
import type {
  Booking,
  BookingStatus,
  Conversation,
  Inquiry,
  InquiryStatus,
  Message,
  RentInvoice,
  ReviewItem,

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
  threads: LocalThread[];
  bookings: LocalBooking[];
  invoices: LocalInvoice[];
}

interface LocalInvoice {
  id: string;
  bookingId: string;
  spaceId: string;
  periodStart: string;
  dueDate: string;
  amount: number;
  status: RentInvoice["status"];
  paidAt: string | null;
  receiptNo: string | null;
}

let receiptCounter = 0;

interface LocalBooking {
  id: string;
  spaceId: string;
  status: BookingStatus;
  moveInDate: string;
  months: number;
  amount: number;
  message: string | null;
  phoneShared: boolean;
  createdAt: string;
  decidedAt: string | null;
  declineReason: string | null;
}

/** The same moves the database allows, mirrored so both backends behave alike. */
const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  requested: ["accepted", "rejected", "cancelled"],
  accepted: ["payment-pending", "confirmed", "cancelled"],
  "payment-pending": ["confirmed", "payment-failed", "cancelled"],
  "payment-failed": ["payment-pending", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  rejected: [],
  cancelled: [],
};

/** Local stand-in for conversations + messages. */
interface LocalThread {
  id: string;
  spaceId: string;
  messages: Array<{ id: string; senderId: string; body: string; sentAt: string; readAt: string | null }>;
}

/** The person you are when there is no sign-in. */
const LOCAL_USER_ID = "LOCAL-USER";

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
    threads: [],
    bookings: [],
    invoices: [],
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
      merged.threads = parsed.threads ?? [];
      merged.bookings = parsed.bookings ?? [];
      merged.invoices = parsed.invoices ?? [];
      // Spaces created before occupancy rules existed default to open.
      for (const space of merged.spaces) {
        if (!space.status) space.status = "published";
        if (!space.status) space.status = "published";
        if (!space.rules) {
          space.rules = {
            familyAllowed: true,
            bachelorAllowed: true,
            studentFriendly: true,
            genderPreference: "any",
            maxOccupants: null,
          };
        }
      }
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
    return settle(
      data.spaces
        .filter((s) => s.status !== "archived")
        .map((s) => join(data, s))
        .filter((x): x is SpaceListing => x !== null),
    );
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

  async space(spaceId: string): Promise<Space | null> {
    return settle(read().spaces.find((s) => s.id === spaceId) ?? null);
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
    const space: Space = {
      ...input,
      id: nextId("SP", data.spaces),
      views: 0,
      inquiryCount: 0,
      synthetic: false,
    };
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

    // Mirror the database: an inquiry is the first message of a thread.
    let thread = data.threads.find((t) => t.spaceId === input.spaceId);
    if (!thread) {
      thread = { id: `CONV-${Date.now()}`, spaceId: input.spaceId, messages: [] };
      data.threads.push(thread);
    }
    thread.messages.push({
      id: `MSG-${Date.now()}`,
      senderId: LOCAL_USER_ID,
      body: input.message,
      sentAt: new Date().toISOString(),
      readAt: null,
    });

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

  /* ── Bookings ───────────────────────────────────────────────────── */

  async bookings(): Promise<Booking[]> {
    const data = read();

    return settle(
      data.bookings.map((b) => {
        const space = data.spaces.find((s) => s.id === b.spaceId);
        const property = space ? data.properties.find((p) => p.id === space.propertyId) : undefined;
        const owner = property ? data.owners.find((o) => o.id === property.ownerId) : undefined;

        return {
          id: b.id,
          spaceId: b.spaceId,
          spaceName: space?.name ?? "A space",
          spaceImage: space?.images[0]?.url ?? null,
          area: property?.area ?? null,
          renterId: LOCAL_USER_ID,
          // Without accounts one person plays both sides, so naming the renter
          // "You" produces "with You" and "You's number". Label it as the demo
          // counterpart instead.
          renterName: "Demo renter",
          ownerId: owner?.id ?? "",
          ownerName: owner?.name ?? "Owner",
          status: b.status,
          moveInDate: b.moveInDate,
          months: b.months,
          amount: b.amount,
          message: b.message,
          phoneShared: b.phoneShared,
          renterPhone: b.phoneShared ? "01700000000" : null,
          ownerPhone: b.phoneShared ? "01800000000" : null,
          declineReason: b.declineReason,
          createdAt: b.createdAt,
          decidedAt: b.decidedAt,
          // Without accounts there is one person, who sees both sides.
          youAreOwner: true,
        };
      }),
    );
  },

  async requestBooking(input): Promise<Booking> {
    const data = read();
    const space = data.spaces.find((s) => s.id === input.spaceId);

    if (!space) throw new Error("That space no longer exists.");
    if (space.availability.status === "occupied" || space.availability.status === "maintenance") {
      throw new Error("That space is not available to book.");
    }

    const booking: LocalBooking = {
      id: `BK-${Date.now()}`,
      spaceId: input.spaceId,
      status: "requested",
      moveInDate: input.moveInDate,
      months: input.months,
      amount: input.amount,
      message: input.message ?? null,
      phoneShared: false,
      createdAt: new Date().toISOString(),
      decidedAt: null,
      declineReason: null,
    };

    data.bookings = [booking, ...data.bookings];
    write(data);

    const [made] = await this.bookings();
    return made;
  },

  async setBookingStatus(bookingId: string, status: BookingStatus, reason?: string): Promise<void> {
    const data = read();
    const booking = data.bookings.find((b) => b.id === bookingId);
    if (!booking) return settle(undefined);

    if (!TRANSITIONS[booking.status].includes(status)) {
      throw new Error(`A booking cannot go from ${booking.status} to ${status}.`);
    }

    booking.status = status;
    if (reason !== undefined) booking.declineReason = reason;

    if (status === "accepted") {
      booking.phoneShared = true;
      booking.decidedAt = new Date().toISOString();
    }
    if (status === "rejected") booking.decidedAt = new Date().toISOString();

    // Mirror the database: confirming raises the rent schedule.
    if (status === "confirmed") {
      const start = new Date(booking.moveInDate);
      for (let i = 0; i < Math.max(booking.months, 1); i++) {
        const period = new Date(start.getFullYear(), start.getMonth() + i, start.getDate());
        const iso = period.toISOString().slice(0, 10);
        if (data.invoices.some((x) => x.bookingId === booking.id && x.periodStart === iso)) continue;

        data.invoices.push({
          id: `INV-${booking.id}-${i}`,
          bookingId: booking.id,
          spaceId: booking.spaceId,
          periodStart: iso,
          dueDate: iso,
          amount: booking.amount,
          status: "due",
          paidAt: null,
          receiptNo: null,
        });
      }
    }

    // Mirror the database: a confirmed booking takes the space off the market.
    const space = data.spaces.find((s) => s.id === booking.spaceId);
    if (space) {
      if (status === "confirmed") space.availability = { ...space.availability, status: "occupied" };
      if (status === "completed" || status === "cancelled") {
        space.availability = { ...space.availability, status: "available" };
      }
    }

    write(data);
    return settle(undefined);
  },

  /* ── Moderation ─────────────────────────────────────────────────── */
  // Moderation is meaningless without accounts to moderate. Rather than
  // simulate a queue, this build says so.

  async reviewQueue(): Promise<ReviewItem[]> {
    return settle([]);
  },

  async setListingVisible(): Promise<void> {
    throw new Error("Moderation needs the database. This build has no accounts.");
  },

  async setTrust(): Promise<void> {
    throw new Error("Moderation needs the database. This build has no accounts.");
  },

  async resolveReports(): Promise<void> {
    throw new Error("Moderation needs the database. This build has no accounts.");
  },

  async clearDuplicate(): Promise<void> {
    throw new Error("Moderation needs the database. This build has no accounts.");
  },

  /* ── Listing fees ───────────────────────────────────────────────── */

  async listingFee(category: string): Promise<number> {
    const prices: Record<string, number> = {"living": 200, "business": 500, "storage": 400, "parking": 100, "land": 500};
    return settle(prices[category] ?? 200);
  },

  async listingAllowance(propertyId: string): Promise<{ used: number; hasPlan: boolean }> {
    const data = read();
    const month = new Date().toISOString().slice(0, 7);
    const used = data.spaces.filter(
      (s) => s.propertyId === propertyId && !s.synthetic && (s.publishedAt ?? "").startsWith(month),
    ).length;

    return settle({ used, hasPlan: false });
  },

  async payListingFee(spaceId: string): Promise<void> {
    const data = read();
    const space = data.spaces.find((s) => s.id === spaceId);
    if (space) {
      space.listingFeePaid = true;
      space.publishedAt = new Date().toISOString();
      write(data);
    }
    return settle(undefined);
  },

  async buyPropertyPlan(): Promise<void> {
    return settle(undefined);
  },

  /* ── Rent ───────────────────────────────────────────────────────── */

  async invoices(): Promise<RentInvoice[]> {
    const data = read();
    const today = new Date().toISOString().slice(0, 10);

    return settle(
      data.invoices.map((inv) => {
        const space = data.spaces.find((s) => s.id === inv.spaceId);
        const property = space ? data.properties.find((p) => p.id === space.propertyId) : undefined;
        const owner = property ? data.owners.find((o) => o.id === property.ownerId) : undefined;

        return {
          id: inv.id,
          bookingId: inv.bookingId,
          spaceId: inv.spaceId,
          spaceName: space?.name ?? "A space",
          area: property?.area ?? null,
          counterpartName: owner?.name ?? "Owner",
          youAreOwner: true,
          periodStart: inv.periodStart,
          periodEnd: inv.periodStart,
          dueDate: inv.dueDate,
          // Overdue is a fact about the date, not something stored.
          status: inv.status === "due" && inv.dueDate < today ? "overdue" : inv.status,
          amount: inv.amount,
          paidAt: inv.paidAt,
          receiptNo: inv.receiptNo,
          simulated: true,
        };
      }),
    );
  },

  async payInvoice(invoiceId: string): Promise<void> {
    const data = read();
    const inv = data.invoices.find((i) => i.id === invoiceId);
    if (!inv || inv.status === "paid") return settle(undefined);

    inv.status = "paid";
    inv.paidAt = new Date().toISOString();
    inv.receiptNo = `HAB-${new Date().getFullYear()}-${String(++receiptCounter).padStart(6, "0")}`;
    write(data);
    return settle(undefined);
  },

  async waiveInvoice(invoiceId: string): Promise<void> {
    const data = read();
    const inv = data.invoices.find((i) => i.id === invoiceId);
    if (inv && inv.status !== "paid") inv.status = "waived";
    write(data);
    return settle(undefined);
  },

  async extendSchedule(bookingId: string, months = 12): Promise<void> {
    const data = read();
    const booking = data.bookings.find((b) => b.id === bookingId);
    if (!booking) return settle(undefined);

    // Carry on from the last month already there, so extending twice neither
    // overlaps nor leaves a gap.
    const existing = data.invoices.filter((i) => i.bookingId === bookingId);
    const sorted = existing.map((i) => i.periodStart).sort();
    const lastIso = sorted.length ? sorted[sorted.length - 1] : booking.moveInDate;
    const last = new Date(lastIso);

    for (let i = 1; i <= months; i++) {
      const period = new Date(last.getFullYear(), last.getMonth() + i, last.getDate());
      const iso = period.toISOString().slice(0, 10);
      if (data.invoices.some((x) => x.bookingId === bookingId && x.periodStart === iso)) continue;

      data.invoices.push({
        id: `INV-${bookingId}-${iso}`,
        bookingId,
        spaceId: booking.spaceId,
        periodStart: iso,
        dueDate: iso,
        amount: booking.amount,
        status: "due",
        paidAt: null,
        receiptNo: null,
      });
    }

    write(data);
    return settle(undefined);
  },

  /* ── Messaging ──────────────────────────────────────────────────── */

  async conversations(): Promise<Conversation[]> {
    const data = read();

    return settle(
      data.threads
        .map((thread) => {
          const space = data.spaces.find((s) => s.id === thread.spaceId);
          const property = space ? data.properties.find((p) => p.id === space.propertyId) : undefined;
          const owner = property ? data.owners.find((o) => o.id === property.ownerId) : undefined;
          const last = thread.messages[thread.messages.length - 1];

          return {
            id: thread.id,
            spaceId: thread.spaceId,
            spaceName: space?.name ?? "A space",
            spaceImage: space?.images[0]?.url ?? null,
            propertyArea: property?.area ?? null,
            counterpartId: owner?.id ?? "",
            counterpartName: owner?.name ?? "Owner",
            counterpartTone: owner?.avatarTone ?? "aqua",
            youAreOwner: false,
            lastMessage: last?.body ?? "",
            lastMessageAt: last?.sentAt ?? new Date().toISOString(),
            unread: thread.messages.filter((m) => m.senderId !== LOCAL_USER_ID && !m.readAt).length,
          };
        })
        .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)),
    );
  },

  async messages(conversationId: string): Promise<Message[]> {
    const thread = read().threads.find((t) => t.id === conversationId);
    if (!thread) return settle([]);

    return settle(
      thread.messages.map((m) => ({
        id: m.id,
        conversationId,
        senderId: m.senderId,
        body: m.body,
        sentAt: m.sentAt,
        readAt: m.readAt,
        mine: m.senderId === LOCAL_USER_ID,
      })),
    );
  },

  async sendMessage(conversationId: string, body: string): Promise<Message> {
    const data = read();
    const thread = data.threads.find((t) => t.id === conversationId);
    if (!thread) throw new Error("That conversation no longer exists.");

    const message = {
      id: `MSG-${Date.now()}`,
      senderId: LOCAL_USER_ID,
      body,
      sentAt: new Date().toISOString(),
      readAt: null,
    };

    thread.messages.push(message);
    write(data);
    notifyLocalChange();

    return settle({ ...message, conversationId, mine: true });
  },

  async markRead(conversationId: string): Promise<void> {
    const data = read();
    const thread = data.threads.find((t) => t.id === conversationId);
    if (!thread) return settle(undefined);

    const now = new Date().toISOString();
    for (const m of thread.messages) {
      if (m.senderId !== LOCAL_USER_ID && !m.readAt) m.readAt = now;
    }

    write(data);
    return settle(undefined);
  },

  async openConversation(spaceId: string): Promise<string> {
    const data = read();
    const existing = data.threads.find((t) => t.spaceId === spaceId);
    if (existing) return settle(existing.id);

    const thread: LocalThread = { id: `CONV-${Date.now()}`, spaceId, messages: [] };
    data.threads.push(thread);
    write(data);

    return settle(thread.id);
  },

  subscribeToMessages(onChange: () => void): () => void {
    // Nothing else can write to this browser's store, so the only changes
    // worth reporting are the ones this tab makes.
    localListeners.add(onChange);
    return () => localListeners.delete(onChange);
  },

  /* ── Maintenance ────────────────────────────────────────────────── */

  async reset(): Promise<void> {
    if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
    read();
    return settle(undefined);
  },
};

export const DATASET_NOTICE = seed._notice;
