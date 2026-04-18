import { parsePaginatedResponse, apiFetch } from "#/lib/api";
import { CourseListItemSchema } from "../types";

export type CourseListParams = {
  search?: string;
  audiences?: string; // comma-separated
  sortField?: "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
};

export async function fetchCourseList(params: CourseListParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.audiences) query.set("audiences", params.audiences);
  if (params.sortField) query.set("sortField", params.sortField);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  query.set("limit", String(params.limit ?? 15));
  query.set("offset", String(params.offset ?? 0));

  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/course?${query.toString()}`,
  );
  return parsePaginatedResponse(response, CourseListItemSchema);
}
