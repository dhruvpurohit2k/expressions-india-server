import { useMutation, useQueryClient } from "@tanstack/react-query";
import { courseKeys } from "#/lib/query-keys";
import { enrollUser, revokeAccess } from "../api/enrollmentMutations";

export function useEnrollUser(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => enrollUser(courseId, userId),
    meta: { successMessage: "Access granted" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.enrolled(courseId, {}) });
      queryClient.invalidateQueries({ queryKey: courseKeys.notEnrolled(courseId, {}) });
    },
  });
}

export function useRevokeAccess(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => revokeAccess(courseId, userId),
    meta: { successMessage: "Access revoked" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.enrolled(courseId, {}) });
      queryClient.invalidateQueries({ queryKey: courseKeys.notEnrolled(courseId, {}) });
    },
  });
}
