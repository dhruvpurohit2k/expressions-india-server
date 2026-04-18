import { parseApiResponse, apiFetch } from "#/lib/api";
import { EnquirySchema } from "../types";

export async function fetchEnquiry(id: string) {
  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/enquiry/${id}`,
  );
  return parseApiResponse(response, EnquirySchema);
}
