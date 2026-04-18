import { parsePaginatedResponse, apiFetch } from "#/lib/api";
import { JournalListItemSchema } from "../types";

export type JournalListParams = {
  search?: string;
  year?: number;
  limit?: number;
  offset?: number;
};

export async function fetchJournalList(params: JournalListParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.year) query.set("year", String(params.year));
  query.set("limit", String(params.limit ?? 15));
  query.set("offset", String(params.offset ?? 0));

  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/journal?${query.toString()}`,
  );
  return parsePaginatedResponse(response, JournalListItemSchema);
}
