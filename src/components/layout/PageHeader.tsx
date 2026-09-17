import type { ReactNode } from "react";

export function PageHeader({
  title,
  lead,
  actions,
}: {
  title: string;
  lead?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="border-b border-hairline bg-surface">
      <div className="container-page flex flex-wrap items-end justify-between gap-4 py-8 md:py-10">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
          {lead && <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{lead}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
}
