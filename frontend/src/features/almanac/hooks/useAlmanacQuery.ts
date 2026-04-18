import { useQuery } from "@tanstack/react-query";
import { fetchAlmanac } from "../api/fetchAlmanac";
import { almanacKeys } from "#/lib/query-keys";
import { retryUnless404 } from "#/lib/api";

export function useAlmanacQuery(id: string) {
  return useQuery({
    queryKey: almanacKeys.detail(id),
    queryFn: () => fetchAlmanac(id),
    retry: retryUnless404,
  });
}
