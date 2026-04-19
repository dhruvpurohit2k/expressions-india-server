import { apiFetch, parsePaginatedResponse } from "#/lib/api";
import { EnrolledUserSchema } from "../types/enrollment";

export type EnrollmentParams = {
  search?: string;
  limit?: number;
  offset?: number;
};

function buildQuery(params: EnrollmentParams): string {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.offset != null) q.set("offset", String(params.offset));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function fetchEnrolledUsers(courseId: string, params: EnrollmentParams = {}) {
  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/course/${courseId}/enrolled${buildQuery(params)}`,
  );
  return parsePaginatedResponse(response, EnrolledUserSchema);
}

export async function fetchNotEnrolledUsers(courseId: string, params: EnrollmentParams = {}) {
  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/course/${courseId}/not-enrolled${buildQuery(params)}`,
  );
  return parsePaginatedResponse(response, EnrolledUserSchema);
}
