import { enquiryKeys } from "#/lib/query-keys";
import { useQuery } from "@tanstack/react-query";
import { fetchEnquiry } from "../api/fetchEnquiry";
import { retryUnless404 } from "#/lib/api";

export function useEnquiryQuery(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: enquiryKeys.detail(id!),
    queryFn: () => fetchEnquiry(id!),
    enabled: !!id && options?.enabled !== false,
    retry: retryUnless404,
  });
}
