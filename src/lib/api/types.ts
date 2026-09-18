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
 * The contract every storage backend implements.
 *
 * Components only ever see this interface, which is what let the app move from
 * browser storage to Postgres without a single page being rewritten.
 */
export interface Repository {
  readonly kind: "local" | "supabase";

  listings(): Promise<SpaceListing[]>;
  listing(spaceId: string): Promise<SpaceListing | null>;
  properties(ownerId?: string): Promise<Property[]>;
  spacesOfProperty(propertyId: string): Promise<Space[]>;
  /** One space by id, including archived ones, so the owner can edit it. */
  space(spaceId: string): Promise<Space | null>;
  owner(ownerId: string): Promise<Owner | null>;

  createProperty(input: Omit<Property, "id" | "createdAt" | "synthetic">): Promise<Property>;
  createSpace(input: Omit<Space, "id" | "views" | "inquiryCount" | "synthetic">): Promise<Space>;
  updateSpace(spaceId: string, patch: Partial<Space>): Promise<Space | null>;
  deleteSpace(spaceId: string): Promise<void>;

  saved(): Promise<string[]>;
  toggleSaved(spaceId: string): Promise<boolean>;

  inquiries(): Promise<Inquiry[]>;
  createInquiry(input: Omit<Inquiry, "id" | "sentAt" | "status">): Promise<Inquiry>;
  setInquiryStatus(inquiryId: string, status: InquiryStatus): Promise<void>;

  /* Bookings */
  bookings(): Promise<Booking[]>;
  requestBooking(input: {
    spaceId: string;
    moveInDate: string;
    months: number;
    amount: number;
    message?: string;
  }): Promise<Booking>;
  setBookingStatus(bookingId: string, status: BookingStatus, reason?: string): Promise<void>;

  /* Moderation — admin only; the database refuses everyone else */
  reviewQueue(): Promise<ReviewItem[]>;
  setListingVisible(spaceId: string, visible: boolean, note?: string): Promise<void>;
  setTrust(profileId: string, tier: TrustTier, note: string): Promise<void>;
  resolveReports(spaceId: string, dismiss: boolean, note?: string): Promise<void>;
  clearDuplicate(spaceId: string, note?: string): Promise<void>;

  /* Rent */
  invoices(): Promise<RentInvoice[]>;
  /**
   * Raises a pending payment and settles it.
   *
   * The settling half is what a real gateway would do from a server. Until
   * there is an Edge Function holding the SSLCommerz credentials, this stands
   * in for it and marks the payment as simulated so the two can never be
   * confused.
   */
  payInvoice(invoiceId: string): Promise<void>;
  waiveInvoice(invoiceId: string): Promise<void>;

  /* Messaging */
  conversations(): Promise<Conversation[]>;
  messages(conversationId: string): Promise<Message[]>;
  sendMessage(conversationId: string, body: string): Promise<Message>;
  markRead(conversationId: string): Promise<void>;
  /** Finds or creates the thread between this user and a space's owner. */
  openConversation(spaceId: string): Promise<string>;
  /**
   * Calls back when anything in the user's threads changes. Returns an
   * unsubscribe function. Live where the backend supports it, polled where
   * it doesn't.
   */
  subscribeToMessages(onChange: () => void): () => void;

  requests(): Promise<SpaceRequest[]>;
  createRequest(input: Omit<SpaceRequest, "id" | "createdAt">): Promise<SpaceRequest>;

  reset(): Promise<void>;
}
