import { useQuery } from "@tanstack/react-query";
import { fetchAudienceList } from "../api/fetchAudienceList";
import { audienceKeys } from "#/lib/query-keys";

export function useAudienceListQuery() {
  return useQuery({
    queryKey: audienceKeys.all,
    queryFn: () => fetchAudienceList(),
  });
}
