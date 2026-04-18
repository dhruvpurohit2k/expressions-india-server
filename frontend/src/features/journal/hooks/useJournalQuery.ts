import { useQuery } from "@tanstack/react-query";
import { fetchJournal } from "../api/fetchJournal";
import { journalKeys } from "#/lib/query-keys";
import { retryUnless404 } from "#/lib/api";

export function useJournalQuery(id?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: journalKeys.detail(id ?? ""),
    queryFn: () => fetchJournal(id ?? ""),
    enabled: !!id && options?.enabled !== false,
    retry: retryUnless404,
  });
}
