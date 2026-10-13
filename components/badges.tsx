import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { PRIORITY_META, REQUEST_STATE_META, STATE_META } from "@/lib/constants";
import type { Priority, RequestState, TicketState } from "@/lib/types";

export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  const meta = PRIORITY_META[priority];
  return (
    <Badge variant="outline" className={cn("font-medium", meta.badge, className)}>
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {priority}
    </Badge>
  );
}

export function StateBadge({
  state,
  className,
}: {
  state: TicketState;
  className?: string;
}) {
  const meta = STATE_META[state];
  return (
    <Badge variant="outline" className={cn("font-medium", meta.badge, className)}>
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {state}
    </Badge>
  );
}

export function RequestStateBadge({
  state,
  className,
}: {
  state: RequestState;
  className?: string;
}) {
  const meta = REQUEST_STATE_META[state];
  return (
    <Badge variant="outline" className={cn("font-medium", meta?.badge, className)}>
      {state}
    </Badge>
  );
}

export function SlaBadge({
  status,
  label,
  className,
}: {
  status: "met" | "on_track" | "at_risk" | "breached";
  label: string;
  className?: string;
}) {
  const styles: Record<typeof status, string> = {
    met: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400",
    on_track:
      "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400",
    at_risk:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400",
    breached:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400",
  };
  return (
    <Badge variant="outline" className={cn("font-medium", styles[status], className)}>
      {label}
    </Badge>
  );
}
