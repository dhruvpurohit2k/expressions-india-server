import { apiFetch, parseApiResponse } from "#/lib/api";
import { z } from "zod";
import { TeamSchema } from "../types";

export async function fetchTeamList() {
  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/team`,
  );
  return parseApiResponse(response, z.array(TeamSchema));
}
