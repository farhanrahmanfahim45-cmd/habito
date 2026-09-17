import { client, toOwner, toProperty, toSpace, propertyInsert, spaceInsert, spacePatch } from "@/lib/supabase";
import type { ProfileRow, PropertyRow, SpaceRow } from "@/lib/supabase";
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
 * Postgres-backed repository.
 *
 * Reads are public; every write is authorised by row-level security in the
 * database rather than by checks in this file. If a signed-out visitor calls a
 * write, Postgres rejects it — the frontend cannot grant itself permission.
 */

const SPACE_COLUMNS = "*";
const PROPERTY_COLUMNS = "*";

function fail(context: string, error: { message: string } | null): never {
  throw new Error(`${context}: ${error?.message ?? "unknown error"}`);
}

async function currentUserId(): Promise<string | null> {
  const { data } = await client().auth.getUser();
  return data.user?.id ?? null;
}

/** Requires a signed-in user for actions that are meaningless without one. */
async function requireUser(action: string): Promise<string> {
  const id = await currentUserId();
  if (!id) throw new Error(`You need to be signed in to ${action}.`);
  return id;
}

/** Joins spaces to their property and owner in one round trip. */
async function loadListings(filter?: { spaceId?: string }): Promise<SpaceListing[]> {
  let query = client()
    .from("spaces")
    .select(`${SPACE_COLUMNS}, properties!inner(${PROPERTY_COLUMNS}, profiles!inner(*))`)
    .eq("status", "published");

  if (filter?.spaceId) query = query.eq("id", filter.spaceId);

  const { data, error } = await query;
  if (error) fail("Could not load listings", error);

  return (data ?? []).map((row) => {
    const { properties, ...spaceRow } = row as SpaceRow & {
      properties: PropertyRow & { profiles: ProfileRow };
    };
    const { profiles, ...propertyRow } = properties;
    return {
      space: toSpace(spaceRow as SpaceRow),
      property: toProperty(propertyRow as PropertyRow),
      owner: toOwner(profiles),
    };
  });
}

