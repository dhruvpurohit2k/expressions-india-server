import { EventListSchema } from "../types";
import { parsePaginatedResponse, apiFetch } from "#/lib/api";

export type EventListParams = {
  search?: string;
  status?: string;
  online?: boolean | null;
  paid?: boolean | null;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
};

export async function fetchEventList(params: EventListParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.online != null) query.set("online", String(params.online));
  if (params.paid != null) query.set("paid", String(params.paid));
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  query.set("limit", String(params.limit ?? 15));
  query.set("offset", String(params.offset ?? 0));

  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/event?${query.toString()}`,
  );
  return parsePaginatedResponse(response, EventListSchema);
}
