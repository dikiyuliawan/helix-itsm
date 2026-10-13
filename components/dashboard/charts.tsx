"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OPEN_STATES, PRIORITIES, TICKET_STATES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f97316",
  Moderate: "#f59e0b",
  Low: "#0ea5e9",
};

const STATE_COLORS: Record<string, string> = {
  New: "#3b82f6",
  "In Progress": "#6366f1",
  "On Hold": "#f59e0b",
  Resolved: "#10b981",
  Closed: "#a1a1aa",
};

interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
  fill?: string;
  dataKey?: string | number;
}

function toEntries(payload: unknown): TooltipEntry[] {
  return Array.isArray(payload) ? (payload as TooltipEntry[]) : [];
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label !== undefined ? (
        <p className="mb-1 font-medium text-foreground">{label}</p>
      ) : null}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ background: entry.color ?? entry.fill ?? "var(--chart-1)" }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-medium tabular-nums text-foreground">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardCharts() {
  const tickets = useStore((state) => state.tickets);

  const trend = useMemo(() => {
    const days: { day: string; created: number; resolved: number }[] = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - offset);
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      const created = tickets.filter((ticket) => {
        const time = new Date(ticket.createdAt).getTime();
        return time >= date.getTime() && time < next.getTime();
      }).length;
      const resolved = tickets.filter((ticket) => {
        if (!ticket.resolvedAt) return false;
        const time = new Date(ticket.resolvedAt).getTime();
        return time >= date.getTime() && time < next.getTime();
      }).length;
      days.push({ day: formatDate(date).slice(0, 6), created, resolved });
    }
    return days;
  }, [tickets]);

  const byPriority = useMemo(
    () =>
      PRIORITIES.map((priority) => ({
        name: priority,
        value: tickets.filter(
          (ticket) => ticket.priority === priority && OPEN_STATES.includes(ticket.state),
        ).length,
        color: PRIORITY_COLORS[priority],
      })),
    [tickets],
  );

  const byState = useMemo(
    () =>
      TICKET_STATES.map((state) => ({
        name: state === "In Progress" ? "In Prog." : state,
        value: tickets.filter((ticket) => ticket.state === state).length,
        color: STATE_COLORS[state],
      })),
    [tickets],
  );

  const openTotal = byPriority.reduce((total, entry) => total + entry.value, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Incident volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="createdFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resolvedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  content={(props) => (
                    <ChartTooltip
                      active={props.active}
                      payload={toEntries(props.payload)}
                      label={props.label as string | undefined}
                    />
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="created"
                  name="Created"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#createdFill)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  fill="url(#resolvedFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open by priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byPriority}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={86}
                  paddingAngle={2}
                  stroke="none"
                >
                  {byPriority.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={(props) => (
                    <ChartTooltip
                      active={props.active}
                      payload={toEntries(props.payload)}
                    />
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold tabular-nums">{openTotal}</span>
              <span className="text-xs text-muted-foreground">open incidents</span>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {byPriority.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs">
                <span className="size-2 rounded-full" style={{ background: entry.color }} />
                <span className="text-muted-foreground">{entry.name}</span>
                <span className="ml-auto font-medium tabular-nums">{entry.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Incidents by state</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byState} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  content={(props) => (
                    <ChartTooltip
                      active={props.active}
                      payload={toEntries(props.payload)}
                      label={props.label as string | undefined}
                    />
                  )}
                />
                <Bar dataKey="value" name="Incidents" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {byState.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
