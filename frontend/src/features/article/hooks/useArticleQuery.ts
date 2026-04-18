import { useQuery } from "@tanstack/react-query";
import { fetchArticle } from "../api/fetchArticle";
import { articleKeys } from "#/lib/query-keys";
import { retryUnless404 } from "#/lib/api";

export function useArticleQuery(id: string | undefined) {
  return useQuery({
    queryKey: articleKeys.detail(id!),
    queryFn: () => fetchArticle(id!),
    enabled: !!id,
    retry: retryUnless404,
  });
}
