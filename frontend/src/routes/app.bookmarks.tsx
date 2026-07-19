import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkX, Clock, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/app/bookmarks")({
  head: () => ({ meta: [{ title: "Bookmarks — Startup Navigator" }] }),
  component: BookmarksPage,
});

type ResourceBookmark = {
  id: number;
  resource: {
    id: number;
    slug: string;
    title: string;
    resource_type: string;
    short_description: string;
    category?: { name: string };
  };
  created_at: string;
};

type ArticleBookmark = {
  id: number;
  article: {
    id: number;
    slug: string;
    title: string;
    summary: string;
    reading_time: number;
    category?: { name: string };
  };
  created_at: string;
};

function BookmarkSkeleton() {
  return (
    <Card className="p-4 space-y-2">
      <Skeleton className="h-4 w-1/4 rounded-full" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
    </Card>
  );
}

function BookmarksPage() {
  const queryClient = useQueryClient();

  const { data: resourceBookmarks = [], isLoading: rlLoading, error: rlError, refetch: rlRefetch } =
    useQuery<ResourceBookmark[]>({
      queryKey: ["resource-bookmarks"],
      queryFn: async () => {
        const res = await api.get("/api/resources/bookmarks/");
        return (res.data?.data ?? []) as ResourceBookmark[];
      },
    });

  const { data: articleBookmarks = [], isLoading: alLoading, error: alError, refetch: alRefetch } =
    useQuery<ArticleBookmark[]>({
      queryKey: ["article-bookmarks"],
      queryFn: async () => {
        const res = await api.get("/api/knowledge/bookmarks/");
        return (res.data?.data ?? []) as ArticleBookmark[];
      },
    });

  const removeResourceBm = useMutation({
    mutationFn: (slug: string) => api.delete(`/api/resources/${slug}/bookmark/`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["resource-bookmarks"] });
      toast.success("Bookmark removed");
    },
  });

  const removeArticleBm = useMutation({
    mutationFn: (slug: string) => api.delete(`/api/knowledge/${slug}/bookmark/`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["article-bookmarks"] });
      toast.success("Bookmark removed");
    },
  });

  const isLoading = rlLoading || alLoading;
  const error = rlError || alError;
  const isEmpty = resourceBookmarks.length === 0 && articleBookmarks.length === 0;

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Bookmarks</h1>
      <p className="mt-1 text-sm text-muted-foreground">Everything you've saved, in one place.</p>

      {isLoading && (
        <div className="mt-8 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid gap-3 md:grid-cols-2">
            <BookmarkSkeleton />
            <BookmarkSkeleton />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-8">
          <ErrorState onRetry={() => { void rlRefetch(); void alRefetch(); }} />
        </div>
      )}

      {!isLoading && !error && !isEmpty && (
        <>
          {resourceBookmarks.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Resources ({resourceBookmarks.length})
              </h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {resourceBookmarks.map((bm) => (
                  <Card key={bm.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="rounded-full">{bm.resource.resource_type}</Badge>
                          <span className="text-muted-foreground">{bm.resource.category?.name}</span>
                        </div>
                        <div className="mt-2 font-medium">{bm.resource.title}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{bm.resource.short_description}</div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                        aria-label="Remove bookmark"
                        disabled={removeResourceBm.isPending}
                        onClick={() => removeResourceBm.mutate(bm.resource.slug)}
                      >
                        <BookmarkX className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {articleBookmarks.length > 0 && (
            <section className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Articles ({articleBookmarks.length})
              </h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {articleBookmarks.map((bm) => (
                  <Link key={bm.id} to="/app/articles/$slug" params={{ slug: bm.article.slug }}>
                    <Card className="p-4 hover:bg-accent/40">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="outline" className="rounded-full">{bm.article.category?.name}</Badge>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />{bm.article.reading_time} min
                            </span>
                          </div>
                          <div className="mt-2 font-medium">{bm.article.title}</div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label="Remove bookmark"
                          disabled={removeArticleBm.isPending}
                          onClick={(e) => {
                            e.preventDefault();
                            removeArticleBm.mutate(bm.article.slug);
                          }}
                        >
                          <BookmarkX className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {!isLoading && !error && isEmpty && (
        <div className="mt-12 grid place-items-center rounded-xl border border-dashed border-border p-12 text-center">
          <Bookmark className="h-6 w-6 text-muted-foreground" />
          <div className="mt-3 text-sm font-medium">No bookmarks yet</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Save articles and resources while browsing to see them here.
          </div>
          <div className="mt-4 flex gap-2">
            <Link to="/app/articles" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              <FileText className="h-4 w-4" /> Browse articles
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
