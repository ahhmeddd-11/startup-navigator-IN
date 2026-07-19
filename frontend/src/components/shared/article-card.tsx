import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Clock } from "lucide-react";
import type { Article } from "@/hooks/use-articles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { articleKeys } from "@/hooks/use-articles";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface ArticleCardProps {
  article: Article;
  /** Route to link to. Use /articles/$slug for public, /app/articles/$slug for app. */
  linkTo: "/articles/$slug" | "/app/articles/$slug";
}

/**
 * Reusable article preview card used in both the public and app article list pages.
 * On the app route, shows a bookmark toggle button that persists to the backend.
 */
export function ArticleCard({ article, linkTo }: ArticleCardProps) {
  const queryClient = useQueryClient();
  const isAppRoute = linkTo === "/app/articles/$slug";

  const bookmarkMutation = useMutation({
    mutationFn: async (bookmarked: boolean) => {
      if (bookmarked) {
        await api.delete(`/api/knowledge/${article.slug}/bookmark/`);
      } else {
        await api.post(`/api/knowledge/${article.slug}/bookmark/`);
      }
    },
    onSuccess: (_, bookmarked) => {
      toast.success(bookmarked ? "Bookmark removed" : "Article bookmarked");
      void queryClient.invalidateQueries({ queryKey: articleKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["article-bookmarks"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => toast.error("Failed to update bookmark"),
  });

  return (
    <Link to={linkTo} params={{ slug: article.slug }} className="group">
      <Card className="relative h-full p-5 transition-colors group-hover:bg-accent/40">
        {isAppRoute && (
          <Button
            size="icon"
            variant="ghost"
            aria-label={article.bookmarked ? "Remove bookmark" : "Bookmark article"}
            className="absolute right-2 top-2 h-7 w-7 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={bookmarkMutation.isPending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              bookmarkMutation.mutate(!!article.bookmarked);
            }}
          >
            {article.bookmarked
              ? <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
              : <Bookmark className="h-3.5 w-3.5" />
            }
          </Button>
        )}
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline" className="rounded-full">
            {article.category?.name ?? "—"}
          </Badge>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            {article.reading_time} min read
          </span>
        </div>
        <h3 className="mt-3 text-base font-semibold tracking-tight">{article.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{article.author?.full_name ?? "Startup Navigator"}</span>
          <span>
            {new Date(article.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
      </Card>
    </Link>
  );
}
