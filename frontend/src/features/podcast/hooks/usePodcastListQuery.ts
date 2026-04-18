import { useQuery } from "@tanstack/react-query";
import { fetchPodcastList, type PodcastListParams } from "../api/fetchPodcastList";
import { podcastKeys } from "#/lib/query-keys";

export function usePodcastListQuery(params: PodcastListParams = {}) {
  return useQuery({
    queryKey: podcastKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchPodcastList(params),
    retry: false,
    placeholderData: (prev) => prev,
  });
}
