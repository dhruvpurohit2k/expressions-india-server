import { parseMutationResponse, apiFetch } from "#/lib/api";

export async function saveJournal(formData: FormData, id?: string) {
  const method = id ? "PUT" : "POST";
  const url = `${import.meta.env.VITE_SERVER_URL}/admin/journal${id ? `/${id}` : ""}`;
  const response = await apiFetch(url, { method, body: formData });
  await parseMutationResponse(response);
}
