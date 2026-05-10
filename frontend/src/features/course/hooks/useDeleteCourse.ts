import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { apiFetch, parseMutationResponse } from "#/lib/api";

export function useDeleteCourse(id: string) {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const response = await apiFetch(
        `${import.meta.env.VITE_SERVER_URL}/api/admin/course/${id}`,
        { method: "DELETE" },
      );
      await parseMutationResponse(response);
    },
    meta: { successMessage: "Course deleted" },
    onSuccess: () => {
      navigate({ to: "/admin/course" });
    },
  });
}
