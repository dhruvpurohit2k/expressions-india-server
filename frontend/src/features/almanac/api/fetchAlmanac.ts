import { AlmanacSchema } from "../types";
import { parseApiResponse, apiFetch } from "#/lib/api";

export async function fetchAlmanac(id: string) {
  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/almanac/${id}`,
  );
  return parseApiResponse(response, AlmanacSchema);
}
