import { BrochureSchema } from "../types";
import { parseApiResponse, apiFetch } from "#/lib/api";

export async function fetchBrochure(id: string) {
  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/brochure/${id}`,
  );
  return parseApiResponse(response, BrochureSchema);
}
