import { useQuery } from "@tanstack/react-query";
import { fetchBrochure } from "../api/fetchBrochure";
import { brochureKeys } from "#/lib/query-keys";
import { retryUnless404 } from "#/lib/api";

export function useBrochureQuery(id: string) {
  return useQuery({
    queryKey: brochureKeys.detail(id),
    queryFn: () => fetchBrochure(id),
    retry: retryUnless404,
  });
}
