import { parseApiResponse, apiFetch } from "#/lib/api";
import { z } from "zod";
import { AudienceListItemSchema } from "../types";

export async function fetchAudienceList() {
  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/audience`,
  );
  return parseApiResponse(response, z.array(AudienceListItemSchema));
}
