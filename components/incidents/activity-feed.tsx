"use client";

import { useMemo, useState } from "react";
import { History, Lock, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { smartDate } from "@/lib/format";
import { permissionsFor } from "@/lib/rbac";
import { useCurrentUser, useStore } from "@/lib/store";
import type { Ticket } from "@/lib/types";
import { cn } from "cn";

export function ActivityFeed({ ticket }: { ticket: Ticket }) {
  const user = useCurrentUser();
  const permissions = permissionsFor(user);
  const allActivities = useStore((state) => state.activities);
  const users = useStore((state) => state.users);
  const addActivity = useStore((state) => state.addActivity);

  const [kind, setKind] = useState<"comment" | "work_note">("comment");
  const [body, setBody] = useState("");

  const ordered = useMemo(
    () =>
      allActivities
        .filter((entry) => entry.ticketId === ticket.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [allActivities, ticket.id],
  );

  function submit() {
    if (!body.trim() || !user) return;
    addActivity(ticket.id, { authorId: user.id, body: body.trim(), kind });
    setBody("");
    toast.success(kind === "work_note" ? "Work note added" : "Comment posted");
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-4 text-muted-foreground" />
          Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {permissions.canComment ? (
          <div className="space-y-2 rounded-xl border border-border p-3">
            {permissions.canAddWorkNote ? (
              <div className="flex items-center gap-1">
                <ComposerTab
                  active={kind === "comment"}
                  onClick={() => setKind("comment")}
                  icon={MessageSquare}
                  label="Comment"
                />
                <ComposerTab
                  active={kind === "work_note"}
                  onClick={() => setKind("work_note")}
                  icon={Lock}
                  label="Work note"
                />
              </div>
            ) : null}
            <Textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={3}
              placeholder={
                kind === "work_note"
                  ? "Add an internal work note (visible to agents)…"
                  : "Add a comment for the caller…"
              }
              className="resize-none border-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {kind === "work_note" ? "Internal only" : "Visible to the caller"}
              </p>
              <Button size="sm" onClick={submit} disabled={!body.trim()}>
                <Send className="size-3.5" />
                {kind === "work_note" ? "Add note" : "Post"}
              </Button>
            </div>
          </div>
        ) : null}

        {ordered.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No activity yet.
          </p>
        ) : (
          <ol className="space-y-4">
            {ordered.map((entry) => {
              const author = users.find((u) => u.id === entry.authorId) ?? null;
              if (entry.kind === "activity") {
                return (
                  <li key={entry.id} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <History className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{author?.name ?? "System"}</span>{" "}
                        <span className="text-muted-foreground">{entry.body}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {smartDate(entry.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              }
              const isNote = entry.kind === "work_note";
              return (
                <li key={entry.id} className="flex items-start gap-3">
                  <UserAvatar user={author} className="size-7" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {author?.name ?? "Unknown"}
                      </span>
                      {isNote ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                          <Lock className="size-3" />
                          Work note
                        </span>
                      ) : null}
                      <span className="text-xs text-muted-foreground">
                        {smartDate(entry.createdAt)}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-sm whitespace-pre-wrap",
                        isNote
                          ? "rounded-lg border border-amber-200/60 bg-amber-50/60 px-3 py-2 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200"
                          : "text-foreground",
                      )}
                    >
                      {entry.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

function ComposerTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof MessageSquare;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-muted",
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}
