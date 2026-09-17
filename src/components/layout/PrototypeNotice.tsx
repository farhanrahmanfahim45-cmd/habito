import { FlaskConical } from "lucide-react";
import { useI18n } from "@/i18n";

/** Mandatory disclosure. Seed listings are invented; this must stay visible. */
export function PrototypeNotice() {
  const { t } = useI18n();
  return (
    <div className="bg-ink text-ivory">
      <p className="container-page flex items-center gap-2 py-2 text-xs">
        <FlaskConical size={13} className="shrink-0 text-aqua-400" aria-hidden />
        <span>
          <strong className="font-semibold">{t("prototype.notice")}</strong> {t("prototype.detail")}
        </span>
      </p>
    </div>
  );
}
