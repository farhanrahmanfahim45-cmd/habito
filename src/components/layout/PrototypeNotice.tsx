import { FlaskConical } from "lucide-react";

/** Mandatory disclosure. Seed listings are invented; this must stay visible. */
export function PrototypeNotice() {
  return (
    <div className="bg-ink text-ivory">
      <p className="container-page flex items-center gap-2 py-2 text-xs">
        <FlaskConical size={13} className="shrink-0 text-aqua-400" aria-hidden />
        <span>
          <strong className="font-semibold">Prototype.</strong> Listings, owners and images are
          synthetic seed data and do not represent real availability.
        </span>
      </p>
    </div>
  );
}
