import { AlmanacListItemSchema } from "../types";
import { parsePaginatedResponse, apiFetch } from "#/lib/api";

export type AlmanacListParams = {
  limit?: number;
  offset?: number;
};

export async function fetchAlmanacList(params: AlmanacListParams = {}) {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit ?? 15));
  query.set("offset", String(params.offset ?? 0));

  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/almanac?${query.toString()}`,
  );
  return parsePaginatedResponse(response, AlmanacListItemSchema);
}
