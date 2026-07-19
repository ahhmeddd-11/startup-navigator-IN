import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Resource = {
  id: number;
  slug: string;
  title: string;
  resource_type: "Template" | "Guide" | "Checklist" | "Toolkit";
  short_description: string;
  full_description?: string;
  external_link?: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  tags: {
    id: number;
    name: string;
    slug: string;
  }[];
  duration: string;
  created_at: string;
  featured: boolean;
  bookmarked?: boolean;
};

export type ResourceCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string;
};

export type ResourceTag = {
  id: number;
  name: string;
  slug: string;
};

export const resourceKeys = {
  all: ["resources"] as const,
  lists: () => [...resourceKeys.all, "list"] as const,
  list: (filters: any) => [...resourceKeys.lists(), filters] as const,
  detail: (slug: string) => [...resourceKeys.all, "detail", slug] as const,
  categories: () => [...resourceKeys.all, "categories"] as const,
  tags: () => [...resourceKeys.all, "tags"] as const,
};

export function useResources(filters: { search?: string; category?: string; tag?: string } = {}) {
  return useQuery({
    queryKey: resourceKeys.list(filters),
    queryFn: async () => {
      const response = await api.get("/api/resources/", { params: filters });
      const payload = response.data?.data;
      // Handle both paginated results and flat array lists
      if (payload && typeof payload === "object" && "results" in payload) {
        return payload.results as Resource[];
      }
      return (payload || []) as Resource[];
    },
  });
}

export function useResource(slug: string) {
  return useQuery({
    queryKey: resourceKeys.detail(slug),
    queryFn: async () => {
      const response = await api.get(`/api/resources/${slug}/`);
      return response.data?.data as Resource;
    },
    enabled: !!slug,
  });
}

export function useResourceCategories() {
  return useQuery({
    queryKey: resourceKeys.categories(),
    queryFn: async () => {
      const response = await api.get("/api/resources/categories/");
      const payload = response.data?.data;
      if (payload && typeof payload === "object" && "results" in payload) {
        return payload.results as ResourceCategory[];
      }
      return (payload || []) as ResourceCategory[];
    },
  });
}

export function useResourceTags() {
  return useQuery({
    queryKey: resourceKeys.tags(),
    queryFn: async () => {
      const response = await api.get("/api/resources/tags/");
      const payload = response.data?.data;
      if (payload && typeof payload === "object" && "results" in payload) {
        return payload.results as ResourceTag[];
      }
      return (payload || []) as ResourceTag[];
    },
  });
}
