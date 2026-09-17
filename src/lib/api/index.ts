import { isRemote } from "@/lib/supabase";
import { localRepository, DEMO_OWNER_ID } from "./local";
import { supabaseRepository } from "./supabase";
import type { Repository } from "./types";

/**
 * One place decides where data lives. Everything else imports `db` and stays
 * unaware of which backend answered.
 */
export const db: Repository = isRemote ? supabaseRepository : localRepository;

export const usingDatabase = isRemote;
export { DEMO_OWNER_ID };
export type { Repository };
