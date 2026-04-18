import { JournalSchema } from "../types";
import { parseApiResponse, apiFetch } from "#/lib/api";

export async function fetchJournal(id: string) {
  const response = await apiFetch(`${import.meta.env.VITE_SERVER_URL}/admin/journal/${id}`);
  return parseApiResponse(response, JournalSchema);
}
