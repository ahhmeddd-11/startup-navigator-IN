import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { suggestedPrompts } from "@/lib/content";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  BookmarkCheck,
  Clock,
  FileText,
  History,
  Landmark,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Startup Navigator" }] }),
  component: Dashboard,
});

type DashboardData = {
  resource_bookmarks_count: number;
  article_bookmarks_count: number;
  ai_conversations_count: number;
  recently_viewed_count: number;
  recent_activity: {
    id: number;
    content_type: "resource" | "article";
    viewed_at: string;
    resource?: { slug: string; title: string; resource_type: string };
    article?: { slug: string; title: string; reading_time: number; category?: { name: string } };
  }[];
};

function Dashboard() {
  const { user } = useAuth();

  const { data: dashboard, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get("/api/dashboard/");
      return res.data?.data as DashboardData;
    },
  });

  const firstName = user?.full_name?.split(" ")[0] ?? "Founder";
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const totalBookmarks = (dashboard?.resource_bookmarks_count ?? 0) + (dashboard?.article_bookmarks_count ?? 0);

  const stats = [
    {
      label: "Articles bookmarked",
      value: isLoading ? "—" : String(dashboard?.article_bookmarks_count ?? 0),
      delta: "articles saved",
      icon: FileText,
    },
    {
      label: "Resources saved",
      value: isLoading ? "—" : String(dashboard?.resource_bookmarks_count ?? 0),
      delta: "resources bookmarked",
      icon: BookmarkCheck,
    },
    {
      label: "AI conversations",
      value: isLoading ? "—" : String(dashboard?.ai_conversations_count ?? 0),
      delta: "total threads",
      icon: Sparkles,
    },
    {
      label: "Items viewed",
      value: isLoading ? "—" : String(dashboard?.recently_viewed_count ?? 0),
      delta: "in history",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="container-page py-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground">{today}</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            Good morning, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's what to focus on today.</p>
        </div>
        <Button asChild>
          <Link to="/app/ai"><Sparkles className="mr-1.5 h-4 w-4" /> Ask AI</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            {isLoading
              ? <Skeleton className="mt-3 h-8 w-16" />
              : <div className="mt-3 text-2xl font-semibold tracking-tight">{s.value}</div>}
            <div className="mt-1 text-xs text-muted-foreground">{s.delta}</div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Recent activity</h2>
            <Link to="/app/history" className="text-xs text-muted-foreground hover:text-foreground">History</Link>
          </div>
          <div className="mt-4 space-y-2">
            {isLoading && (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            )}
            {error && (
              <div className="text-xs text-destructive">Failed to load recent activity.</div>
            )}
            {!isLoading && !error && (dashboard?.recent_activity ?? []).length === 0 && (
              <div className="text-xs text-muted-foreground py-4 text-center">
                No recent activity yet. Start browsing articles or resources!
              </div>
            )}
            {!isLoading && !error && (dashboard?.recent_activity ?? []).map((item) => {
              if (item.content_type === "article" && item.article) {
                return (
                  <Link
                    key={item.id}
                    to="/app/articles/$slug"
                    params={{ slug: item.article.slug }}
                    className="flex items-center justify-between rounded-lg border border-border p-3 text-sm hover:bg-accent/40"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{item.article.title}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        {item.article.category?.name && (
                          <Badge variant="outline" className="rounded-full">{item.article.category.name}</Badge>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {item.article.reading_time} min
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 shrink-0 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDistanceToNow(new Date(item.viewed_at), { addSuffix: true })}</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                );
              }
              if (item.content_type === "resource" && item.resource) {
                return (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{item.resource.title}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{item.resource.resource_type}</div>
                    </div>
                    <div className="ml-4 shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.viewed_at), { addSuffix: true })}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </Card>

        {/* Quick Actions + Suggested Prompts */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Quick actions</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { l: "Ask AI", to: "/app/ai" as const, i: Sparkles },
              { l: "Schemes", to: "/app/schemes" as const, i: Landmark },
              { l: "Articles", to: "/app/articles" as const, i: FileText },
              { l: "History", to: "/app/history" as const, i: History },
            ].map((a) => (
              <Button key={a.l} variant="outline" className="justify-start" asChild>
                <Link to={a.to}><a.i className="mr-2 h-4 w-4" /> {a.l}</Link>
              </Button>
            ))}
          </div>

          <h3 className="mt-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Suggested prompts</h3>
          <div className="mt-3 space-y-1.5">
            {suggestedPrompts.slice(0, 4).map((p) => (
              <Link
                key={p}
                to="/app/ai"
                className="block truncate rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {p}
              </Link>
            ))}
          </div>

          {totalBookmarks > 0 && (
            <>
              <h3 className="mt-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Bookmarks</h3>
              <Link
                to="/app/bookmarks"
                className="mt-2 flex items-center justify-between rounded-md border border-border p-3 text-sm hover:bg-accent/40"
              >
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="h-4 w-4" />
                  <span>{totalBookmarks} saved items</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
