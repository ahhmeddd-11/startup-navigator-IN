import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSchemes } from "@/hooks/use-schemes";
import { SchemeCard } from "@/components/shared/scheme-card";
import { FilterPills } from "@/components/shared/filter-pills";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";

import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_public/schemes")({
  head: () => ({
    meta: [
      { title: "Government schemes — Startup Navigator" },
      {
        name: "description",
        content:
          "Central and state government schemes for Indian startups, with eligibility and benefits.",
      },
    ],
  }),
  component: SchemesPage,
});

const schemeCategories = ["All", "Funding", "Taxation", "Innovation", "Inclusion"];

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
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const filtered = useMemo(
    () =>
      schemes.filter(
        (s) =>
          (cat === "All" || s.category === cat) &&
          (q === "" ||
            (s.name + s.summary + s.ministry).toLowerCase().includes(q.toLowerCase()))
      ),
    [schemes, q, cat]
  );

  return (
    <div className="container-page py-16 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Government schemes</h1>
        <p className="mt-4 text-muted-foreground">
          {isLoading ? "Curated schemes from ministries..." : `${schemes.length}+ curated schemes from DPIIT, SIDBI, MeitY and other ministries — with clear eligibility and benefits.`}
        </p>
      </div>
      <div className="mx-auto mt-10 max-w-4xl">
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Search schemes"
          inputClassName="h-11 pl-10"
          aria-label="Search schemes"
        />
        <FilterPills
          options={schemeCategories}
          selected={cat}
          onSelect={setCat}
          className="mt-4"
        />
      </div>
      <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2">
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
        {!isLoading && !error && filtered.map((s) => (
          <SchemeCard key={s.slug} scheme={s} />
        ))}
        {!isLoading && !error && filtered.length === 0 && (
          <EmptyState message="No schemes match your filters." />
        )}
      </div>
    </div>
  );
}
