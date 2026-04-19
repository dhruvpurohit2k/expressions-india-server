import { apiFetch, parseMutationResponse } from "#/lib/api";

export interface CertApplicationPayload {
  formUrl: string;
  openFrom?: string | null;
  openUntil?: string | null;
  closedMessage?: string | null;
}

export async function saveCertApplication(payload: CertApplicationPayload, id?: string) {
  const method = id ? "PUT" : "POST";
  const url = `${import.meta.env.VITE_SERVER_URL}/admin/certificate-application${id ? `/${id}` : ""}`;
  const res = await apiFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await parseMutationResponse(res);
}
