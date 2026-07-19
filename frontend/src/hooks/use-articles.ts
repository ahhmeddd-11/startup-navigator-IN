import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Article = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  reading_time: number;
  featured_image?: string;
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
  author?: {
    id: number;
    full_name: string;
    email: string;
  };
  created_at: string;
  featured: boolean;
  bookmarked?: boolean;
};

export type KnowledgeCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string;
};

export type KnowledgeTag = {
  id: number;
  name: string;
  slug: string;
};

export const articleKeys = {
  all: ["articles"] as const,
  lists: () => [...articleKeys.all, "list"] as const,
  list: (filters: any) => [...articleKeys.lists(), filters] as const,
  detail: (slug: string) => [...articleKeys.all, "detail", slug] as const,
  categories: () => [...articleKeys.all, "categories"] as const,
  tags: () => [...articleKeys.all, "tags"] as const,
};

export function useArticles(filters: { search?: string; category?: string; tag?: string } = {}) {
  return useQuery({
    queryKey: articleKeys.list(filters),
    queryFn: async () => {
      const response = await api.get("/api/knowledge/", { params: filters });
      const payload = response.data?.data;
      if (payload && typeof payload === "object" && "results" in payload) {
        return payload.results as Article[];
      }
      return (payload || []) as Article[];
    },
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: articleKeys.detail(slug),
    queryFn: async () => {
      const response = await api.get(`/api/knowledge/${slug}/`);
      return response.data?.data as Article;
    },
    enabled: !!slug,
  });
}

export function useKnowledgeCategories() {
  return useQuery({
    queryKey: articleKeys.categories(),
    queryFn: async () => {
      const response = await api.get("/api/knowledge/categories/");
      const payload = response.data?.data;
      if (payload && typeof payload === "object" && "results" in payload) {
        return payload.results as KnowledgeCategory[];
      }
      return (payload || []) as KnowledgeCategory[];
    },
  });
}

export function useKnowledgeTags() {
  return useQuery({
    queryKey: articleKeys.tags(),
    queryFn: async () => {
      const response = await api.get("/api/knowledge/tags/");
      const payload = response.data?.data;
      if (payload && typeof payload === "object" && "results" in payload) {
        return payload.results as KnowledgeTag[];
      }
      return (payload || []) as KnowledgeTag[];
    },
  });
}
