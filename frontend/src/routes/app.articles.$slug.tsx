import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Bookmark, BookmarkCheck, Clock, Share2 } from "lucide-react";
import { useArticle, articleKeys } from "@/hooks/use-articles";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/app/articles/$slug")({
  head: () => ({ meta: [{ title: "Article — Startup Navigator" }] }),
  component: AppArticleDetail,
});

function AppArticleDetail() {
  const { slug } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: article, isLoading, error } = useArticle(slug);

  const bookmarkMutation = useMutation({
    mutationFn: async (bookmarked: boolean) => {
      if (bookmarked) {
        await api.delete(`/api/knowledge/${slug}/bookmark/`);
      } else {
        await api.post(`/api/knowledge/${slug}/bookmark/`);
      }
    },
    onSuccess: (_, bookmarked) => {
      toast.success(bookmarked ? "Bookmark removed" : "Article bookmarked");
      void queryClient.invalidateQueries({ queryKey: articleKeys.detail(slug) });
      void queryClient.invalidateQueries({ queryKey: ["article-bookmarks"] });
    },
    onError: () => toast.error("Failed to update bookmark"),
  });

  if (isLoading) {
    return (
      <div className="container-page py-8">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-6 h-10 w-3/4" />
        <Skeleton className="mt-3 h-5 w-full" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-xl font-semibold">Article not found</h1>
        <Link to="/app/articles" className="mt-3 inline-block text-sm text-muted-foreground hover:text-foreground">
          Back to articles
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <Link to="/app/articles" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All articles
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_240px]">
        <article className="min-w-0">
          <Badge variant="outline" className="rounded-full">{article.category?.name}</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{article.title}</h1>
          <p className="mt-3 text-base text-muted-foreground">{article.summary}</p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-xs font-medium">
                {(article.author?.full_name ?? "SN").split(" ").map((s: string) => s[0]).join("")}
              </div>
              <div>
                <div className="font-medium">{article.author?.full_name ?? "Startup Navigator"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {article.reading_time} min</span>
              <Button
                size="icon"
                variant="ghost"
                aria-label={article.bookmarked ? "Remove bookmark" : "Bookmark article"}
                className="h-8 w-8"
                disabled={bookmarkMutation.isPending}
                onClick={() => bookmarkMutation.mutate(!!article.bookmarked)}
              >
                {article.bookmarked
                  ? <BookmarkCheck className="h-4 w-4 text-primary" />
                  : <Bookmark className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Share"
                className="h-8 w-8"
                onClick={() => {
                  void navigator.clipboard?.writeText(window.location.href);
                  toast.success("Link copied");
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {article.content}
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag.id} variant="outline" className="rounded-full">{tag.name}</Badge>
              ))}
            </div>
          )}
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Details</div>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div>{article.category?.name}</div>
              <div>{article.reading_time} min read</div>
              <div>
                {new Date(article.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
