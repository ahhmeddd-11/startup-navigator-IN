import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowUpRight, Bookmark, BookmarkCheck } from "lucide-react";
import { useResources, useResourceCategories, resourceKeys } from "@/hooks/use-resources";
import { FilterPills } from "@/components/shared/filter-pills";
import { SearchInput } from "@/components/shared/search-input";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/app/resources")({
  head: () => ({ meta: [{ title: "Resources — Startup Navigator" }] }),
  component: ResourcesPage,
});

function ResourceCardSkeleton() {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="ml-auto h-4 w-12" />
      </div>
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-24 pt-2" />
    </Card>
  );
}

function ResourcesPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const queryClient = useQueryClient();

  const { data: categories = [] } = useResourceCategories();
  const { data: resources = [], isLoading, error, refetch } = useResources({
    search: q || undefined,
    category: cat !== "All" ? cat : undefined,
  });

  const bookmarkMutation = useMutation({
    mutationFn: async ({ slug, bookmarked }: { slug: string; bookmarked: boolean }) => {
      if (bookmarked) {
        await api.delete(`/api/resources/${slug}/bookmark/`);
      } else {
        await api.post(`/api/resources/${slug}/bookmark/`);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: resourceKeys.all });
    },
    onError: () => toast.error("Failed to update bookmark"),
  });

  const categoryOptions = ["All", ...categories.map((c) => c.name)];

  // Track resource view in history when user opens the external link
  function trackResourceView(slug: string) {
    void api.get(`/api/resources/${slug}/`).then(() => {
      void queryClient.invalidateQueries({ queryKey: ["user-history"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }).catch(() => {
      // Silently ignore tracking failures
    });
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Resources</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Templates, checklists, and toolkits — ready to use.
      </p>
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Search resources"
          inputClassName="h-10 pl-10"
          wrapperClassName="relative flex-1"
          aria-label="Search resources"
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
            <ResourceCardSkeleton />
            <ResourceCardSkeleton />
            <ResourceCardSkeleton />
          </>
        )}
        {error && <ErrorState onRetry={() => refetch()} />}
        {!isLoading && !error && resources.map((resource) => (
          <Card key={resource.slug} className="p-5 hover:bg-accent/40 flex flex-col">
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="rounded-full">
                {resource.resource_type}
              </Badge>
              <span className="text-muted-foreground">{resource.category?.name}</span>
              {resource.duration && (
                <span className="ml-auto flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {resource.duration}
                </span>
              )}
            </div>
            <div className="mt-3 text-base font-semibold">{resource.title}</div>
            <p className="mt-1.5 text-sm text-muted-foreground flex-1">{resource.short_description}</p>
            <div className="mt-4 flex items-center gap-2">
              {resource.external_link && (
                <a
                  href={resource.external_link}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${resource.title}`}
                  className="inline-flex items-center gap-1 text-sm font-medium hover:opacity-70"
                  onClick={() => trackResourceView(resource.slug)}
                >
                  Open <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="ml-auto h-8 w-8"
                aria-label={resource.bookmarked ? "Remove bookmark" : "Bookmark resource"}
                disabled={bookmarkMutation.isPending}
                onClick={() =>
                  bookmarkMutation.mutate({ slug: resource.slug, bookmarked: !!resource.bookmarked })
                }
              >
                {resource.bookmarked
                  ? <BookmarkCheck className="h-4 w-4 text-primary" />
                  : <Bookmark className="h-4 w-4" />}
              </Button>
            </div>
          </Card>
        ))}
        {!isLoading && !error && resources.length === 0 && (
          <EmptyState colSpan="col-span-full" message="No resources found." />
        )}
      </div>
    </div>
  );
}
