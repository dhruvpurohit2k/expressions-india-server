import { EventSchema } from "../types";
import { parseApiResponse, apiFetch } from "#/lib/api";

export async function fetchEvent(id: string) {
  const response = await apiFetch(`${import.meta.env.VITE_SERVER_URL}/admin/event/${id}`);
  return parseApiResponse(response, EventSchema);
}
