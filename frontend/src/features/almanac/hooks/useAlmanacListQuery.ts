import { useQuery } from "@tanstack/react-query";
import { fetchAlmanacList, type AlmanacListParams } from "../api/fetchAlmanacList";
import { almanacKeys } from "#/lib/query-keys";

export function useAlmanacListQuery(params: AlmanacListParams = {}) {
  return useQuery({
    queryKey: almanacKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchAlmanacList(params),
    retry: false,
    placeholderData: (prev) => prev,
  });
}
