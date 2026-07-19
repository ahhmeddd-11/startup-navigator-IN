import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/shared/search-input";
import { useArticles } from "@/hooks/use-articles";
import { useSchemes } from "@/hooks/use-schemes";
import { useResources } from "@/hooks/use-resources";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/app/search")({
  head: () => ({ meta: [{ title: "Search — Startup Navigator" }] }),
  component: SearchPage,
});

function SearchPage() {
  const queryClient = useQueryClient();
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

  const [query, setQuery] = useState("");

  // Debounce search tracking — only record after user stops typing (1.5s) and query is >= 3 chars
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTrackedQuery = useRef<string>("");

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (trimmed.length < 3) return;
    debounceRef.current = setTimeout(() => {
      if (trimmed === lastTrackedQuery.current) return;
      lastTrackedQuery.current = trimmed;
      void api.post("/api/users/history/", { content_type: "search", metadata: { query: trimmed } })
        .then(() => queryClient.invalidateQueries({ queryKey: ["user-history"] }))
        .catch(() => {});
    }, 1500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, queryClient]);

  const results = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery) return null;
    return {
      articles: articles.filter((article) => (article.title + article.summary).toLowerCase().includes(trimmedQuery)),
      schemes: schemes.filter((scheme) => (scheme.name + scheme.summary).toLowerCase().includes(trimmedQuery)),
      resources: resources.filter((resource) => (resource.title + resource.short_description).toLowerCase().includes(trimmedQuery)),
    };
  }, [query, articles, schemes, resources]);

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search anything"
        inputClassName="h-11 pl-10"
        wrapperClassName="relative mt-4 max-w-xl"
        aria-label="Search content"
        autoFocus
      />
      <div className="mt-6 max-w-3xl space-y-6">
        {isLoading && query.trim() && (
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {error && query.trim() && (
          <ErrorState onRetry={handleRetry} />
        )}
        {!isLoading && !error && !results && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Start typing to search.
          </div>
        )}
        {!isLoading && !error && results && (
          <>
            <Section title={`Articles (${results.articles.length})`}>
              {results.articles.map((article) => (
                <Link key={article.slug} to="/app/articles/$slug" params={{ slug: article.slug }}>
                  <div className="rounded-lg border border-border p-3 hover:bg-accent/40 transition-colors">
                    <Badge variant="outline" className="rounded-full">{article.category?.name}</Badge>
                    <div className="mt-1 font-medium">{article.title}</div>
                  </div>
                </Link>
              ))}
              {results.articles.length === 0 && (
                <div className="text-xs text-muted-foreground">No articles match.</div>
              )}
            </Section>
            <Section title={`Schemes (${results.schemes.length})`}>
              {results.schemes.map((scheme) => (
                <Link key={scheme.slug} to="/app/schemes">
                  <div className="rounded-lg border border-border p-3 hover:bg-accent/40 transition-colors">
                    <div className="text-xs text-muted-foreground">{scheme.ministry}</div>
                    <div className="mt-1 font-medium">{scheme.name}</div>
                  </div>
                </Link>
              ))}
              {results.schemes.length === 0 && (
                <div className="text-xs text-muted-foreground">No schemes match.</div>
              )}
            </Section>
            <Section title={`Resources (${results.resources.length})`}>
              {results.resources.map((resource) => (
                <Link key={resource.slug} to="/app/resources">
                  <div className="rounded-lg border border-border p-3 hover:bg-accent/40 transition-colors">
                    <Badge variant="outline" className="rounded-full">{resource.resource_type}</Badge>
                    <div className="mt-1 font-medium">{resource.title}</div>
                  </div>
                </Link>
              ))}
              {results.resources.length === 0 && (
                <div className="text-xs text-muted-foreground">No resources match.</div>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