export const supabaseRepository: Repository = {
  kind: "supabase",

  /* ── Reads ────────────────────────────────────────────────────────────── */

  async listings(): Promise<SpaceListing[]> {
    return loadListings();
  },

  async listing(spaceId: string): Promise<SpaceListing | null> {
    const [found] = await loadListings({ spaceId });
    return found ?? null;
  },

  async properties(ownerId?: string): Promise<Property[]> {
    let query = client().from("properties").select(PROPERTY_COLUMNS).order("created_at", { ascending: false });
    if (ownerId) query = query.eq("owner_id", ownerId);

    const { data, error } = await query;
    if (error) fail("Could not load properties", error);
    return (data as PropertyRow[]).map(toProperty);
  },

  async spacesOfProperty(propertyId: string): Promise<Space[]> {
    const { data, error } = await client()
      .from("spaces")
      .select(SPACE_COLUMNS)
      .eq("property_id", propertyId)
      .order("created_at", { ascending: true });

    if (error) fail("Could not load spaces", error);
    return (data as SpaceRow[]).map(toSpace);
  },

  async owner(ownerId: string): Promise<Owner | null> {
    const { data, error } = await client().from("profiles").select("*").eq("id", ownerId).maybeSingle();
    if (error) fail("Could not load owner", error);
    return data ? toOwner(data as ProfileRow) : null;
  },

  /* ── Owner writes ─────────────────────────────────────────────────────── */

  async createProperty(input): Promise<Property> {
    const userId = await requireUser("add a property");
    const { data, error } = await client()
      .from("properties")
      .insert({ ...propertyInsert(input), owner_id: userId })
      .select()
      .single();

    if (error) fail("Could not create the property", error);
    return toProperty(data as PropertyRow);
  },

  async createSpace(input): Promise<Space> {
    await requireUser("add a space");
    const { data, error } = await client().from("spaces").insert(spaceInsert(input)).select().single();
    if (error) fail("Could not create the space", error);
    return toSpace(data as SpaceRow);
  },

  async updateSpace(spaceId: string, patch: Partial<Space>): Promise<Space | null> {
    await requireUser("edit a space");
    const { data, error } = await client()
      .from("spaces")
      .update(spacePatch(patch))
      .eq("id", spaceId)
      .select()
      .maybeSingle();

    if (error) fail("Could not update the space", error);
    return data ? toSpace(data as SpaceRow) : null;
  },

  async deleteSpace(spaceId: string): Promise<void> {
    await requireUser("remove a space");
    const { error } = await client().from("spaces").delete().eq("id", spaceId);
    if (error) fail("Could not remove the space", error);
  },

  /* ── Favourites ───────────────────────────────────────────────────────── */

  async saved(): Promise<string[]> {
    const userId = await currentUserId();
    if (!userId) return [];

    const { data, error } = await client().from("favorites").select("space_id").eq("user_id", userId);
    if (error) fail("Could not load saved spaces", error);
    return (data ?? []).map((r) => (r as { space_id: string }).space_id);
  },

  async toggleSaved(spaceId: string): Promise<boolean> {
    const userId = await requireUser("save a space");

    const { data: existing } = await client()
      .from("favorites")
      .select("space_id")
      .eq("user_id", userId)
      .eq("space_id", spaceId)
      .maybeSingle();

    if (existing) {
      const { error } = await client()
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("space_id", spaceId);
      if (error) fail("Could not remove from saved", error);
      return false;
    }

    const { error } = await client().from("favorites").insert({ user_id: userId, space_id: spaceId });
    if (error) fail("Could not save this space", error);
    return true;
  },

  /* ── Inquiries ────────────────────────────────────────────────────────── */
  // Backed by conversations + messages, so the same rows become the chat
  // thread when messaging lands in the next stage.

  async inquiries(): Promise<Inquiry[]> {
    const userId = await currentUserId();
    if (!userId) return [];

    const { data, error } = await client()
      .from("conversations")
      .select("id, space_id, renter_id, created_at, messages(id, body, created_at, sender_id), profiles!conversations_renter_id_fkey(name)")
      .order("last_message_at", { ascending: false });

    if (error) fail("Could not load inquiries", error);

    return (data ?? []).flatMap((row) => {
      const conv = row as unknown as {
        id: string;
        space_id: string | null;
        renter_id: string;
        created_at: string;
        messages: Array<{ id: string; body: string; created_at: string; sender_id: string }>;
        profiles: { name: string } | Array<{ name: string }> | null;
      };
      const first = [...conv.messages].sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
      if (!first || !conv.space_id) return [];

      // PostgREST returns an embedded row as an object or a one-element array
      // depending on the relationship it infers; handle both.
      const profile = Array.isArray(conv.profiles) ? conv.profiles[0] : conv.profiles;

      return [{
        id: conv.id,
        spaceId: conv.space_id,
        name: profile?.name ?? "Habito user",
        message: first.body,
        moveInDate: conv.created_at.slice(0, 10),
        budgetMin: 0,
        budgetMax: 0,
        sentAt: first.created_at,
        status: "new" as InquiryStatus,
      }];
    });
  },

  async createInquiry(input): Promise<Inquiry> {
    const userId = await requireUser("send an inquiry");

    const { data: space, error: spaceError } = await client()
      .from("spaces")
      .select("id, properties!inner(owner_id)")
      .eq("id", input.spaceId)
      .single();

    if (spaceError) fail("Could not find that space", spaceError);
    const ownerId = (space as unknown as { properties: { owner_id: string } }).properties.owner_id;

    // One thread per person per space — a second inquiry continues it.
    const { data: conversation, error: convError } = await client()
      .from("conversations")
      .upsert(
        { space_id: input.spaceId, renter_id: userId, owner_id: ownerId, last_message_at: new Date().toISOString() },
        { onConflict: "space_id,renter_id,owner_id" },
      )
      .select()
      .single();

    if (convError) fail("Could not start the conversation", convError);

    const { data: message, error: msgError } = await client()
      .from("messages")
      .insert({ conversation_id: (conversation as { id: string }).id, sender_id: userId, body: input.message })
      .select()
      .single();

    if (msgError) fail("Could not send the message", msgError);

    await client().from("notifications").insert({
      user_id: ownerId,
      kind: "message",
      title: "New inquiry",
      body: input.message.slice(0, 140),
      entity_type: "space",
      entity_id: input.spaceId,
    });

    return {
      ...input,
      id: (message as { id: string }).id,
      sentAt: (message as { created_at: string }).created_at,
      status: "new",
    };
  },

  async setInquiryStatus(inquiryId: string, _status: InquiryStatus): Promise<void> {
    // Inquiry state moves onto the booking record in the next stage; for now
    // opening a thread simply marks its messages read.
    const userId = await currentUserId();
    if (!userId) return;

    await client()
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", inquiryId)
      .neq("sender_id", userId)
      .is("read_at", null);
  },

  /* ── Space requests ───────────────────────────────────────────────────── */

  async requests(): Promise<SpaceRequest[]> {
    const { data, error } = await client()
      .from("space_requests")
      .select("*")
      .eq("open", true)
      .order("created_at", { ascending: false });

    if (error) fail("Could not load requests", error);

    return (data ?? []).map((row) => {
      const r = row as Record<string, string & number>;
      return {
        id: r.id,
        category: r.category as SpaceRequest["category"],
        spaceType: r.space_type as SpaceRequest["spaceType"],
        transaction: r.transaction as SpaceRequest["transaction"],
        area: r.area,
        budgetMin: Number(r.budget_min),
        budgetMax: Number(r.budget_max),
        neededBy: r.needed_by,
        note: r.note ?? "",
        createdAt: r.created_at,
      };
    });
  },

  async createRequest(input): Promise<SpaceRequest> {
    const userId = await requireUser("post a request");

    const { data, error } = await client()
      .from("space_requests")
      .insert({
        user_id: userId,
        category: input.category,
        space_type: input.spaceType,
        transaction: input.transaction,
        area: input.area,
        budget_min: input.budgetMin,
        budget_max: input.budgetMax,
        needed_by: input.neededBy,
        note: input.note,
      })
      .select()
      .single();

    if (error) fail("Could not post the request", error);
    return { ...input, id: (data as { id: string }).id, createdAt: (data as { created_at: string }).created_at };
  },

  /* ── Maintenance ──────────────────────────────────────────────────────── */

  async reset(): Promise<void> {
    // Nothing to reset against a shared database. Seed data is restored by
    // replaying supabase/seed.sql, which is a deliberate admin action.
    throw new Error("Resetting isn't available when Habito is connected to the database.");
  },
};
