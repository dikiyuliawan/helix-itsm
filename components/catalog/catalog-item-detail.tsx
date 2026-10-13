"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Store, Tag } from "lucide-react";

import { RequestStateBadge } from "@/components/badges";
import { EmptyState } from "@/components/empty-state";
import { IconByName } from "@/components/icon-by-name";
import { RequestDialog } from "@/components/catalog/request-dialog";
import { UserAvatar } from "@/components/user-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currency, smartDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "cn";

export function CatalogItemDetail({ itemId }: { itemId: string }) {
  const item = useStore(
    (state) => state.catalogItems.find((entry) => entry.id === itemId) ?? null,
  );
  const users = useStore((state) => state.users);
  const allRequests = useStore((state) => state.requests);
  const requests = useMemo(
    () => allRequests.filter((request) => request.itemId === itemId),
    [allRequests, itemId],
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!item) {
    return (
      <EmptyState
        icon={Store}
        title="Catalog item not found"
        description="This item may no longer be available."
      >
        <Link href="/catalog" className={cn(buttonVariants({ size: "sm" }))}>
          Back to catalog
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href="/catalog"
          className="mt-1 inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Back to catalog"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex items-start gap-3">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <IconByName name={item.icon} className="size-6" />
          </span>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{item.category}</p>
            <h1 className="font-heading text-xl font-semibold tracking-tight">
              {item.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About this service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">{item.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What happens next</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                {[
                  "You submit the request with the details we need.",
                  "A fulfillment team reviews and approves if required.",
                  `The service is delivered (typically ${item.deliveryTime}).`,
                  "You receive a notification when the request is fulfilled.",
                ].map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {requests.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {requests.slice(0, 4).map((request) => {
                  const requestedFor =
                    users.find((user) => user.id === request.requestedForId) ?? null;
                  return (
                    <div
                      key={request.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <UserAvatar user={requestedFor} className="size-7" />
                        <div>
                          <p className="text-sm font-medium">{request.number}</p>
                          <p className="text-xs text-muted-foreground">
                            {requestedFor?.name} · {smartDate(request.createdAt)}
                          </p>
                        </div>
                      </div>
                      <RequestStateBadge state={request.state} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div>
          <Card className="lg:sticky lg:top-20">
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-semibold tracking-tight">
                  {currency(item.price)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.price === 0 ? "No charge for approved users" : "One-time charge"}
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-3.5" />
                  Delivery: <span className="text-foreground">{item.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="size-3.5" />
                  Category: <span className="text-foreground">{item.category}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="size-3.5" />
                  {item.fields.length} detail field
                  {item.fields.length === 1 ? "" : "s"} to complete
                </div>
              </div>
              <Button className="w-full" onClick={() => setDialogOpen(true)}>
                Request now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <RequestDialog item={item} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
