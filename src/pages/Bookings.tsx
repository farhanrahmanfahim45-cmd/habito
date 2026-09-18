import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, Phone, Check, X, Clock, Ban } from "lucide-react";
import { db } from "@/lib/api";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { money, longDate } from "@/lib/format";
import type { Booking, BookingStatus } from "@/types/space";
import { cn } from "@/lib/cn";

/**
 * Bookings, both sides in one place.
 *
 * Which buttons appear is decided by who you are in the booking and what state
 * it is in — but the database decides what is actually permitted, so a hidden
 * button is a courtesy rather than the protection.
 */
const STATUS_STYLE: Record<BookingStatus, string> = {
  requested: "bg-aqua-100 text-aqua-700",
  accepted: "bg-ok-100 text-ok-600",
  "payment-pending": "bg-sun/45 text-sun-ink",
  confirmed: "bg-ok-100 text-ok-600",
  completed: "bg-ivory-deep text-muted",
  rejected: "bg-danger-100 text-danger-600",
  cancelled: "bg-ivory-deep text-muted",
  "payment-failed": "bg-danger-100 text-danger-600",
};

export default function Bookings() {
  const { t } = useI18n();
  const { notify } = useToast();

  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [declining, setDeclining] = useState<Booking | null>(null);
  const [confirming, setConfirming] = useState<Booking | null>(null);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    try {
      setBookings(await db.bookings());
    } catch {
      setBookings([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const move = async (booking: Booking, status: BookingStatus, why?: string) => {
    setBusy(booking.id);
    try {
      await db.setBookingStatus(booking.id, status, why);
      await load();
      notify(t(`booking.moved.${status}` as never));
    } catch (e) {
      notify(e instanceof Error ? e.message : t("auth.errorGeneric"));
    } finally {
      setBusy(null);
      setDeclining(null);
      setReason("");
    }
  };

  const live = (bookings ?? []).filter(
    (b) => !["completed", "rejected", "cancelled"].includes(b.status),
  );
  const past = (bookings ?? []).filter((b) =>
    ["completed", "rejected", "cancelled"].includes(b.status),
  );

  return (
    <>
      <PageHeader title={t("booking.title")} lead={t("booking.lead")} />

      <div className="container-page max-w-3xl py-6 md:py-10">
        {bookings === null ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-card" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center rounded-card bg-surface px-6 py-16 text-center ring-1 ring-hairline">
            <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-aqua-100 text-aqua-700">
              <CalendarCheck size={22} aria-hidden />
            </span>
            <h2 className="font-display text-xl font-bold text-ink">{t("booking.none")}</h2>
            <p className="mt-2 max-w-sm text-sm text-muted">{t("booking.noneBody")}</p>
            <Link to="/search" className="mt-5">
              <Button>{t("action.browseSpaces")}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {live.length > 0 && (
              <section>
                <h2 className="mb-3 font-display text-lg font-bold text-ink">{t("booking.active")}</h2>
                <ul className="space-y-3">
                  {live.map((b) => (
                    <li key={b.id}>
                      <BookingCard
                        booking={b}
                        busy={busy === b.id}
                        onMove={move}
                        onDecline={() => setDeclining(b)}
                        onConfirm={() => setConfirming(b)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <h2 className="mb-3 font-display text-lg font-bold text-ink">{t("booking.past")}</h2>
                <ul className="space-y-3">
                  {past.map((b) => (
                    <li key={b.id}>
                      <BookingCard
                        booking={b}
                        busy={false}
                        onMove={move}
                        onDecline={() => {}}
                        onConfirm={() => {}}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>

      <Modal
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        title={t("booking.confirmTitle")}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setConfirming(null)}>
              {t("action.cancel")}
            </Button>
            <Button
              fullWidth
              onClick={() => {
                const target = confirming;
                setConfirming(null);
                if (target) void move(target, "confirmed");
              }}
            >
              {t("booking.confirm")}
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-ink-soft">{t("booking.confirmBody")}</p>
        <p className="mt-3 rounded-xl bg-warn-100 p-3 text-sm leading-relaxed text-warn-700">
          {t("booking.confirmWarning")}
        </p>
      </Modal>

      <Modal
        open={declining !== null}
        onClose={() => setDeclining(null)}
        title={t("booking.declineTitle")}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setDeclining(null)}>
              {t("action.cancel")}
            </Button>
            <Button
              variant="destructive"
              fullWidth
              onClick={() => declining && void move(declining, "rejected", reason.trim() || undefined)}
            >
              {t("booking.decline")}
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-ink-soft">{t("booking.declineBody")}</p>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">
            {t("booking.declineReason")}
          </span>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("booking.declineHint")}
            className="w-full rounded-xl bg-ivory p-3 text-[0.9375rem] ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600"
          />
        </label>
      </Modal>
    </>
  );
}

function BookingCard({
  booking,
  busy,
  onMove,
  onDecline,
  onConfirm,
}: {
  booking: Booking;
  busy: boolean;
  onMove: (b: Booking, s: BookingStatus, why?: string) => void;
  onDecline: () => void;
  onConfirm: () => void;
}) {
  const { t } = useI18n();
  const b = booking;

  return (
    <article className="rounded-card bg-surface p-4 ring-1 ring-hairline sm:p-5">
      <div className="flex gap-4">
        {b.spaceImage ? (
          <img src={b.spaceImage} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
        ) : (
          <span className="size-16 shrink-0 rounded-xl bg-ivory-deep" aria-hidden />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/space/${b.spaceId}`} className="font-display font-bold text-ink hover:text-aqua-700">
              {b.spaceName}
            </Link>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_STYLE[b.status])}>
              {t(`booking.status.${b.status}` as never)}
            </span>
          </div>

          <p className="mt-0.5 text-sm text-muted">
            {b.area ? `${b.area} · ` : ""}
            {t("booking.withPerson", { name: b.youAreOwner ? b.renterName : b.ownerName })}
          </p>

          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <div className="flex gap-1.5">
              <dt className="text-muted">{t("booking.moveIn")}</dt>
              <dd className="font-semibold text-ink">{longDate(b.moveInDate)}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-muted">{t("booking.amount")}</dt>
              <dd className="font-semibold tnum text-ink">{money(b.amount)}</dd>
            </div>
            {b.months > 1 && (
              <div className="flex gap-1.5">
                <dt className="text-muted">{t("booking.scheduled")}</dt>
                <dd className="font-semibold tnum text-ink">
                  {t("booking.monthsCount", { count: b.months })}
                </dd>
              </div>
            )}
          </dl>

          {b.message && (
            <p className="mt-3 rounded-xl bg-ivory p-3 text-sm leading-relaxed text-ink-soft">{b.message}</p>
          )}

          {b.declineReason && (
            <p className="mt-3 rounded-xl bg-danger-100 p-3 text-sm leading-relaxed text-danger-600">
              {b.declineReason}
            </p>
          )}

          {/* Contact details, only once accepted */}
          {b.phoneShared ? (
            <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-ok-100 px-3 py-2 text-sm font-semibold text-ok-600">
              <Phone size={14} aria-hidden />
              {b.youAreOwner ? b.renterPhone : b.ownerPhone}
              <span className="font-normal opacity-80">
                {t("booking.phoneNow", { name: b.youAreOwner ? b.renterName : b.ownerName })}
              </span>
            </p>
          ) : (
            b.status === "requested" && (
              <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted">
                <Clock size={13} aria-hidden />
                {t("booking.phoneLater")}
              </p>
            )
          )}

          {/* What each side can do from here */}
          <div className="mt-4 flex flex-wrap gap-2">
            {b.youAreOwner && b.status === "requested" && (
              <>
                <Button size="sm" disabled={busy} onClick={() => onMove(b, "accepted")}>
                  <Check size={15} aria-hidden />
                  {t("booking.accept")}
                </Button>
                <Button size="sm" variant="secondary" disabled={busy} onClick={onDecline}>
                  <X size={15} aria-hidden />
                  {t("booking.decline")}
                </Button>
              </>
            )}

            {b.youAreOwner && b.status === "accepted" && (
              <Button size="sm" disabled={busy} onClick={onConfirm}>
                <Check size={15} aria-hidden />
                {t("booking.confirm")}
              </Button>
            )}

            {b.youAreOwner && b.status === "confirmed" && (
              <Button size="sm" disabled={busy} onClick={() => onMove(b, "completed")}>
                {t("booking.complete")}
              </Button>
            )}

            {["requested", "accepted", "confirmed"].includes(b.status) && (
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => onMove(b, "cancelled")}>
                <Ban size={15} aria-hidden />
                {t("booking.cancel")}
              </Button>
            )}
          </div>

          {b.status === "accepted" && (
            <p className="mt-3 text-xs leading-relaxed text-muted">{t("booking.acceptedNote")}</p>
          )}
        </div>
      </div>
    </article>
  );
}
