"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CornerDownLeft, Search, Store, TriangleAlert } from "lucide-react";

import { useStore } from "@/lib/store";
import { cn } from "cn";

interface SearchResult {
  id: string;
  group: string;
  title: string;
  subtitle: string;
  href: string;
  icon: typeof Search;
}

export function GlobalSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const tickets = useStore((state) => state.tickets);
  const articles = useStore((state) => state.articles);
  const catalogItems = useStore((state) => state.catalogItems);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const ticketResults = tickets
      .filter(
        (ticket) =>
          ticket.number.toLowerCase().includes(q) ||
          ticket.shortDescription.toLowerCase().includes(q) ||
          ticket.category.toLowerCase().includes(q),
      )
      .slice(0, 4)
      .map<SearchResult>((ticket) => ({
        id: ticket.id,
        group: "Incidents",
        title: `${ticket.number} · ${ticket.shortDescription}`,
        subtitle: `${ticket.state} · ${ticket.priority} priority · ${ticket.category}`,
        href: `/incidents/${ticket.id}`,
        icon: TriangleAlert,
      }));

    const articleResults = articles
      .filter(
        (article) =>
          article.title.toLowerCase().includes(q) ||
          article.summary.toLowerCase().includes(q) ||
          article.tags.some((tag) => tag.includes(q)),
      )
      .slice(0, 3)
      .map<SearchResult>((article) => ({
        id: article.id,
        group: "Knowledge Base",
        title: article.title,
        subtitle: article.category,
        href: `/kb/${article.id}`,
        icon: BookOpen,
      }));

    const catalogResults = catalogItems
      .filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.shortDescription.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q),
      )
      .slice(0, 3)
      .map<SearchResult>((item) => ({
        id: item.id,
        group: "Service Catalog",
        title: item.name,
        subtitle: item.shortDescription,
        href: `/catalog/${item.id}`,
        icon: Store,
      }));

    return [...ticketResults, ...articleResults, ...catalogResults];
  }, [query, tickets, articles, catalogItems]);

  useEffect(() => {
    function handlePointer(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, []);

  function go(result: SearchResult) {
    setOpen(false);
    setQuery("");
    router.push(result.href);
  }

  const showPanel = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => {
            setActiveIndex(0);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => Math.min(index + 1, results.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            } else if (event.key === "Enter" && results[activeIndex]) {
              go(results[activeIndex]);
            }
          }}
          placeholder="Search incidents, articles, and services…"
          className="h-9 w-full rounded-lg border border-input bg-background pr-3 pl-8 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 dark:bg-input/30"
        />
      </div>

      {showPanel ? (
        <div className="absolute top-11 left-0 z-50 w-full overflow-hidden rounded-xl bg-popover shadow-lg ring-1 ring-foreground/10">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No results for “{query}”
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto p-1.5">
              {results.map((result, index) => {
                const Icon = result.icon;
                return (
                  <button
                    key={`${result.group}-${result.id}`}
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => go(result)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                      index === activeIndex ? "bg-accent" : "hover:bg-accent/60",
                    )}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="size-4" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">{result.title}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {result.group} · {result.subtitle}
                      </span>
                    </span>
                    <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
