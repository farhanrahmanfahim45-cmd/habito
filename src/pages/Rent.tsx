/*
 * Rent ledger and receipts.
 *
 * Withdrawn from the product: Habito charges for listings rather than taking
 * a cut of rent, so this page is not reachable and is not in the navigation.
 * The code, the migrations and the database guards are kept because they work
 * and were tested, and because rent collection is a Year-2 route once a legal
 * entity exists. Re-add the route in AppRoutes to bring it back.
 */

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Receipt, Wallet, FlaskConical, Check, AlertCircle, CalendarPlus } from "lucide-react";
import { db } from "@/lib/api";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { money, longDate } from "@/lib/format";
import type { RentInvoice } from "@/types/space";
import { cn } from "@/lib/cn";

const STATUS_STYLE: Record<RentInvoice["status"], string> = {
  due: "bg-aqua-100 text-aqua-700",
  paid: "bg-ok-100 text-ok-600",
  overdue: "bg-danger-100 text-danger-600",
  waived: "bg-ivory-deep text-muted",
  cancelled: "bg-ivory-deep text-muted",
};

/**
 * Rent.
 *
 * Renters see what they owe; owners see what is owed to them. Both see the
 * receipt once a month is settled — which for many renters here is worth more
 * than the payment itself, because a rent record is otherwise a verbal claim.
 */
