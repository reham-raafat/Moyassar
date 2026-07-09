import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={`mx-auto flex max-w-md flex-col items-center rounded-2xl border bg-card p-8 text-center ${className ?? ""}`}
    >
      <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        {icon ?? <Inbox className="size-7" aria-hidden="true" />}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
