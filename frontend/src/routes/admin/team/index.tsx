import { createFileRoute } from "@tanstack/react-router";
import { H1 } from "#/components/ui/typographyh1";
import { Skeleton } from "#/components/ui/skeleton";
import { useTeamListQuery } from "#/features/team/hooks/useTeamListQuery";
import { TeamForm } from "./_formLayout";

export const Route = createFileRoute("/admin/team/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: teams, isLoading, error } = useTeamListQuery();

  const team = teams?.[0];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <H1>Team</H1>

      {isLoading ? (
        <div className="space-y-4 rounded border bg-card p-6 shadow-sm">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">Could not load team data.</p>
      ) : (
        <TeamForm team={team} />
      )}
    </div>
  );
}
