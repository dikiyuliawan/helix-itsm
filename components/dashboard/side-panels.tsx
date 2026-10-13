"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Activity, ArrowUpRight, History, Lock, MessageSquare, Users } from "lucide-react";

import { PriorityBadge } from "@/components/badges";
import { UserAvatar } from "@/components/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OPEN_STATES } from "@/lib/constants";
import { relativeTime } from "@/lib/format";
import { isStaff } from "@/lib/rbac";
import { useCurrentUser, useStore } from "@/lib/store";

export function RecentActivity() {
  const activities = useStore((state) => state.activities);
  const tickets = useStore((state) => state.tickets);
  const users = useStore((state) => state.users);

  const recent = useMemo(
    () => [...activities].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
    [activities],
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-4 text-muted-foreground" />
          Recent activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recent.map((entry) => {
          const ticket = tickets.find((item) => item.id === entry.ticketId);
          const author = users.find((user) => user.id === entry.authorId) ?? null;
          return (
            <div key={entry.id} className="flex items-start gap-3">
              {entry.kind === "activity" ? (
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <History className="size-3.5" />
                </span>
              ) : (
                <UserAvatar user={author} className="mt-0.5 size-7" />
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm">
                  <span className="font-medium">{author?.name ?? "System"}</span>{" "}
                  <span className="text-muted-foreground">
                    {entry.kind === "activity"
                      ? entry.body
                      : entry.kind === "work_note"
                        ? "added a work note"
                        : "commented"}
                  </span>
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  {ticket ? (
                    <Link
                      href={`/incidents/${ticket.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {ticket.number}
                    </Link>
                  ) : null}
                  <span>{relativeTime(entry.createdAt)}</span>
                  {entry.kind === "work_note" ? (
                    <Lock className="size-3" />
                  ) : entry.kind === "comment" ? (
                    <MessageSquare className="size-3" />
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function TeamWorkload() {
  const tickets = useStore((state) => state.tickets);

  const groups = useMemo(() => {
    const open = tickets.filter((ticket) => OPEN_STATES.includes(ticket.state));
    const map = new Map<string, number>();
    open.forEach((ticket) => {
      map.set(ticket.assignmentGroup, (map.get(ticket.assignmentGroup) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [tickets]);

  const max = Math.max(...groups.map((group) => group.count), 1);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          Open by assignment group
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.map((group) => (
          <div key={group.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{group.name}</span>
              <span className="font-medium tabular-nums">{group.count}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(group.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function MyOpenWork() {
  const user = useCurrentUser();
  const tickets = useStore((state) => state.tickets);

  const items = useMemo(() => {
    if (!user) return [];
    const relevant = isStaff(user)
      ? tickets.filter((ticket) => ticket.assigneeId === user.id)
      : tickets.filter((ticket) => ticket.callerId === user.id);
    return relevant
      .filter((ticket) => OPEN_STATES.includes(ticket.state))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 6);
  }, [tickets, user]);

  const title = isStaff(user) ? "Assigned to me" : "My open incidents";

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Link
            href="/incidents"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all
            <ArrowUpRight className="size-3" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nothing open right now.
          </p>
        ) : (
          items.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/incidents/${ticket.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-muted/60"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">
                  {ticket.shortDescription}
                </span>
                <span className="text-xs text-muted-foreground">
                  {ticket.number} · {ticket.state}
                </span>
              </span>
              <PriorityBadge priority={ticket.priority} />
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
