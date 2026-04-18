import { parseApiResponse, apiFetch } from "#/lib/api";
import { CourseSchema } from "../types";

export async function fetchCourse(id: string) {
  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/course/${id}`,
  );
  return parseApiResponse(response, CourseSchema);
}
