import { useQuery } from "@tanstack/react-query";
import { schemes, type Scheme } from "@/lib/content";

export const schemeKeys = {
  all: ["schemes"] as const,
  detail: (slug: string) => ["schemes", slug] as const,
};

/**
 * Fetches the full list of government schemes.
 * Currently returns static data from content.ts.
 * Replace the queryFn body with a real API call when a backend is available.
 */
export function useSchemes() {
  return useQuery<Scheme[]>({
    queryKey: schemeKeys.all,
    queryFn: async () => schemes,
    staleTime: Infinity,
  });
}

/**
 * Fetches a single scheme by slug.
 */
export function useScheme(slug: string) {
  return useQuery<Scheme | undefined>({
    queryKey: schemeKeys.detail(slug),
    queryFn: async () => schemes.find((s) => s.slug === slug),
    staleTime: Infinity,
  });
}
