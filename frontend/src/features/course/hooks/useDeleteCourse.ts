import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { apiFetch, parseMutationResponse } from "#/lib/api";
import { courseKeys } from "#/lib/query-keys";

export function useDeleteCourse(id: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiFetch(
        `${import.meta.env.VITE_SERVER_URL}/admin/course/${id}`,
        { method: "DELETE" },
      );
      await parseMutationResponse(response);
    },
    meta: { successMessage: "Course deleted" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
      navigate({ to: "/admin/course" });
    },
  });
}
