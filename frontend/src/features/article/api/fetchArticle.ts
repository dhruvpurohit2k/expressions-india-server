import { parseApiResponse, apiFetch } from "#/lib/api";
import { ArticleSchema } from "../types";

export async function fetchArticle(id: string) {
  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/api/admin/article/${id}`,
  );
  return parseApiResponse(response, ArticleSchema);
}
