import { parseMutationResponse, apiFetch } from "#/lib/api";

export async function saveBrochure(formData: FormData, id?: string) {
  const method = id ? "PUT" : "POST";
  const url = `${import.meta.env.VITE_SERVER_URL}/admin/brochure${id ? `/${id}` : ""}`;
  const response = await apiFetch(url, { method, body: formData });
  await parseMutationResponse(response);
}