export default function Rent() {
  const { t } = useI18n();
  const { notify } = useToast();

  const [invoices, setInvoices] = useState<RentInvoice[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [paying, setPaying] = useState<RentInvoice | null>(null);
  const [receipt, setReceipt] = useState<RentInvoice | null>(null);

  const load = useCallback(async () => {
    try {
      setInvoices(await db.invoices());
    } catch {
      setInvoices([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pay = async (invoice: RentInvoice) => {
    setBusy(invoice.id);
    setPaying(null);
    try {
      await db.payInvoice(invoice.id);
      const next = await db.invoices();
      setInvoices(next);
      notify(t("rent.paid"));
      const settled = next.find((i) => i.id === invoice.id);
      if (settled?.receiptNo) setReceipt(settled);
    } catch (e) {
      notify(e instanceof Error ? e.message : t("rent.failed"));
    } finally {
      setBusy(null);
    }
  };

  const waive = async (invoice: RentInvoice) => {
    setBusy(invoice.id);
    try {
      await db.waiveInvoice(invoice.id);
      await load();
      notify(t("rent.waived"));
    } catch (e) {
      notify(e instanceof Error ? e.message : t("auth.errorGeneric"));
    } finally {
      setBusy(null);
    }
  };

  const extend = async (bookingId: string) => {
    setBusy(bookingId);
    try {
      await db.extendSchedule(bookingId, 12);
      await load();
      notify(t("rent.extended"));
    } catch (e) {
      notify(e instanceof Error ? e.message : t("auth.errorGeneric"));
    } finally {
      setBusy(null);
    }
  };

  const outstanding = (invoices ?? []).filter((i) => i.status === "due" || i.status === "overdue");
  const settled = (invoices ?? []).filter((i) => i.status !== "due" && i.status !== "overdue");
  const owed = outstanding.reduce((sum, i) => sum + i.amount, 0);

  return (
    <>
      <PageHeader title={t("rent.title")} lead={t("rent.lead")} />

      <div className="container-page max-w-3xl py-6 md:py-10">
        {/* The sandbox has to be unmissable. A payment screen that looks real
            but isn't is exactly the kind of thing that misleads people. */}
        <p className="mb-5 flex items-start gap-2.5 rounded-card bg-warn-100 p-4 text-sm leading-relaxed text-warn-700">
          <FlaskConical size={16} className="mt-0.5 shrink-0" aria-hidden />
          {t("rent.sandboxNotice")}
        </p>

        {invoices === null ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-card" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center rounded-card bg-surface px-6 py-16 text-center ring-1 ring-hairline">
            <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-aqua-100 text-aqua-700">
              <Wallet size={22} aria-hidden />
            </span>
            <h2 className="font-display text-xl font-bold text-ink">{t("rent.none")}</h2>
            <p className="mt-2 max-w-sm text-sm text-muted">{t("rent.noneBody")}</p>
            <Link to="/bookings" className="mt-5">
              <Button variant="secondary">{t("nav.bookings")}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {outstanding.length > 0 && (
              <section>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-lg font-bold text-ink">{t("rent.outstanding")}</h2>
                  <p className="text-sm font-semibold tnum text-ink">{money(owed)}</p>
                </div>
                <ul className="space-y-3">
                  {outstanding.map((i) => (
                    <li key={i.id}>
                      <InvoiceRow
                        invoice={i}
                        busy={busy === i.id}
                        onPay={() => setPaying(i)}
                        onWaive={() => void waive(i)}
                        onReceipt={() => setReceipt(i)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* A schedule with nothing left to pay has run out, and a tenancy
                that is still going needs more months raised. */}
            {(invoices ?? []).some((i) => i.youAreOwner) && outstanding.length === 0 && (
              <section className="rounded-card bg-surface p-5 ring-1 ring-hairline">
                <h2 className="font-display font-bold text-ink">{t("rent.runOut")}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">{t("rent.runOutBody")}</p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3"
                  disabled={busy !== null}
                  onClick={() => {
                    const b = (invoices ?? []).find((i) => i.youAreOwner)?.bookingId;
                    if (b) void extend(b);
                  }}
                >
                  <CalendarPlus size={15} aria-hidden />
                  {t("rent.extend")}
                </Button>
              </section>
            )}

            {settled.length > 0 && (
              <section>
                <h2 className="mb-3 font-display text-lg font-bold text-ink">{t("rent.settled")}</h2>
                <ul className="space-y-3">
                  {settled.map((i) => (
                    <li key={i.id}>
                      <InvoiceRow
                        invoice={i}
                        busy={busy === i.id}
                        onPay={() => setPaying(i)}
                        onWaive={() => void waive(i)}
                        onReceipt={() => setReceipt(i)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Payment confirmation */}
      <Modal
        open={paying !== null}
        onClose={() => setPaying(null)}
        title={t("rent.payTitle")}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setPaying(null)}>
              {t("action.cancel")}
            </Button>
            <Button fullWidth onClick={() => paying && void pay(paying)}>
              {t("rent.payNow")}
            </Button>
          </div>
        }
      >
        {paying && (
          <>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">{t("rent.forMonth")}</dt>
                <dd className="font-semibold text-ink">{monthLabel(paying.periodStart)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">{t("booking.amount")}</dt>
                <dd className="font-semibold tnum text-ink">{money(paying.amount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">{t("rent.space")}</dt>
                <dd className="font-semibold text-ink">{paying.spaceName}</dd>
              </div>
            </dl>

            <p className="mt-4 rounded-xl bg-warn-100 p-3 text-sm leading-relaxed text-warn-700">
              {t("rent.sandboxPay")}
            </p>
          </>
        )}
      </Modal>

      {/* Receipt */}
      <Modal
        open={receipt !== null}
        onClose={() => setReceipt(null)}
        title={t("rent.receipt")}
        footer={
          <Button fullWidth onClick={() => setReceipt(null)}>
            {t("action.done")}
          </Button>
        }
      >
        {receipt && (
          <div className="rounded-card bg-ivory p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-lg font-extrabold text-ink">Habito</p>
                <p className="mt-0.5 text-xs text-muted">{t("rent.receipt")}</p>
              </div>
              <p className="text-right text-xs tnum text-muted">{receipt.receiptNo}</p>
            </div>

            <dl className="mt-5 space-y-2 border-t border-hairline pt-4 text-sm">
              <Line label={t("rent.space")} value={receipt.spaceName} />
              <Line label={t("rent.forMonth")} value={monthLabel(receipt.periodStart)} />
              <Line
                label={receipt.youAreOwner ? t("rent.from") : t("rent.to")}
                value={receipt.counterpartName}
              />
              <Line label={t("rent.paidOn")} value={receipt.paidAt ? longDate(receipt.paidAt) : "—"} />
              <div className="flex justify-between border-t border-hairline pt-2">
                <dt className="font-semibold text-ink">{t("booking.amount")}</dt>
                <dd className="font-display text-lg font-extrabold tnum text-ink">
                  {money(receipt.amount)}
                </dd>
              </div>
            </dl>

            {receipt.simulated && (
              <p className="mt-4 rounded-xl bg-warn-100 p-2.5 text-xs leading-relaxed text-warn-700">
                {t("rent.sandboxReceipt")}
              </p>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

function InvoiceRow({
  invoice,
  busy,
  onPay,
  onWaive,
  onReceipt,
}: {
  invoice: RentInvoice;
  busy: boolean;
  onPay: () => void;
  onWaive: () => void;
  onReceipt: () => void;
}) {
  const { t } = useI18n();
  const i = invoice;
  const open = i.status === "due" || i.status === "overdue";

  return (
    <article className="flex flex-wrap items-center gap-4 rounded-card bg-surface p-4 ring-1 ring-hairline">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/space/${i.spaceId}`} className="font-semibold text-ink hover:text-aqua-700">
            {i.spaceName}
          </Link>
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_STYLE[i.status])}>
            {t(`rent.status.${i.status}` as never)}
          </span>
          {i.status === "overdue" && (
            <AlertCircle size={14} className="text-danger-600" aria-hidden />
          )}
        </div>

        <p className="mt-0.5 text-sm text-muted">
          {monthLabel(i.periodStart)} · {t("rent.due", { date: longDate(i.dueDate) })}
        </p>
      </div>

      <p className="font-display text-lg font-bold tnum text-ink">{money(i.amount)}</p>

      <div className="flex gap-2">
        {open && !i.youAreOwner && (
          <Button size="sm" disabled={busy} onClick={onPay}>
            {t("rent.pay")}
          </Button>
        )}
        {open && i.youAreOwner && (
          <Button size="sm" variant="secondary" disabled={busy} onClick={onWaive}>
            {t("rent.waive")}
          </Button>
        )}
        {i.status === "paid" && i.receiptNo && (
          <Button size="sm" variant="secondary" onClick={onReceipt}>
            <Receipt size={14} aria-hidden />
            {t("rent.viewReceipt")}
          </Button>
        )}
        {i.status === "paid" && !i.receiptNo && <Check size={16} className="text-ok-600" aria-hidden />}
      </div>
    </article>
  );
}

const monthLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(
    document.documentElement.dataset.lang === "bn" ? "bn-BD" : "en-GB",
    { month: "long", year: "numeric" },
  );
