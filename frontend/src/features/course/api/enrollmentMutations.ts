import { apiFetch, parseMutationResponse } from "#/lib/api";

export async function enrollUser(courseId: string, userId: string) {
  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/course/${courseId}/enroll`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    },
  );
  await parseMutationResponse(response);
}

export async function revokeAccess(courseId: string, userId: string) {
  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/course/${courseId}/enrolled/${userId}`,
    { method: "DELETE" },
  );
  await parseMutationResponse(response);
}
