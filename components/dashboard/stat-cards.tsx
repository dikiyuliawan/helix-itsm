"use client";

import { useMemo } from "react";
import { AlertOctagon, CalendarCheck2, Inbox, TimerReset, UserX } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { OPEN_STATES } from "@/lib/constants";
import { computeSla } from "@/lib/sla";
import { useStore } from "@/lib/store";
import type { LucideIcon } from "lucide-react";
import { cn } from "cn";

interface Stat {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  tone: string;
}

export function StatCards() {
  const tickets = useStore((state) => state.tickets);

  const stats = useMemo<Stat[]>(() => {
    const open = tickets.filter((ticket) => OPEN_STATES.includes(ticket.state));
    const unassigned = open.filter((ticket) => !ticket.assigneeId);
    const highPriority = open.filter(
      (ticket) => ticket.priority === "Critical" || ticket.priority === "High",
    );
    const atRisk = open.filter((ticket) => {
      const sla = computeSla(ticket);
      return sla.status === "at_risk" || sla.status === "breached";
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const resolvedToday = tickets.filter(
      (ticket) =>
        ticket.resolvedAt && new Date(ticket.resolvedAt).getTime() >= startOfToday.getTime(),
    );

    return [
      {
        label: "Open incidents",
        value: open.length,
        hint: `${tickets.length} total`,
        icon: Inbox,
        tone: "bg-primary/10 text-primary",
      },
      {
        label: "Unassigned",
        value: unassigned.length,
        hint: "Awaiting an owner",
        icon: UserX,
        tone: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
      },
      {
        label: "Critical & high",
        value: highPriority.length,
        hint: "High impact open",
        icon: AlertOctagon,
        tone: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
      },
      {
        label: "SLA at risk",
        value: atRisk.length,
        hint: "Breached or nearing",
        icon: TimerReset,
        tone: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
      },
      {
        label: "Resolved today",
        value: resolvedToday.length,
        hint: "Since midnight",
        icon: CalendarCheck2,
        tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
      },
    ];
  }, [tickets]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="gap-0">
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <span className={cn("flex size-7 items-center justify-center rounded-lg", stat.tone)}>
                  <Icon className="size-3.5" />
                </span>
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.hint}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
