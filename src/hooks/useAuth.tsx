import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isRemote } from "@/lib/supabase";
import type { ProfileRow } from "@/lib/supabase";

export type AccountRole = "renter" | "owner" | "admin";

export interface Account {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: AccountRole;
  verification: "unverified" | "pending" | "verified";
  avatarTone: string;
  suspended: boolean;
}

interface AuthState {
  /** False until the initial session check finishes — guards wait on this. */
  ready: boolean;
  configured: boolean;
  session: Session | null;
  account: Account | null;

  signUp: (input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: "renter" | "owner";
  }) => Promise<{ needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (patch: Partial<Pick<Account, "name" | "phone">>) => Promise<void>;
  refreshAccount: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

function toAccount(row: ProfileRow): Account {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    verification: row.verification,
    avatarTone: row.avatar_tone,
    suspended: row.suspended,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!isRemote);
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<Account | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    if (!supabase) return;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    // The profile is created by a database trigger. On the very first sign-in
    // it can lag by a moment, so a miss here isn't an error.
    if (!error && data) setAccount(toAccount(data as ProfileRow));
  }, []);

  useEffect(() => {
    if (!supabase) return;

    void supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) await loadProfile(data.session.user.id);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next?.user) {
        void loadProfile(next.user.id);
      } else {
        setAccount(null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const signUp: AuthState["signUp"] = useCallback(async ({ name, email, password, phone, role }) => {
    if (!supabase) throw new Error("Sign-up needs the database. Add your Supabase keys to .env.");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // The trigger reads these; role is validated server-side and can never
      // be 'admin' no matter what is sent from here.
      options: { data: { name, phone: phone ?? null, role } },
    });

    if (error) throw new Error(error.message);
    return { needsConfirmation: !data.session };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error("Signing in needs the database. Add your Supabase keys to .env.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAccount(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) throw new Error("Password reset needs the database.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account`,
    });
    if (error) throw new Error(error.message);
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<Pick<Account, "name" | "phone">>) => {
      if (!supabase || !account) return;
      const { data, error } = await supabase
        .from("profiles")
        .update({ name: patch.name, phone: patch.phone })
        .eq("id", account.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      setAccount(toAccount(data as ProfileRow));
    },
    [account],
  );

  const refreshAccount = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const value = useMemo<AuthState>(
    () => ({
      ready,
      configured: isRemote,
      session,
      account,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updateProfile,
      refreshAccount,
    }),
    [ready, session, account, signUp, signIn, signOut, resetPassword, updateProfile, refreshAccount],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
