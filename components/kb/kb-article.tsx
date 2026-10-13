"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Eye,
  LifeBuoy,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { KbMarkdown } from "@/components/kb/kb-markdown";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, smartDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "cn";

const viewed = new Set<string>();

export function KbArticle({ articleId }: { articleId: string }) {
  const router = useRouter();
  const articles = useStore((state) => state.articles);
  const users = useStore((state) => state.users);
  const recordArticleView = useStore((state) => state.recordArticleView);
  const rateArticle = useStore((state) => state.rateArticle);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const recorded = useRef(false);

  const article = articles.find((entry) => entry.id === articleId) ?? null;

  useEffect(() => {
    if (!article || recorded.current || viewed.has(article.id)) return;
    recorded.current = true;
    viewed.add(article.id);
    recordArticleView(article.id);
  }, [article, recordArticleView]);

  const related = useMemo(() => {
    if (!article) return [];
    return articles
      .filter((entry) => entry.id !== article.id && entry.category === article.category)
      .slice(0, 3);
  }, [articles, article]);

  if (!article) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Article not found"
        description="This article may have been removed or renamed."
      >
        <Link href="/kb" className={cn(buttonVariants({ size: "sm" }))}>
          Back to knowledge base
        </Link>
      </EmptyState>
    );
  }

  const author = users.find((user) => user.id === article.authorId) ?? null;

  function handleVote(next: "up" | "down") {
    if (vote) return;
    setVote(next);
    rateArticle(article!.id, next === "up");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href="/kb"
          className="mt-1 inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Back to knowledge base"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">{article.category}</Badge>
            <span>{article.number}</span>
          </div>
          <h1 className="max-w-3xl font-heading text-2xl font-semibold tracking-tight text-balance">
            {article.title}
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">{article.summary}</p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
            {author ? (
              <span className="flex items-center gap-1.5">
                <UserAvatar user={author} className="size-5" />
                {author.name}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              Updated {formatDate(article.updatedAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3.5" />
              {article.views.toLocaleString()} views
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent>
              <KbMarkdown content={article.body} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Was this article helpful?</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Button
                variant={vote === "up" ? "default" : "outline"}
                size="sm"
                disabled={vote !== null}
                onClick={() => handleVote("up")}
              >
                <ThumbsUp className="size-3.5" />
                Yes ({article.helpful})
              </Button>
              <Button
                variant={vote === "down" ? "default" : "outline"}
                size="sm"
                disabled={vote !== null}
                onClick={() => handleVote("down")}
              >
                <ThumbsDown className="size-3.5" />
                No ({article.notHelpful})
              </Button>
              {vote ? (
                <span className="text-xs text-muted-foreground">Thanks for your feedback</span>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LifeBuoy className="size-4 text-muted-foreground" />
                Still need help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                If this did not resolve your issue, raise an incident and our team will help.
              </p>
              <Button className="w-full" onClick={() => router.push("/incidents/new")}>
                Raise an incident
              </Button>
            </CardContent>
          </Card>

          {related.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Related articles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {related.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/kb/${entry.id}`}
                    className="block rounded-lg border border-border p-2.5 transition-colors hover:bg-muted/60"
                  >
                    <p className="text-sm font-medium">{entry.title}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {entry.summary}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <p className="px-1 text-xs text-muted-foreground">
            Last reviewed {smartDate(article.updatedAt)}.
          </p>
        </div>
      </div>
    </div>
  );
}
