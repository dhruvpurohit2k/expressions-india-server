import { useQuery } from "@tanstack/react-query";
import { fetchJournalList, type JournalListParams } from "../api/fetchJournalList";
import { journalKeys } from "#/lib/query-keys";

export function useJournalListQuery(params: JournalListParams = {}) {
  return useQuery({
    queryKey: journalKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchJournalList(params),
    placeholderData: (prev) => prev,
  });
}
