import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, EyeOff, Eye, Copy, Flag, Check, X, ChevronRight, ClipboardList,
} from "lucide-react";
import { db } from "@/lib/api";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import type { ReviewItem } from "@/types/space";
import { cn } from "@/lib/cn";

/**
 * The review queue.
 *
 * Deliberately a queue and not a dashboard. The job is "what needs a decision
 * next", and anything that isn't that is a distraction for the one person who
 * will be doing this for a few minutes a day.
 */
export default function Admin() {
  const { t } = useI18n();
  const { notify } = useToast();

  const [items, setItems] = useState<ReviewItem[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<ReviewItem | null>(null);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    try {
      setItems(await db.reviewQueue());
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (item: ReviewItem, run: () => Promise<void>, message: string) => {
    setBusy(item.spaceId);
    try {
      await run();
      await load();
      notify(message);
    } catch (e) {
      notify(e instanceof Error ? e.message : t("auth.errorGeneric"));
    } finally {
      setBusy(null);
      setReviewing(null);
      setNote("");
    }
  };

  return (
    <>
      <PageHeader title={t("admin.title")} lead={t("admin.lead")} />

      <div className="container-page max-w-4xl py-6 md:py-10">
        {items === null ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-card" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center rounded-card bg-surface px-6 py-16 text-center ring-1 ring-hairline">
            <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-ok-100 text-ok-600">
              <Check size={22} aria-hidden />
            </span>
            <h2 className="font-display text-xl font-bold text-ink">{t("admin.clear")}</h2>
            <p className="mt-2 max-w-sm text-sm text-muted">{t("admin.clearBody")}</p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted">{t("admin.count", { count: items.length })}</p>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.spaceId}>
                  <QueueCard
                    item={item}
                    busy={busy === item.spaceId}
                    onReview={() => setReviewing(item)}
                    onHide={() =>
                      void act(item, () => db.setListingVisible(item.spaceId, false), t("admin.hidden"))
                    }
                    onRestore={() =>
                      void act(item, () => db.setListingVisible(item.spaceId, true), t("admin.restored"))
                    }
                    onDismissReports={() =>
                      void act(item, () => db.resolveReports(item.spaceId, true), t("admin.reportsDismissed"))
                    }
                    onUpholdReports={() =>
                      void act(item, () => db.resolveReports(item.spaceId, false), t("admin.reportsUpheld"))
                    }
                    onClearDuplicate={() =>
                      void act(item, () => db.clearDuplicate(item.spaceId), t("admin.duplicateCleared"))
                    }
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Marking an owner as reviewed */}
      <Modal
        open={reviewing !== null}
        onClose={() => setReviewing(null)}
        title={t("admin.reviewTitle")}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setReviewing(null)}>
              {t("action.cancel")}
            </Button>
            <Button
              fullWidth
              disabled={note.trim().length === 0}
              onClick={() =>
                reviewing &&
                void act(
                  reviewing,
                  () => db.setTrust(reviewing.ownerId, "reviewed", note.trim()),
                  t("admin.ownerReviewed"),
                )
              }
            >
              {t("admin.markReviewed")}
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-ink-soft">{t("admin.reviewBody")}</p>

        <ol className="mt-3 space-y-1.5 text-sm text-ink-soft">
          {["admin.check1", "admin.check2", "admin.check3", "admin.check4"].map((key, i) => (
            <li key={key} className="flex gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-ivory-deep text-[0.65rem] font-bold tnum">
                {i + 1}
              </span>
              {t(key as never)}
            </li>
          ))}
        </ol>

        <p className="mt-3 rounded-xl bg-warn-100 p-3 text-xs leading-relaxed text-warn-700">
          {t("admin.deleteDocument")}
        </p>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">{t("admin.note")}</span>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("admin.notePlaceholder")}
            className="w-full rounded-xl bg-ivory p-3 text-[0.9375rem] ring-1 ring-hairline-strong focus:outline-none focus:ring-2 focus:ring-aqua-600"
          />
        </label>
        <p className="mt-2 text-xs text-muted">{t("admin.noteAudit")}</p>
      </Modal>
    </>
  );
}

const PRIORITY_STYLE = [
  "bg-danger-100 text-danger-600",
  "bg-warn-100 text-warn-700",
  "bg-lilac/40 text-ink",
  "bg-ivory-deep text-muted",
  "bg-ivory-deep text-muted",
];

function QueueCard({
  item,
  busy,
  onReview,
  onHide,
  onRestore,
  onDismissReports,
  onUpholdReports,
  onClearDuplicate,
}: {
  item: ReviewItem;
  busy: boolean;
  onReview: () => void;
  onHide: () => void;
  onRestore: () => void;
  onDismissReports: () => void;
  onUpholdReports: () => void;
  onClearDuplicate: () => void;
}) {
  const { t } = useI18n();

  const reason =
    item.hiddenAt !== null
      ? { key: "admin.reasonHidden", icon: EyeOff, level: 0 }
      : item.openReports > 0
        ? { key: "admin.reasonReported", icon: Flag, level: 1 }
        : item.flaggedDuplicate
          ? { key: "admin.reasonDuplicate", icon: Copy, level: 2 }
          : { key: "admin.reasonUnverified", icon: ShieldCheck, level: 3 };

  return (
    <article className="rounded-card bg-surface p-4 ring-1 ring-hairline sm:p-5">
      <div className="flex flex-wrap items-start gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
            PRIORITY_STYLE[reason.level],
          )}
        >
          <reason.icon size={13} aria-hidden />
          {t(reason.key as never)}
        </span>

        <div className="min-w-0 flex-1">
          <Link
            to={`/space/${item.spaceId}`}
            className="font-display font-bold text-ink hover:text-aqua-700"
          >
            {item.spaceName}
          </Link>
          <p className="mt-0.5 text-sm text-muted">
            {item.area ?? "—"} · {item.ownerName} ·{" "}
            <span className="font-medium">{t(`trust.tier.${item.ownerTrust}` as never)}</span>
          </p>
          <p className="mt-1 text-xs text-muted">
            {t("admin.completeness", { score: item.completeness })}
            {item.reportCount > 0 && ` · ${t("admin.reporters", { count: item.reportCount })}`}
          </p>
          {item.hiddenReason && (
            <p className="mt-2 rounded-xl bg-ivory p-2.5 text-xs text-ink-soft">{item.hiddenReason}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.openReports > 0 && (
          <>
            <Button size="sm" variant="secondary" disabled={busy} onClick={onDismissReports}>
              <X size={14} aria-hidden />
              {t("admin.dismissReports")}
            </Button>
            <Button size="sm" variant="destructive" disabled={busy} onClick={onUpholdReports}>
              <Flag size={14} aria-hidden />
              {t("admin.upholdReports")}
            </Button>
          </>
        )}

        {item.flaggedDuplicate && (
          <Button size="sm" variant="secondary" disabled={busy} onClick={onClearDuplicate}>
            <Copy size={14} aria-hidden />
            {t("admin.notDuplicate")}
          </Button>
        )}

        {item.hiddenAt ? (
          <Button size="sm" variant="secondary" disabled={busy} onClick={onRestore}>
            <Eye size={14} aria-hidden />
            {t("admin.restore")}
          </Button>
        ) : (
          <Button size="sm" variant="ghost" disabled={busy} onClick={onHide}>
            <EyeOff size={14} aria-hidden />
            {t("admin.hide")}
          </Button>
        )}

        {item.ownerTrust === "unverified" && (
          <Button size="sm" disabled={busy} onClick={onReview}>
            <ClipboardList size={14} aria-hidden />
            {t("admin.review")}
            <ChevronRight size={14} aria-hidden />
          </Button>
        )}
      </div>
    </article>
  );
}
