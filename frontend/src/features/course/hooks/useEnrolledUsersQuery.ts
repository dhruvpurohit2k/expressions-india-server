import { useQuery } from "@tanstack/react-query";
import { courseKeys } from "#/lib/query-keys";
import { fetchEnrolledUsers, type EnrollmentParams } from "../api/fetchEnrolledUsers";

export function useEnrolledUsersQuery(courseId: string, params: EnrollmentParams = {}) {
  return useQuery({
    queryKey: courseKeys.enrolled(courseId, params as Record<string, unknown>),
    queryFn: () => fetchEnrolledUsers(courseId, params),
    placeholderData: (prev) => prev,
  });
}
