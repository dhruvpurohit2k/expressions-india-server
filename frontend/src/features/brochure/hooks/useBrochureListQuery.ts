import { useQuery } from "@tanstack/react-query";
import { fetchBrochureList, type BrochureListParams } from "../api/fetchBrochureList";
import { brochureKeys } from "#/lib/query-keys";

export function useBrochureListQuery(params: BrochureListParams = {}) {
  return useQuery({
    queryKey: brochureKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchBrochureList(params),
    retry: false,
    placeholderData: (prev) => prev,
  });
}
