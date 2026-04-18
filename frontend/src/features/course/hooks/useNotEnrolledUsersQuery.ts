import { useQuery } from "@tanstack/react-query";
import { courseKeys } from "#/lib/query-keys";
import { fetchNotEnrolledUsers, type EnrollmentParams } from "../api/fetchEnrolledUsers";

export function useNotEnrolledUsersQuery(courseId: string, params: EnrollmentParams = {}) {
  return useQuery({
    queryKey: courseKeys.notEnrolled(courseId, params as Record<string, unknown>),
    queryFn: () => fetchNotEnrolledUsers(courseId, params),
    placeholderData: (prev) => prev,
  });
}
