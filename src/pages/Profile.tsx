import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Check, Database, HardDrive } from "lucide-react";
import { useHabito } from "@/hooks/useHabito";
import { useAuth } from "@/hooks/useAuth";
import { db, usingDatabase } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { money, longDate } from "@/lib/format";
import { CATEGORY_LABEL } from "@/types/space";
import type { Owner } from "@/types/space";
import { cn } from "@/lib/cn";

const inputClass =
  "h-11 w-full rounded-xl bg-ivory px-3 text-[0.9375rem] text-ink ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600";

const VERIFICATION_COPY = {
  verified: { label: "Verified", tone: "bg-ok-100 text-ok-600" },
  pending: { label: "Verification pending", tone: "bg-warn-100 text-warn-700" },
  unverified: { label: "Not verified", tone: "bg-ivory-deep text-muted" },
} as const;

export default function Profile() {
  const { role, ownerId, savedIds, compareIds, inquiries, requests, requirements, hasStatedNeeds, refresh } =
    useHabito();
  const { account, configured, updateProfile } = useAuth();
  const { notify } = useToast();

  const [owner, setOwner] = useState<Owner | null>(null);
  const [name, setName] = useState(account?.name ?? "");
  const [phone, setPhone] = useState(account?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    setName(account?.name ?? "");
    setPhone(account?.phone ?? "");
  }, [account]);

  useEffect(() => {
    void db.owner(ownerId).then(setOwner).catch(() => setOwner(null));
  }, [ownerId]);

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      notify("Profile updated");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Could not save your profile");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    setResetting(true);
    try {
      await db.reset();
      await refresh();
      notify("Demo data restored");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Could not reset");
    } finally {
      setResetting(false);
    }
  };

  const dirty = account ? name.trim() !== account.name || phone.trim() !== (account.phone ?? "") : false;

  return (
    <>
      <PageHeader
        title={account ? "Your account" : "Your profile"}
        lead="Enough context for an owner to reply, without handing over your documents."
      />

      <div className="container-page grid gap-5 py-8 md:grid-cols-2 md:py-10">
        <section className="rounded-card bg-surface p-6 ring-1 ring-hairline">
          <h2 className="font-display text-lg font-bold text-ink">
            {account ? "Profile" : "Demo profile"}
          </h2>

          {account ? (
            <>
              <p className="mt-1 text-sm text-muted">
                Signed in as {account.email} · {account.role}
              </p>

              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink-soft">Name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink-soft">Phone</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                    placeholder="01XXXXXXXXX"
                    className={inputClass}
                  />
                </label>
                <Button size="sm" disabled={!dirty || saving} onClick={() => void save()}>
                  <Check size={15} aria-hidden />
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>

              <div className="mt-5 border-t border-hairline pt-4">
                <span
                  className={cn(
                    "inline-block rounded-full px-2.5 py-1 text-xs font-semibold",
                    VERIFICATION_COPY[account.verification].tone,
                  )}
                >
                  {VERIFICATION_COPY[account.verification].label}
                </span>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Identity verification isn't switched on yet. When it is, Habito will hold only the
                  status shown here — never your NID number, and never anything visible to other users.
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted">
                Browsing as a <strong className="font-semibold text-ink">{role}</strong> without an account.
              </p>
              {configured ? (
                <div className="mt-4 flex gap-2">
                  <Link to="/signin">
                    <Button size="sm" variant="secondary">
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm">Create an account</Button>
                  </Link>
                </div>
              ) : (
                <p className="mt-4 text-xs leading-relaxed text-muted">
                  This build isn't connected to the database, so the role switch in the header stands in
                  for signing in. Everything you do is kept in this browser only.
                </p>
              )}
            </>
          )}
        </section>

        <section className="rounded-card bg-surface p-6 ring-1 ring-hairline">
          <h2 className="font-display text-lg font-bold text-ink">What you're looking for</h2>
          {hasStatedNeeds ? (
            <dl className="mt-4 space-y-2 text-sm">
              <Row
                label="Category"
                value={requirements.category === "any" ? "Anything" : CATEGORY_LABEL[requirements.category]}
              />
              <Row label="Area" value={requirements.area} />
              <Row label="Budget" value={`${money(requirements.budgetMin)} – ${money(requirements.budgetMax)}`} />
              <Row label="Needed by" value={longDate(requirements.moveInDate)} />
            </dl>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted">You haven't told us what you need yet.</p>
              <Link to="/find" className="mt-4 inline-block">
                <Button size="sm">Tell us what you need</Button>
              </Link>
            </>
          )}
        </section>

        {(account?.role === "owner" || !configured) && owner && (
          <section className="rounded-card bg-surface p-6 ring-1 ring-hairline">
            <h2 className="font-display text-lg font-bold text-ink">Owner activity</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Response rate" value={`${owner.responseRate}%`} />
              <Row label="Usual reply" value={`Within ${owner.responseTimeHours}h`} />
              <Row label="Member since" value={longDate(owner.memberSince)} />
            </dl>
            <Link to="/portfolio" className="mt-4 inline-block">
              <Button size="sm" variant="secondary">
                Open my spaces
              </Button>
            </Link>
          </section>
        )}

        <section className="rounded-card bg-surface p-6 ring-1 ring-hairline">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
            {usingDatabase ? (
              <Database size={17} className="text-aqua-600" aria-hidden />
            ) : (
              <HardDrive size={17} className="text-muted" aria-hidden />
            )}
            {usingDatabase ? "Your data" : "This device"}
          </h2>

          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Saved spaces" value={String(savedIds.length)} />
            <Row label="In compare" value={String(compareIds.length)} />
            <Row label="Inquiries" value={String(inquiries.length)} />
            <Row label="Requests posted" value={String(requests.length)} />
          </dl>

          <p className="mt-4 text-xs leading-relaxed text-muted">
            {usingDatabase
              ? "Your listings, saved spaces and messages live in Habito's database, so they follow your account onto any device."
              : "Habito is running without a database, so this activity is stored in this browser alone and isn't shared with anyone."}
          </p>

          {!usingDatabase && (
            <Button variant="secondary" size="sm" className="mt-4" disabled={resetting} onClick={() => void reset()}>
              <RotateCcw size={14} aria-hidden />
              {resetting ? "Resetting…" : "Reset demo data"}
            </Button>
          )}
        </section>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="font-semibold text-ink">{value}</dd>
    </div>
  );
}
