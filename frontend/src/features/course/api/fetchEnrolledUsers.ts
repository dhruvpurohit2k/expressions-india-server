import { apiFetch, parsePaginatedResponse } from "#/lib/api";
import { EnrolledUserSchema } from "../types/enrollment";

export type EnrollmentParams = {
  search?: string;
  limit?: number;
  offset?: number;
};

export async function fetchEnrolledUsers(courseId: string, params: EnrollmentParams = {}) {
  const url = new URL(`${import.meta.env.VITE_SERVER_URL}/admin/course/${courseId}/enrolled`);
  if (params.search) url.searchParams.set("search", params.search);
  if (params.limit != null) url.searchParams.set("limit", String(params.limit));
  if (params.offset != null) url.searchParams.set("offset", String(params.offset));

  const response = await apiFetch(url.toString());
  return parsePaginatedResponse(response, EnrolledUserSchema);
}

export async function fetchNotEnrolledUsers(courseId: string, params: EnrollmentParams = {}) {
  const url = new URL(`${import.meta.env.VITE_SERVER_URL}/admin/course/${courseId}/not-enrolled`);
  if (params.search) url.searchParams.set("search", params.search);
  if (params.limit != null) url.searchParams.set("limit", String(params.limit));
  if (params.offset != null) url.searchParams.set("offset", String(params.offset));

  const response = await apiFetch(url.toString());
  return parsePaginatedResponse(response, EnrolledUserSchema);
}
