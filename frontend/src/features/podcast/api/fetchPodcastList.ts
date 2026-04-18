import { parsePaginatedResponse, apiFetch } from "#/lib/api";
import { PodcastListItemSchema } from "../types";

export type PodcastListParams = {
  search?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
};

export async function fetchPodcastList(params: PodcastListParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  query.set("limit", String(params.limit ?? 15));
  query.set("offset", String(params.offset ?? 0));

  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/podcast?${query.toString()}`,
  );
  return parsePaginatedResponse(response, PodcastListItemSchema);
}
