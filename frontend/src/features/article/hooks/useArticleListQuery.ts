import { useQuery } from "@tanstack/react-query";
import { fetchArticleList, type ArticleListParams } from "../api/fetchArticleList";
import { articleKeys } from "#/lib/query-keys";

export function useArticleListQuery(params: ArticleListParams = {}) {
  return useQuery({
    queryKey: articleKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchArticleList(params),
    retry: false,
    placeholderData: (prev) => prev,
  });
}
