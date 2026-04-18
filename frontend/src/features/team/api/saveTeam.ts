import { apiFetch, parseMutationResponse } from "#/lib/api";

type PositionInput = { position: string; holders: string[] };

export type TeamPayload = {
  description: string;
  members: PositionInput[];
};

export async function saveTeam(payload: TeamPayload, id?: string) {
  const url = id
    ? `${import.meta.env.VITE_SERVER_URL}/admin/team/${id}`
    : `${import.meta.env.VITE_SERVER_URL}/admin/team`;
  const response = await apiFetch(url, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await parseMutationResponse(response);
}
