import { createFileRoute } from "@tanstack/react-router";
import { useSchemes } from "@/hooks/use-schemes";
import { SchemeCard } from "@/components/shared/scheme-card";

import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export const Route = createFileRoute("/app/schemes")({
  head: () => ({ meta: [{ title: "Government schemes — Startup Navigator" }] }),
  component: SchemesPage,
});

function SchemeCardSkeleton() {
  return (
    <Card className="flex flex-col p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <div className="space-y-3 pt-2">
        <div className="space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-4">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </Card>
  );
}

function SchemesPage() {
  const { data: schemes = [], isLoading, error, refetch } = useSchemes();

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Government schemes</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Central and state schemes with eligibility and benefits.
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {isLoading && (
          <>
            <SchemeCardSkeleton />
            <SchemeCardSkeleton />
            <SchemeCardSkeleton />
            <SchemeCardSkeleton />
          </>
        )}
        {error && (
          <ErrorState onRetry={() => refetch()} />
        )}
        {!isLoading && !error && schemes.map((scheme) => (
          <SchemeCard key={scheme.slug} scheme={scheme} />
        ))}
        {!isLoading && !error && schemes.length === 0 && (
          <EmptyState message="No schemes found." />
        )}
      </div>
    </div>
  );
}
