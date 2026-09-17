import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Home, Store, AlertCircle, MailCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Mode = "signin" | "signup";

const inputClass =
  "h-11 w-full rounded-xl bg-ivory px-3 text-[0.9375rem] text-ink ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600";

export default function Auth({ initial = "signin" }: { initial?: Mode }) {
  const { account, configured, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<Mode>(initial);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"renter" | "owner">("renter");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from;

  if (account) return <Navigate to={from ?? (account.role === "owner" ? "/portfolio" : "/explore")} replace />;

  const submit = async () => {
    setError(null);
    setNotice(null);

    if (!email.trim() || password.length < 6) {
      setError("Enter your email and a password of at least 6 characters.");
      return;
    }
    if (mode === "signup" && name.trim().length < 2) {
      setError("Tell us your name so owners know who's asking.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
        navigate(from ?? "/explore", { replace: true });
      } else {
        const { needsConfirmation } = await signUp({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          role,
        });

        if (needsConfirmation) {
          setNotice("Check your email for a confirmation link, then sign in.");
          setMode("signin");
        } else {
          navigate(role === "owner" ? "/portfolio" : "/explore", { replace: true });
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!email.trim()) {
      setError("Enter your email first, then tap reset.");
      return;
    }
    try {
      await resetPassword(email.trim());
      setNotice("If that email has an account, a reset link is on its way.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the reset link.");
    }
  };

  return (
    <div className="container-page max-w-md py-12 md:py-16">
      <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
        {mode === "signin" ? "Welcome back." : "Create your account."}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {mode === "signin"
          ? "Sign in to reach your saved spaces, inquiries and listings."
          : "One account, whichever side of Habito you're on."}
      </p>

      {!configured && (
        <p className="mt-5 flex gap-2.5 rounded-card bg-warn-100 p-4 text-sm leading-relaxed text-warn-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            Habito isn't connected to a database in this build, so accounts can't be created. Browsing
            still works and your activity is kept in this browser.
          </span>
        </p>
      )}

      <div className="mt-7 space-y-4">
        {mode === "signup" && (
          <>
            <Field label="Your name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Farhana Akter"
                className={inputClass}
              />
            </Field>

            <Field label="What brings you here?">
              <div className="grid grid-cols-2 gap-2">
                <RoleOption
                  active={role === "renter"}
                  onClick={() => setRole("renter")}
                  icon={Home}
                  title="I need a space"
                  body="Search, save and enquire"
                />
                <RoleOption
                  active={role === "owner"}
                  onClick={() => setRole("owner")}
                  icon={Store}
                  title="I have a space"
                  body="List and manage it"
                />
              </div>
            </Field>
          </>
        )}

        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </Field>

        {mode === "signup" && (
          <Field label="Phone" optional>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              inputMode="tel"
              placeholder="01XXXXXXXXX"
              className={inputClass}
            />
          </Field>
        )}

        <Field label="Password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder="At least 6 characters"
            className={inputClass}
          />
        </Field>

        {error && (
          <p className="flex gap-2 rounded-xl bg-danger-100 p-3 text-sm text-danger-600">
            <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden />
            {error}
          </p>
        )}

        {notice && (
          <p className="flex gap-2 rounded-xl bg-ok-100 p-3 text-sm text-ok-600">
            <MailCheck size={15} className="mt-0.5 shrink-0" aria-hidden />
            {notice}
          </p>
        )}

        <Button size="lg" fullWidth disabled={busy || !configured} onClick={() => void submit()}>
          {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
          <ArrowRight size={17} aria-hidden />
        </Button>

        {mode === "signin" && configured && (
          <button
            type="button"
            onClick={() => void forgot()}
            className="w-full text-center text-xs font-semibold text-muted hover:text-ink"
          >
            Forgot your password?
          </button>
        )}
      </div>

      <p className="mt-8 border-t border-hairline pt-5 text-center text-sm text-muted">
        {mode === "signin" ? "No account yet?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setNotice(null);
          }}
          className="font-semibold text-aqua-700 hover:underline"
        >
          {mode === "signin" ? "Create one" : "Sign in"}
        </button>
      </p>

      <p className="mt-4 text-center text-xs text-muted">
        Just looking?{" "}
        <Link to="/explore" className="font-semibold hover:text-ink">
          Browse without an account
        </Link>
      </p>
    </div>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label}
        {optional && <span className="ml-1.5 text-xs text-muted">optional</span>}
      </span>
      {children}
    </label>
  );
}

function RoleOption({
  active,
  onClick,
  icon: Icon,
  title,
  body,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Home;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-2xl p-3.5 text-left ring-1 transition-colors",
        active ? "bg-aqua-50 ring-aqua-600" : "bg-ivory ring-hairline hover:ring-hairline-strong",
      )}
    >
      <Icon size={18} className={active ? "text-aqua-700" : "text-muted"} aria-hidden />
      <span className="mt-2 block text-sm font-bold text-ink">{title}</span>
      <span className="mt-0.5 block text-xs leading-snug text-muted">{body}</span>
    </button>
  );
}
