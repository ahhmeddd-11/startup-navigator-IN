import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Compass } from "lucide-react";
import { useArticles } from "@/hooks/use-articles";
import { useSchemes } from "@/hooks/use-schemes";
import { useResources } from "@/hooks/use-resources";

import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/app/recommendations")({
  head: () => ({ meta: [{ title: "Recommendations — Startup Navigator" }] }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
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

  return (
    <div className="container-page py-8">
      <div className="flex items-center gap-2">
        <Compass className="h-5 w-5" />
        <h1 className="text-2xl font-semibold tracking-tight">Recommendations</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Personalised for a pre-seed SaaS founder in Bengaluru.</p>

      {isLoading && (
        <div className="mt-8 space-y-6">
          <Skeleton className="h-6 w-32" />
          <div className="grid gap-3 md:grid-cols-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-8">
          <ErrorState onRetry={handleRetry} />
        </div>
      )}

      {!isLoading && !error && (
        <>
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Read next</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {articles.slice(0, 3).map((article) => (
                <Link key={article.slug} to="/app/articles/$slug" params={{ slug: article.slug }}>
                  <Card className="h-full p-4 hover:bg-accent/40">
                    <Badge variant="outline" className="rounded-full">{article.category?.name}</Badge>
                    <div className="mt-2 text-sm font-medium">{article.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">Why: matches your incorporation stage.</div>
                  </Card>
                </Link>
              ))}
              {articles.length === 0 && (
                <div className="col-span-full text-xs text-muted-foreground">No articles recommended at this time.</div>
              )}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Schemes to apply to</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {schemes.slice(0, 2).map((scheme) => (
                <Card key={scheme.slug} className="p-4">
                  <div className="text-xs text-muted-foreground">{scheme.ministry}</div>
                  <div className="mt-1 font-medium">{scheme.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Why: eligibility fits your DPIIT-recognised SaaS.</div>
                </Card>
              ))}
              {schemes.length === 0 && (
                <div className="col-span-full text-xs text-muted-foreground">No matching schemes.</div>
              )}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Resources to explore</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {resources.slice(0, 3).map((resource) => (
                <Card key={resource.slug} className="p-4">
                  <Badge variant="outline" className="rounded-full">{resource.resource_type}</Badge>
                  <div className="mt-2 text-sm font-medium">{resource.title}</div>
                </Card>
              ))}
              {resources.length === 0 && (
                <div className="col-span-full text-xs text-muted-foreground">No resources available.</div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
