import { PRIORITY_META } from "./constants";
import type { Priority, Ticket } from "./types";

export function slaDueFrom(createdAt: string | Date, priority: Priority): string {
  const created = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const hours = PRIORITY_META[priority].slaHours;
  return new Date(created.getTime() + hours * 60 * 60 * 1000).toISOString();
}

export type SlaStatus = "met" | "on_track" | "at_risk" | "breached";

export interface SlaInfo {
  status: SlaStatus;
  label: string;
  msRemaining: number;
  percentElapsed: number;
  dueLabel: string;
}

export interface SlaInput {
  createdAt: string;
  slaDueAt: string;
  state: Ticket["state"];
  resolvedAt: string | null;
}

export function computeSla(ticket: SlaInput): SlaInfo {
  const created = new Date(ticket.createdAt).getTime();
  const due = new Date(ticket.slaDueAt).getTime();
  const now = Date.now();
  const total = Math.max(due - created, 1);
  const isSettled = ticket.state === "Resolved" || ticket.state === "Closed";

  if (isSettled) {
    const end = ticket.resolvedAt ? new Date(ticket.resolvedAt).getTime() : now;
    const met = end <= due;
    return {
      status: met ? "met" : "breached",
      label: met ? "SLA met" : "SLA breached",
      msRemaining: due - end,
      percentElapsed: Math.min(((end - created) / total) * 100, 100),
      dueLabel: labelFor(end, due),
    };
  }

  const msRemaining = due - now;
  const percentElapsed = Math.min(Math.max(((now - created) / total) * 100, 0), 100);
  let status: SlaStatus = "on_track";
  if (msRemaining < 0) status = "breached";
  else if (percentElapsed >= 75) status = "at_risk";

  return {
    status,
    label:
      status === "breached"
        ? "SLA breached"
        : status === "at_risk"
          ? "SLA at risk"
          : "On track",
    msRemaining,
    percentElapsed,
    dueLabel: labelFor(now, due),
  };
}

function labelFor(from: number, due: number): string {
  const diff = Math.abs(due - from);
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  if (due < from) {
    if (hours >= 24) return `overdue by ${Math.floor(hours / 24)}d`;
    if (hours >= 1) return `overdue by ${hours}h`;
    return `overdue by ${minutes}m`;
  }
  if (hours >= 24) return `due in ${Math.floor(hours / 24)}d`;
  if (hours >= 1) return `due in ${hours}h ${minutes}m`;
  return `due in ${minutes}m`;
}

export function formatDuration(ms: number): string {
  const abs = Math.abs(ms);
  const hours = Math.floor(abs / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours >= 1) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
