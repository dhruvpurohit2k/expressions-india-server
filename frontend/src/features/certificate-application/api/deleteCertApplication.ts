import { apiFetch, parseMutationResponse } from "#/lib/api";

export async function deleteCertApplication(id: string) {
  const res = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/certificate-application/${id}`,
    { method: "DELETE" },
  );
  await parseMutationResponse(res);
}
