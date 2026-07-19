import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useArticles, useKnowledgeCategories } from "@/hooks/use-articles";
import { ArticleCard } from "@/components/shared/article-card";
import { FilterPills } from "@/components/shared/filter-pills";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/app/articles")({
  head: () => ({ meta: [{ title: "Articles — Startup Navigator" }] }),
  component: AppArticles,
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

function AppArticles() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const { data: categories = [] } = useKnowledgeCategories();
  const { data: articles = [], isLoading, error, refetch } = useArticles({
    search: q || undefined,
    category: cat !== "All" ? cat : undefined,
  });

  const categoryOptions = ["All", ...categories.map((c) => c.name)];

  return (
    <div className="container-page py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Articles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Playbooks and deep dives for Indian founders.
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Search articles"
          inputClassName="h-10 pl-10"
          wrapperClassName="relative flex-1"
          aria-label="Search articles"
        />
      </div>
      <FilterPills
        options={categoryOptions}
        selected={cat}
        onSelect={setCat}
        className="mt-4"
      />
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && (
          <>
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
          </>
        )}
        {error && <ErrorState onRetry={() => refetch()} />}
        {!isLoading && !error && articles.map((a) => (
          <ArticleCard key={a.slug} article={a} linkTo="/app/articles/$slug" />
        ))}
        {!isLoading && !error && articles.length === 0 && (
          <EmptyState colSpan="col-span-full" message="No articles match your filters." />
        )}
      </div>
    </div>
  );
}
