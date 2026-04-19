import { z } from "zod";
import { apiFetch, parseApiResponse } from "#/lib/api";
import { CertApplicationSchema } from "../types";

export async function fetchCertApplications() {
  const res = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/certificate-application`,
  );
  return parseApiResponse(res, z.array(CertApplicationSchema));
}
