import type { RealtimeChannel } from "@supabase/supabase-js";
import { client, toOwner, toProperty, toSpace, propertyInsert, spaceInsert, spacePatch } from "@/lib/supabase";
import type { ProfileRow, PropertyRow, SpaceRow } from "@/lib/supabase";
import type { Repository } from "./types";
import type {
  Booking,
  BookingStatus,
  Conversation,
  Inquiry,
  InquiryStatus,
  Message,
  RentInvoice,
  ReviewItem,
  TrustTier,
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

/** Makes each realtime channel name unique across the app's subscribers. */
let channelSeq = 0;

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
    .select(
      // Named explicitly: property_managers adds a second properties→profiles
      // path, and PostgREST will not guess between them.
      `${SPACE_COLUMNS}, properties!inner(${PROPERTY_COLUMNS}, profiles!properties_owner_id_fkey!inner(*))`,
    )
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
    // No status filter: the portfolio shows archived spaces too, which is the
    // only place they should still be visible.
    const { data, error } = await client()
      .from("spaces")
      .select(SPACE_COLUMNS)
      .eq("property_id", propertyId)
      .order("created_at", { ascending: true });

    if (error) fail("Could not load spaces", error);
    return (data as SpaceRow[]).map(toSpace);
  },

  async space(spaceId: string): Promise<Space | null> {
    const { data, error } = await client()
      .from("spaces")
      .select(SPACE_COLUMNS)
      .eq("id", spaceId)
      .maybeSingle();

    if (error) fail("Could not load that space", error);
    return data ? toSpace(data as SpaceRow) : null;
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

  /* ── Bookings ─────────────────────────────────────────────────────── */

  async bookings(): Promise<Booking[]> {
    const userId = await currentUserId();
    if (!userId) return [];

    // Row-level security already limits this to bookings you are part of.
    const { data, error } = await client()
      .from("bookings")
      .select(`
        *,
        spaces ( id, name, images, properties ( area ) ),
        renter:profiles!bookings_renter_id_fkey ( id, name ),
        owner:profiles!bookings_owner_id_fkey ( id, name )
      `)
      .order("created_at", { ascending: false });

    if (error) fail("Could not load your bookings", error);

    return (data ?? []).map((row) => {
      const b = row as unknown as {
        id: string; space_id: string; renter_id: string; owner_id: string;
        status: BookingStatus; move_in_date: string; months: number; amount: number;
        message: string | null; phone_shared: boolean;
        renter_phone: string | null; owner_phone: string | null;
        decline_reason: string | null; created_at: string; decided_at: string | null;
        spaces: { name: string; images: Array<{ url: string }>; properties: { area: string } | null } | null;
        renter: { id: string; name: string } | null;
        owner: { id: string; name: string } | null;
      };

      return {
        id: b.id,
        spaceId: b.space_id,
        spaceName: b.spaces?.name ?? "A space",
        spaceImage: b.spaces?.images?.[0]?.url ?? null,
        area: b.spaces?.properties?.area ?? null,
        renterId: b.renter_id,
        renterName: b.renter?.name ?? "Habito user",
        ownerId: b.owner_id,
        ownerName: b.owner?.name ?? "Owner",
        status: b.status,
        moveInDate: b.move_in_date,
        months: b.months,
        amount: b.amount,
        message: b.message,
        phoneShared: b.phone_shared,
        renterPhone: b.renter_phone,
        ownerPhone: b.owner_phone,
        declineReason: b.decline_reason,
        createdAt: b.created_at,
        decidedAt: b.decided_at,
        youAreOwner: b.owner_id === userId,
      };
    });
  },

  async requestBooking(input): Promise<Booking> {
    const userId = await requireUser("request a booking");

    // owner_id is overwritten by a trigger from the property, so what the
    // client sends here cannot be used to misattribute a booking.
    const { data, error } = await client()
      .from("bookings")
      .insert({
        space_id: input.spaceId,
        renter_id: userId,
        owner_id: userId,
        move_in_date: input.moveInDate,
        months: input.months,
        amount: input.amount,
        message: input.message ?? null,
      })
      .select()
      .single();

    if (error) fail("Could not request this booking", error);

    const row = data as { id: string; created_at: string; status: BookingStatus };
    return {
      id: row.id,
      spaceId: input.spaceId,
      spaceName: "",
      spaceImage: null,
      area: null,
      renterId: userId,
      renterName: "",
      ownerId: "",
      ownerName: "",
      status: row.status,
      moveInDate: input.moveInDate,
      months: input.months,
      amount: input.amount,
      message: input.message ?? null,
      phoneShared: false,
      renterPhone: null,
      ownerPhone: null,
      declineReason: null,
      createdAt: row.created_at,
      decidedAt: null,
      youAreOwner: false,
    };
  },

  async setBookingStatus(bookingId: string, status: BookingStatus, reason?: string): Promise<void> {
    await requireUser("change a booking");

    const patch: Record<string, unknown> = { status };
    if (reason !== undefined) patch.decline_reason = reason;

    // Legal moves, permissions and the phone reveal are all decided by the
    // database trigger; a rejection here is a real rejection.
    const { error } = await client().from("bookings").update(patch).eq("id", bookingId);
    if (error) fail("Could not update this booking", error);
  },

  /* ── Moderation ───────────────────────────────────────────────────── */

  async reviewQueue(): Promise<ReviewItem[]> {
    const { data, error } = await client()
      .from("review_queue")
      .select("*")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) fail("Could not load the review queue", error);

    return (data ?? []).map((row) => {
      const r = row as {
        space_id: string; space_name: string; area: string | null;
        owner_id: string; owner_name: string; owner_trust: TrustTier;
        completeness: number; flagged_duplicate: boolean;
        hidden_at: string | null; hidden_reason: string | null;
        report_count: number; open_reports: number; priority: number;
      };

      return {
        spaceId: r.space_id,
        spaceName: r.space_name,
        area: r.area,
        ownerId: r.owner_id,
        ownerName: r.owner_name,
        ownerTrust: r.owner_trust,
        completeness: r.completeness,
        flaggedDuplicate: r.flagged_duplicate,
        hiddenAt: r.hidden_at,
        hiddenReason: r.hidden_reason,
        reportCount: Number(r.report_count),
        openReports: Number(r.open_reports),
        priority: r.priority,
      };
    });
  },

  async setListingVisible(spaceId: string, visible: boolean, note?: string): Promise<void> {
    // Every one of these writes its own audit row inside the function, so the
    // record cannot be skipped by a client that forgets to write it.
    const { error } = await client().rpc("admin_set_listing_visible", {
      target: spaceId,
      visible,
      why: note ?? null,
    });
    if (error) fail("Could not change that listing", error);
  },

  async setTrust(profileId: string, tier: TrustTier, note: string): Promise<void> {
    const { error } = await client().rpc("admin_set_trust", {
      target: profileId,
      tier,
      why: note,
    });
    if (error) fail("Could not set that trust level", error);
  },

  async resolveReports(spaceId: string, dismiss: boolean, note?: string): Promise<void> {
    const { error } = await client().rpc("admin_resolve_reports", {
      target: spaceId,
      dismiss,
      why: note ?? null,
    });
    if (error) fail("Could not resolve those reports", error);
  },

  async clearDuplicate(spaceId: string, note?: string): Promise<void> {
    const { error } = await client().rpc("admin_clear_duplicate", {
      target: spaceId,
      why: note ?? null,
    });
    if (error) fail("Could not clear that flag", error);
  },

  /* ── Listing fees ─────────────────────────────────────────────────── */

  async listingFee(category: string): Promise<number> {
    const { data } = await client()
      .from("listing_prices")
      .select("amount")
      .eq("category", category)
      .maybeSingle();

    return (data as { amount: number } | null)?.amount ?? 200;
  },

  async listingAllowance(propertyId: string): Promise<{ used: number; hasPlan: boolean }> {
    const [{ data: used }, { data: plan }] = await Promise.all([
      client().rpc("listings_this_month", { target: propertyId }),
      client().rpc("property_has_plan", { target: propertyId }),
    ]);

    return { used: Number(used ?? 0), hasPlan: Boolean(plan) };
  },

  async payListingFee(spaceId: string, amount: number): Promise<void> {
    const userId = await requireUser("pay a listing fee");

    const { data, error } = await client()
      .from("payments")
      .insert({
        user_id: userId,
        amount,
        kind: "listing",
        space_id: spaceId,
        gateway: "sandbox",
        status: "pending",
        simulated: true,
      })
      .select("id")
      .single();

    if (error) fail("Could not start that payment", error);

    // Stands in for the gateway callback, exactly as the rent sandbox did.
    const { error: settleError } = await client()
      .from("payments")
      .update({ status: "successful", reference: `SANDBOX-${Date.now()}` })
      .eq("id", (data as { id: string }).id);

    if (settleError) fail("That payment did not go through", settleError);
  },

  async buyPropertyPlan(propertyId: string, amount: number): Promise<void> {
    const userId = await requireUser("buy a plan");

    const ends = new Date();
    ends.setFullYear(ends.getFullYear() + 1);

    const { data, error } = await client()
      .from("property_plans")
      .insert({
        property_id: propertyId,
        owner_id: userId,
        ends_on: ends.toISOString().slice(0, 10),
        amount,
      })
      .select("id")
      .single();

    if (error) fail("Could not start that plan", error);

    const { data: payment } = await client()
      .from("payments")
      .insert({
        user_id: userId,
        amount,
        kind: "plan",
        plan_id: (data as { id: string }).id,
        gateway: "sandbox",
        status: "pending",
        simulated: true,
      })
      .select("id")
      .single();

    if (payment) {
      await client()
        .from("payments")
        .update({ status: "successful", reference: `SANDBOX-${Date.now()}` })
        .eq("id", (payment as { id: string }).id);
    }
  },

  /* ── Rent ─────────────────────────────────────────────────────────── */

  async invoices(): Promise<RentInvoice[]> {
    const userId = await currentUserId();
    if (!userId) return [];

    // Sweep overdue first so what you see is current rather than yesterday's.
    await client().rpc("mark_overdue_invoices");

    const { data, error } = await client()
      .from("rent_invoices")
      .select(`
        *,
        spaces ( name, properties ( area ) ),
        renter:profiles!rent_invoices_renter_id_fkey ( name ),
        owner:profiles!rent_invoices_owner_id_fkey ( name ),
        payments ( simulated )
      `)
      .order("due_date", { ascending: true });

    if (error) fail("Could not load your rent", error);

    return (data ?? []).map((row) => {
      const r = row as unknown as {
        id: string; booking_id: string; space_id: string; renter_id: string; owner_id: string;
        period_start: string; period_end: string; due_date: string; amount: number;
        status: RentInvoice["status"]; paid_at: string | null; receipt_no: string | null;
        spaces: { name: string; properties: { area: string } | null } | null;
        renter: { name: string } | null;
        owner: { name: string } | null;
        payments: { simulated: boolean } | null;
      };

      const youAreOwner = r.owner_id === userId;
      return {
        id: r.id,
        bookingId: r.booking_id,
        spaceId: r.space_id,
        spaceName: r.spaces?.name ?? "A space",
        area: r.spaces?.properties?.area ?? null,
        counterpartName: (youAreOwner ? r.renter?.name : r.owner?.name) ?? "Habito user",
        youAreOwner,
        periodStart: r.period_start,
        periodEnd: r.period_end,
        dueDate: r.due_date,
        amount: r.amount,
        status: r.status,
        paidAt: r.paid_at,
        receiptNo: r.receipt_no,
        simulated: r.payments?.simulated ?? false,
      };
    });
  },

  async payInvoice(invoiceId: string): Promise<void> {
    const userId = await requireUser("pay rent");

    const { data: invoice, error: readError } = await client()
      .from("rent_invoices")
      .select("id, booking_id, amount, status")
      .eq("id", invoiceId)
      .single();

    if (readError) fail("Could not find that invoice", readError);
    const inv = invoice as { booking_id: string; amount: number; status: string };
    if (inv.status === "paid") return;

    // Raised as pending — the database refuses any other starting status.
    const { data: payment, error: insertError } = await client()
      .from("payments")
      .insert({
        booking_id: inv.booking_id,
        user_id: userId,
        amount: inv.amount,
        invoice_id: invoiceId,
        kind: "rent",
        gateway: "sandbox",
        status: "pending",
        simulated: true,
      })
      .select("id")
      .single();

    if (insertError) fail("Could not start that payment", insertError);

    // Stands in for the gateway callback. A real integration replaces exactly
    // this step and nothing else.
    const { error: settleError } = await client()
      .from("payments")
      .update({ status: "successful", reference: `SANDBOX-${Date.now()}` })
      .eq("id", (payment as { id: string }).id);

    if (settleError) fail("That payment did not go through", settleError);
  },

  async waiveInvoice(invoiceId: string): Promise<void> {
    await requireUser("waive rent");
    const { error } = await client()
      .from("rent_invoices")
      .update({ status: "waived" })
      .eq("id", invoiceId);
    if (error) fail("Could not waive that month", error);
  },

  async extendSchedule(bookingId: string, months = 12): Promise<void> {
    await requireUser("extend a rent schedule");
    const { error } = await client().rpc("extend_rent_schedule", {
      target_booking: bookingId,
      add_months: months,
    });
    if (error) fail("Could not extend that schedule", error);
  },

  /* ── Messaging ────────────────────────────────────────────────────── */

  async conversations(): Promise<Conversation[]> {
    const userId = await currentUserId();
    if (!userId) return [];

    // Row-level security already limits this to threads you belong to, so
    // there is no need to filter by user here.
    const { data, error } = await client()
      .from("conversations")
      .select(`
        id, space_id, renter_id, owner_id, last_message_at,
        spaces ( id, name, images, properties ( area ) ),
        renter:profiles!conversations_renter_id_fkey ( id, name, avatar_tone ),
        owner:profiles!conversations_owner_id_fkey ( id, name, avatar_tone ),
        messages ( id, body, sender_id, read_at, created_at )
      `)
      .order("last_message_at", { ascending: false });

    if (error) fail("Could not load your messages", error);

    return (data ?? []).map((row) => {
      const c = row as unknown as {
        id: string;
        space_id: string | null;
        renter_id: string;
        owner_id: string;
        last_message_at: string;
        spaces: { name: string; images: Array<{ url: string }>; properties: { area: string } | null } | null;
        renter: { id: string; name: string; avatar_tone: string } | null;
        owner: { id: string; name: string; avatar_tone: string } | null;
        messages: Array<{ id: string; body: string; sender_id: string; read_at: string | null; created_at: string }>;
      };

      const youAreOwner = c.owner_id === userId;
      const other = youAreOwner ? c.renter : c.owner;
      const ordered = [...c.messages].sort((a, b) => a.created_at.localeCompare(b.created_at));
      const last = ordered[ordered.length - 1];

      return {
        id: c.id,
        spaceId: c.space_id,
        spaceName: c.spaces?.name ?? "A space",
        spaceImage: c.spaces?.images?.[0]?.url ?? null,
        propertyArea: c.spaces?.properties?.area ?? null,
        counterpartId: other?.id ?? "",
        counterpartName: other?.name ?? "Habito user",
        counterpartTone: other?.avatar_tone ?? "aqua",
        youAreOwner,
        lastMessage: last?.body ?? "",
        lastMessageAt: last?.created_at ?? c.last_message_at,
        unread: ordered.filter((m) => m.sender_id !== userId && !m.read_at).length,
      };
    });
  },

  async messages(conversationId: string): Promise<Message[]> {
    const userId = await currentUserId();

    const { data, error } = await client()
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) fail("Could not load the conversation", error);

    return (data ?? []).map((row) => {
      const m = row as { id: string; sender_id: string; body: string; created_at: string; read_at: string | null };
      return {
        id: m.id,
        conversationId,
        senderId: m.sender_id,
        body: m.body,
        sentAt: m.created_at,
        readAt: m.read_at,
        mine: m.sender_id === userId,
      };
    });
  },

  async sendMessage(conversationId: string, body: string): Promise<Message> {
    const userId = await requireUser("send a message");

    const { data, error } = await client()
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: userId, body })
      .select()
      .single();

    if (error) fail("Could not send your message", error);

    // Keeps the conversation list ordered by recency.
    await client()
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    const m = data as { id: string; created_at: string };
    return { id: m.id, conversationId, senderId: userId, body, sentAt: m.created_at, readAt: null, mine: true };
  },

  async markRead(conversationId: string): Promise<void> {
    const userId = await currentUserId();
    if (!userId) return;

    await client()
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .is("read_at", null);
  },

  async openConversation(spaceId: string): Promise<string> {
    const userId = await requireUser("start a conversation");

    const { data: space, error: spaceError } = await client()
      .from("spaces")
      .select("id, properties!inner(owner_id)")
      .eq("id", spaceId)
      .single();

    if (spaceError) fail("Could not find that space", spaceError);
    const ownerId = (space as unknown as { properties: { owner_id: string } }).properties.owner_id;

    if (ownerId === userId) throw new Error("That's your own listing.");

    const { data, error } = await client()
      .from("conversations")
      .upsert(
        { space_id: spaceId, renter_id: userId, owner_id: ownerId, last_message_at: new Date().toISOString() },
        { onConflict: "space_id,renter_id,owner_id" },
      )
      .select("id")
      .single();

    if (error) fail("Could not open the conversation", error);
    return (data as { id: string }).id;
  },

  subscribeToMessages(onChange: () => void): () => void {
    // Several parts of the app subscribe at once — the unread badge, the
    // conversation list, the open thread. Asking for the same channel name
    // twice returns the already-subscribed instance, which then refuses new
    // callbacks, so every subscriber gets its own channel.
    const name = `habito-messages-${++channelSeq}`;

    // A poll keeps messages arriving even if realtime isn't enabled on the
    // tables or the socket drops. Set up first so it survives a live failure.
    const poll = window.setInterval(onChange, 20000);

    let channel: RealtimeChannel | null = null;
    try {
      channel = client()
        .channel(name)
        .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => onChange())
        .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => onChange())
        .subscribe();
    } catch (error) {
      // Live updates are a convenience, never a requirement. Falling back to
      // the poll is far better than taking the page down.
      console.warn("Habito: live updates unavailable, polling instead.", error);
    }

    return () => {
      window.clearInterval(poll);
      if (channel) void client().removeChannel(channel);
    };
  },


  /* ── Maintenance ──────────────────────────────────────────────────────── */

  async reset(): Promise<void> {
    // Nothing to reset against a shared database. Seed data is restored by
    // replaying supabase/seed.sql, which is a deliberate admin action.
    throw new Error("Resetting isn't available when Habito is connected to the database.");
  },
};
