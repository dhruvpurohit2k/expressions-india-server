import { useQuery } from "@tanstack/react-query";
import { fetchPodcast } from "../api/fetchPodcast";
import { podcastKeys } from "#/lib/query-keys";
import { retryUnless404 } from "#/lib/api";

export function usePodcastQuery(id?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: podcastKeys.detail(id!),
    queryFn: () => fetchPodcast(id!),
    enabled: !!id && options?.enabled !== false,
    retry: retryUnless404,
  });
}
