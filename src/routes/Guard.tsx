import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { AccountRole } from "@/hooks/useAuth";

/**
 * Route guard. Typing a URL isn't enough to reach a protected page — and the
 * database refuses the underlying queries anyway, so this is about showing the
 * right screen rather than about security.
 */
export function Guard({ allow, children }: { allow: AccountRole[]; children: ReactNode }) {
  const { ready, configured, account } = useAuth();
  const location = useLocation();

  // Without a database there are no accounts, so guards would lock out the
  // whole owner side of the demo. Let it through and let the local store serve.
  if (!configured) return <>{children}</>;

  if (!ready) {
    return <div className="container-page py-24 text-center text-sm text-muted">Checking your session…</div>;
  }

  if (!account) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  if (account.suspended) {
    return (
      <div className="container-page max-w-md py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">Your account is suspended.</h1>
        <p className="mt-2 text-sm text-muted">Contact support if you think this is a mistake.</p>
      </div>
    );
  }

  if (!allow.includes(account.role)) {
    return (
      <div className="container-page max-w-md py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">That page isn't for this account.</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          You're signed in as a {account.role}. {allow.includes("owner") && "Owner tools need an owner account."}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
