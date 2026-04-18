import { useQuery } from "@tanstack/react-query";
import { fetchCourse } from "../api/fetchCourse";
import { courseKeys } from "#/lib/query-keys";
import { retryUnless404 } from "#/lib/api";

export function useCourseQuery(id: string | undefined) {
  return useQuery({
    queryKey: courseKeys.detail(id!),
    queryFn: () => fetchCourse(id!),
    enabled: !!id,
    retry: retryUnless404,
  });
}
