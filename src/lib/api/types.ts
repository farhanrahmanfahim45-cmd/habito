import type {
  Conversation,
  Inquiry,
  InquiryStatus,
  Message,
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
