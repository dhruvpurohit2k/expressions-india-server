import { useQuery } from "@tanstack/react-query";
import { fetchEventList, type EventListParams } from "../api/fetchEventList.ts";
import { eventKeys } from "#/lib/query-keys";

export function useEventListQuery(params: EventListParams = {}) {
  return useQuery({
    queryKey: eventKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchEventList(params),
    retry: false,
    placeholderData: (prev) => prev,
  });
}
