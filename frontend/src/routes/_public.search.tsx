import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/shared/search-input";
import { useArticles } from "@/hooks/use-articles";
import { useSchemes } from "@/hooks/use-schemes";
import { useResources } from "@/hooks/use-resources";

import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_public/search")({
  head: () => ({
    meta: [
      { title: "Search — Startup Navigator" },
      { name: "description", content: "Search across articles, schemes and resources." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { data: articles = [], isLoading: isLoadingArticles, error: errorArticles, refetch: refetchArticles } = useArticles();
  const { data: schemes = [], isLoading: isLoadingSchemes, error: errorSchemes, refetch: refetchSchemes } = useSchemes();
  const { data: resources = [], isLoading: isLoadingResources, error: errorResources, refetch: refetchResources } = useResources();

  const isLoading = isLoadingArticles || isLoadingSchemes || isLoadingResources;
  const error = errorArticles || errorSchemes || errorResources;

  const handleRetry = () => {
    void refetchArticles();
    void refetchSchemes();
    void refetchResources();
  };

  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return null;
    return {
      articles: articles.filter((a) => (a.title + a.summary).toLowerCase().includes(query)),
      schemes: schemes.filter((s) => (s.name + s.summary).toLowerCase().includes(query)),
      resources: resources.filter((r) => (r.title + r.short_description).toLowerCase().includes(query)),
    };
  }, [q, articles, schemes, resources]);

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Search</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Find articles, schemes, and resources across the platform.
        </p>
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Try 'DPIIT', 'seed fund', or 'GST'"
          inputClassName="h-12 pl-10 text-base"
          wrapperClassName="relative mt-6"
          autoFocus
          aria-label="Search the platform"
        />
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        {isLoading && q.trim() && (
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}
        {error && q.trim() && (
          <ErrorState onRetry={handleRetry} />
        )}
        {!isLoading && !error && !results && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Start typing to search across the platform.
          </div>
        )}
        {!isLoading && !error && results && (
          <div className="space-y-8">
            <ResultGroup title="Articles" count={results.articles.length}>
              {results.articles.map((a) => (
                <Link
                  key={a.slug}
                  to="/articles/$slug"
                  params={{ slug: a.slug }}
                  className="block rounded-lg border border-border p-4 hover:bg-accent/40"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="rounded-full">
                      {a.category?.name}
                    </Badge>
                    <span className="text-muted-foreground">{a.reading_time} min</span>
                  </div>
                  <div className="mt-2 font-medium">{a.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{a.summary}</div>
                </Link>
              ))}
            </ResultGroup>
            <ResultGroup title="Schemes" count={results.schemes.length}>
              {results.schemes.map((s) => (
                <div key={s.slug} className="rounded-lg border border-border p-4">
                  <div className="text-xs text-muted-foreground">{s.ministry}</div>
                  <div className="mt-1 font-medium">{s.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.summary}</div>
                </div>
              ))}
            </ResultGroup>
            <ResultGroup title="Resources" count={results.resources.length}>
              {results.resources.map((r) => (
                <div key={r.slug} className="rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="rounded-full">
                      {r.resource_type}
                    </Badge>
                    <span className="text-muted-foreground">{r.category?.name}</span>
                  </div>
                  <div className="mt-2 font-medium">{r.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{r.short_description}</div>
                </div>
              ))}
            </ResultGroup>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultGroup({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </h2>
        <span className="text-xs text-muted-foreground">{count} results</span>
      </div>
      {count === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          No {title.toLowerCase()} match.
        </div>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </section>
  );
}
