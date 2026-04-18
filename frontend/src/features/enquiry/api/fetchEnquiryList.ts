import { parsePaginatedResponse, apiFetch } from "#/lib/api";
import { EnquiryListItemSchema } from "../types";

export type EnquiryListParams = {
  name?: string;
  email?: string;
  phone?: string;
  limit?: number;
  offset?: number;
};

export async function fetchEnquiryList(params: EnquiryListParams = {}) {
  const query = new URLSearchParams();
  if (params.name) query.set("name", params.name);
  if (params.email) query.set("email", params.email);
  if (params.phone) query.set("phone", params.phone);
  query.set("limit", String(params.limit ?? 15));
  query.set("offset", String(params.offset ?? 0));

  const response = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/enquiry?${query.toString()}`,
  );
  return parsePaginatedResponse(response, EnquiryListItemSchema);
}
