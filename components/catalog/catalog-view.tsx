"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock, Search, Store } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { IconByName } from "@/components/icon-by-name";
import { PageHeader } from "@/components/page-header";
import { RequestDialog } from "@/components/catalog/request-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { CatalogItem } from "@/lib/types";
import { cn } from "cn";

export function CatalogView() {
  const items = useStore((state) => state.catalogItems);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [dialogItem, setDialogItem] = useState<CatalogItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(items.map((item) => item.category)))],
    [items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.shortDescription.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [items, query, category]);

  function openRequest(item: CatalogItem) {
    setDialogItem(item);
    setDialogOpen(true);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Self-service"
        title="Service Catalog"
        description="Browse and request IT services, equipment, and access."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the catalog…"
            className="h-9 w-full rounded-lg border border-input bg-background pr-3 pl-8 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 dark:bg-input/30"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCategory(option)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                category === option
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {option === "all" ? "All" : option}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No catalog items found"
          description="Try a different search or category."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <IconByName name={item.icon} className="size-5" />
                </span>
                {item.popular ? (
                  <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                    Popular
                  </Badge>
                ) : null}
              </div>

              <div className="mt-3 flex-1 space-y-1">
                <Link
                  href={`/catalog/${item.id}`}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {item.name}
                </Link>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {item.shortDescription}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {item.deliveryTime}
                </span>
                <span className="font-medium text-foreground">{currency(item.price)}</span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" className="flex-1" onClick={() => openRequest(item)}>
                  Request
                </Button>
                <Link
                  href={`/catalog/${item.id}`}
                  className="inline-flex size-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={`View ${item.name}`}
                >
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <RequestDialog item={dialogItem} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
