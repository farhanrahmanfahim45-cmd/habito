import { ShieldCheck, ShieldQuestion, ShieldAlert } from "lucide-react";
import type { AvailabilityDetail, Verification } from "@/types/space";

import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n";

export type TrustLevel = "verified" | "in-review" | "unverified";

export function trustLevel(v: Verification): TrustLevel {
  if (v.owner === "verified" && v.space === "verified") return "verified";
  if (v.owner === "unverified" && v.space === "unverified") return "unverified";
  return "in-review";
}

const TRUST = {
  verified: { key: "trust.verified", icon: ShieldCheck, className: "bg-ok-100 text-ok-600" },
  "in-review": { key: "trust.inReview", icon: ShieldQuestion, className: "bg-warn-100 text-warn-700" },
  unverified: { key: "trust.unverified", icon: ShieldAlert, className: "bg-ivory-deep text-muted" },
} as const;

/** Always carries "(demo)" — Habito performs no real checks. */
export function TrustBadge({ verification, compact }: { verification: Verification; compact?: boolean }) {
  const { t } = useI18n();
  const { key, icon: Icon, className } = TRUST[trustLevel(verification)];

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", className)}>
      <Icon size={12} aria-hidden />
      {t(key)}
      {!compact && <span className="font-normal opacity-70">{t("trust.demo")}</span>}
    </span>
  );
}

const AVAILABILITY_STYLE: Record<string, string> = {
  available: "bg-ok-100 text-ok-600",
  "partially-available": "bg-sun/45 text-sun-ink",
  "available-soon": "bg-aqua-100 text-aqua-700",
  occupied: "bg-ivory-deep text-muted",
  maintenance: "bg-warn-100 text-warn-700",
};

const AVAILABILITY_KEY = {
  available: "availability.available",
  "partially-available": "availability.partial",
  "available-soon": "availability.soon",
  occupied: "availability.occupied",
  maintenance: "availability.maintenance",
} as const;

export function AvailabilityBadge({ availability }: { availability: AvailabilityDetail }) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        AVAILABILITY_STYLE[availability.status],
      )}
    >
      {t(AVAILABILITY_KEY[availability.status])}
    </span>
  );
}
