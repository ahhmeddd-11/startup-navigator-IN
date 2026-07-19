import { createFileRoute } from "@tanstack/react-router";
import { categories } from "@/lib/content";
import { useMemo, useState } from "react";
import { useArticles } from "@/hooks/use-articles";
import { ArticleCard } from "@/components/shared/article-card";
import { FilterPills } from "@/components/shared/filter-pills";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";

import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_public/articles")({
  head: () => ({
    meta: [
      { title: "Articles — Startup Navigator" },
      { name: "description", content: "Operator-authored playbooks for Indian founders." },
    ],
  }),
  component: ArticlesPage,
});

function ArticleCardSkeleton() {
  return (
    <Card className="h-full p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>
    </Card>
  );
}

function ArticlesPage() {
  const { data: articles = [], isLoading, error, refetch } = useArticles();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const filtered = useMemo(
    () =>
      articles.filter(
        (a) =>
          (cat === "All" || a.category?.name === cat) &&
          (q === "" ||
            (a.title + a.summary + a.tags.map((t) => t.name).join(" ")).toLowerCase().includes(q.toLowerCase()))
      ),
    [articles, q, cat]
  );

  return (
    <div className="container-page py-16 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Articles &amp; playbooks
        </h1>
        <p className="mt-4 text-muted-foreground">
          Deep guides on incorporation, funding, compliance and growth — written by Indian
          operators.
        </p>
      </div>
      <div className="mx-auto mt-10 max-w-4xl">
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Search articles"
          inputClassName="h-11 pl-10"
          aria-label="Search articles"
        />
        <FilterPills
          options={["All", ...categories]}
          selected={cat}
          onSelect={setCat}
          className="mt-4"
        />
      </div>
      <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2">
        {isLoading && (
          <>
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
          </>
        )}
        {error && (
          <ErrorState onRetry={() => refetch()} />
        )}
        {!isLoading && !error && filtered.map((a) => (
          <ArticleCard key={a.slug} article={a} linkTo="/articles/$slug" />
        ))}
        {!isLoading && !error && filtered.length === 0 && (
          <EmptyState message="No articles match your filters." />
        )}
      </div>
    </div>
  );
}
