import { useQuery } from "@tanstack/react-query";
import { fetchEvent } from "../api/fetchEvent";
import { eventKeys } from "#/lib/query-keys";
import { retryUnless404 } from "#/lib/api";

export function useEvent(id?: string, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: eventKeys.detail(id!),
		queryFn: () => fetchEvent(id!),
		enabled: !!id && options?.enabled !== false,
		retry: retryUnless404,
	});
}
