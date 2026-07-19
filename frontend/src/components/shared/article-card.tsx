import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { Article } from "@/hooks/use-articles";

interface ArticleCardProps {
  article: Article;
  /** Route to link to. Use /articles/$slug for public, /app/articles/$slug for app. */
  linkTo: "/articles/$slug" | "/app/articles/$slug";
}

/**
 * Reusable article preview card used in both the public and app article list pages.
 */
export function ArticleCard({ article, linkTo }: ArticleCardProps) {
  return (
    <Link to={linkTo} params={{ slug: article.slug }} className="group">
      <Card className="h-full p-5 transition-colors group-hover:bg-accent/40">
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
