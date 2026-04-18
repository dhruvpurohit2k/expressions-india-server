import { BrochureListItemSchema } from "../types";
import { parsePaginatedResponse, apiFetch } from "#/lib/api";

export type BrochureListParams = {
  limit?: number;
  offset?: number;
};

export async function fetchBrochureList(params: BrochureListParams = {}) {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit ?? 15));
  query.set("offset", String(params.offset ?? 0));

  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/brochure?${query.toString()}`,
  );
  return parsePaginatedResponse(response, BrochureListItemSchema);
}
