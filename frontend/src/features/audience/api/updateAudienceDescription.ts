import { parseMutationResponse, apiFetch } from "#/lib/api";

export async function updateAudienceDescription(
  id: number,
  introduction: string,
) {
  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/audience/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: introduction }),
    },
  );
  await parseMutationResponse(response);
}
