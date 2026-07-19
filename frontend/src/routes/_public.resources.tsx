import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, Clock } from "lucide-react";
import { useResources } from "@/hooks/use-resources";

import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";

export const Route = createFileRoute("/_public/resources")({
  head: () => ({
    meta: [
      { title: "Resources — Startup Navigator" },
      { name: "description", content: "Templates, toolkits, and checklists for Indian founders." },
    ],
  }),
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
  const { data: resources = [], isLoading, error, refetch } = useResources();

  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Templates &amp; toolkits
        </h1>
        <p className="mt-4 text-muted-foreground">
          Practical, ready-to-use assets — reviewed by Indian operators and updated every quarter.
        </p>
      </div>
      <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-2">
        {isLoading && (
          <>
            <ResourceCardSkeleton />
            <ResourceCardSkeleton />
            <ResourceCardSkeleton />
            <ResourceCardSkeleton />
          </>
        )}
        {error && (
          <ErrorState onRetry={() => refetch()} />
        )}
        {!isLoading && !error && resources.map((r) => (
          <Card key={r.slug} className="group p-5 transition-colors hover:bg-accent/40">
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="rounded-full">
                {r.resource_type}
              </Badge>
              <span className="text-muted-foreground">{r.category?.name}</span>
              <span className="ml-auto flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" /> {r.duration}
              </span>
            </div>
            <h3 className="mt-3 text-base font-medium">{r.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{r.short_description}</p>
            <Link
              to="/register"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground/90 hover:text-foreground"
            >
              Get resource <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Card>
        ))}
        {!isLoading && !error && resources.length === 0 && (
          <EmptyState message="No resources found." />
        )}
      </div>
    </div>
  );
}
