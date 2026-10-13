import type { Channel, Impact, Priority, TicketState, Urgency } from "./types";

export const TICKET_STATES: TicketState[] = [
  "New",
  "In Progress",
  "On Hold",
  "Resolved",
  "Closed",
];

export const OPEN_STATES: TicketState[] = ["New", "In Progress", "On Hold"];

export const PRIORITIES: Priority[] = ["Critical", "High", "Moderate", "Low"];

export const IMPACTS: Impact[] = ["1 - High", "2 - Medium", "3 - Low"];
export const URGENCIES: Urgency[] = ["1 - High", "2 - Medium", "3 - Low"];

export const CHANNELS: Channel[] = [
  "Self-service",
  "Email",
  "Phone",
  "Walk-in",
  "Chat",
];

export const CATEGORIES = [
  "Hardware",
  "Software",
  "Network",
  "Access & Identity",
  "Email & Collaboration",
  "Database",
  "Inquiry / Help",
];

export const ASSIGNMENT_GROUPS = [
  "Service Desk",
  "Network Operations",
  "Identity & Access",
  "Application Support",
  "Field Services",
];

export const PRIORITY_META: Record<
  Priority,
  { badge: string; dot: string; slaHours: number; rank: number }
> = {
  Critical: {
    badge:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400",
    dot: "bg-red-500",
    slaHours: 4,
    rank: 0,
  },
  High: {
    badge:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-400",
    dot: "bg-orange-500",
    slaHours: 8,
    rank: 1,
  },
  Moderate: {
    badge:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400",
    dot: "bg-amber-500",
    slaHours: 24,
    rank: 2,
  },
  Low: {
    badge:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-400",
    dot: "bg-sky-500",
    slaHours: 72,
    rank: 3,
  },
};

export const STATE_META: Record<
  TicketState,
  { badge: string; dot: string }
> = {
  New: {
    badge:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  "In Progress": {
    badge:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-400",
    dot: "bg-indigo-500",
  },
  "On Hold": {
    badge:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  Resolved: {
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  Closed: {
    badge:
      "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400",
    dot: "bg-zinc-400",
  },
};

export const REQUEST_STATE_META: Record<
  string,
  { badge: string }
> = {
  Submitted: {
    badge:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400",
  },
  Approved: {
    badge:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-400",
  },
  "In Fulfillment": {
    badge:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-400",
  },
  Fulfilled: {
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  Rejected: {
    badge:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400",
  },
};

export const PRIORITY_MATRIX: Record<Impact, Record<Urgency, Priority>> = {
  "1 - High": {
    "1 - High": "Critical",
    "2 - Medium": "High",
    "3 - Low": "Moderate",
  },
  "2 - Medium": {
    "1 - High": "High",
    "2 - Medium": "Moderate",
    "3 - Low": "Low",
  },
  "3 - Low": {
    "1 - High": "Moderate",
    "2 - Medium": "Low",
    "3 - Low": "Low",
  },
};

export function derivePriority(impact: Impact, urgency: Urgency): Priority {
  return PRIORITY_MATRIX[impact][urgency];
}

export const KB_CATEGORIES = [
  "Getting Started",
  "Account & Access",
  "Hardware",
  "Software",
  "Network & VPN",
  "Email",
];
