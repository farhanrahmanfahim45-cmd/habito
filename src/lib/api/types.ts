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

  requests(): Promise<SpaceRequest[]>;
  createRequest(input: Omit<SpaceRequest, "id" | "createdAt">): Promise<SpaceRequest>;

  reset(): Promise<void>;
}
