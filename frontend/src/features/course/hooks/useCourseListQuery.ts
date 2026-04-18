import { useQuery } from "@tanstack/react-query";
import { fetchCourseList, type CourseListParams } from "../api/fetchCourseList";
import { courseKeys } from "#/lib/query-keys";

export function useCourseListQuery(params: CourseListParams = {}) {
  return useQuery({
    queryKey: courseKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchCourseList(params),
    retry: false,
    placeholderData: (prev) => prev,
  });
}
