import { parseApiResponse, apiFetch } from "#/lib/api";
import { PodcastSchema } from "../types";

export async function fetchPodcast(id: string) {
  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/podcast/${id}`,
  );
  return parseApiResponse(response, PodcastSchema);
}
