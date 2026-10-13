"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PriorityBadge } from "@/components/badges";
import { Field, SelectField } from "@/components/field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ASSIGNMENT_GROUPS,
  CATEGORIES,
  CHANNELS,
  IMPACTS,
  PRIORITY_META,
  URGENCIES,
  derivePriority,
} from "@/lib/constants";
import { permissionsFor } from "@/lib/rbac";
import { useCurrentUser, useStore } from "@/lib/store";
import type { Channel, Impact, Ticket, Urgency } from "@/lib/types";
import { cn } from "cn";

export function IncidentForm({
  mode,
  ticket,
}: {
  mode: "create" | "edit";
  ticket?: Ticket;
}) {
  const router = useRouter();
  const user = useCurrentUser();
  const users = useStore((state) => state.users);
  const createTicket = useStore((state) => state.createTicket);
  const updateTicket = useStore((state) => state.updateTicket);
  const addActivity = useStore((state) => state.addActivity);
  const permissions = permissionsFor(user);

  const [shortDescription, setShortDescription] = useState(
    ticket?.shortDescription ?? "",
  );
  const [description, setDescription] = useState(ticket?.description ?? "");
  const [callerId, setCallerId] = useState(ticket?.callerId ?? user?.id ?? "");
  const [channel, setChannel] = useState<Channel>(ticket?.channel ?? "Self-service");
  const [category, setCategory] = useState(ticket?.category ?? CATEGORIES[0]);
  const [impact, setImpact] = useState<Impact>(ticket?.impact ?? "2 - Medium");
  const [urgency, setUrgency] = useState<Urgency>(ticket?.urgency ?? "2 - Medium");
  const [assignmentGroup, setAssignmentGroup] = useState(
    ticket?.assignmentGroup ?? ASSIGNMENT_GROUPS[0],
  );
  const [assigneeId, setAssigneeId] = useState(ticket?.assigneeId ?? "unassigned");
  const [submitting, setSubmitting] = useState(false);

  const priority = useMemo(() => derivePriority(impact, urgency), [impact, urgency]);
  const slaHours = PRIORITY_META[priority].slaHours;

  const callerOptions = users.map((u) => ({ value: u.id, label: `${u.name} · ${u.department}` }));
  const staffOptions = [
    { value: "unassigned", label: "Unassigned" },
    ...users
      .filter((u) => u.role !== "user")
      .map((u) => ({ value: u.id, label: `${u.name} · ${u.title}` })),
  ];

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!shortDescription.trim()) {
      toast.error("Short description is required");
      return;
    }
    setSubmitting(true);

    if (mode === "create") {
      const created = createTicket({
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        category,
        impact,
        urgency,
        callerId: permissions.canManageTickets ? callerId : user?.id ?? callerId,
        channel,
        assignmentGroup,
        assigneeId:
          permissions.canAssign && assigneeId !== "unassigned" ? assigneeId : null,
      });
      toast.success(`${created.number} created`);
      router.push(`/incidents/${created.id}`);
      return;
    }

    if (ticket) {
      updateTicket(ticket.id, {
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        category,
        impact,
        urgency,
        priority,
        assignmentGroup,
        assigneeId: assigneeId === "unassigned" ? null : assigneeId,
      });
      addActivity(ticket.id, {
        authorId: user?.id ?? ticket.callerId,
        body: "Incident details updated.",
        kind: "activity",
      });
      toast.success(`${ticket.number} updated`);
      router.push(`/incidents/${ticket.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={mode === "edit" && ticket ? `/incidents/${ticket.id}` : "/incidents"}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          )}
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            {mode === "create" ? "Raise an incident" : `Edit ${ticket?.number}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "create"
              ? "Describe the issue and we will route it to the right team."
              : "Update the incident details and classification."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>What is the issue?</CardTitle>
              <CardDescription>
                Provide a short summary and any details that help us resolve it quickly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Short description" htmlFor="shortDescription" required>
                <Input
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(event) => setShortDescription(event.target.value)}
                  placeholder="e.g. Unable to connect to the corporate VPN"
                  maxLength={160}
                />
              </Field>
              <Field
                label="Description"
                htmlFor="description"
                hint="Include error messages, when it started, and what you have tried."
              >
                <Textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the issue in detail…"
                  rows={6}
                />
              </Field>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Priority</CardTitle>
              <CardDescription>Set impact and urgency to derive priority.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Impact">
                <SelectField
                  value={impact}
                  onValueChange={(value) => setImpact(value as Impact)}
                  options={IMPACTS.map((value) => ({ value, label: value }))}
                />
              </Field>
              <Field label="Urgency">
                <SelectField
                  value={urgency}
                  onValueChange={(value) => setUrgency(value as Urgency)}
                  options={URGENCIES.map((value) => ({ value, label: value }))}
                />
              </Field>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="size-3.5 text-primary" />
                  Computed priority
                </span>
                <PriorityBadge priority={priority} />
              </div>
              <p className="text-xs text-muted-foreground">
                Target resolution within <span className="font-medium text-foreground">{slaHours}h</span>{" "}
                ({PRIORITY_META[priority].slaHours} hour SLA).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Category">
                <SelectField
                  value={category}
                  onValueChange={setCategory}
                  options={CATEGORIES.map((value) => ({ value, label: value }))}
                />
              </Field>
              <Field label="Channel">
                <SelectField
                  value={channel}
                  onValueChange={(value) => setChannel(value as Channel)}
                  options={CHANNELS.map((value) => ({ value, label: value }))}
                />
              </Field>
              {permissions.canManageTickets ? (
                <Field label="Caller">
                  <SelectField
                    value={callerId}
                    onValueChange={setCallerId}
                    options={callerOptions}
                  />
                </Field>
              ) : null}
            </CardContent>
          </Card>

          {permissions.canAssign ? (
            <Card>
              <CardHeader>
                <CardTitle>Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Assignment group">
                  <SelectField
                    value={assignmentGroup}
                    onValueChange={setAssignmentGroup}
                    options={ASSIGNMENT_GROUPS.map((value) => ({ value, label: value }))}
                  />
                </Field>
                <Field label="Assigned to">
                  <SelectField
                    value={assigneeId}
                    onValueChange={setAssigneeId}
                    options={staffOptions}
                  />
                </Field>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Link
          href={mode === "edit" && ticket ? `/incidents/${ticket.id}` : "/incidents"}
          className={cn(
            "inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-muted",
          )}
        >
          Cancel
        </Link>
        <Button type="submit" disabled={submitting}>
          <Check className="size-4" />
          {mode === "create" ? "Submit incident" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
