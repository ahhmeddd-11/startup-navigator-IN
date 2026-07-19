import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { History as HistoryIcon, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/app/history")({
  head: () => ({ meta: [{ title: "History — Startup Navigator" }] }),
  component: HistoryPage,
});

type HistoryItem = {
  id: number;
  content_type: "resource" | "article";
  viewed_at: string;
  resource?: {
    id: number;
    slug: string;
    title: string;
    resource_type: string;
    category?: { name: string };
  };
  article?: {
    id: number;
    slug: string;
    title: string;
    reading_time: number;
    category?: { name: string };
  };
};

function HistorySkeleton() {
  return (
    <Card className="flex items-center justify-between p-3">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </Card>
  );
}

function HistoryPage() {
  const { data: history = [], isLoading, error, refetch } = useQuery<HistoryItem[]>({
    queryKey: ["user-history"],
    queryFn: async () => {
      const res = await api.get("/api/users/history/");
      return (res.data?.data ?? []) as HistoryItem[];
    },
  });

  return (
    <div className="container-page py-8">
      <div className="flex items-center gap-2">
        <HistoryIcon className="h-5 w-5" />
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Everything you've read and explored.</p>

      <div className="mt-8 space-y-2">
        {isLoading && (
          <>
            <HistorySkeleton />
            <HistorySkeleton />
            <HistorySkeleton />
            <HistorySkeleton />
          </>
        )}

        {error && <ErrorState onRetry={() => refetch()} />}

        {!isLoading && !error && history.length === 0 && (
          <div className="grid place-items-center rounded-xl border border-dashed border-border p-12 text-center">
            <HistoryIcon className="h-6 w-6 text-muted-foreground" />
            <div className="mt-3 text-sm font-medium">No history yet</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Pages you visit will appear here.
            </div>
          </div>
        )}

        {!isLoading && !error && history.map((item) => {
          const isArticle = item.content_type === "article" && item.article;
          const isResource = item.content_type === "resource" && item.resource;

          if (isArticle && item.article) {
            return (
              <Link key={item.id} to="/app/articles/$slug" params={{ slug: item.article.slug }}>
                <Card className="flex items-center justify-between p-3 hover:bg-accent/40">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{item.article.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="rounded-full">{item.article.category?.name}</Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{item.article.reading_time} min
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.viewed_at), { addSuffix: true })}
                  </div>
                </Card>
              </Link>
            );
          }

          if (isResource && item.resource) {
            return (
              <Card key={item.id} className="flex items-center justify-between p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{item.resource.title}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="rounded-full">{item.resource.resource_type}</Badge>
                    {item.resource.category?.name && (
                      <span>{item.resource.category.name}</span>
                    )}
                  </div>
                </div>
                <div className="ml-4 shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.viewed_at), { addSuffix: true })}
                </div>
              </Card>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
