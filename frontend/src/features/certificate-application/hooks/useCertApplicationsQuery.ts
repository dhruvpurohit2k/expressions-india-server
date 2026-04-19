import { useQuery } from "@tanstack/react-query";
import { certApplicationKeys } from "#/lib/query-keys";
import { fetchCertApplications } from "../api/fetchCertApplications";

export function useCertApplicationsQuery() {
  return useQuery({
    queryKey: certApplicationKeys.all,
    queryFn: fetchCertApplications,
  });
}
