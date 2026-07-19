import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { History as HistoryIcon, Clock, Landmark, MessageSquare, Search as SearchIcon, Compass } from "lucide-react";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/app/history")({
  head: () => ({ meta: [{ title: "History — Startup Navigator" }] }),
  component: HistoryPage,
});

type HistoryItem = {
  id: number;
  content_type: "resource" | "article" | "scheme" | "recommendations" | "search";
  viewed_at: string;
  metadata?: {
    title?: string;
    name?: string;
    query?: string;
    slug?: string;
    ministry?: string;
    category?: string;
  } | null;
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
            <HistoryIcon className="h-8 w-8 text-muted-foreground/40" />
            <div className="mt-3 text-sm font-medium">No history yet</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Pages you visit will appear here.
            </div>
          </div>
        )}

        {!isLoading && !error && history.map((item) => {
          const timeAgo = formatDistanceToNow(new Date(item.viewed_at), { addSuffix: true });

          if (item.content_type === "article" && item.article) {
            return (
              <Link key={item.id} to="/app/articles/$slug" params={{ slug: item.article.slug }}>
                <Card className="flex items-center justify-between p-3 hover:bg-accent/40 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{item.article.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="rounded-full">{item.article.category?.name}</Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{item.article.reading_time} min
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 shrink-0 text-xs text-muted-foreground">{timeAgo}</div>
                </Card>
              </Link>
            );
          }

          if (item.content_type === "resource" && item.resource) {
            return (
              <Card key={item.id} className="flex items-center justify-between p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Compass className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div className="truncate text-sm font-medium">{item.resource.title}</div>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="rounded-full">{item.resource.resource_type}</Badge>
                    {item.resource.category?.name && (
                      <span>{item.resource.category.name}</span>
                    )}
                  </div>
                </div>
                <div className="ml-4 shrink-0 text-xs text-muted-foreground">{timeAgo}</div>
              </Card>
            );
          }

          if (item.content_type === "scheme" && item.metadata) {
            return (
              <Link key={item.id} to="/app/schemes">
                <Card className="flex items-center justify-between p-3 hover:bg-accent/40 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Landmark className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <div className="truncate text-sm font-medium">{item.metadata.name ?? item.metadata.title ?? "Government Scheme"}</div>
                    </div>
                    {item.metadata.ministry && (
                      <div className="mt-0.5 text-xs text-muted-foreground">{item.metadata.ministry}</div>
                    )}
                  </div>
                  <div className="ml-4 shrink-0 text-xs text-muted-foreground">{timeAgo}</div>
                </Card>
              </Link>
            );
          }

          if (item.content_type === "recommendations") {
            return (
              <Link key={item.id} to="/app/recommendations">
                <Card className="flex items-center justify-between p-3 hover:bg-accent/40 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <div className="truncate text-sm font-medium">Viewed Recommendations</div>
                    </div>
                  </div>
                  <div className="ml-4 shrink-0 text-xs text-muted-foreground">{timeAgo}</div>
                </Card>
              </Link>
            );
          }

          if (item.content_type === "search" && item.metadata?.query) {
            return (
              <Link key={item.id} to="/app/search">
                <Card className="flex items-center justify-between p-3 hover:bg-accent/40 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <SearchIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <div className="truncate text-sm font-medium">Searched: "{item.metadata.query}"</div>
                    </div>
                  </div>
                  <div className="ml-4 shrink-0 text-xs text-muted-foreground">{timeAgo}</div>
                </Card>
              </Link>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
