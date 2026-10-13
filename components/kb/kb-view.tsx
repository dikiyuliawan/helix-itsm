"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Eye, Search, Sparkles, ThumbsUp } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { KB_CATEGORIES } from "@/lib/constants";
import { smartDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "cn";

export function KbView() {
  const articles = useStore((state) => state.articles);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles
      .filter((article) => {
        if (category !== "all" && article.category !== category) return false;
        if (!q) return true;
        return (
          article.title.toLowerCase().includes(q) ||
          article.summary.toLowerCase().includes(q) ||
          article.tags.some((tag) => tag.includes(q))
        );
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [articles, query, category]);

  const popular = useMemo(
    () => [...articles].sort((a, b) => b.views - a.views)[0] ?? null,
    [articles],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Self-service"
        title="Knowledge Base"
        description="Guides and answers to help you solve issues without raising a ticket."
      />

      {popular && !query && category === "all" ? (
        <Link
          href={`/kb/${popular.id}`}
          className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent p-4 transition-colors hover:from-primary/15"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </span>
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                Most read
              </p>
              <p className="font-heading text-base font-semibold">{popular.title}</p>
              <p className="line-clamp-1 max-w-2xl text-sm text-muted-foreground">
                {popular.summary}
              </p>
            </div>
          </div>
          <span className="hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <Eye className="size-3.5" />
            {popular.views.toLocaleString()} views
          </span>
        </Link>
      ) : null}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles…"
            className="h-9 w-full rounded-lg border border-input bg-background pr-3 pl-8 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 dark:bg-input/30"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {["all", ...KB_CATEGORIES].map((option) => (
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
          icon={BookOpen}
          title="No articles found"
          description="Try a different search term or category."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((article) => (
            <Link
              key={article.id}
              href={`/kb/${article.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{article.category}</Badge>
                <span className="text-[11px] text-muted-foreground">{article.number}</span>
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-medium text-foreground group-hover:text-primary">
                  {article.title}
                </h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {article.summary}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Eye className="size-3.5" />
                  {article.views.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="size-3.5" />
                  {article.helpful}
                </span>
                <span className="ml-auto">Updated {smartDate(article.updatedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
