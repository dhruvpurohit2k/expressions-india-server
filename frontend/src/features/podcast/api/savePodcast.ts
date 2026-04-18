import { parseMutationResponse, apiFetch } from "#/lib/api";

export async function savePodcast(body: Record<string, unknown>, id?: string) {
  const method = id ? "PUT" : "POST";
  const url = `${import.meta.env.VITE_SERVER_URL}/admin/podcast${id ? `/${id}` : ""}`;
  const response = await apiFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await parseMutationResponse(response);
}
