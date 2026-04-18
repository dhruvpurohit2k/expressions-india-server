import { useQuery } from "@tanstack/react-query";
import { fetchEnquiryList, type EnquiryListParams } from "../api/fetchEnquiryList";
import { enquiryKeys } from "#/lib/query-keys";

export function useEnquiryListQuery(params: EnquiryListParams = {}) {
  return useQuery({
    queryKey: enquiryKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchEnquiryList(params),
    placeholderData: (prev) => prev,
  });
}
