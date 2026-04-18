import { parsePaginatedResponse, apiFetch } from "#/lib/api";
import { ArticleListItemSchema } from "../types";

export type ArticleListParams = {
  search?: string;
  category?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
};

export async function fetchArticleList(params: ArticleListParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  query.set("limit", String(params.limit ?? 15));
  query.set("offset", String(params.offset ?? 0));

  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/article?${query.toString()}`,
  );
  return parsePaginatedResponse(response, ArticleListItemSchema);
}
