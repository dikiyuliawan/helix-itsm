"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronsUpDown,
  Clock,
  Pencil,
  Tag,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import { PriorityBadge, SlaBadge, StateBadge } from "@/components/badges";
import { EmptyState } from "@/components/empty-state";
import { ActivityFeed } from "@/components/incidents/activity-feed";
import { UserAvatar } from "@/components/user-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { TICKET_STATES } from "@/lib/constants";
import { formatDateTime, smartDate } from "@/lib/format";
import { permissionsFor } from "@/lib/rbac";
import { computeSla } from "@/lib/sla";
import { useCurrentUser, useStore } from "@/lib/store";
import { cn } from "cn";

export function IncidentDetail({ ticketId }: { ticketId: string }) {
  const user = useCurrentUser();
  const permissions = permissionsFor(user);
  const ticket = useStore((state) =>
    state.tickets.find((item) => item.id === ticketId) ?? null,
  );
  const users = useStore((state) => state.users);
  const articles = useStore((state) => state.articles);
  const setTicketState = useStore((state) => state.setTicketState);
  const assignTicket = useStore((state) => state.assignTicket);

  const suggestedArticles = useMemo(() => {
    if (!ticket) return [];
    const words = `${ticket.shortDescription} ${ticket.category}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 3);
    return articles
      .map((article) => {
        const haystack = `${article.title} ${article.summary} ${article.tags.join(" ")} ${article.category}`.toLowerCase();
        const score = words.reduce((total, word) => (haystack.includes(word) ? total + 1 : total), 0);
        return { article, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((entry) => entry.article);
  }, [ticket, articles]);

  if (!ticket) {
    return (
      <EmptyState
        icon={TriangleAlert}
        title="Incident not found"
        description="This incident may have been removed."
      >
        <Link href="/incidents" className={cn(buttonVariants({ size: "sm" }))}>
          Back to incidents
        </Link>
      </EmptyState>
    );
  }

  const assignee = ticket.assigneeId
    ? users.find((u) => u.id === ticket.assigneeId) ?? null
    : null;
  const caller = users.find((u) => u.id === ticket.callerId) ?? null;
  const sla = computeSla(ticket);
  const isOpen = ticket.state !== "Resolved" && ticket.state !== "Closed";
  const staffOptions = [
    { id: null, label: "Unassigned" },
    ...users.filter((u) => u.role !== "user").map((u) => ({ id: u.id, label: u.name })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href={permissions.canViewAllTickets ? "/incidents" : "/incidents"}
            className="mt-0.5 inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Back to incidents"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-primary">{ticket.number}</span>
              <span>·</span>
              <span>{ticket.category}</span>
            </div>
            <h1 className="max-w-2xl font-heading text-xl font-semibold tracking-tight text-balance">
              {ticket.shortDescription}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <StateBadge state={ticket.state} />
              <PriorityBadge priority={ticket.priority} />
              <SlaBadge status={sla.status} label={sla.label} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {permissions.canChangeState && isOpen ? (
            <Button
              size="sm"
              onClick={() => {
                setTicketState(ticket.id, "Resolved", user!.id);
              }}
            >
              <CheckCircle2 className="size-3.5" />
              Mark resolved
            </Button>
          ) : null}
          {permissions.canChangeState ? (
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                Change state
                <ChevronsUpDown className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Set state</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {TICKET_STATES.map((state) => (
                  <DropdownMenuItem
                    key={state}
                    disabled={state === ticket.state}
                    onClick={() => setTicketState(ticket.id, state, user!.id)}
                  >
                    {state}
                    {state === ticket.state ? (
                      <span className="ml-auto text-xs text-muted-foreground">current</span>
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {permissions.canManageTickets ? (
            <Link
              href={`/incidents/${ticket.id}/edit`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <Pencil className="size-3.5" />
              Edit
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap text-foreground">
                {ticket.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          <ActivityFeed ticket={ticket} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DetailRow icon={UserRound} label="Caller">
                {caller ? (
                  <span className="flex items-center gap-2">
                    <UserAvatar user={caller} className="size-6" />
                    {caller.name}
                  </span>
                ) : (
                  "Unknown"
                )}
              </DetailRow>
              <Separator />
              <DetailRow icon={Building2} label="Assignment group">
                {ticket.assignmentGroup}
              </DetailRow>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <UserRound className="size-3.5" />
                  Assigned to
                </span>
                {permissions.canAssign ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-muted">
                      {assignee ? (
                        <span className="flex items-center gap-1.5">
                          <UserAvatar user={assignee} className="size-5" />
                          {assignee.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                      <ChevronsUpDown className="size-3 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      {staffOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.id ?? "none"}
                          disabled={option.id === ticket.assigneeId}
                          onClick={() => assignTicket(ticket.id, option.id, user!.id)}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <span>{assignee?.name ?? "Unassigned"}</span>
                )}
              </div>
              <Separator />
              <DetailRow icon={Tag} label="Category">
                {ticket.category}
              </DetailRow>
              <Separator />
              <DetailRow icon={TriangleAlert} label="Impact / Urgency">
                {ticket.impact} / {ticket.urgency}
              </DetailRow>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SLA & timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">SLA status</span>
                <SlaBadge status={sla.status} label={sla.label} />
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    sla.status === "breached"
                      ? "bg-red-500"
                      : sla.status === "at_risk"
                        ? "bg-amber-500"
                        : sla.status === "met"
                          ? "bg-emerald-500"
                          : "bg-primary",
                  )}
                  style={{ width: `${Math.min(Math.max(sla.percentElapsed, 4), 100)}%` }}
                />
              </div>
              <DetailRow icon={Clock} label="Due">
                {sla.dueLabel}
              </DetailRow>
              <Separator />
              <DetailRow icon={CalendarClock} label="Created">
                {formatDateTime(ticket.createdAt)}
              </DetailRow>
              <Separator />
              <DetailRow icon={CalendarClock} label="Updated">
                {smartDate(ticket.updatedAt)}
              </DetailRow>
              {ticket.resolvedAt ? (
                <>
                  <Separator />
                  <DetailRow icon={CheckCircle2} label="Resolved">
                    {formatDateTime(ticket.resolvedAt)}
                  </DetailRow>
                </>
              ) : null}
            </CardContent>
          </Card>

          {suggestedArticles.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-4 text-muted-foreground" />
                  Suggested knowledge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestedArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/kb/${article.id}`}
                    className="block rounded-lg border border-border p-2.5 transition-colors hover:bg-muted/60"
                  >
                    <p className="text-sm font-medium">{article.title}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {article.summary}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Clock;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="text-right">{children}</span>
    </div>
  );
}
