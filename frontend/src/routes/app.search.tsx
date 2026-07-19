import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/shared/search-input";
import { useArticles } from "@/hooks/use-articles";
import { useSchemes } from "@/hooks/use-schemes";
import { useResources } from "@/hooks/use-resources";

import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/app/search")({
  head: () => ({ meta: [{ title: "Search — Startup Navigator" }] }),
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

  const [query, setQuery] = useState("");
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
                <div key={article.slug} className="rounded-lg border border-border p-3">
                  <Badge variant="outline" className="rounded-full">{article.category?.name}</Badge>
                  <div className="mt-1 font-medium">{article.title}</div>
                </div>
              ))}
            </Section>
            <Section title={`Schemes (${results.schemes.length})`}>
              {results.schemes.map((scheme) => (
                <div key={scheme.slug} className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">{scheme.ministry}</div>
                  <div className="mt-1 font-medium">{scheme.name}</div>
                </div>
              ))}
            </Section>
            <Section title={`Resources (${results.resources.length})`}>
              {results.resources.map((resource) => (
                <div key={resource.slug} className="rounded-lg border border-border p-3">
                  <Badge variant="outline" className="rounded-full">{resource.resource_type}</Badge>
                  <div className="mt-1 font-medium">{resource.title}</div>
                </div>
              ))}
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
