import { useQuery } from "@tanstack/react-query";
import { fetchTeamList } from "../api/fetchTeamList";
import { teamKeys } from "#/lib/query-keys";

export function useTeamListQuery() {
  return useQuery({
    queryKey: teamKeys.all,
    queryFn: fetchTeamList,
  });
}
